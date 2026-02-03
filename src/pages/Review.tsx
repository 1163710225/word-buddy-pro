import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { mockWords, mockUserStats } from '@/data/mockData';
import { Brain, Clock, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Review = () => {
  const needReviewWords = mockWords.filter((w) => w.mastery < 80);
  const urgentWords = mockWords.filter((w) => w.mastery < 40);
  
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">复习中心</h1>
          <p className="text-muted-foreground mt-1">根据记忆曲线智能安排复习</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockUserStats.todayReviewWords}</p>
                <p className="text-sm text-muted-foreground">今日已复习</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentWords.length}</p>
                <p className="text-sm text-muted-foreground">急需复习</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockUserStats.masteredWords}</p>
                <p className="text-sm text-muted-foreground">已掌握</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Queue */}
        <div className="bg-card rounded-2xl p-8 shadow-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl gradient-primary">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">智能复习</h2>
                <p className="text-muted-foreground text-sm">
                  {needReviewWords.length} 个单词需要复习
                </p>
              </div>
            </div>
            <Link to="/study">
              <Button className="gradient-primary shadow-primary">
                <Play className="w-4 h-4 mr-2" />
                开始复习
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {needReviewWords.slice(0, 5).map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-lg">{word.word}</span>
                  <span className="text-muted-foreground text-sm">{word.phonetic}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{word.mastery}%</p>
                    <p className="text-xs text-muted-foreground">掌握度</p>
                  </div>
                  <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
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
            <p className="text-center text-muted-foreground text-sm mt-4">
              还有 {needReviewWords.length - 5} 个单词...
            </p>
          )}
        </div>

        {/* Memory Curve Explanation */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-semibold mb-2">📈 艾宾浩斯记忆曲线</h3>
          <p className="text-muted-foreground text-sm">
            系统会根据你的学习情况，在最佳时间点安排复习。及时复习可以有效防止遗忘，
            让单词记忆更加牢固。建议每天完成系统推荐的复习任务。
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Review;
