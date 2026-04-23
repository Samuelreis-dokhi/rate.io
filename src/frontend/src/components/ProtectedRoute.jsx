// Importa o componente de navegação do React Router para redirecionamento
import { Navigate } from 'react-router-dom';
// importa o hook de autenticação para acessar o estado de autenticação e bootstrapping
import { useAuth } from '../context/useAuth';



const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, bootstrapping } = useAuth();

    // Se estiver no processo de bootstrapping, exibe um indicador de carregamento
    if (bootstrapping) {
        return (
            <div className='screen-message' role='status' aria-label='Carregando Painel'>
                <p>Carregando painel...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        // Se o usuário não estiver autenticado, redireciona para a página de login
        return <Navigate to='/auth' replace />;
    }

    return children;
}

export default ProtectedRoute;