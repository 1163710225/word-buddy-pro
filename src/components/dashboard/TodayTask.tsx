import { Button } from '@/components/ui/button';
import { ProgressRing } from './ProgressRing';
import { Play, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TodayTaskProps {
  newWords: { current: number; target: number };
  reviewWords: { current: number; target: number };
  studyMinutes: { current: number; target: number };
}

export function TodayTask({ newWords, reviewWords, studyMinutes }: TodayTaskProps) {
  const newProgress = Math.round((newWords.current / newWords.target) * 100);
  const reviewProgress = Math.round((reviewWords.current / reviewWords.target) * 100);
  const totalProgress = Math.round(
    ((newWords.current + reviewWords.current) / (newWords.target + reviewWords.target)) * 100
  );

  return (
    <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="font-semibold text-lg md:text-xl">今日任务</h3>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            已学习 {studyMinutes.current} 分钟
          </p>
        </div>
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-accent/10 text-accent">
          <Zap className="w-3 h-3 md:w-4 md:h-4" />
          <span className="font-medium text-xs md:text-sm">连续 15 天</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <ProgressRing progress={totalProgress} size={120} strokeWidth={10}>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{totalProgress}%</p>
            <p className="text-xs md:text-sm text-muted-foreground">完成度</p>
          </div>
        </ProgressRing>

        <div className="flex-1 w-full space-y-3 md:space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5 md:mb-2">
                <span className="text-xs md:text-sm font-medium">新学单词</span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {newWords.current}/{newWords.target}
                </span>
              </div>
              <div className="h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${newProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5 md:mb-2">
                <span className="text-xs md:text-sm font-medium">复习单词</span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {reviewWords.current}/{reviewWords.target}
                </span>
              </div>
              <div className="h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-accent rounded-full transition-all duration-500"
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
            </div>
          </div>

          <Link to="/study">
            <Button className="w-full mt-2 md:mt-4 gradient-primary shadow-primary hover:shadow-lg transition-all text-sm md:text-base">
              <Play className="w-4 h-4 mr-2" />
              继续学习
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
