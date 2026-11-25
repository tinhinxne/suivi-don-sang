import { Users, Check, Clock, Activity } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from './StatCard'
import RolesCard from './RolesCard'
import ActivityCard from './ActivityCard'
import { stats, roles, activity } from './data'
import styles from './Dashboard.module.css'

export default function DashboardPage() {
  const activePct = Math.round((stats.active / stats.total) * 100)

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue synthétique de votre espace" />

      <div className={styles.content}>
        <div className={styles.stats}>
          <StatCard featured title="Total des comptes" icon={Users} tone="glass" value={stats.total}>
            <div className={styles.foot}>Tous rôles confondus</div>
          </StatCard>

          {/* <StatCard title="Comptes actifs" icon={Check} tone="green" value={stats.active}>
            <div className={styles.bar}><span style={{ width: `${activePct}%` }} /></div>
            <div className={styles.foot} style={{ marginTop: 8 }}>
              <span className={`${styles.badge} ${styles.badgeGreen}`}>{activePct} %</span>
              du total
            </div>
          </StatCard> */}

          <StatCard title="Comptes actifs" icon={Check} tone="green" value={stats.active}>
  <div className={styles.bar}><span style={{ width: `${activePct}%` }} /></div>
  <div className={styles.foot}>
    <span className={`${styles.badge} ${styles.badgeGreen}`}>{activePct} %</span>
    du total
  </div>
</StatCard>

          <StatCard title="Comptes désactivés" icon={Clock} tone="orange" value={stats.disabled}>
            <div className={styles.foot}>
              <span className={`${styles.badge} ${styles.badgeOrange}`}>À examiner</span>
            </div>
          </StatCard>

          <StatCard title="Connexions aujourd'hui" icon={Activity} tone="blue" value={stats.loginsToday}>
            <div className={styles.foot}>
              <span className={styles.spark} aria-hidden="true">
                <span style={{ height: 6 }} />
                <span style={{ height: 8 }} />
                <span style={{ height: 11 }} />
                <span style={{ height: 16 }} />
              </span>
              Dernière à {stats.lastLogin}
            </div>
          </StatCard>
        </div>

        <div className={styles.grid2}>
          <RolesCard roles={roles} />
          <ActivityCard items={activity} />
        </div>
      </div>
    </>
  )
}