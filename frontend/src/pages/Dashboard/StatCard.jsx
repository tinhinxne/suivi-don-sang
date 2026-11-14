import styles from './Dashboard.module.css'

export default function StatCard({ title, icon: Icon, tone, featured, value, children }) {
  return (
    <div className={`${styles.card} ${styles.stat} ${featured ? styles.featured : ''}`}>
      <div className={styles.statHead}>
        <span>{title}</span>
        <span className={`${styles.icon} ${styles[tone]}`}>
          <Icon size={14} strokeWidth={2} />
        </span>
      </div>
      <div className={styles.value}>{value}</div>
      {children}
    </div>
  )
}