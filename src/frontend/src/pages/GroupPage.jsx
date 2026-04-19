import MenuNav from "../components/MenuNav.jsx";

const GroupPage = () => {

    return (
        <div className="page group-page content-wrap">
            <MenuNav />

            <h1>Grupos de Despesas</h1>
            <p>Aqui você pode criar e gerenciar seus grupos de despesas. Organize suas finanças agrupando despesas relacionadas, facilitando o acompanhamento e controle dos seus gastos.</p>
            <p>Use o menu lateral para navegar entre as seções do seu dashboard.</p>
        </div>
    );
}

export default GroupPage;