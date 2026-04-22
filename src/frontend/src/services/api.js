// API_BASE_URL é a URL base para as chamadas à API, configurada via variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE;

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
        throw new Error(data.message || data.error || 'Erro na requisição');
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
    /* GET PARA OBTER OS GRUPOS DE UM USUÁRIO -> TELA DE GRUPOS */
    getUserGroups: (userId) => request(`/api/groups/user/${userId}`),
    
    /* HANDLE DE CRIAÇÃO DE GRUPOS */
    createGroup: (payload) => request('/api/groups', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),

    /* HANDLE DE CONVITE PARA GRUPOS */
    inviteToGroup: (groupId, payload) => request(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }),

    /* HANDLE DE EXCLUSÃO DE GRUPOS */
    deleteGroup: (groupId, payload) => request(`/api/groups/${groupId}`, {
        method: 'DELETE',
        body: JSON.stringify(payload),
    }),

    /* GET PARA OBTER AS ATIVIDADES DE UM GRUPO */
    getGroupActivities: (groupId, userId) => request(`/api/groups/${groupId}/activities?userId=${userId}`),

  // ── Expenses ──────────────────────────────────────────────
    /* RETORNA DESPESAS DE UM GRUPO ESPECÍFICO */
    getGroupExpenses: (groupId, userId) => request(`/api/expenses/group/${groupId}?userId=${userId}`),

    /* BALANÇO DE GRUPO */
    getGroupBalance: (groupId, userId) => request(`/api/expenses/group/${groupId}/balances?userId=${userId}`),

    /* HANDLE DE CRIAÇÃO DE DESPESAS */
    createExpense: (payload) => request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),

    /* HANDLE DE LIQUIDAÇÃO DE COMPARTILHAMENTO DE DESPESA */
    settleExpenseShare: async (expenseId, payload) => {
        /* RECUPERA O TOKEN DE ONDE FOI SALVO NO LOGIN */
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_BASE;

        /* FAZ A CHAMADA NATIVA COM FETCH */
        const response = await fetch(`${baseUrl}/expenses/${expenseId}/settle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao processar o pagamento');
        }

        return await response.json();
    },

}