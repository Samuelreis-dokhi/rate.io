/**
 * MenuNav.jsx
 * Componente de navegação para o painel do usuário replicável em todas as páginas protegidas.
 * Deve conter links para as principais seções do dashboard e um botão de logout.
 * O layout deve ser responsivo, adaptando-se a diferentes tamanhos de tela.
 * O estilo deve ser consistente com o design geral do aplicativo, utilizando as cores e fontes definidas.
 * Este componente é essencial para a usabilidade do dashboard, garantindo fácil acesso às funcionalidades principais.
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

/**
 * Componente de navegação para o painel do usuário.
 * @returns {JSX.Element}
 * Se usuário está logado, exibe links para Dashboard, Grupos, Despesas e um botão de Logout.
 * Se usuário não está logado, exibe Título, "como funciona" e "começar agora".
 */
const MenuNav = () => {
    const { isAuthenticated, logout } = useAuth()
    const actionRoute = isAuthenticated ? '/dashboard' : '/auth'
    const actionLabel = isAuthenticated ? 'Dashboard' : 'Começar agora'
    
    return (
        <nav className='topbar'>
        <div className='bg-shape bg-shape-top' aria-hidden='true' />
        <div className='bg-shape bg-shape-bottom' aria-hidden='true' />           
            <div className='brand'>RATE.IO</div>
            <ul className='menu-links'>
                {isAuthenticated ? (
                    <>
                        <li><Link to='/dashboard'>Dashboard</Link></li>
                        <li><Link to='/groups'>Grupos</Link></li>
                        <li><Link to='/expenses'>Despesas</Link></li>
                        <li><button onClick={logout} className='btn btn-small btn-outline'>Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><a href='#como-funciona'>Como funciona</a></li>
                        <li><Link to={actionRoute} className='btn btn-small btn-outline'>{actionLabel}</Link></li>
                    </>
                )}
            </ul>                
        </nav>
    )
}

export default MenuNav