const router = require('express').Router();
const { body } = require('express-validator');
const db = require('../db');
const bc = require('../blockchain');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('administrateur', 'agent_centre'));

router.get('/', async (_req, res) => {
  const [rows] = await db.query(
    `SELECT d.*, CONCAT(dn.prenom,' ',dn.nom) AS donneur
     FROM dons d JOIN donneurs dn ON dn.id = d.donneur_id
     ORDER BY d.date_collecte DESC`);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM dons WHERE id_don = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Don introuvable' });
  const [poches] = await db.query('SELECT * FROM poches WHERE don_id = ?', [req.params.id]);
  res.json({ ...rows[0], poches });
});

// Enregistrement d'un don : crée le don + ses poches (1..*) et les enregistre sur la blockchain
router.post('/', requireRole('agent_centre'),
  body('donneur_id').isInt(), body('lieu').notEmpty(),
  body('volume_ml').isInt({ min: 1 }), body('nb_poches').optional().isInt({ min: 1, max: 10 }),
  validate,
  async (req, res) => {
    const { donneur_id, lieu, volume_ml, date_collecte } = req.body;
    const nb = req.body.nb_poches || 1;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [dn] = await conn.query('SELECT groupe_sanguin FROM donneurs WHERE id = ?', [donneur_id]);
      if (!dn[0]) { await conn.rollback(); return res.status(404).json({ error: 'Donneur introuvable' }); }
      const groupe = dn[0].groupe_sanguin;
      const [r] = await conn.query(
        `INSERT INTO dons (donneur_id, agent_id, date_collecte, lieu, volume_ml, groupe_sanguin)
         VALUES (?,?,?,?,?,?)`,
        [donneur_id, req.user.id, date_collecte || new Date(), lieu, volume_ml, groupe]);

      let premierHash = null;
      for (let i = 0; i < nb; i++) {
        const [p] = await conn.query('INSERT INTO poches (don_id, groupe_sanguin) VALUES (?,?)', [r.insertId, groupe]);
        const tx = await bc.send('enregistrerDon', bc.pocheId(p.insertId), bc.donneurId(donneur_id), bc.groupeIndex(groupe));
        if (tx) await conn.query('UPDATE poches SET tx_hash = ? WHERE id_poche = ?', [tx, p.insertId]);
        premierHash = premierHash || tx;
      }
      if (premierHash) await conn.query('UPDATE dons SET tx_hash = ? WHERE id_don = ?', [premierHash, r.insertId]);
      await conn.query('UPDATE donneurs SET dernier_don = DATE(?) WHERE id = ?', [date_collecte || new Date(), donneur_id]);
      await conn.commit();
      res.status(201).json({ id_don: r.insertId, nb_poches: nb });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  });

module.exports = router;
