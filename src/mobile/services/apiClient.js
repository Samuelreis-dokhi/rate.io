import { getToken, clearSession } from "./storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export async function request(endpoint, options = {}) {
    if(!API_BASE_URL) {
        throw new ApiError('Base URL da API não foi configurada', 0, {})
    }

    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) {
            await clearSession();
        }

        throw new ApiError(data.message || data.error || 'Erro na requisição', response.status, data);
    }

    return data;
}