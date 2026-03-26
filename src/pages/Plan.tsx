import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWordbooks } from '@/hooks/useWordbooks';
import { useUserStats } from '@/hooks/useUserStats';
import { Calendar, Target, Clock, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Plan = () => {
  const { data: wordbooks, isLoading } = useWordbooks();
  const { data: stats } = useUserStats();
  const [dailyNewWords, setDailyNewWords] = useState(20);
  const [dailyReviewWords, setDailyReviewWords] = useState(50);
  const [selectedBookId, setSelectedBookId] = useState('');

  useEffect(() => {
    if (wordbooks && wordbooks.length > 0 && !selectedBookId) {
      setSelectedBookId(wordbooks[0].id);
    }
  }, [wordbooks, selectedBookId]);

  const selectedBook = wordbooks?.find(wb => wb.id === selectedBookId);
  const totalWords = selectedBook?.word_count || 0;
  const progress = selectedBook?.progress || 0;
  const masteredWords = stats?.masteredWords || 0;
  const remainingWords = Math.max(0, totalWords - Math.round(totalWords * progress / 100));
  const estimatedDays = dailyNewWords > 0 ? Math.ceil(remainingWords / dailyNewWords) : 0;

  const handleSavePlan = () => {
    toast.success('学习计划已保存', {
      description: `每日新词 ${dailyNewWords} 个，复习 ${dailyReviewWords} 个`,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">学习计划</h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-base">制定你的专属学习计划</p>
        </div>

        <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 shadow-card mb-4 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="p-2 md:p-3 rounded-lg md:rounded-xl gradient-primary">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-semibold">当前学习计划</h2>
              <p className="text-muted-foreground text-xs md:text-sm">
                {selectedBook ? selectedBook.name : '请选择词库'}
              </p>
            </div>
          </div>

          {/* Wordbook selector */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-medium mb-2">选择词库</label>
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger className="w-full md:max-w-md">
                <SelectValue placeholder="选择要学习的词库" />
              </SelectTrigger>
              <SelectContent>
                {wordbooks?.map((wb) => (
                  <SelectItem key={wb.id} value={wb.id}>
                    {wb.icon} {wb.name} ({wb.word_count}词)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
            {[
              { icon: BookOpen, value: remainingWords, label: '剩余单词' },
              { icon: Calendar, value: estimatedDays, label: '预计天数' },
              { icon: Clock, value: `~${Math.max(10, Math.round(dailyNewWords * 1.5))}`, label: '每日分钟' },
            ].map((s) => (
              <div key={s.label} className="bg-secondary/50 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <s.icon className="w-5 h-5 md:w-6 md:h-6 mx-auto text-primary mb-1 md:mb-2" />
                <p className="text-lg md:text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] md:text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2">每日新词数量：{dailyNewWords}</label>
              <div className="flex items-center gap-3 md:gap-4">
                <Input type="range" min="5" max="50" value={dailyNewWords} onChange={(e) => setDailyNewWords(Number(e.target.value))} className="flex-1" />
                <span className="text-base md:text-lg font-semibold w-10 text-center">{dailyNewWords}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2">每日复习数量：{dailyReviewWords}</label>
              <div className="flex items-center gap-3 md:gap-4">
                <Input type="range" min="10" max="100" value={dailyReviewWords} onChange={(e) => setDailyReviewWords(Number(e.target.value))} className="flex-1" />
                <span className="text-base md:text-lg font-semibold w-10 text-center">{dailyReviewWords}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleSavePlan} className="w-full mt-4 md:mt-6 gradient-primary shadow-primary text-sm md:text-base">
            保存计划
          </Button>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl md:rounded-2xl p-4 md:p-6 border border-primary/10">
          <h3 className="font-semibold text-sm md:text-base mb-2">💡 学习建议</h3>
          <ul className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
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
