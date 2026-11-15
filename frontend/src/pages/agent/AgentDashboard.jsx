import { Link } from 'react-router-dom'
import { FlaskConical, Droplets, Calendar, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/ui/StatCard'
import styles from './AgentDashboard.module.css'
import { dashboardStats, dashboardStocks as stocks } from './mockData'

// Données de démonstration, à remplacer par l'API
const stats = [
  {
    icon: FlaskConical,
    tone: 'amber',
    label: "En attente d'analyse",
    value: dashboardStats.pendingAnalysis,
  },
  {
    icon: Droplets,
    tone: 'green',
    label: 'Poches disponibles',
    value: dashboardStats.availableBags,
  },
  {
    icon: Calendar,
    tone: 'rose',
    label: 'Demandes en attente',
    value: dashboardStats.pendingRequests,
  },
]


export default function AgentDashboard() {
  const max = Math.max(...stocks.map((s) => s.count), 1)

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue synthétique de votre espace" />

      <div className={styles.content}>
        <div className={styles.stats}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} hint="Données du centre" />
          ))}
        </div>

        <section className={styles.stock}>
          <div className={styles.stockHead}>
            <h2 className={styles.stockTitle}>Stocks par groupe</h2>
            <p className={styles.stockSub}>Poches actuellement disponibles</p>
          </div>

          <ul className={styles.list}>
            {stocks.map(({ group, count }) => (
              <li key={group} className={styles.row}>
                <span className={styles.tag}>{group}</span>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{ width: `${Math.max((count / max) * 100, 3)}%` }}
                  />
                </div>
                <span className={styles.count}>{count}</span>
              </li>
            ))}
          </ul>

          <Link to="/agent/stock" className={styles.more}>
            Voir le stock <ArrowRight size={13} />
          </Link>
        </section>
      </div>
    </>
  )
}