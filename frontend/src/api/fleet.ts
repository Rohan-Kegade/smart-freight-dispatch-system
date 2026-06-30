import { apiFetch } from './client';
import type { Driver, Vehicle, VehicleType } from '@/types';

export const fleetApi = {
  getVehicles: () => apiFetch<{ vehicles: Vehicle[] }>('GET', '/fleet/vehicles'),
  createVehicle: (data: {
    vehicle_number: string;
    type_id: string;
    capacity_kg: number;
    current_location: string;
    maintenance_status?: string;
  }) => apiFetch<Vehicle>('POST', '/fleet/vehicles', data),
  updateVehicle: (id: string, data: Partial<{
    capacity_kg: number;
    maintenance_status: string;
    current_location: string;
    type_id: string;
  }>) => apiFetch<Vehicle>('PATCH', `/fleet/vehicles/${id}`, data),

  getDrivers: () => apiFetch<{ drivers: Driver[] }>('GET', '/fleet/drivers'),
  createDriver: (data: {
    name: string;
    phone: string;
    license_type_id: string;
    current_location: string;
    hours_worked_this_week?: number;
    on_leave_until?: string | null;
  }) => apiFetch<Driver>('POST', '/fleet/drivers', data),
  updateDriver: (id: string, data: Partial<{
    name: string;
    phone: string;
    license_type_id: string;
    current_location: string;
    hours_worked_this_week: number;
    on_leave_until: string | null;
  }>) => apiFetch<Driver>('PATCH', `/fleet/drivers/${id}`, data),

  getVehicleTypes: () => apiFetch<{ vehicle_types: VehicleType[] }>('GET', '/fleet/vehicle-types'),
};
