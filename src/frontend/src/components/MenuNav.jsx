import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

const MenuNav = () => {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/groups', label: 'Grupos' },
    { to: '/activities', label: 'Atividades' },
  ]

  return (
    <nav className='topbar'>
      <div className='bg-shape bg-shape-top' aria-hidden='true' />
      <div className='bg-shape bg-shape-bottom' aria-hidden='true' />
      <Link to={isAuthenticated ? '/dashboard' : '/'} className='brand'>
        RATE.IO
      </Link>
      <ul className='menu-links'>
        {isAuthenticated ? (
          <>
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={location.pathname === to || location.pathname.startsWith(to + '/') ? 'nav-link nav-link--active' : 'nav-link'}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button onClick={logout} className='btn btn-small btn-outline'>
                Sair
              </button>
            </li>
          </>
        ) : (
          <>
            <li><a href='#como-funciona' className='nav-link'>Como funciona</a></li>
            <li>
              <Link to='/auth' className='btn btn-small btn-outline'>
                Começar agora
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default MenuNav