import { request } from "@/services/api-client";

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    authId: string;
    avatarUrl?: string;
    isActive: boolean;
}

export function getCurrentUser(): Promise<UserProfile> {
    return request('/api/users/profile')
}

export function updateProfile(payload: {
    name?: string;
    avatarUrl?: string;
}): Promise<{ message: string; id: string; avatarUrl?: string }> {
    return request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

export function getPublicProfile(userId: string): Promise<UserProfile> {
    return request(`/api/users/${userId}`)
}