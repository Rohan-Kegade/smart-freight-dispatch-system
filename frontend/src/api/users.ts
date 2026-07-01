import { apiFetch } from './client';
import type { Role } from '@/types';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  driver_id: string | null;
}

export const usersApi = {
  list: () => apiFetch<{ users: AdminUser[] }>('GET', '/users'),

  create: (data: { email: string; password: string; name: string; role: Role; driverId?: string }) =>
    apiFetch<{ user: AdminUser }>('POST', '/users', data),

  update: (id: string, data: Partial<{
    name: string;
    role: Role;
    is_active: boolean;
    password: string;
    driverId: string | null;
  }>) => apiFetch<{ message: string }>('PATCH', `/users/${id}`, data),
};
