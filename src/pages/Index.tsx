import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStats } from '@/hooks/useUserStats';
import { useWordbooks } from '@/hooks/useWordbooks';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, BookOpen, Trophy, Flame, Brain, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: wordbooks, isLoading: wordbooksLoading } = useWordbooks();
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>('');

  // Load last used wordbook from localStorage
  useEffect(() => {
    if (wordbooks && wordbooks.length > 0 && !selectedWordbookId) {
      const lastUsed = localStorage.getItem('lastWordbookId');
      if (lastUsed && wordbooks.find(wb => wb.id === lastUsed)) {
        setSelectedWordbookId(lastUsed);
      } else {
        setSelectedWordbookId(wordbooks[0].id);
      }
    }
  }, [wordbooks, selectedWordbookId]);

  // Save selected wordbook
  useEffect(() => {
    if (selectedWordbookId) {
      localStorage.setItem('lastWordbookId', selectedWordbookId);
    }
  }, [selectedWordbookId]);

  // Get progress for selected wordbook
  const { data: wordbookProgress } = useQuery({
    queryKey: ['wordbookProgress', selectedWordbookId, user?.id],
    enabled: !!selectedWordbookId && !!user,
    queryFn: async () => {
      const { count: totalCount } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('wordbook_id', selectedWordbookId);

      const { data: words } = await supabase
        .from('words')
        .select('id')
        .eq('wordbook_id', selectedWordbookId);

      if (!words || words.length === 0) return { total: 0, mastered: 0, learning: 0, newWords: 0 };

      const { data: progress } = await supabase
        .from('user_word_progress')
        .select('mastery')
        .eq('user_id', user!.id)
        .in('word_id', words.map(w => w.id));

      const mastered = progress?.filter(p => p.mastery >= 80).length || 0;
      const learning = progress?.filter(p => p.mastery > 0 && p.mastery < 80).length || 0;
      const total = totalCount || 0;

      return { total, mastered, learning, newWords: total - mastered - learning };
    },
  });

  // Get review count
  const { data: reviewCount } = useQuery({
    queryKey: ['reviewCount', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_word_progress')
        .select('id')
        .eq('user_id', user!.id)
        .lt('mastery', 80);
      return data?.length || 0;
    },
  });

  const isLoading = statsLoading || wordbooksLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const s = stats || { totalWords: 0, masteredWords: 0, learningWords: 0, streak: 0, todayNewWords: 0, todayReviewWords: 0, todayStudyMinutes: 0 };
  const selectedBook = wordbooks?.find(wb => wb.id === selectedWordbookId);
  const prog = wordbookProgress || { total: 0, mastered: 0, learning: 0, newWords: 0 };
  const progressPercent = prog.total > 0 ? Math.round((prog.mastered / prog.total) * 100) : 0;

  const handleStartLearn = () => {
    if (selectedWordbookId) {
      navigate(`/wordbooks/${selectedWordbookId}/learn`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-1">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">今天也要加油 ✨</h1>
          <p className="text-sm text-muted-foreground mt-1">
            已坚持 {s.streak} 天 · 今日学习 {s.todayNewWords} 词
          </p>
        </div>

        {/* Wordbook Selector */}
        <div className="mb-4">
          <Select value={selectedWordbookId} onValueChange={setSelectedWordbookId}>
            <SelectTrigger className="w-full h-12 text-base">
              <SelectValue placeholder="选择词库" />
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

        {/* Main Learning Card */}
        {selectedBook && (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedBook.icon} {selectedBook.name}</h2>
                <p className="text-sm text-muted-foreground">{prog.total} 词</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{progressPercent}%</span>
                <p className="text-xs text-muted-foreground">掌握度</p>
              </div>
            </div>

            <Progress value={progressPercent} className="h-2.5 mb-4" />

            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="bg-secondary/50 rounded-xl py-2.5">
                <p className="text-lg font-bold text-foreground">{prog.newWords}</p>
                <p className="text-xs text-muted-foreground">待学习</p>
              </div>
              <div className="bg-secondary/50 rounded-xl py-2.5">
                <p className="text-lg font-bold text-amber-500">{prog.learning}</p>
                <p className="text-xs text-muted-foreground">学习中</p>
              </div>
              <div className="bg-secondary/50 rounded-xl py-2.5">
                <p className="text-lg font-bold text-green-500">{prog.mastered}</p>
                <p className="text-xs text-muted-foreground">已掌握</p>
              </div>
            </div>

            <Button
              onClick={handleStartLearn}
              className="w-full h-14 text-lg font-semibold gradient-primary shadow-primary"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              {prog.learning > 0 || prog.mastered > 0 ? '继续学习' : '开始学习'}
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/review')}
            className="bg-card rounded-xl p-4 border border-border text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-sm">待复习</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{reviewCount || 0}</p>
          </button>

          <button
            onClick={() => navigate('/stats')}
            className="bg-card rounded-xl p-4 border border-border text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-500" />
                <span className="font-medium text-sm">已掌握</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{s.masteredWords}</p>
          </button>
        </div>

        {/* Today Stats Bar */}
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-around text-center">
          <div>
            <p className="text-lg font-bold">{s.todayNewWords}</p>
            <p className="text-xs text-muted-foreground">今日新词</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-lg font-bold">{s.todayReviewWords}</p>
            <p className="text-xs text-muted-foreground">今日复习</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-lg font-bold">{s.todayStudyMinutes}</p>
            <p className="text-xs text-muted-foreground">分钟</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <p className="text-lg font-bold">{s.streak}</p>
            </div>
            <p className="text-xs text-muted-foreground">连续</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
