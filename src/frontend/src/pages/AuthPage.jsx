import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import { useState, useEffect } from 'react' // 1. Adicione o useEffect aqui
import '../pages/styles/AuthPage.css'

const initialLogin = { email: '', password: '' }
const initialRegister = { name: '', email: '', password: '' }

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(initialLogin)
  const [registerForm, setRegisterForm] = useState(initialRegister)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  // Limpa os dados sempre que a página carregar
  useEffect(() => {
    setLoginForm(initialLogin)
    setRegisterForm(initialRegister)
    setMode('login')
    setError('')
    setFeedback('')
  }, [])

  const clearMessages = () => { setFeedback(''); setError('') }

  const onLoginChange = (e) => 
    setLoginForm((curr) => ({ ...curr, [e.target.name]: e.target.value }))

  const onRegisterChange = (e) => 
    setRegisterForm((curr) => ({ ...curr, [e.target.name]: e.target.value }))

  const onLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      await login(loginForm)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRegisterSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      await register(registerForm)
      setFeedback('Conta criada com sucesso. Você já pode fazer login.')
      setMode('login')
    } catch (err){
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-layout content-wrap">
        <aside className="auth-panel reveal reveal-1">
          <p className="kicker">Acesse seu painel de despesas</p>
          <h1>Bem-vindo ao RATE.IO</h1>
          <p>
            Novo por aqui? Crie sua conta e inicie seu primeiro grupo. Já tem conta? Entre e mantenha seus saldos atualizados.
          </p>
          <ul>
            <li>Despesas compartilhadas sem dor de cabeça.</li>
            <li>Controle e transparência total.</li>
            <li>Visibilidade compartilhada de grupos e histórico</li>
          </ul>
          <Link to="/" className="btn btn-ghost">Voltar ao início</Link>
        </aside>

        <section className="auth-card reveal reveal-2">
          <div className="auth-switch" role="tablist" aria-label="Modo de autenticação">
            <button
              className={mode === 'login' ? 'switch active' : 'switch'}
              onClick={() => { setMode('login'); clearMessages() }}
              type="button"
            >
              Já tenho conta
            </button>
            <button
              className={mode === 'register' ? 'switch active' : 'switch'}
              onClick={() => { setMode('register'); clearMessages() }}
              type="button"
            >
              Criar conta
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={onLoginSubmit} className="auth-form" noValidate>
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email" name="email" type="email" required
                placeholder="voce@exemplo.com"
                value={loginForm.email} onChange={onLoginChange}
              />
              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password" name="password" type="password" required
                placeholder="••••••••"
                value={loginForm.password} onChange={onLoginChange}
              />
              <button disabled={loading} className="btn btn-primary" type="submit">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={onRegisterSubmit} className="auth-form" noValidate>
              <label htmlFor="register-name">Nome</label>
              <input
                id="register-name" name="name" type="text" required
                placeholder="Seu nome"
                value={registerForm.name} onChange={onRegisterChange}
              />
              <label htmlFor="register-email">E-mail</label>
              <input
                id="register-email" name="email" type="email" required
                placeholder="voce@exemplo.com"
                value={registerForm.email} onChange={onRegisterChange}
              />
              <label htmlFor="register-password">Senha</label>
              <input
                id="register-password" name="password" type="password"
                required minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={registerForm.password} onChange={onRegisterChange}
              />
              <button disabled={loading} className="btn btn-primary" type="submit">
                {loading ? 'Criando...' : 'Criar conta'}
              </button>
            </form>
          )}

          {feedback ? <p className="feedback success">{feedback}</p> : null}
          {error ? <p className="feedback error">{error}</p> : null}
        </section>
      </div>
    </div>
  )
}

export default AuthPage