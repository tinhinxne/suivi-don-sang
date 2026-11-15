import styles from './StatCard.module.css'

export default function StatCard({ icon: Icon, tone = 'rose', label, value, hint }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${styles[tone]}`}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
        <div className={styles.hint}>{hint}</div>
      </div>
    </div>
  )
}