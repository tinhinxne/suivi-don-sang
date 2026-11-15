import { useContext } from 'react'
import { UserContext } from './UserContext'
import styles from './Layout.module.css'

export default function PageHeader({ title, subtitle }) {
  const user = useContext(UserContext)

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageSub}>{subtitle}</p>
      </div>
      <div className={styles.who}>
        <span>{user.name}</span>
        <span className={styles.pill}>{user.roleLabel}</span>
      </div>
    </header>
  )
}