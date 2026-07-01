import { apiFetch } from './client';
import type { User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('POST', '/auth/login', { email, password }),
};

const TOKEN_KEY = 'freight_token';
const USER_KEY = 'freight_user';

export function storeAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredAuth(): { token: string; user: User } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try { return { token, user: JSON.parse(raw) as User }; } catch { return null; }
}
