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
    </div>
  );

}

export default DashboardPage;