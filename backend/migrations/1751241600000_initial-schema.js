/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
exports.shorthands = undefined;

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  // Extensions
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Reusable trigger function for auto-updating updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  // ── users (Admin + Dispatcher auth) ───────────────────────────────────────
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(20)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('users', 'users_role_check', "CHECK (role IN ('admin', 'dispatcher'))");

  // ── license_types (reference data) ────────────────────────────────────────
  pgm.createTable('license_types', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(50)', notNull: true, unique: true },
    description: { type: 'text' },
  });

  // ── vehicle_types (reference data) ────────────────────────────────────────
  pgm.createTable('vehicle_types', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    compatible_cargo_types: {
      type: 'text[]',
      notNull: true,
      default: pgm.func("'{}'"),
    },
    is_refrigerated: { type: 'boolean', notNull: true, default: false },
    is_hazmat_certified: { type: 'boolean', notNull: true, default: false },
    required_license_type_id: {
      type: 'uuid',
      notNull: true,
      references: '"license_types"',
    },
  });

  // ── vehicles ──────────────────────────────────────────────────────────────
  pgm.createTable('vehicles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    vehicle_number: { type: 'varchar(50)', notNull: true, unique: true },
    type_id: { type: 'uuid', notNull: true, references: '"vehicle_types"' },
    capacity_kg: { type: 'integer', notNull: true },
    maintenance_status: {
      type: 'varchar(20)',
      notNull: true,
      default: pgm.func("'active'"),
    },
    current_location: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint(
    'vehicles',
    'vehicles_status_check',
    "CHECK (maintenance_status IN ('active', 'maintenance', 'retired'))",
  );
  pgm.sql(`
    CREATE TRIGGER set_updated_at_vehicles
      BEFORE UPDATE ON vehicles
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);

  // ── drivers ───────────────────────────────────────────────────────────────
  pgm.createTable('drivers', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    phone: { type: 'varchar(20)', notNull: true },
    license_type_id: {
      type: 'uuid',
      notNull: true,
      references: '"license_types"',
    },
    hours_worked_this_week: { type: 'decimal(5,2)', notNull: true, default: 0 },
    on_leave_until: { type: 'timestamptz' }, // NULL = not on leave
    current_location: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.sql(`
    CREATE TRIGGER set_updated_at_drivers
      BEFORE UPDATE ON drivers
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);

  // ── companies (clients placing requests) ──────────────────────────────────
  pgm.createTable('companies', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    contact_person: { type: 'varchar(255)' },
    phone: { type: 'varchar(20)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // ── requests (transport requests from dispatchers) ────────────────────────
  pgm.createTable('requests', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_id: { type: 'uuid', references: '"companies"' }, // nullable
    raw_text: { type: 'text', notNull: true },
    cargo_type: { type: 'varchar(100)' },
    weight_kg: { type: 'decimal(10,2)' },
    pickup_location: { type: 'varchar(255)' },
    drop_location: { type: 'varchar(255)' },
    deadline: { type: 'timestamptz' },
    special_handling: { type: 'text[]', default: pgm.func("'{}'") },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: pgm.func("'pending_confirmation'"),
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint(
    'requests',
    'requests_status_check',
    "CHECK (status IN ('pending_confirmation', 'confirmed', 'matched', 'booked', 'cancelled'))",
  );
  pgm.sql(`
    CREATE TRIGGER set_updated_at_requests
      BEFORE UPDATE ON requests
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);

  // ── bookings ──────────────────────────────────────────────────────────────
  // Overlap guard is enforced in application layer (serializable transaction)
  // rather than a DB exclusion constraint, since tstzrange exclusion requires
  // the btree_gist extension which adds infra complexity for this project's scale.
  pgm.createTable('bookings', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    request_id: { type: 'uuid', notNull: true, references: '"requests"' },
    vehicle_id: { type: 'uuid', notNull: true, references: '"vehicles"' },
    driver_id: { type: 'uuid', notNull: true, references: '"drivers"' },
    start_time: { type: 'timestamptz', notNull: true },
    end_time: { type: 'timestamptz', notNull: true },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: pgm.func("'confirmed'"),
    },
    score: { type: 'decimal(6,2)' },
    deadhead_km: { type: 'decimal(8,2)' },
    cost_estimate: { type: 'decimal(10,2)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint(
    'bookings',
    'bookings_status_check',
    "CHECK (status IN ('confirmed', 'completed', 'cancelled'))",
  );
  pgm.addConstraint('bookings', 'bookings_time_check', 'CHECK (end_time > start_time)');
  pgm.sql(`
    CREATE TRIGGER set_updated_at_bookings
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);

  // ── Indexes ───────────────────────────────────────────────────────────────
  pgm.createIndex('bookings', 'vehicle_id');
  pgm.createIndex('bookings', 'driver_id');
  pgm.createIndex('bookings', ['start_time', 'end_time'], { name: 'idx_bookings_time_range' });
  pgm.createIndex('requests', 'status');
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.dropTable('bookings', { cascade: true });
  pgm.dropTable('requests', { cascade: true });
  pgm.dropTable('companies', { cascade: true });
  pgm.dropTable('drivers', { cascade: true });
  pgm.dropTable('vehicles', { cascade: true });
  pgm.dropTable('vehicle_types', { cascade: true });
  pgm.dropTable('license_types', { cascade: true });
  pgm.dropTable('users', { cascade: true });
  pgm.sql('DROP FUNCTION IF EXISTS set_updated_at() CASCADE');
  pgm.sql('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
