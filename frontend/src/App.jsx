import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/Dashboard/DashboardPage'
import PersonnelPage from './pages/Personnel/PersonnelPage'
import RolesPage from './pages/Roles/RolesPage'
import PageHeader from './components/layout/PageHeader'

function Soon({ title }) {
  return <PageHeader title={title} subtitle="Cette page arrive bientôt" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/parametres" element={<Soon title="Paramètres" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}