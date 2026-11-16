const router = require('express').Router();
const { body } = require('express-validator');
const db = require('../db');
const bc = require('../blockchain');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// Stock par groupe : accessible aussi au médecin (page « Poches disponibles »)
router.get('/stock', async (_req, res) => {
  const [rows] = await db.query(
    `SELECT groupe_sanguin, COUNT(*) AS nb_poches FROM poches
     WHERE statut = 'stocke' GROUP BY groupe_sanguin`);
  res.json(rows);
});

router.use(requireRole('administrateur', 'agent_centre'));

router.get('/', async (req, res) => {
  const { statut, groupe } = req.query;
  const where = [], params = [];
  if (statut) { where.push('p.statut = ?'); params.push(statut); }
  if (groupe) { where.push('p.groupe_sanguin = ?'); params.push(groupe); }
  const [rows] = await db.query(
    `SELECT p.*, d.date_collecte, d.lieu, CONCAT(dn.prenom,' ',dn.nom) AS donneur, dn.id AS donneur_id
     FROM poches p JOIN dons d ON d.id_don = p.don_id JOIN donneurs dn ON dn.id = d.donneur_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.id_poche DESC`, params);
  res.json(rows);
});

// Traçabilité : poche + don + analyses + distribution (base de données)
router.get('/:id', async (req, res) => {
  const [p] = await db.query('SELECT * FROM poches WHERE id_poche = ?', [req.params.id]);
  if (!p[0]) return res.status(404).json({ error: 'Poche introuvable' });
  const [don] = await db.query('SELECT * FROM dons WHERE id_don = ?', [p[0].don_id]);
  const [analyses] = await db.query('SELECT * FROM analyses WHERE poche_id = ? ORDER BY date_analyse', [req.params.id]);
  const [dist] = p[0].distribution_id
    ? await db.query('SELECT * FROM distributions WHERE id = ?', [p[0].distribution_id]) : [[]];
  res.json({ ...p[0], don: don[0], analyses, distribution: dist[0] || null });
});

// Traçabilité : état et historique lus directement sur la blockchain
router.get('/:id/blockchain', async (req, res) => {
  res.json(await bc.historique(req.params.id));
});

// Démarrer l'analyse : enregistre -> en_analyse
router.patch('/:id/demarrer-analyse', requireRole('agent_centre'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      "UPDATE poches SET statut = 'en_analyse' WHERE id_poche = ? AND statut = 'enregistre'", [req.params.id]);
    if (!r.affectedRows) { await conn.rollback(); return res.status(409).json({ error: 'Poche introuvable ou déjà en analyse' }); }
    const tx = await bc.send('demarrerAnalyse', bc.pocheId(req.params.id));
    await conn.commit();
    res.json({ ok: true, tx_hash: tx });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
});

// Résultat d'analyse : conforme -> valide, non conforme -> rejete
// (si l'analyse n'a pas été démarrée, elle l'est automatiquement)
router.post('/:id/analyses', requireRole('agent_centre'),
  body('resultat').isIn(['conforme', 'non_conforme']), body('remarque').optional().isString(), validate,
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [p] = await conn.query('SELECT statut FROM poches WHERE id_poche = ? FOR UPDATE', [req.params.id]);
      if (!p[0]) { await conn.rollback(); return res.status(404).json({ error: 'Poche introuvable' }); }
      if (!['enregistre', 'en_analyse'].includes(p[0].statut)) {
        await conn.rollback();
        return res.status(409).json({ error: 'Cette poche a déjà été analysée' });
      }
      const { resultat, remarque } = req.body;
      if (p[0].statut === 'enregistre') await bc.send('demarrerAnalyse', bc.pocheId(req.params.id));

      const [r] = await conn.query(
        'INSERT INTO analyses (poche_id, agent_id, resultat, remarque) VALUES (?,?,?,?)',
        [req.params.id, req.user.id, resultat, remarque || null]);
      await conn.query('UPDATE poches SET statut = ? WHERE id_poche = ?',
        [resultat === 'conforme' ? 'valide' : 'rejete', req.params.id]);
      const tx = await bc.send(resultat === 'conforme' ? 'validerDon' : 'rejeterDon', bc.pocheId(req.params.id),
        bc.hashAnalyse({ poche: Number(req.params.id), resultat, remarque: remarque || null, analyse: r.insertId }));
      if (tx) await conn.query('UPDATE analyses SET tx_hash = ? WHERE id = ?', [tx, r.insertId]);
      await conn.commit();
      res.status(201).json({ id: r.insertId, tx_hash: tx });
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  });

// Mise en stock : valide -> stocke
router.patch('/:id/stocker', requireRole('agent_centre'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      "UPDATE poches SET statut = 'stocke' WHERE id_poche = ? AND statut = 'valide'", [req.params.id]);
    if (!r.affectedRows) { await conn.rollback(); return res.status(409).json({ error: 'Poche introuvable ou non validée' }); }
    const tx = await bc.send('stockerDon', bc.pocheId(req.params.id));
    if (tx) await conn.query('UPDATE poches SET tx_hash_stockage = ? WHERE id_poche = ?', [tx, req.params.id]);
    await conn.commit();
    res.json({ ok: true, tx_hash: tx });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
});

module.exports = router;
