/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
exports.shorthands = undefined;

// Drivers can't be hard-deleted once they have booking or leave history —
// `bookings.driver_id` and `leave_requests.driver_id` are NOT NULL foreign
// keys with no ON DELETE clause, so Postgres would reject the delete anyway.
// A soft "deactivate" flag mirrors the pattern already used for
// `users.is_active` and `vehicles.maintenance_status = 'retired'`.
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.addColumn('drivers', {
    is_active: { type: 'boolean', notNull: true, default: true },
  });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.dropColumn('drivers', 'is_active');
};
