import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface StudyModeCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'primary' | 'accent' | 'success' | 'warning';
  onClick?: () => void;
}

export function StudyModeCard({
  name,
  description,
  icon,
  color,
  onClick,
}: StudyModeCardProps) {
  const colorStyles = {
    primary: 'hover:border-primary/50 hover:bg-primary/5',
    accent: 'hover:border-accent/50 hover:bg-accent/5',
    success: 'hover:border-success/50 hover:bg-success/5',
    warning: 'hover:border-warning/50 hover:bg-warning/5',
  };

  const iconBgStyles = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-2xl p-6 border border-transparent cursor-pointer',
        'hover:shadow-card-hover transition-all duration-300',
        'animate-fade-in group',
        colorStyles[color]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center text-2xl', iconBgStyles[color])}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}
