import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import panel from '../../components/ui/DataPanel.module.css'
import styles from './Medecin.module.css'
import { useRequests } from './useRequests'
import { STATUS_LABELS } from './data'

export default function MyRequestsPage() {
  const { requests } = useRequests()

  return (
    <>
      <PageHeader title="Mes demandes" subtitle="Suivez l'état de vos demandes" />

      <div className={layout.content}>
        <section className={panel.panel}>
          <div className={panel.head}>
            <div>
              <h2 className={panel.title}>Mes demandes</h2>
              <p className={panel.sub}>Demandes de sang transmises au centre</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <p className={styles.empty}>Vous n'avez pas encore fait de demande.</p>
          ) : (
            <div className={panel.tableWrap}>
              <table className={panel.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Hôpital</th>
                    <th>Groupe</th>
                    <th>Quantité</th>
                    <th>Urgence</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className={panel.muted}>{r.date}</td>
                      <td>{r.hospital}</td>
                      <td><span className={styles.group}>{r.group}</span></td>
                      <td>{r.quantity}</td>
                      <td className={r.urgency === 'Normale' ? panel.muted : styles.urgent}>
                        {r.urgency}
                      </td>
                      <td>
                        <span className={`${panel.badge} ${styles[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}