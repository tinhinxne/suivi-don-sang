import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, ShieldCheck, Settings, LogOut } from 'lucide-react'
import goutte from '../../assets/icons/goutte.svg'
import styles from './Layout.module.css'

const items = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutGrid },
  { to: '/personnel', label: 'Personnel', icon: Users },
  { to: '/roles', label: 'Rôles et permissions', icon: ShieldCheck },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
]

export default function Sidebar() {
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

      <nav className={styles.nav}>
        {items.map(({ to, label, icon: Icon }) => (
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
          <div className={styles.avatar}>TB</div>
          <div>
            <div className={styles.userName}>tinhinane belarbi</div>
            <div className={styles.userRole}>Administrateur</div>
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