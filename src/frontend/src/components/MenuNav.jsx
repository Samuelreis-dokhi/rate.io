import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import { useState } from 'react'

const MenuNav = () => {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  /* Estado para controlar a abertura do menu no mobile */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = isAuthenticated ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/groups', label: 'Grupos' },
    { to: '/activities', label: 'Atividades' },
    { to: '/profile', label: 'Perfil' },
  ] : [
    { to: '/auth', label: 'Começar agora' },
  ];

  const closeMenu = () => setIsMenuOpen(false);
  
  return (
    <nav className='topbar'>
      <div className='bg-shape bg-shape-top' aria-hidden='true' />
      <div className='bg-shape bg-shape-bottom' aria-hidden='true' />
      <Link to={isAuthenticated ? '/dashboard' : '/'} className='brand'>
        RATE.IO
      </Link>

      <div className='menu-container'>
        
        {/* Botão Hamburguer visível apeanas no mobile */}
        <button className='hamburguer-btn' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? 'x':'☰'}
        </button>
        
        {/* A classe is-open é adicionada dinamicamente com base no estado */}
        <nav className={`menu-nav ${isMenuOpen ? 'is-open' : ''}`}>
          <ul className='menu-links'>
            {navLinks.map((link,i) => (
              <li key={i}>
                <Link to={link.to} className={location.pathname === link.to ? 'active' : ''} onClick={closeMenu}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {isAuthenticated && (
            <button onClick={() => { logout(); closeMenu(); }} className='btn btn-small btn-outline'>
              Sair
            </button>
          )}
        </nav>
      </div>

    </nav>
  )
}

export default MenuNav