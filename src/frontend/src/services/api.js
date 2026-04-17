// API_BASE_URL é a URL base para as chamadas à API, configurada via variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// função que lê o token do localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}

// Wrapper centralizado para chamadas à API
const request = async (endpoint, options = {}) => {
    const response = await fetch (`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({})); // Em caso de resposta sem JSON, retorna um objeto vazio

    if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
    }

    return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────
    register: (payload) => request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    login: (payload) => request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    logout: () => Promise.resolve(),
    
  // ── User ──────────────────────────────────────────────
    // GET /api/users/profile - perfil do usuário autenticado (via token)
    getCurrentUser: () => request('/api/users/profile'),
    
    // GET /api/users/:userId - perfil público de um usuário 
    getUserProfile: (userId) => request(`/api/users/${userId}`),

    // PUT /api/users/profile - atualiza nome/avatar do usuário autenticado
    updateUserProfile: (_userId, payload) => request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
    }),

  // ── Groups ──────────────────────────────────────────────
    getUserGroups: (userId) => request(`/api/groups/user/${userId}`),
    
    createGroup: (payload) => request('/api/groups', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),

    inviteToGroup: (groupId, payload) => request(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }),

    deleteGroup: (groupId, payload) => request(`/api/groups/${groupId}`, {
        method: 'DELETE',
        body: JSON.stringify(payload),
    }),

    getGroupActivities: (groupId, userId) => request(`/api/groups/${groupId}/activities?userId=${userId}`),

  // ── Expenses ──────────────────────────────────────────────
    // Retorna expenses:[...] do grupo, já filtrados para o userId (com campo "paidByUser" true/false)
    getGroupExpenses: (groupId, userId) => request(`/api/expenses/group/${groupId}?userId=${userId}`),

    // Retorna balance: { totalPaid, totalOwed, netBalance, summary } 
    getGroupBalance: (groupId, userId) => request(`/api/expenses/group/${groupId}/balance?userId=${userId}`),

    createExpense: (payload) => request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),

    settleExpenseShare: (expenseId, payload) => request(`/api/expenses/${expenseId}/settle`, {
        method: 'POST',
        body: JSON.stringify({
            userId: payload.userId,
            paidBy: payload.paid,
        }),
    }),

}