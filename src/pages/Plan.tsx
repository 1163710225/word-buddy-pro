import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockWordBooks } from '@/data/mockData';
import { Calendar, Target, Clock, BookOpen } from 'lucide-react';

const Plan = () => {
  const [dailyNewWords, setDailyNewWords] = useState(20);
  const [dailyReviewWords, setDailyReviewWords] = useState(50);

  const selectedBook = mockWordBooks[0];
  const remainingWords = selectedBook.wordCount - Math.round(selectedBook.wordCount * selectedBook.progress / 100);
  const estimatedDays = Math.ceil(remainingWords / dailyNewWords);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">学习计划</h1>
          <p className="text-muted-foreground mt-1">制定你的专属学习计划</p>
        </div>

        {/* Current Plan */}
        <div className="bg-card rounded-2xl p-8 shadow-card mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl gradient-primary">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">当前学习计划</h2>
              <p className="text-muted-foreground text-sm">{selectedBook.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{remainingWords}</p>
              <p className="text-sm text-muted-foreground">剩余单词</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold">{estimatedDays}</p>
              <p className="text-sm text-muted-foreground">预计天数</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">~30</p>
              <p className="text-sm text-muted-foreground">每日分钟</p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">每日新词数量</label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="5"
                  max="50"
                  value={dailyNewWords}
                  onChange={(e) => setDailyNewWords(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-semibold w-12 text-center">{dailyNewWords}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">每日复习数量</label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="10"
                  max="100"
                  value={dailyReviewWords}
                  onChange={(e) => setDailyReviewWords(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-semibold w-12 text-center">{dailyReviewWords}</span>
              </div>
            </div>
          </div>

          <Button className="w-full mt-6 gradient-primary shadow-primary">
            保存计划
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-semibold mb-3">💡 学习建议</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 每天坚持学习比一次性突击更有效</li>
            <li>• 建议新词数量控制在 15-30 个之间</li>
            <li>• 复习是巩固记忆的关键，不要跳过</li>
            <li>• 早晚各学习一次效果更好</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default Plan;
