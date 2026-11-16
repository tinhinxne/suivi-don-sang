const router = require('express').Router();
const { body } = require('express-validator');
const db = require('../db');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
router.use(authenticate);

// Médecin : ses demandes ; agent/admin : toutes (critiques en premier)
router.get('/', async (req, res) => {
  const base = `SELECT d.*, u.nom AS medecin, h.nom AS hopital
                FROM demandes d JOIN utilisateurs u ON u.id = d.medecin_id
                JOIN hopitaux h ON h.id = d.hopital_id`;
  const order = `ORDER BY FIELD(d.urgence,'critique','urgente','normale'), d.date_demande DESC`;
  const [rows] = req.user.role === 'medecin'
    ? await db.query(`${base} WHERE d.medecin_id = ? ${order}`, [req.user.id])
    : await db.query(`${base} ${order}`);
  res.json(rows);
});

router.post('/', requireRole('medecin'),
  body('hopital_id').isInt(), body('groupe_sanguin').isIn(GROUPES), body('quantite').isInt({ min: 1 }),
  body('urgence').optional().customSanitizer((v) => (typeof v === 'string' ? v.toLowerCase() : v))
    .isIn(['normale', 'urgente', 'critique']),
  validate,
  async (req, res) => {
    const { hopital_id, groupe_sanguin, quantite, urgence } = req.body;
    const [r] = await db.query(
      'INSERT INTO demandes (medecin_id, hopital_id, groupe_sanguin, quantite, urgence) VALUES (?,?,?,?,?)',
      [req.user.id, hopital_id, groupe_sanguin, quantite, urgence || 'normale']);
    res.status(201).json({ id: r.insertId });
  });

// Agent : accepte ou refuse une demande en attente
router.patch('/:id/traiter', requireRole('agent_centre'),
  body('statut').isIn(['acceptee', 'refusee']), validate,
  async (req, res) => {
    const [r] = await db.query(
      "UPDATE demandes SET agent_id = ?, statut = ? WHERE id = ? AND statut = 'en_attente'",
      [req.user.id, req.body.statut, req.params.id]);
    if (!r.affectedRows) return res.status(409).json({ error: 'Demande introuvable ou déjà traitée' });
    res.json({ ok: true });
  });

module.exports = router;
