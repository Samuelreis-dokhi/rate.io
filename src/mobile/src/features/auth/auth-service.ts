import { request } from "@/services/api-client";

/** PAYLOAD */
interface LoginPayload {
    email: string;
    password: string;
}
interface RegisterPayload {
    name: string;
    email: string;
    password: string; // Auth._id
}

/** RESPONSE */
interface LoginResponse {
    message: string;
    token: string;
    userId: string;  // Auth._id
}
interface RegisterResponse {
    message: string;
    authId: string;
    id: string;
    name: string;
    email: string;
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
    return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export function register(payload: RegisterPayload): Promise<RegisterResponse> {
    return request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export function changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}): Promise<{ message: string }> {
    return request('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}