import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { UserContext } from './UserContext'
import styles from './Layout.module.css'

export default function DashboardLayout({ nav, user }) {
  return (
    <UserContext.Provider value={user}>
      <div className={styles.app}>
        <Sidebar nav={nav} user={user} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </UserContext.Provider>
  )
}