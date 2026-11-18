require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./db');

const app = express();
app.use(helmet());
// Accepte le front sur n'importe quel port local (5173, 5174, ...) en développement.
// En production, définir FRONTEND_URL dans le .env.
app.use(cors({
  origin: process.env.FRONTEND_URL || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', async (_req, res) => {
  await db.query('SELECT 1');
  res.json({ status: 'ok', db: 'connectée' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/hopitaux', require('./routes/hopitaux'));
app.use('/api/donneurs', require('./routes/donneurs'));
app.use('/api/dons', require('./routes/dons'));
app.use('/api/poches', require('./routes/poches'));
app.use('/api/demandes', require('./routes/demandes'));
app.use('/api/distributions', require('./routes/distributions'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500)
    .json({ error: err.code === 'ER_DUP_ENTRY' ? 'Valeur déjà existante' : 'Erreur serveur' });
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try { await db.query('SELECT 1'); console.log(`API sur http://localhost:${port} — MySQL OK`); }
  catch (e) { console.error('Connexion MySQL impossible :', e.message); }
});