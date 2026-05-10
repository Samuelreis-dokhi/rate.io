import MenuNav from "../components/MenuNav.jsx";
import "./styles/ResetPasswordPage.css";

const ResetPasswordPage = () => {
  return (
    <div className="page dashboard-page content-wrap">
      <MenuNav />

      <div className="reset-password-container">
        <div className="reset-password-header">
          <button
            className="reset-password-back-btn"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </button>

          <h1>Redefinição de senha</h1>
          <p className="reset-password-subtitle">
            Esta funcionalidade ainda está em desenvolvimento.
          </p>
        </div>

        <div className="reset-password-card">
          <h2>Página em construção</h2>

          <p>
            Em breve você poderá redefinir sua senha por aqui.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;