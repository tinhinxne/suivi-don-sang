const router = require('express').Router();
const { body } = require('express-validator');
const db = require('../db');
const bc = require('../blockchain');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', requireRole('administrateur', 'agent_centre'), async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM distributions ORDER BY date_distribution DESC');
  res.json(rows);
});

// Poches stockées compatibles avec le groupe du patient d'une demande (écran « Distribution »)
router.get('/poches-disponibles/:demandeId', requireRole('agent_centre'), async (req, res) => {
  const [dem] = await db.query('SELECT groupe_sanguin FROM demandes WHERE id = ?', [req.params.demandeId]);
  if (!dem[0]) return res.status(404).json({ error: 'Demande introuvable' });
  const [poches] = await db.query(
    `SELECT p.id_poche, p.groupe_sanguin, d.date_collecte
     FROM poches p JOIN dons d ON d.id_don = p.don_id
     WHERE p.statut = 'stocke' ORDER BY d.date_collecte`);
  res.json(poches.filter((p) => bc.estCompatible(p.groupe_sanguin, dem[0].groupe_sanguin)));
});

// Distribution de poches stockées pour une demande acceptée (ou partielle)
router.post('/', requireRole('agent_centre'),
  body('demande_id').isInt(), body('poche_ids').isArray({ min: 1 }), body('poche_ids.*').isInt(),
  validate,
  async (req, res) => {
    const { demande_id, poche_ids } = req.body;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [dem] = await conn.query('SELECT * FROM demandes WHERE id = ? FOR UPDATE', [demande_id]);
      if (!dem[0] || !['acceptee', 'partielle'].includes(dem[0].statut)) {
        await conn.rollback();
        return res.status(409).json({ error: 'La demande doit être acceptée avant distribution' });
      }
      const [poches] = await conn.query(
        'SELECT id_poche, groupe_sanguin, statut FROM poches WHERE id_poche IN (?) FOR UPDATE', [poche_ids]);
      if (poches.length !== poche_ids.length || poches.some((p) => p.statut !== 'stocke')) {
        await conn.rollback();
        return res.status(409).json({ error: 'Poches inexistantes ou non stockées' });
      }
      if (poches.some((p) => !bc.estCompatible(p.groupe_sanguin, dem[0].groupe_sanguin))) {
        await conn.rollback();
        return res.status(409).json({ error: 'Groupe incompatible avec le patient' });
      }

      const [r] = await conn.query(
        'INSERT INTO distributions (demande_id, agent_id) VALUES (?,?)', [demande_id, req.user.id]);
      await conn.query(
        "UPDATE poches SET statut = 'distribue', distribution_id = ? WHERE id_poche IN (?)", [r.insertId, poche_ids]);

      let premierHash = null;
      for (const pid of poche_ids) {
        const tx = await bc.send('distribuerDon', bc.pocheId(pid), bc.hopitalId(dem[0].hopital_id),
          bc.groupeIndex(dem[0].groupe_sanguin));
        premierHash = premierHash || tx;
      }
      if (premierHash) await conn.query('UPDATE distributions SET tx_hash = ? WHERE id = ?', [premierHash, r.insertId]);

      const [tot] = await conn.query(
        `SELECT COUNT(*) AS n FROM poches p JOIN distributions d ON d.id = p.distribution_id
         WHERE d.demande_id = ?`, [demande_id]);
      await conn.query('UPDATE demandes SET agent_id = ?, statut = ? WHERE id = ?',
        [req.user.id, tot[0].n >= dem[0].quantite ? 'distribuee' : 'partielle', demande_id]);
      await conn.commit();
      res.status(201).json({ id: r.insertId });
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  });

module.exports = router;
