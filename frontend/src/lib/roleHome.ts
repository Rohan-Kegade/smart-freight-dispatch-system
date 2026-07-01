import type { Role } from '@/types';

export function roleHomePath(role: Role | undefined): string {
  switch (role) {
    case 'system_admin': return '/app/system/users';
    case 'fleet_manager': return '/app/fleet/dashboard';
    case 'driver': return '/app/driver/trips';
    case 'dispatcher':
    default:
      return '/app/dashboard';
  }
}
