import { apiFetch } from './client';
import type { FreightRequest } from '@/types';

export const requestsApi = {
  create: (rawText: string) =>
    apiFetch<{ request: FreightRequest }>('POST', '/requests', { raw_text: rawText }),
  list: () =>
    apiFetch<{ requests: FreightRequest[] }>('GET', '/requests'),
};
