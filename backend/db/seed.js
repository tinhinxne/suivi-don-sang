// Crée les hôpitaux du front + un compte par rôle. Usage : npm run db:seed
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/db');

(async () => {
  const hopitaux = [['CHU de Béjaïa', 'Béjaïa'], ["EPH d'Akbou", 'Akbou'], ['EPH de Sidi Aïch', 'Sidi Aïch']];
  const ids = [];
  for (const [nom, ville] of hopitaux) {
    const [r] = await db.query('INSERT INTO hopitaux (nom, ville) VALUES (?,?)', [nom, ville]);
    ids.push(r.insertId);
  }
  const hash = await bcrypt.hash('Qatra@2026', 10);
  const users = [
    ['Tinhinane Belarbi', 'admin@qatra.dz', 'administrateur', null],
    ['Agent Centre', 'agent@qatra.dz', 'agent_centre', null],
    ['Dr Test', 'medecin@qatra.dz', 'medecin', ids[0]],
  ];
  for (const [nom, email, role, hop] of users)
    await db.query(
      'INSERT INTO utilisateurs (nom, email, password_hash, role, hopital_id) VALUES (?,?,?,?,?)',
      [nom, email, hash, role, hop]);
  console.log('Comptes créés (mot de passe : Qatra@2026)');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
