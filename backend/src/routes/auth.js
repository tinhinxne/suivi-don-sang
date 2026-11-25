const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../db');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/login',
  body('email').isEmail(), body('password').notEmpty(), validate,
  async (req, res) => {
    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [req.body.email]);
    const u = rows[0];
    if (!u || u.statut !== 'actif' || !(await bcrypt.compare(req.body.password, u.password_hash)))
      return res.status(401).json({ error: 'Identifiants incorrects' });
    await db.query('UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = ?', [u.id]);
    const token = jwt.sign({ id: u.id, role: u.role, hopital_id: u.hopital_id },
      process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: u.id, nom: u.nom, email: u.email, role: u.role, hopital_id: u.hopital_id } });
  });

// Création de comptes : réservée à l'administrateur
router.post('/utilisateurs', authenticate, requireRole('administrateur'),
  body('nom').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 8 }),
  body('role').customSanitizer((v) => (typeof v === 'string' ? v.toLowerCase() : v))
    .isIn(['administrateur', 'agent_centre', 'medecin']),
  body('hopital_id').optional({ nullable: true }).isInt(),
  validate,
  async (req, res) => {
    const { nom, email, password, role, hopital_id } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO utilisateurs (nom, email, password_hash, role, hopital_id) VALUES (?,?,?,?,?)',
      [nom, email, hash, role, role === 'medecin' ? hopital_id || null : null]);
    res.status(201).json({ id: r.insertId });
  });

router.get('/utilisateurs', authenticate, requireRole('administrateur'), async (_req, res) => {
  const [rows] = await db.query(
    'SELECT id, nom, email, role, statut, derniere_connexion, hopital_id FROM utilisateurs');
  res.json(rows);
});

router.get('/me', authenticate, async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, nom, email, role, hopital_id FROM utilisateurs WHERE id = ?', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json(rows[0]);
});
router.patch('/utilisateurs/:id/statut', authenticate, requireRole('administrateur'),
  body('statut').isIn(['actif', 'inactif']), validate,
  async (req, res) => {
    if (Number(req.params.id) === req.user.id)
      return res.status(409).json({ error: 'Vous ne pouvez pas désactiver votre propre compte' });
    const [r] = await db.query('UPDATE utilisateurs SET statut = ? WHERE id = ?',
      [req.body.statut, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ ok: true });
  });
  
module.exports = router;

