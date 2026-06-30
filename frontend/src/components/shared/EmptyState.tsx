import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="relative mb-5">
        {/* outer ring */}
        <div className="h-20 w-20 rounded-full bg-muted/60 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-6 w-6 text-muted-foreground/70" />
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-5">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
