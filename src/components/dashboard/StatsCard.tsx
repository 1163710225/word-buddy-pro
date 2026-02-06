import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    accent: 'gradient-accent text-accent-foreground',
    success: 'gradient-success text-success-foreground',
  };

  const isGradient = variant !== 'default';

  return (
    <div
      className={cn(
        'rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-xs md:text-sm font-medium', isGradient ? 'opacity-90' : 'text-muted-foreground')}>
            {title}
          </p>
          <p className={cn('text-xl md:text-3xl font-bold mt-1 md:mt-2', isGradient ? '' : 'text-foreground')}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-xs md:text-sm mt-0.5 md:mt-1', isGradient ? 'opacity-80' : 'text-muted-foreground')}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1 md:mt-2">
              <span className={cn('text-xs md:text-sm', trend.isPositive ? 'text-success' : 'text-destructive')}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className={cn('text-xs hidden sm:inline', isGradient ? 'opacity-70' : 'text-muted-foreground')}>
                vs 上周
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-2 md:p-3 rounded-lg md:rounded-xl',
            isGradient ? 'bg-white/20' : 'bg-secondary'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
