const router = require('express').Router();
const { body } = require('express-validator');
const db = require('../db');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM hopitaux ORDER BY nom');
  res.json(rows);
});

router.post('/', requireRole('administrateur'),
  body('nom').notEmpty(), body('ville').notEmpty(), validate,
  async (req, res) => {
    const [r] = await db.query('INSERT INTO hopitaux (nom, ville) VALUES (?,?)', [req.body.nom, req.body.ville]);
    res.status(201).json({ id: r.insertId });
  });

module.exports = router;
