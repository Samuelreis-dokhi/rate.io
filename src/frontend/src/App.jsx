import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GroupPage from './pages/GroupPage.jsx'
/* import ExpensePage from './pages/ExpensePage.jsx' */
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/useAuth.jsx'
import ExpensePage from './pages/ExpensePage.jsx'

function App() {
  const { isAuthenticated } = useAuth()

  // Configurar sistema de rotas com proteção de acesso, redirecionando de forma inteligente e bloqueando acesso não autenticado a rotas privadas. Exemplo:
  // - Rota pública: /landing-page → LandingPage.jsx
  // - Rota pública: /auth → AuthPage.jsx
  // - Rota privada: /dashboard → DashboardPage.jsx (redireciona para /auth se não autenticado)
  // - Rota de fallback: /not-found → NotFoundPage.jsx (para rotas des  conhecidas)
  return (
    <Routes>
      {/* Pública - Sempre acessível */}
      <Route path='/' element={<LandingPage />} />

      {/* Pública - Redireciona para /dashboard se já autenticado */}
      <Route
        path='/auth'
        element={isAuthenticated ? <Navigate to='/dashboard' /> : <AuthPage />}
      />

      {/* Privada - Redireciona para /auth se não autenticado */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Privada - Caminho para Grupos */}
      <Route
        path='/groups'
        element={
          <ProtectedRoute>
            <GroupPage />
          </ProtectedRoute>
        }
      />

      {/* Privada - Caminho para Despesas */}
      <Route
        path='/expenses'
        element={
          <ProtectedRoute>
            <ExpensePage />
          </ProtectedRoute>
        }
      />

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