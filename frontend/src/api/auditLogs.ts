import { apiFetch } from './client';
import type { AuditLog } from '@/types';

export const auditLogsApi = {
  list: (params?: { actorUserId?: string; entityType?: string; action?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ auditLogs: AuditLog[] }>('GET', `/audit-logs${query ? `?${query}` : ''}`);
  },
};
