import { cn } from '@/lib/utils';

interface StudyProgressProps {
  current: number;
  total: number;
  correctCount: number;
}

export function StudyProgress({ current, total, correctCount }: StudyProgressProps) {
  const progress = (current / total) * 100;
  const accuracy = current > 0 ? Math.round((correctCount / current) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-3xl font-bold text-foreground">{current}</span>
            <span className="text-muted-foreground">/{total}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">正确率</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            正确 <span className="text-success font-medium">{correctCount}</span> · 
            错误 <span className="text-destructive font-medium">{current - correctCount}</span>
          </p>
        </div>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            accuracy >= 80 ? 'gradient-success' : accuracy >= 50 ? 'gradient-primary' : 'gradient-accent'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
