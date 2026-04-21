import MenuNav from "../components/MenuNav.jsx";

const GroupDetailPage = () => {

    return (
        <div className="page group-page content-wrap">
            <MenuNav />

            <h1>Detalhes do grupo</h1>
            <p>Esta página deve exibir os detalhes de cada grupo. Começamos com o nome do grupo, seguido do balanço geral, despesas listadas, atividades, do grupo, funções de criar, editar, excluir um grupo, definir uma despesa como paga e convidar membros</p>
        </div>
    );
}

export default GroupDetailPage;