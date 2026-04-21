import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'

import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GroupPage from './pages/GroupPage.jsx'
import GroupDetailPage from './pages/GroupDetailPage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
/* import ExpensePage from './pages/ExpensePage.jsx' */

import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/useAuth.jsx'

function App() {
  const { isAuthenticated } = useAuth()

  // Configurar sistema de rotas com proteção de acesso, redirecionando de forma inteligente e bloqueando acesso não autenticado a rotas privadas. Exemplo:
  // - Rota pública: /landing-page → LandingPage.jsx
  // - Rota pública: /auth → AuthPage.jsx
  // - Rota privada: /dashboard → DashboardPage.jsx (redireciona para /auth se não autenticado)
  // - Rota de fallback: /not-found → NotFoundPage.jsx (para rotas des  conhecidas)
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

      {/* DESPESAS */}
      {/* 
      <Route
        path='/expenses'
        element={
          <ProtectedRoute>
            <ExpensePage />
          </ProtectedRoute>
        }
      />
      */}


      {/* Fallback para rotas desconhecidas */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App

/**
 * Mapa de redirecionamento e proteção de rotas:
 * - Não logado acessa /dashboard → redireciona para /auth
 * - Logado acessa /auth → redireciona para /dashboard
 * - Qualquer rota desconhecida → redireciona para /
 */