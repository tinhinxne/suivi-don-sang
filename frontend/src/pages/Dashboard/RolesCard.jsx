import styles from './Dashboard.module.css'

export default function RolesCard({ roles }) {
  const max = Math.max(...roles.map((r) => r.count))
  const total = roles.reduce((sum, r) => sum + r.count, 0)

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Comptes par rôle</h2>
      <p className={styles.cardSub}>Répartition des utilisateurs de la plateforme</p>

      {roles.map((r) => (
        <div key={r.label} className={styles.row}>
          <span>{r.label}</span>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span className={styles.count}>{r.count}</span>
        </div>
      ))}

      <div className={styles.total}>
        <span>Total</span>
        <strong>{total} comptes</strong>
      </div>
    </section>
  )
}