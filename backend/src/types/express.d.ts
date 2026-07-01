export type Role = 'system_admin' | 'fleet_manager' | 'dispatcher' | 'driver';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        driverId?: string;
      };
    }
  }
}
