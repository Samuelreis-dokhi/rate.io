const bcrypt = require('bcryptjs');
const {
  changePassword,
  validateChangePasswordPayload,
} = require('../../services/changePasswordService');

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('Change Password Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate current password', async () => {
    const auth = {
      password: 'hashed-current-password',
      isActive: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const Auth = {
      findById: jest.fn().mockResolvedValue(auth),
    };

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      changePassword({
        Auth,
        authId: 'auth-id',
        currentPassword: 'senha-atual',
        newPassword: 'senha-nova',
        confirmPassword: 'senha-nova',
      })
    ).rejects.toMatchObject({
      message: 'Senha atual incorreta',
      statusCode: 401,
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('senha-atual', 'hashed-current-password');
    expect(auth.save).not.toHaveBeenCalled();
  });

  it('should check password strength', () => {
    expect(() =>
      validateChangePasswordPayload({
        currentPassword: 'senha-atual',
        newPassword: '12345',
        confirmPassword: '12345',
      })
    ).toThrow('Nova senha deve ter no mínimo 6 caracteres');
  });

  it('should reject if passwords do not match', () => {
    expect(() =>
      validateChangePasswordPayload({
        currentPassword: 'senha-atual',
        newPassword: 'senha-nova',
        confirmPassword: 'outra-senha',
      })
    ).toThrow('Senhas não conferem');
  });

  it('should persist new password so Auth model hook hashes it', async () => {
    const auth = {
      password: 'hashed-current-password',
      isActive: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const Auth = {
      findById: jest.fn().mockResolvedValue(auth),
    };

    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await changePassword({
      Auth,
      authId: 'auth-id',
      currentPassword: 'senha-atual',
      newPassword: 'senha-nova',
      confirmPassword: 'senha-nova',
    });

    expect(auth.password).toBe('senha-nova');
    expect(auth.save).toHaveBeenCalledTimes(1);
  });

  it('should reject when new password matches the previous password', async () => {
    const auth = {
      password: 'hashed-current-password',
      isActive: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const Auth = {
      findById: jest.fn().mockResolvedValue(auth),
    };

    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    await expect(
      changePassword({
        Auth,
        authId: 'auth-id',
        currentPassword: 'senha-atual',
        newPassword: 'senha-atual',
        confirmPassword: 'senha-atual',
      })
    ).rejects.toMatchObject({
      message: 'a senha nao pode ser a mesma utilizada anteriormente',
      statusCode: 400,
    });

    expect(bcrypt.compare).toHaveBeenNthCalledWith(1, 'senha-atual', 'hashed-current-password');
    expect(bcrypt.compare).toHaveBeenNthCalledWith(2, 'senha-atual', 'hashed-current-password');
    expect(auth.save).not.toHaveBeenCalled();
  });
});
