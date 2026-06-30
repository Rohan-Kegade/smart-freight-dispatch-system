import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

const statusMap: Record<string, BadgeProps['variant']> = {
  confirmed: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
  active: 'success',
  maintenance: 'warning',
  retired: 'secondary',
  pending_confirmation: 'info',
  booked: 'default',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusMap[status] ?? 'outline';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return <Badge variant={variant}>{label}</Badge>;
}
