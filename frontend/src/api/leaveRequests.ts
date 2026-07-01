import { apiFetch } from './client';
import type { LeaveRequest } from '@/types';

export const leaveRequestsApi = {
  list: (params?: { driverId?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ leaveRequests: LeaveRequest[] }>('GET', `/leave-requests${query ? `?${query}` : ''}`);
  },

  get: (id: string) => apiFetch<{ leaveRequest: LeaveRequest }>('GET', `/leave-requests/${id}`),

  create: (data: { driverId?: string; startDate: string; endDate: string; reason?: string }) =>
    apiFetch<{ leaveRequest: LeaveRequest }>('POST', '/leave-requests', data),

  approve: (id: string) => apiFetch<{ message: string }>('PATCH', `/leave-requests/${id}/approve`),

  deny: (id: string) => apiFetch<{ message: string }>('PATCH', `/leave-requests/${id}/deny`),

  end: (id: string) => apiFetch<{ message: string }>('PATCH', `/leave-requests/${id}/end`),
};
