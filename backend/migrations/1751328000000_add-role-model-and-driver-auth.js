/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
exports.shorthands = undefined;

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  // ── schema drift fix ────────────────────────────────────────────────────────
  // The initial migration declares `drivers.phone` and `companies.name` unique,
  // but the live DB is missing these constraints. seed.ts relies on
  // `ON CONFLICT (phone)` / `ON CONFLICT (name)`, so restore them here.
  pgm.addConstraint('drivers', 'drivers_phone_key', 'UNIQUE(phone)');
  pgm.addConstraint('companies', 'companies_name_key', 'UNIQUE(name)');

  // ── users: 4-role model + is_active ───────────────────────────────────────
  // Constraint must be dropped before the data rename — no single CHECK
  // expression accepts both 'admin' and 'system_admin' at once.
  pgm.dropConstraint('users', 'users_role_check');
  pgm.sql("UPDATE users SET role = 'system_admin' WHERE role = 'admin'");
  pgm.addConstraint(
    'users',
    'users_role_check',
    "CHECK (role IN ('system_admin', 'fleet_manager', 'dispatcher', 'driver'))",
  );
  pgm.addColumn('users', {
    is_active: { type: 'boolean', notNull: true, default: true },
  });

  // ── drivers: optional link to a login account ─────────────────────────────
  // Fleet Manager still owns the roster row (name/phone/license); System Admin
  // provisions the actual login and links it here. Nullable — not every
  // roster entry needs portal access.
  pgm.addColumn('drivers', {
    user_id: { type: 'uuid', unique: true, references: '"users"', onDelete: 'SET NULL' },
  });

  // ── bookings: proposal lifecycle + trip milestones + manual emergency flag ─
  pgm.dropConstraint('bookings', 'bookings_status_check');
  pgm.addConstraint(
    'bookings',
    'bookings_status_check',
    "CHECK (status IN ('proposed', 'confirmed', 'rejected', 'cancelled', 'completed'))",
  );
  pgm.addColumn('bookings', {
    trip_milestone: { type: 'varchar(20)' },
    is_emergency: { type: 'boolean', notNull: true, default: false },
    emergency_note: { type: 'text' },
    emergency_marked_by: { type: 'uuid', references: '"users"' },
    emergency_marked_at: { type: 'timestamptz' },
  });
  pgm.addConstraint(
    'bookings',
    'bookings_trip_milestone_check',
    "CHECK (trip_milestone IS NULL OR trip_milestone IN ('at_pickup', 'loaded', 'in_transit', 'delivered'))",
  );

  // ── leave_requests ──────────────────────────────────────────────────────────
  pgm.createTable('leave_requests', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    driver_id: { type: 'uuid', notNull: true, references: '"drivers"' },
    start_date: { type: 'date', notNull: true },
    end_date: { type: 'date', notNull: true },
    reason: { type: 'text' },
    status: { type: 'varchar(20)', notNull: true, default: pgm.func("'pending'") },
    reviewed_by: { type: 'uuid', references: '"users"' },
    reviewed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint(
    'leave_requests',
    'leave_requests_status_check',
    "CHECK (status IN ('pending', 'approved', 'denied'))",
  );
  pgm.addConstraint('leave_requests', 'leave_requests_date_check', 'CHECK (end_date >= start_date)');
  pgm.sql(`
    CREATE TRIGGER set_updated_at_leave_requests
      BEFORE UPDATE ON leave_requests
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
  pgm.createIndex('leave_requests', 'driver_id');
  pgm.createIndex('leave_requests', 'status');

  // ── audit_logs ──────────────────────────────────────────────────────────────
  // Immutable by convention — the app only ever INSERTs here, never UPDATE/DELETE.
  pgm.createTable('audit_logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    actor_user_id: { type: 'uuid', references: '"users"' },
    actor_role: { type: 'varchar(20)' },
    action: { type: 'varchar(100)', notNull: true },
    entity_type: { type: 'varchar(50)', notNull: true },
    entity_id: { type: 'uuid' },
    metadata: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('audit_logs', 'actor_user_id');
  pgm.createIndex('audit_logs', ['entity_type', 'entity_id']);
  pgm.createIndex('audit_logs', 'created_at');
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.dropTable('audit_logs', { cascade: true });
  pgm.dropTable('leave_requests', { cascade: true });

  pgm.dropConstraint('bookings', 'bookings_trip_milestone_check');
  pgm.dropColumns('bookings', [
    'trip_milestone',
    'is_emergency',
    'emergency_note',
    'emergency_marked_by',
    'emergency_marked_at',
  ]);
  pgm.dropConstraint('bookings', 'bookings_status_check');
  pgm.addConstraint(
    'bookings',
    'bookings_status_check',
    "CHECK (status IN ('confirmed', 'completed', 'cancelled'))",
  );

  pgm.dropColumn('drivers', 'user_id');

  pgm.dropConstraint('drivers', 'drivers_phone_key');
  pgm.dropConstraint('companies', 'companies_name_key');

  pgm.dropColumn('users', 'is_active');
  pgm.dropConstraint('users', 'users_role_check');
  // Lossy: any fleet_manager/driver rows created after up() collapse to 'admin'.
  pgm.sql("UPDATE users SET role = 'admin' WHERE role = 'system_admin'");
  pgm.addConstraint('users', 'users_role_check', "CHECK (role IN ('admin', 'dispatcher'))");
};
