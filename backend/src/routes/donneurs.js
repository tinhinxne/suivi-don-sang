const router = require('express').Router();
const { body } = require('express-validator');
const db = require('../db');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
router.use(authenticate, requireRole('administrateur', 'agent_centre'));

router.get('/', async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM donneurs ORDER BY nom, prenom');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM donneurs WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Donneur introuvable' });
  const [dons] = await db.query('SELECT * FROM dons WHERE donneur_id = ? ORDER BY date_collecte DESC', [req.params.id]);
  res.json({ ...rows[0], dons });
});

router.post('/',
  body('nom').notEmpty(), body('prenom').notEmpty(),
  body('date_naissance').isISO8601(), body('sexe').isIn(['M', 'F']),
  body('groupe_sanguin').isIn(GROUPES), body('telephone').optional().isString(),
  validate,
  async (req, res) => {
    const { nom, prenom, date_naissance, sexe, telephone, groupe_sanguin } = req.body;
    const [r] = await db.query(
      `INSERT INTO donneurs (nom, prenom, date_naissance, sexe, telephone, groupe_sanguin)
       VALUES (?,?,?,?,?,?)`,
      [nom, prenom, date_naissance, sexe, telephone || null, groupe_sanguin]);
    res.status(201).json({ id: r.insertId });
  });

router.put('/:id',
  body('nom').notEmpty(), body('prenom').notEmpty(),
  body('date_naissance').isISO8601(), body('sexe').isIn(['M', 'F']),
  body('groupe_sanguin').isIn(GROUPES), validate,
  async (req, res) => {
    const { nom, prenom, date_naissance, sexe, telephone, groupe_sanguin } = req.body;
    await db.query(
      `UPDATE donneurs SET nom=?, prenom=?, date_naissance=?, sexe=?, telephone=?, groupe_sanguin=? WHERE id=?`,
      [nom, prenom, date_naissance, sexe, telephone || null, groupe_sanguin, req.params.id]);
    res.json({ ok: true });
  });

module.exports = router;
