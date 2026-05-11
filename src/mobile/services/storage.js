import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'rateio.token';
const PROFILE_KEY = 'rateio.profile';


/* auth token */
export async function saveToken(token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

/* Profile */
export async function saveProfile(profile) {
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile() {
    const value = await SecureStore.setItemAsync(PROFILE_KEY);
    return value ? JSON.parse(value) : null;
}

export async function clearSession() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(PROFILE_KEY);
}