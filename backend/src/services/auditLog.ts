import type { Pool, PoolClient } from 'pg';
import type { Role } from '../types/express';

interface AuditEntry {
  actorUserId?: string;
  actorRole?: Role;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

// Accepts either the shared pool or an in-transaction client so callers can
// log inside the same BEGIN/COMMIT block as the mutation being recorded.
export async function recordAudit(
  db: Pool | PoolClient,
  { actorUserId, actorRole, action, entityType, entityId, metadata }: AuditEntry,
): Promise<void> {
  await db.query(
    `INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorUserId ?? null, actorRole ?? null, action, entityType, entityId ?? null, metadata ?? null],
  );
}
