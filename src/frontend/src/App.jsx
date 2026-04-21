import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GroupPage from './pages/GroupPage.jsx'
import GroupDetailPage from './pages/GroupDetailPage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'
/* import ExpensePage from './pages/ExpensePage.jsx' */
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/useAuth.jsx'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Pública */}
      <Route path='/' element={<LandingPage />} />
      <Route
        path='/auth'
        element={isAuthenticated ? <Navigate to='/dashboard' /> : <AuthPage />}
      />

      {/* Privadas */}
      <Route path='/dashboard' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path='/groups' element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
      <Route path='/groups/:groupId' element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
      <Route path='/activities' element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
{/*       <Route path='/expenses' element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} /> */}

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App