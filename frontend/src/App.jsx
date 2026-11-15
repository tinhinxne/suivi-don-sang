import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import PageHeader from './components/layout/PageHeader'
import { adminNav, doctorNav, adminUser, doctorUser } from './components/layout/navConfig'
import DashboardPage from './pages/Dashboard/DashboardPage'
import PersonnelPage from './pages/Personnel/PersonnelPage'
import RolesPage from './pages/Roles/RolesPage'
import RequestsProvider from './pages/Medecin/RequestsProvider'
import DoctorDashboardPage from './pages/Medecin/DoctorDashboardPage'
import StockPage from './pages/Medecin/StockPage'
import NewRequestPage from './pages/Medecin/NewRequestPage'
import MyRequestsPage from './pages/Medecin/MyRequestsPage'

function Soon({ title }) {
  return <PageHeader title={title} subtitle="Cette page arrive bientôt" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Administrateur */}
      <Route element={<DashboardLayout nav={adminNav} user={adminUser} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/parametres" element={<Soon title="Paramètres" />} />
      </Route>

      {/* Médecin */}
      <Route
        element={
          <RequestsProvider>
            <DashboardLayout nav={doctorNav} user={doctorUser} />
          </RequestsProvider>
        }
      >
        <Route path="/medecin/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/medecin/poches" element={<StockPage />} />
        <Route path="/medecin/nouvelle-demande" element={<NewRequestPage />} />
        <Route path="/medecin/mes-demandes" element={<MyRequestsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}