import { Plus, Shield, Ban, Check } from 'lucide-react'
import styles from './Dashboard.module.css'

const icons = { add: Plus, shield: Shield, ban: Ban, check: Check }

export default function ActivityCard({ items }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>Activité récente</h2>
          <p className={styles.cardSub}>Dernières actions sur les comptes</p>
        </div>
        <a href="#" className={styles.seeAll}>Tout voir</a>
      </div>

      <ul className={styles.list}>
        {items.map((a) => {
          const Icon = icons[a.icon]
          return (
            <li key={a.title} className={styles.item}>
              <span className={`${styles.itemIcon} ${styles[a.tone]}`}>
                <Icon size={13} strokeWidth={2} />
              </span>
              <div>
                <div className={styles.itemTitle}>{a.title}</div>
                <div className={styles.itemTime}>{a.time}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}