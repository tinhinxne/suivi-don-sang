import { Calendar, Clock, Check } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import styles from './Medecin.module.css'
import { useRequests } from './useRequests'

export default function DoctorDashboardPage() {
  const { requests } = useRequests()
  const pending = requests.filter((r) => r.status === 'pending').length
  const distributed = requests.filter((r) => r.status === 'distributed').length

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue synthétique de votre espace" />

      <div className={layout.content}>
        <div className={styles.miniStats}>
          <div className={`${styles.mini} ${styles.miniFeatured}`}>
            <span className={styles.miniIcon}><Calendar size={16} strokeWidth={1.8} /></span>
            <div>
              <div className={styles.miniLabel}>Mes demandes</div>
              <div className={styles.miniValue}>{requests.length}</div>
            </div>
          </div>

          <div className={styles.mini}>
            <span className={`${styles.miniIcon} ${styles.orange}`}>
              <Clock size={16} strokeWidth={1.8} />
            </span>
            <div>
              <div className={styles.miniLabel}>En attente</div>
              <div className={styles.miniValue}>{pending}</div>
            </div>
          </div>

          <div className={styles.mini}>
            <span className={`${styles.miniIcon} ${styles.green}`}>
              <Check size={16} strokeWidth={2} />
            </span>
            <div>
              <div className={styles.miniLabel}>Distribuées</div>
              <div className={styles.miniValue}>{distributed}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}