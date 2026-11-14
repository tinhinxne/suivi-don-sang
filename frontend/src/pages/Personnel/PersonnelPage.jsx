import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import styles from '../../components/ui/DataPanel.module.css'
import CreateAccountModal from './CreateAccountModal'

const ROLE_LABELS = {
  MEDECIN: 'Médecin',
  AGENT_CENTRE: 'Agent du centre',
}

const initialPeople = [
  { id: 1, name: 'Dr Amine B.', email: 'amine.b@qatra.dz', role: 'MEDECIN', active: true, lastLogin: "Aujourd'hui, 08:55" },
  { id: 2, name: 'Dr Sarah K.', email: 'sarah.k@qatra.dz', role: 'MEDECIN', active: true, lastLogin: 'Hier, 16:10' },
  { id: 3, name: 'Yacine M.', email: 'yacine.m@qatra.dz', role: 'AGENT_CENTRE', active: true, lastLogin: "Aujourd'hui, 09:42" },
  { id: 4, name: 'Lilia H.', email: 'lilia.h@qatra.dz', role: 'AGENT_CENTRE', active: false, lastLogin: 'Il y a 12 jours' },
]

function initials(name) {
  return name
    .split(' ')
    .filter((w) => w && !/^dr\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default function PersonnelPage() {
  const [people, setPeople] = useState(initialPeople)
  const [open, setOpen] = useState(false)

  function handleCreate({ name, email, role }) {
    // TODO : appeler services/api.js
    setPeople((p) => [
      ...p,
      { id: Date.now(), name, email, role, active: true, lastLogin: 'Jamais connecté' },
    ])
    setOpen(false)
  }

  function reactivate(id) {
    // TODO : appeler services/api.js
    setPeople((p) => p.map((x) => (x.id === id ? { ...x, active: true } : x)))
  }

  return (
    <>
      <PageHeader title="Personnel" subtitle="Gérez les comptes du personnel" />

      <div className={layout.content}>
        <section className={styles.panel}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title}>Personnel</h2>
              <p className={styles.sub}>Médecins et agents du centre</p>
            </div>
            <button className={styles.add} onClick={() => setOpen(true)}>
              <Plus size={15} strokeWidth={2.2} />
              Ajouter un compte
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar}>{initials(p.name)}</span>
                        <div>
                          <div className={styles.name}>{p.name}</div>
                          <div className={styles.email}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.muted}>{ROLE_LABELS[p.role]}</td>
                    <td>
                      <span className={`${styles.badge} ${p.active ? styles.on : styles.off}`}>
                        {p.active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className={styles.muted}>{p.lastLogin}</td>
                    <td>
                      {p.active ? (
                        <button className={styles.action}>Gérer</button>
                      ) : (
                        <button className={styles.action} onClick={() => reactivate(p.id)}>
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {open && (
        <CreateAccountModal onClose={() => setOpen(false)} onCreate={handleCreate} />
      )}
    </>
  )
}