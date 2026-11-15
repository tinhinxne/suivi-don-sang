import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import goutte from '../../assets/icons/goutte.svg'
import styles from './Layout.module.css'

export default function Sidebar({ nav, user }) {
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src={goutte} alt="" width={34} height={34} />
        <div>
          <div className={styles.brandName}>QATRA</div>
          <div className={styles.brandTag}>Traçabilité du don</div>
        </div>
      </div>
      <div className={styles.section}>{user.roleLabel.toUpperCase()}</div>
      <nav className={styles.nav}>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.user}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{user.initials}</div>
          <div>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{user.roleLabel}</div>
          </div>
        </div>

        <button className={styles.logout} onClick={() => navigate('/')}>
          <LogOut size={14} strokeWidth={1.8} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}