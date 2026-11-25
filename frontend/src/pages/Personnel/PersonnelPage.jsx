import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import styles from '../../components/ui/DataPanel.module.css'
import CreateAccountModal from './CreateAccountModal'
import { api } from '../../services/api'

const ROLE_LABELS = {
  MEDECIN: 'Médecin',
  AGENT_CENTRE: 'Agent du centre',
}

function initials(name) {
  return name
    .split(' ')
    .filter((w) => w && !/^dr\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const toPerson = (u) => ({
  id: u.id,
  name: u.nom,
  email: u.email,
  role: u.role.toUpperCase(),
  active: u.statut === 'actif',
  lastLogin: u.derniere_connexion || 'Jamais connecté',
})

export default function PersonnelPage() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    api('/auth/utilisateurs')
      .then((rows) => {
        setPeople(rows.filter((u) => u.role !== 'administrateur').map(toPerson))
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [refresh])

  async function handleCreate({ name, email, password, role }) {
    try {
      await api('/auth/utilisateurs', {
        method: 'POST',
        body: { nom: name, email, password, role },
      })
      setOpen(false)
      setRefresh((n) => n + 1)
    } catch (e) {
      alert(e.message)
    }
  }

  async function changeStatus(id, statut) {
    try {
      await api(`/auth/utilisateurs/${id}/statut`, { method: 'PATCH', body: { statut } })
      setRefresh((n) => n + 1)
    } catch (e) {
      alert(e.message)
    }
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

          {loading && <p className={styles.muted}>Chargement…</p>}
          {error && <p className={styles.muted}>{error}</p>}

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
                        <button className={styles.action} onClick={() => changeStatus(p.id, 'inactif')}>
                          Désactiver
                        </button>
                      ) : (
                        <button className={styles.action} onClick={() => changeStatus(p.id, 'actif')}>
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