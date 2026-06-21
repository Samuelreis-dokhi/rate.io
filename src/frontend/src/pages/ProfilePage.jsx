import { useEffect, useState } from 'react'
import MenuNav from '../components/MenuNav.jsx'
import { Modal } from '../components/ui/index.jsx'
import { api } from '../services/api.js'
import './styles/shared.css'
import './styles/ProfilePage.css'

const initialPasswordData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [initialProfileData, setInitialProfileData] = useState({
    name: '',
    email: '',
    avatarUrl: null,
  })
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [passwordData, setPasswordData] = useState(initialPasswordData)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState('')

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await api.getCurrentUser()

        setFormData({
          name: userData.name || '',
          email: userData.email || '',
        })
        setInitialProfileData({
          name: userData.name || '',
          email: userData.email || '',
          avatarUrl: userData.avatarUrl || null,
        })

        setAvatar(userData.avatarUrl || null)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError('Erro ao carregar dados do perfil')
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target
    setPasswordData((current) => ({ ...current, [name]: value }))
    setPasswordError('')
    setPasswordFeedback('')
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    setError('')
    setShowConfirmationModal(true)
  }

  const handleConfirmSave = async () => {
    try {
      await api.updateUserProfile(null, {
        name: formData.name,
        avatarUrl: avatar,
      })

      setInitialProfileData({
        name: formData.name,
        email: formData.email,
        avatarUrl: avatar,
      })

      setShowConfirmationModal(false)
      window.location.reload()
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setError('Erro ao salvar perfil')
      setShowConfirmationModal(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordFeedback('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Senhas não batem')
      return
    }

    setPasswordLoading(true)

    try {
      await api.changePassword(passwordData)
      setPasswordData(initialPasswordData)
      setPasswordFeedback('Senha alterada com sucesso.')
    } catch (err) {
      const message = err.message || 'Não foi possível alterar a senha.'
      setPasswordError(message === 'Senha atual incorreta' ? 'Senha incorreta' : message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: initialProfileData.name,
      email: initialProfileData.email,
    })
    setAvatar(initialProfileData.avatarUrl)
    setError('')
  }

  const togglePasswordAccordion = () => {
    setIsPasswordOpen((current) => !current)
    setPasswordError('')
    setPasswordFeedback('')
  }

  const getInitial = () => {
    return (formData.name || formData.email || 'U').charAt(0).toUpperCase()
  }

  return (
    <div className='inner-page'>
      <MenuNav />

      <div className='inner-page-body content-wrap'>
        <div className='page-header profile-page-header'>
          <div className='page-header__text'>
            <button className='back-link' onClick={() => window.history.back()} type='button'>
              ← Voltar
            </button>
            <h1>Perfil de usuário</h1>
            <p>Gerencie suas informações pessoais e configurações de conta.</p>
          </div>
        </div>

        {error && <div className='profile-error profile-page-alert'>{error}</div>}

        <div className='profile-layout'>
          <section className='profile-summary-card' aria-label='Foto do perfil'>
            <div className='profile-avatar-wrapper'>
              {avatar ? (
                <img src={avatar} alt='Avatar do usuário' className='profile-avatar-image' />
              ) : (
                <span className='profile-avatar-initial'>{getInitial()}</span>
              )}
            </div>

            <button
              type='button'
              className='btn btn-outline profile-avatar-btn'
              onClick={() => setShowModal(true)}
            >
              Alterar foto
            </button>
          </section>

          <main className='profile-content'>
            <form className='profile-panel profile-form'>
              <div className='profile-section-header'>
                <h2 className='profile-section-title'>Dados cadastrais</h2>
                <p>Esses dados aparecem na sua conta e nos grupos dos quais você participa.</p>
              </div>

              <div className='profile-form-grid'>
                <div className='form-group'>
                  <label htmlFor='name'>Nome</label>
                  <input
                    id='name'
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Digite seu nome'
                  />
                </div>

                <div className='form-group form-group--readonly'>
                  <label htmlFor='email'>Email</label>
                  <input
                    id='email'
                    type='email'
                    name='email'
                    value={formData.email}
                    disabled
                    placeholder='email@example.com'
                  />
                  <span className='form-group-hint'>Email não pode ser alterado.</span>
                </div>
              </div>

              <div className='profile-actions'>
                <button type='button' className='btn btn-primary' onClick={handleSave}>
                  Salvar alterações
                </button>
                <button type='button' className='btn btn-ghost' onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>

            <section className={`profile-panel profile-password-actions ${isPasswordOpen ? 'is-open' : ''}`}>
              <button
                type='button'
                className='profile-password-toggle'
                onClick={togglePasswordAccordion}
                aria-expanded={isPasswordOpen}
                aria-controls='change-password-panel'
              >
                <span className='profile-password-heading'>
                  <span className='profile-section-title'>Senha</span>
                  <span className='form-group-hint'>
                    Por questões de segurança, recomendamos que a senha seja alterada periodicamente.
                  </span>
                </span>
                <span className='profile-password-chevron' aria-hidden='true'>
                  {isPasswordOpen ? '−' : '+'}
                </span>
              </button>

              {isPasswordOpen ? (
                <form
                  id='change-password-panel'
                  className='profile-password-form'
                  onSubmit={handlePasswordSubmit}
                >
                  <div className='profile-form-grid'>
                    <div className='form-group'>
                      <label htmlFor='currentPassword'>Senha atual</label>
                      <input
                        id='currentPassword'
                        name='currentPassword'
                        type='password'
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        autoComplete='current-password'
                        required
                      />
                    </div>

                    <div className='form-group'>
                      <label htmlFor='newPassword'>Nova senha</label>
                      <input
                        id='newPassword'
                        name='newPassword'
                        type='password'
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        autoComplete='new-password'
                        minLength={6}
                        required
                      />
                    </div>

                    <div className='form-group'>
                      <label htmlFor='confirmPassword'>Confirmar nova senha</label>
                      <input
                        id='confirmPassword'
                        name='confirmPassword'
                        type='password'
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        autoComplete='new-password'
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  {passwordError && <div className='profile-error'>{passwordError}</div>}
                  {passwordFeedback && <div className='profile-success'>{passwordFeedback}</div>}

                  <button type='submit' className='btn btn-primary profile-password-submit' disabled={passwordLoading}>
                    {passwordLoading ? 'Alterando...' : 'Alterar senha'}
                  </button>
                </form>
              ) : null}
            </section>
          </main>
        </div>

        <Modal
          open={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          title='Confirmar alterações'
          size='sm'
        >
          <div className='profile-modal-content'>
            <p>Tem certeza que deseja salvar as alterações do seu perfil?</p>
            <div className='modal-actions modal-actions--reversed'>
              <button className='btn btn-primary' onClick={handleConfirmSave} type='button'>
                Confirmar
              </button>
              <button className='btn btn-ghost' onClick={() => setShowConfirmationModal(false)} type='button'>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title='Alterar foto de perfil'
          size='sm'
        >
          <div className='profile-modal-content'>
            <p>Funcionalidade em desenvolvimento</p>
            <div className='modal-actions'>
              <button className='btn btn-ghost' onClick={() => setShowModal(false)} type='button'>
                Cancelar
              </button>
              <button className='btn btn-primary' onClick={() => setShowModal(false)} type='button'>
                OK
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ProfilePage
