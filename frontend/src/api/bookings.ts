import { apiFetch } from './client';
import type { Booking } from '@/types';

export const bookingsApi = {
  create: (payload: {
    requestId: string;
    vehicleId: string;
    driverId: string;
    startTime: string;
    endTime: string;
    score: number;
    deadheadKm: number;
    costEstimate: number;
  }) => apiFetch<{ booking: Booking }>('POST', '/bookings', payload),

  list: () => apiFetch<{ bookings: Booking[] }>('GET', '/bookings'),

  get: (id: string) => apiFetch<{ booking: Booking }>('GET', `/bookings/${id}`),

  update: (id: string, status: 'cancelled' | 'completed') =>
    apiFetch<{ message: string }>('PATCH', `/bookings/${id}`, { status }),
};
