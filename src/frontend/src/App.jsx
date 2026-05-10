import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'

import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import { useAuth } from './context/useAuth.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GroupPage from './pages/GroupPage.jsx'
import GroupDetailPage from './pages/GroupDetailPage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
/* import ExpensePage from './pages/ExpensePage.jsx' */
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/*****************************************************************************************
      REDES PÚBLICAS - Acessíveis a todos, mas redirecionam para /dashboard se já autenticado
      ******************************************************************************************/}
      {/* LANDING PAGE */}
      <Route path='/' element={<LandingPage />} />

      {/* PÁGINA DE AUTENTICAÇÃO */}
      <Route
        path='/auth'
        element={isAuthenticated ? <Navigate to='/dashboard' /> : <AuthPage />}
      />

      {/*****************************************************************************************
      REDES PRIVADAS - Acessíveis apenas se autenticado, caso contrário redirecionam para /auth 
      ******************************************************************************************/}
      {/* DASHBOARD */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* GRUPOS */}
      <Route
        path='/groups'
        element={
          <ProtectedRoute>
            <GroupPage />
          </ProtectedRoute>
        }
      />

      {/* DETALHES DE GRUPO POR ID */}
      <Route
        path='/groups/:groupId'
        element={
          <ProtectedRoute>
            <GroupDetailPage />
          </ProtectedRoute>
        }
      />

      {/* ATIVIDADES */}
      <Route
        path='/activities'
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />

      {/* PERFIL DO USUÁRIO */}
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* REDEFINIÇÃO DE SENHA */}
      <Route
        path='/reset-password'
        element={
          <ProtectedRoute>
            <ResetPasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback para rotas desconhecidas */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
