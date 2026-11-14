import styles from './Layout.module.css'

export default function PageHeader({ title, subtitle }) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageSub}>{subtitle}</p>
      </div>
      <div className={styles.who}>
        <span>tinhinane belarbi</span>
        <span className={styles.pill}>Administrateur</span>
      </div>
    </header>
  )
}