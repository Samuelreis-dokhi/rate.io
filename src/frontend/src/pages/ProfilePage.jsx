import { useState, useEffect } from "react";
import MenuNav from "../components/MenuNav.jsx";
import "./styles/ProfilePage.css";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Carregar dados do usuário ao montar o componente
// Carregar dados do usuário ao montar o componente
useEffect(() => {
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token"); // ou onde você armazena o token

      if (!token) {
        throw new Error("Token não encontrado. Tente fazer login novamente.");
      }

      const response = await fetch("http://localhost:3000/api/users/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar dados do perfil.");
      }

      const userData = await response.json();

      setFormData({
        name: userData.name || "",
        email: userData.email || "",
      });

      // Caso exista avatar salvo, o que não será o caso de nenhum usuário no momento.
      if (userData.avatarUrl) {
        setAvatar(userData.avatarUrl);
      }

    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Erro ao carregar dados do perfil");
    }
  };

  loadUserData();
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    setError("");
    console.log("Perfil atualizado:", formData);
    // Aqui você faria a requisição para salvar os dados na API
  };

  const handleCancel = () => {
    // Recarregar dados originais do usuário
    const userData = {
      name: "João Silva",
      email: "joao@example.com",
    };
    setFormData(userData);
    setAvatar(null);
    setError("");
  };

  const getInitial = () => {
    return formData.name.charAt(0).toUpperCase();
  };

  return (
    <div className="page dashboard-page content-wrap">
      <MenuNav />

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="profile-back-btn" onClick={() => window.history.back()}>
            ← Voltar
          </button>
          <h1>Perfil de usuário</h1>
          <p className="profile-subtitle">Gerenciar suas informações pessoais e configurações de conta</p>
        </div>

        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {avatar ? (
              <img src={avatar} alt="Avatar do usuário" className="profile-avatar-image" />
            ) : (
              <span className="profile-avatar-initial">{getInitial()}</span>
            )}
          </div>
          <button
            type="button"
            className="btn profile-avatar-btn"
            onClick={() => setShowModal(true)}
          >
            Alterar foto de perfil
          </button>
        </div>

        {/* Modal de Alteração de Foto */}
        {showModal && (
          <div className="profile-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <button
                  className="profile-modal-back-btn"
                  onClick={() => setShowModal(false)}
                  aria-label="Voltar"
                >
                  ←
                </button>
              </div>
              <div className="profile-modal-content">
                <p>Funcionalidade em desenvolvimento</p>
              </div>
              <div className="profile-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="profile-error">{error}</div>}

        {/* Form */}
        <form className="profile-form">
          {/* Personal Information Section */}
          <div className="profile-section">
            <h2 className="profile-section-title">Dados Cadastrais</h2>

            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome"
              />
            </div>

            <div className="form-group form-group--readonly">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="email@example.com"
              />
              <span className="form-group-hint">Email não pode ser alterado.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;