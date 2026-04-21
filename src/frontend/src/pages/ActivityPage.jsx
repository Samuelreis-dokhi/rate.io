import MenuNav from "../components/MenuNav.jsx";

const ActivityPage = () => {

  return (

    <div className="page dashboard-page content-wrap">
      <MenuNav />

      <h1>Página de atividades</h1>
      <p>
        Esta página deve exibir um feed de atividades recentes relacionadas às despesas e grupos do usuário.
        As atividades podem incluir ações como "João adicionou uma despesa de R$ 50 ao grupo 'Alimentação'", "Maria pagou a despesa 'Jantar' no valor de R$ 30", ou "Carlos criou o grupo 'Viagem'".
        Cada atividade deve mostrar o nome do usuário que realizou a ação, a descrição da ação, o valor envolvido (se aplicável) e um timestamp indicando quando a atividade ocorreu.
        A página deve ser acessível a partir do menu do dashboard e deve seguir o mesmo estilo visual das outras páginas protegidas.
        Esta funcionalidade é importante para manter o usuário informado sobre as mudanças e atualizações em seus grupos e despesas, promovendo transparência e colaboração entre os membros dos grupos.
      </p>
    </div>
  );

}

export default ActivityPage;