import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { changePassword } from '../services/api';
import '../styles/ChangePasswordForm.css';

export default function ChangePasswordForm() {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Validações locais
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setFeedback({ 
        type: 'error', 
        message: 'Todos os campos são obrigatórios' 
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setFeedback({ 
        type: 'error', 
        message: 'Nova senha deve ter no mínimo 6 caracteres' 
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFeedback({ 
        type: 'error', 
        message: 'Senhas não conferem' 
      });
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setFeedback({ 
        type: 'error', 
        message: 'Nova senha não pode ser igual à anterior' 
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setFeedback({ 
        type: 'success', 
        message: 'Senha alterada com sucesso! Fazendo login novamente...' 
      });

      // Limpar formulário
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Fazer logout após 2s para reautenticar
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error.message || 'Erro ao alterar senha' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h3>Alterar Senha</h3>
      
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Senha Atual</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Digite sua senha atual"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Nova Senha</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Digite a nova senha (mín. 6 caracteres)"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme a nova senha"
            disabled={loading}
            required
          />
        </div>

        {feedback.message && (
          <div className={`feedback feedback-${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-change-password"
        >
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}