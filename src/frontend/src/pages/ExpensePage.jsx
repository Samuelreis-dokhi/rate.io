import MenuNav from "../components/MenuNav.jsx";

const ExpensePage = () => {

    return (
        <div className="page expense-page content-wrap">
            <MenuNav />

            <h1>Despesas</h1>
            <p>Aqui você pode criar e gerenciar suas despesas. Organize suas finanças registrando gastos individuais, facilitando o acompanhamento e controle dos seus gastos.</p>
            <p>Use o menu lateral para navegar entre as seções do seu dashboard.</p>
        </div>
    );
}

export default ExpensePage;