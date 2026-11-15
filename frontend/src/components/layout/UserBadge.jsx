import { useContext } from 'react'
import { UserContext } from './UserContext'
import styles from './UserBadge.module.css'

export default function UserBadge() {
  const user = useContext(UserContext)

  return (
    <div className={styles.badge}>
      <span className={styles.name}>{user.name}</span>
      <span className={styles.pill}>{user.roleLabel}</span>
    </div>
  )
}