import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import styles from '../../components/ui/DataPanel.module.css'
import CreateRoleModal from './CreateRoleModal'

const initialRoles = [
  {
    code: 'ADMIN',
    actions: ['Créer les comptes du personnel', 'Attribuer les rôles', 'Gérer les accès'],
    full: true,
  },
  {
    code: 'DONNEUR',
    actions: ['Consulter ses informations', 'Consulter ses dons'],
    full: false,
  },
  {
    code: 'MEDECIN',
    actions: ['Consulter le stock', 'Créer et suivre ses demandes'],
    full: false,
  },
  {
    code: 'AGENT_CENTRE',
    actions: ['Gérer donneurs, dons, analyses, stock, demandes et distributions'],
    full: false,
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles)
  const [open, setOpen] = useState(false)

  function handleCreate(role) {
    // TODO : appeler services/api.js
    setRoles((list) => [...list, role])
    setOpen(false)
  }

  return (
    <>
      <PageHeader title="Rôles et permissions" subtitle="Consultez les accès autorisés" />

      <div className={layout.content}>
        <section className={styles.panel}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title}>Rôles</h2>
              <p className={styles.sub}>Permissions appliquées dans toute l'application</p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rôle</th>
                  <th>Actions autorisées</th>
                  <th>Accès</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.code}>
                    <td className={styles.name}>{r.code}</td>
                    <td className={styles.muted}>{r.actions.join(' · ')}</td>
                    <td>
                      <span className={`${styles.badge} ${r.full ? styles.full : styles.limited}`}>
                        {r.full ? 'Accès complet' : 'Accès limité'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.footer}>
          <button className={styles.add} onClick={() => setOpen(true)}>
            <Plus size={15} strokeWidth={2.2} />
            Ajouter un rôle
          </button>
        </div>
      </div>

      {open && (
        <CreateRoleModal
          existingCodes={roles.map((r) => r.code)}
          onClose={() => setOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  )
}