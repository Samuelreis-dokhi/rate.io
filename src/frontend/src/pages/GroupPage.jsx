import MenuNav from "../components/MenuNav.jsx";

const GroupPage = () => {

    return (
        <div className="page group-page content-wrap">
            <MenuNav />

            <h1>Dashboard de Grupos</h1>
            <p>Deve exibir uma lista dos grupos de despesas criados pelo usuário, com opções para criar um novo grupo, editar ou excluir grupos existentes. 
            <p>Cada grupo deve mostrar o nome, a descrição e o saldo atual (total de despesas - total de pagamentos).</p>
            <p>A página deve ser acessível a partir do menu do dashboard e deve seguir o mesmo estilo visual das outras páginas protegidas.</p>Esta página é fundamental para a organização das finanças do usuário, permitindo que ele categorize suas despesas de forma eficiente.</p>
        </div>
    );
}

export default GroupPage;