import { useAuth } from "../context/useAuth";
import MenuNav from "../components/MenuNav.jsx";

const DashboardPage = () => {

  const { user } = useAuth();

  return (

    <div className="page dashboard-page content-wrap">
      <MenuNav />


      <h1>Bem-vindo, {user.name}!</h1>
      <p>Este é o seu painel de controle. Aqui você pode criar grupos, adicionar despesas e acompanhar seus saldos em tempo real.</p>
      <p>Use o menu lateral para navegar entre as seções do seu dashboard.</p>

      {/* Lista de páginas para fins de teste */}
      <ul>
        <li><a href="/groups">Grupos</a></li>
        <li><a href="/groups/:groupId">Página de grupo específico</a></li>
        <li><a href="/activities">Atividades</a></li>
        <li><a href="/profile">Perfil</a></li>
      </ul>
    </div>
  );

}

export default DashboardPage;