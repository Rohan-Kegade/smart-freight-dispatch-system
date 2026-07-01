import { apiFetch } from './client';
import type { FreightRequest } from '@/types';

export const requestsApi = {
  create: (rawText: string) =>
    apiFetch<{ request: FreightRequest }>('POST', '/requests', { raw_text: rawText }),
  list: () =>
    apiFetch<{ requests: FreightRequest[] }>('GET', '/requests'),
  update: (id: string, data: Partial<{
    cargo_type: string;
    weight_kg: number;
    pickup_location: string;
    drop_location: string;
    deadline: string;
    special_handling: string[];
  }>) => apiFetch<{ request: FreightRequest }>('PATCH', `/requests/${id}`, data),
};
