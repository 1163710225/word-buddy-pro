import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockWords, mockUserStats } from '@/data/mockData';
import { Brain, Clock, AlertCircle, CheckCircle2, Play, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { speakWord } from '@/lib/speech';

const Review = () => {
  const needReviewWords = mockWords.filter((w) => w.mastery < 80);
  const urgentWords = mockWords.filter((w) => w.mastery < 40);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">复习中心</h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-base">根据记忆曲线智能安排复习</p>
        </div>

        {/* Stats - horizontal scroll on mobile */}
        <div className="flex gap-3 md:grid md:grid-cols-3 md:gap-6 mb-4 md:mb-8 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { icon: Clock, value: mockUserStats.todayReviewWords, label: '今日已复习', color: 'primary' },
            { icon: AlertCircle, value: urgentWords.length, label: '急需复习', color: 'accent' },
            { icon: CheckCircle2, value: mockUserStats.masteredWords, label: '已掌握', color: 'success' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card flex-shrink-0 w-[140px] md:w-auto">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-${stat.color}/10`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review Queue */}
        <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 shadow-card mb-4 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl gradient-primary">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-semibold">智能复习</h2>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {needReviewWords.length} 个单词需要复习
                </p>
              </div>
            </div>
            <Link to="/study">
              <Button className="gradient-primary shadow-primary text-sm md:text-base" size="sm">
                <Play className="w-4 h-4 mr-1 md:mr-2" />
                开始复习
              </Button>
            </Link>
          </div>

          <div className="space-y-2 md:space-y-3">
            {needReviewWords.slice(0, 5).map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-3 md:p-4 bg-secondary/50 rounded-lg md:rounded-xl"
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <button onClick={() => speakWord(word.word)} className="p-1 rounded-full hover:bg-secondary flex-shrink-0">
                    <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  </button>
                  <span className="font-medium text-sm md:text-lg">{word.word}</span>
                  <span className="text-muted-foreground text-xs md:text-sm hidden sm:inline">{word.phonetic}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs md:text-sm font-medium">{word.mastery}%</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">掌握度</p>
                  </div>
                  <div className="w-14 md:w-20 h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        word.mastery >= 80
                          ? 'bg-success'
                          : word.mastery >= 50
                          ? 'bg-primary'
                          : 'bg-accent'
                      }`}
                      style={{ width: `${word.mastery}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {needReviewWords.length > 5 && (
            <p className="text-center text-muted-foreground text-xs md:text-sm mt-3 md:mt-4">
              还有 {needReviewWords.length - 5} 个单词...
            </p>
          )}
        </div>

        {/* Memory Curve */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl md:rounded-2xl p-4 md:p-6 border border-primary/10">
          <h3 className="font-semibold text-sm md:text-base mb-2">📈 艾宾浩斯记忆曲线</h3>
          <p className="text-muted-foreground text-xs md:text-sm">
            系统会根据你的学习情况，在最佳时间点安排复习。及时复习可以有效防止遗忘，让单词记忆更加牢固。
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Review;
