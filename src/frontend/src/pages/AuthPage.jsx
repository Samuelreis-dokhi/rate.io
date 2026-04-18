import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

const AuthPage = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <div className='auth-page'>
        <h1>Você já está conectado</h1>
        <p>Ir para o painel.</p>
        <Link to='/dashboard'>Acessar painel</Link>
      </div>
    )
  }

  return (
    <div className='auth-page'>
      <h1>Login / Registro</h1>
      <p>Aqui será o formulário de autenticação.</p>
      <Link to='/'>Voltar para a página inicial</Link>
    </div>
  )
}

export default AuthPage
