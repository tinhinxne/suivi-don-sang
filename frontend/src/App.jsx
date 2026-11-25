import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import PageHeader from './components/layout/PageHeader'
import { adminNav, doctorNav, agentNav } from './components/layout/navConfig'
import { getToken, getUser } from './services/api'
import AgentDashboard from './pages/agent/AgentDashboard'
import DashboardPage from './pages/Dashboard/DashboardPage'
import PersonnelPage from './pages/Personnel/PersonnelPage'
import RolesPage from './pages/Roles/RolesPage'
import RequestsProvider from './pages/Medecin/RequestsProvider'
import DoctorDashboardPage from './pages/Medecin/DoctorDashboardPage'
import StockPage from './pages/Medecin/StockPage'
import NewRequestPage from './pages/Medecin/NewRequestPage'
import MyRequestsPage from './pages/Medecin/MyRequestsPage'
import AgentAnalyses from './pages/agent/AgentAnalyses'
import AgentStock from './pages/agent/AgentStock'
import AgentRequests from './pages/agent/AgentRequests'
import AgentDistribution from './pages/agent/AgentDistribution'
import AgentTraceability from './pages/agent/AgentTraceability'
import AgentDonations from './pages/agent/AgentDonations'
import AgentDonationDetail from './pages/agent/AgentDonationDetail'

function Soon({ title }) {
  return <PageHeader title={title} subtitle="Cette page arrive bientôt" />
}

const ROLES = {
  administrateur: 'Administrateur',
  agent_centre: 'Agent du centre',
  medecin: 'Médecin',
}

function ProtectedLayout({ role, nav }) {
  const u = getUser()
  if (!getToken() || !u || u.role !== role) return <Navigate to="/" replace />
  const initials = u.nom.split(' ').filter(Boolean).slice(0, 2)
    .map((m) => m[0].toUpperCase()).join('')
  return (
    <DashboardLayout
      nav={nav}
      user={{ name: u.nom, initials, roleLabel: ROLES[u.role] }}
    />
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Administrateur */}
      <Route element={<ProtectedLayout role="administrateur" nav={adminNav} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/parametres" element={<Soon title="Paramètres" />} />
      </Route>

      {/* Médecin */}
      <Route
        element={
          <RequestsProvider>
            <ProtectedLayout role="medecin" nav={doctorNav} />
          </RequestsProvider>
        }
      >
        <Route path="/medecin/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/medecin/poches" element={<StockPage />} />
        <Route path="/medecin/nouvelle-demande" element={<NewRequestPage />} />
        <Route path="/medecin/mes-demandes" element={<MyRequestsPage />} />
      </Route>

      {/* Agent du centre */}
      <Route element={<ProtectedLayout role="agent_centre" nav={agentNav} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/dons" element={<AgentDonations />} />
        <Route path="/agent/dons/:id" element={<AgentDonationDetail />} />
        <Route path="/agent/analyses" element={<AgentAnalyses />} />
        <Route path="/agent/stock" element={<AgentStock />} />
        <Route path="/agent/demandes" element={<AgentRequests />} />
        <Route path="/agent/distribution" element={<AgentDistribution />} />
        <Route path="/agent/tracabilite" element={<AgentTraceability />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}