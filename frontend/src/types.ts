export type Role = 'system_admin' | 'fleet_manager' | 'dispatcher' | 'driver';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  driverId?: string;
}

export interface LicenseType {
  id: string;
  name: string;
}

export interface VehicleType {
  id: string;
  name: string;
  compatible_cargo_types: string[];
  is_refrigerated: boolean;
  is_hazmat_certified: boolean;
  required_license_type: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  capacity_kg: number;
  maintenance_status: 'active' | 'maintenance' | 'retired';
  current_location: string;
  type: VehicleType;
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  hours_worked_this_week: number;
  on_leave_until: string | null;
  current_location: string;
  license_type: LicenseType;
  user_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FreightRequest {
  id: string;
  raw_text: string;
  cargo_type: string;
  weight_kg: string | number;
  pickup_location: string;
  drop_location: string;
  deadline: string;
  special_handling: string[];
  status: string;
  company_id: string | null;
  created_at: string;
}

export interface Match {
  vehicle_id: string;
  vehicle_number: string;
  driver_id: string;
  driver_name: string;
  score: number;
  deadhead_km: number;
  eta_to_pickup_minutes: number;
  trip_km: number;
  cost_estimate: number;
  overtime_risk_hours: number;
  explanation: string | null;
}

export type TripMilestone = 'at_pickup' | 'loaded' | 'in_transit' | 'delivered';

export interface Booking {
  id: string;
  request_id: string;
  vehicle_id: string;
  driver_id: string;
  start_time: string;
  end_time: string;
  status: 'proposed' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  score: number | null;
  deadhead_km: number | null;
  cost_estimate: number | null;
  vehicle_number: string;
  vehicle_type: string;
  driver_name: string;
  driver_phone: string;
  cargo_type: string;
  pickup_location: string;
  drop_location: string;
  created_at: string;
  trip_milestone: TripMilestone | null;
  is_emergency: boolean;
  emergency_note: string | null;
  emergency_marked_by: string | null;
  emergency_marked_at: string | null;
}

export interface LeaveRequest {
  id: string;
  driver_id: string;
  driver_name?: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  actor_name?: string;
  actor_email?: string;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
