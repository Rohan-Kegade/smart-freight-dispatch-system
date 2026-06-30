import type { Booking } from '../../types';

interface Props {
  booking: Booking;
  onNewRequest: () => void;
}

export default function BookingSuccess({ booking, onNewRequest }: Props) {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      {/* Check icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed</h2>
      <p className="text-gray-500 text-sm mb-8">
        The driver has been notified via SMS.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-left space-y-3 text-sm mb-8">
        <Row label="Vehicle"  value={booking.vehicle_number} />
        <Row label="Type"     value={booking.vehicle_type} />
        <Row label="Driver"   value={`${booking.driver_name} · ${booking.driver_phone}`} />
        <Row label="Route"    value={`${booking.pickup_location} → ${booking.drop_location}`} />
        <Row label="Cargo"    value={booking.cargo_type.replace('_', ' ')} />
        <Row
          label="Start"
          value={new Date(booking.start_time).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        />
        <Row
          label="Deadline"
          value={new Date(booking.end_time).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        />
        {booking.cost_estimate != null && (
          <Row label="Est. cost" value={`₹${Number(booking.cost_estimate).toFixed(0)}`} />
        )}
        {booking.score != null && (
          <Row label="Match score" value={`${Number(booking.score).toFixed(1)} / 100`} />
        )}
      </div>

      <button
        onClick={onNewRequest}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors"
      >
        New Request
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right capitalize">{value}</span>
    </div>
  );
}
