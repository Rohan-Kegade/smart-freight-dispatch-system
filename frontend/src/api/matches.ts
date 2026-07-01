import { apiFetch } from './client';
import type { Match } from '@/types';

export const matchesApi = {
  get: (requestId: string) =>
    apiFetch<{ matches: Match[] }>('GET', `/matches?requestId=${encodeURIComponent(requestId)}`),
};
