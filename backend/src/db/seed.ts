import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './pool';

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── License types ────────────────────────────────────────────────────────
    // Inserted by name so we can reference them when inserting vehicle_types/drivers
    await client.query(`
      INSERT INTO license_types (name, description) VALUES
        ('LMV',  'Light Motor Vehicle — vans, small trucks up to ~7.5t GVW'),
        ('HMV',  'Heavy Motor Vehicle — trucks and buses above 7.5t GVW'),
        ('HGMV', 'Heavy Goods Motor Vehicle — articulated trucks and container trailers')
      ON CONFLICT (name) DO NOTHING
    `);

    const { rows: licenseRows } = await client.query<{ id: string; name: string }>(
      'SELECT id, name FROM license_types',
    );
    const licenseId: Record<string, string> = {};
    for (const row of licenseRows) licenseId[row.name] = row.id;

    // ── Vehicle types ────────────────────────────────────────────────────────
    await client.query(
      `
      INSERT INTO vehicle_types
        (name, compatible_cargo_types, is_refrigerated, is_hazmat_certified, required_license_type_id)
      VALUES
        ('van',
         ARRAY['general','documents','electronics','clothing'],
         false, false, $1),
        ('mini_truck',
         ARRAY['general','fabric','electronics','furniture','clothing','packaged_goods'],
         false, false, $2),
        ('refrigerated_truck',
         ARRAY['perishable','pharmaceutical','dairy','frozen_goods'],
         true, false, $3),
        ('flatbed_truck',
         ARRAY['machinery','construction_material','steel','oversized','automotive'],
         false, false, $4),
        ('container_trailer',
         ARRAY['general','bulk','containers','hazardous'],
         false, true, $5)
      ON CONFLICT (name) DO NOTHING
      `,
      [licenseId['LMV'], licenseId['LMV'], licenseId['HMV'], licenseId['HMV'], licenseId['HGMV']],
    );

    const { rows: typeRows } = await client.query<{ id: string; name: string }>(
      'SELECT id, name FROM vehicle_types',
    );
    const typeId: Record<string, string> = {};
    for (const row of typeRows) typeId[row.name] = row.id;

    // ── Vehicles ─────────────────────────────────────────────────────────────
    await client.query(
      `
      INSERT INTO vehicles
        (vehicle_number, type_id, capacity_kg, maintenance_status, current_location)
      VALUES
        ('MH-12-AB-1234', $1, 1000,  'active',      'Andheri, Mumbai'),
        ('MH-12-CD-5678', $2, 3000,  'active',      'Bhiwandi'),
        ('MH-12-EF-9012', $3, 8000,  'active',      'Thane'),
        ('MH-12-GH-3456', $4, 12000, 'active',      'Pune'),
        ('MH-12-IJ-7890', $5, 20000, 'active',      'Navi Mumbai'),
        ('MH-12-KL-2345', $2, 2500,  'maintenance', 'Andheri, Mumbai')
      ON CONFLICT (vehicle_number) DO NOTHING
      `,
      [
        typeId['van'],
        typeId['mini_truck'],
        typeId['refrigerated_truck'],
        typeId['flatbed_truck'],
        typeId['container_trailer'],
      ],
    );

    // ── Drivers ──────────────────────────────────────────────────────────────
    await client.query(
      `
      INSERT INTO drivers
        (name, phone, license_type_id, hours_worked_this_week, on_leave_until, current_location)
      VALUES
        ('Ramesh Kumar',  '+91-9876543210', $1, 15.00, NULL,                     'Bhiwandi'),
        ('Suresh Patil',  '+91-9876543211', $2, 20.00, NULL,                     'Thane'),
        ('Mahesh Singh',  '+91-9876543212', $3, 35.00, NULL,                     'Navi Mumbai'),
        ('Dinesh Sharma', '+91-9876543213', $1, 5.00,  NULL,                     'Bhiwandi'),
        ('Vijay Pawar',   '+91-9876543214', $1, 0.00,  NOW() + INTERVAL '1 day', 'Pune'),
        ('Anil Desai',    '+91-9876543215', $1, 28.00, NULL,                     'Andheri, Mumbai')
      ON CONFLICT DO NOTHING
      `,
      [licenseId['HMV'], licenseId['LMV'], licenseId['HGMV']],
    );

    // ── Companies (clients) ──────────────────────────────────────────────────
    await client.query(`
      INSERT INTO companies (name, contact_person, phone) VALUES
        ('ABC Textiles',       'Ravi Mehta',   '+91-2222-111111'),
        ('Mumbai Pharma Ltd',  'Priya Shah',   '+91-2222-222222'),
        ('National Steel Corp','Ajay Verma',   '+91-2222-333333')
      ON CONFLICT DO NOTHING
    `);

    // ── Users ────────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('password123', 12);
    await client.query(
      `
      INSERT INTO users (email, password_hash, name, role) VALUES
        ('admin@freight.local',      $1, 'Fleet Admin',  'admin'),
        ('dispatcher@freight.local', $1, 'Dispatcher 1', 'dispatcher')
      ON CONFLICT (email) DO NOTHING
      `,
      [passwordHash],
    );

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
