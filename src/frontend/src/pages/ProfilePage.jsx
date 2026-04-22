import MenuNav from "../components/MenuNav.jsx";

const ProfilePage = () => {

  return (

    <div className="page dashboard-page content-wrap">
      <MenuNav />

      <h1>Perfil de usuário</h1>
      <p>
        Esta página deve exibir informações sobre o usuário logado, como nome, email, foto de perfil e outras informações de conta.
        Aqui o usuário deve ter a opção de editar suas informações pessoais, como nome e foto de perfil, e também a opção de alterar sua senha.
        A página deve ser acessível a partir do menu do dashboard e deve seguir o mesmo estilo visual das outras páginas protegidas.
        Esta funcionalidade é importante para que o usuário possa manter suas informações de conta atualizadas e personalizar sua experiência no aplicativo.
      </p>
    </div>
  );

}

export default ProfilePage;