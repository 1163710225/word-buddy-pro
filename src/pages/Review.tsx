import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useUserStats } from '@/hooks/useUserStats';
import { useWordbooks } from '@/hooks/useWordbooks';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Clock, AlertCircle, CheckCircle2, Play, Volume2, Loader2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { speakWord } from '@/lib/speech';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReviewWord {
  id: string;
  word_id: string;
  mastery: number;
  review_count: number;
  correct_count: number;
  last_reviewed: string | null;
  next_review: string | null;
  word: string;
  phonetic: string | null;
  meaning: string;
  wordbook_id: string;
  wordbook_name?: string;
  wordbook_icon?: string;
}

const Review = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: wordbooks, isLoading: wbLoading } = useWordbooks();
  const [selectedWbId, setSelectedWbId] = useState<string>('all');

  // Fetch real review words from user_word_progress joined with words
  const { data: reviewWords, isLoading: wordsLoading } = useQuery({
    queryKey: ['review-words', user?.id, selectedWbId],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // Get all user progress with word details
      const { data: progress, error } = await supabase
        .from('user_word_progress')
        .select(`
          id,
          word_id,
          mastery,
          review_count,
          correct_count,
          last_reviewed,
          next_review,
          words!inner (
            id,
            word,
            phonetic,
            meaning,
            wordbook_id
          )
        `)
        .eq('user_id', user.id)
        .order('mastery', { ascending: true });

      if (error) throw error;

      // Map and filter
      const mapped: ReviewWord[] = (progress || []).map((p: any) => ({
        id: p.id,
        word_id: p.word_id,
        mastery: p.mastery,
        review_count: p.review_count,
        correct_count: p.correct_count,
        last_reviewed: p.last_reviewed,
        next_review: p.next_review,
        word: p.words.word,
        phonetic: p.words.phonetic,
        meaning: p.words.meaning,
        wordbook_id: p.words.wordbook_id,
      }));

      // Filter by wordbook if selected
      let filtered = mapped;
      if (selectedWbId && selectedWbId !== 'all') {
        filtered = mapped.filter(w => w.wordbook_id === selectedWbId);
      }

      return filtered;
    },
  });

  // Categorize words
  const needReviewWords = reviewWords?.filter(w => w.mastery < 80) || [];
  const urgentWords = reviewWords?.filter(w => w.mastery < 40) || [];
  const wrongWords = reviewWords?.filter(w => w.mastery === 0 && w.review_count > 0) || [];
  const masteredWords = reviewWords?.filter(w => w.mastery >= 80) || [];

  if (statsLoading || wbLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const handleStartReview = (wordbookId?: string) => {
    // Navigate to WordLearn with the wordbook, which will auto-sort by low mastery
    const targetWbId = wordbookId || (selectedWbId !== 'all' ? selectedWbId : undefined);
    if (targetWbId) {
      navigate(`/wordbooks/${targetWbId}/learn`);
    } else if (wordbooks && wordbooks.length > 0) {
      // Find the wordbook with most words to review
      const wbWithMostReview = needReviewWords.reduce((acc, w) => {
        acc[w.wordbook_id] = (acc[w.wordbook_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topWbId = Object.entries(wbWithMostReview).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topWbId) {
        navigate(`/wordbooks/${topWbId}/learn`);
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">复习中心</h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-base">根据记忆曲线智能安排复习</p>
        </div>

        {/* Wordbook selector */}
        <div className="mb-4 md:mb-6">
          <Select value={selectedWbId} onValueChange={setSelectedWbId}>
            <SelectTrigger className="w-full md:max-w-md">
              <SelectValue placeholder="选择词库（默认全部）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📚 全部词库</SelectItem>
              {wordbooks?.map((wb) => (
                <SelectItem key={wb.id} value={wb.id}>
                  {wb.icon} {wb.name} ({wb.word_count}词)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="flex gap-3 md:grid md:grid-cols-4 md:gap-6 mb-4 md:mb-8 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { icon: AlertCircle, value: wrongWords.length, label: '答错/不认识', color: 'destructive' },
            { icon: Clock, value: urgentWords.length, label: '急需复习', color: 'warning' },
            { icon: Brain, value: needReviewWords.length, label: '待复习', color: 'primary' },
            { icon: CheckCircle2, value: masteredWords.length, label: '已掌握', color: 'success' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card flex-shrink-0 w-[140px] md:w-auto">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-primary/10">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wrong / Don't Know Section */}
        {wrongWords.length > 0 && (
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 shadow-card mb-4 md:mb-8 border-l-4 border-destructive">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-destructive/10">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-base md:text-xl font-semibold">不认识的单词</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {wrongWords.length} 个单词答错或标记为不认识
                  </p>
                </div>
              </div>
              <Button 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm md:text-base" 
                size="sm"
                onClick={() => handleStartReview()}
              >
                <Play className="w-4 h-4 mr-1 md:mr-2" />
                立即复习
              </Button>
            </div>
            <WordList words={wrongWords.slice(0, 5)} />
            {wrongWords.length > 5 && (
              <p className="text-center text-muted-foreground text-xs md:text-sm mt-3 md:mt-4">
                还有 {wrongWords.length - 5} 个单词...
              </p>
            )}
          </div>
        )}

        {/* Urgent Review Section */}
        {urgentWords.filter(w => w.mastery > 0).length > 0 && (
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 shadow-card mb-4 md:mb-8 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-amber-500/10">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base md:text-xl font-semibold">急需巩固</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {urgentWords.filter(w => w.mastery > 0).length} 个单词掌握度较低
                  </p>
                </div>
              </div>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm md:text-base" 
                size="sm"
                onClick={() => handleStartReview()}
              >
                <Play className="w-4 h-4 mr-1 md:mr-2" />
                巩固复习
              </Button>
            </div>
            <WordList words={urgentWords.filter(w => w.mastery > 0).slice(0, 5)} />
          </div>
        )}

        {/* General Review Queue */}
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
            <Button 
              className="gradient-primary shadow-primary text-sm md:text-base" 
              size="sm"
              onClick={() => handleStartReview()}
              disabled={needReviewWords.length === 0}
            >
              <Play className="w-4 h-4 mr-1 md:mr-2" />
              开始复习
            </Button>
          </div>

          {wordsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : needReviewWords.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm mb-2">
                {reviewWords && reviewWords.length > 0 
                  ? '太棒了！所有学过的单词都已掌握 🎉' 
                  : '还没有学习记录，去词库开始学习吧'}
              </p>
              {(!reviewWords || reviewWords.length === 0) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/wordbooks')}
                  className="mt-2"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  去词库学习
                </Button>
              )}
            </div>
          ) : (
            <WordList words={needReviewWords.filter(w => w.mastery > 0 && w.mastery < 80).slice(0, 8)} />
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

// Extracted word list component
function WordList({ words }: { words: ReviewWord[] }) {
  if (words.length === 0) return null;

  return (
    <div className="space-y-2 md:space-y-3">
      {words.map((word) => (
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
            <span className="text-muted-foreground text-xs truncate hidden md:inline">{word.meaning}</span>
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
                    ? 'bg-green-500'
                    : word.mastery >= 50
                    ? 'bg-primary'
                    : word.mastery > 0
                    ? 'bg-amber-500'
                    : 'bg-destructive'
                }`}
                style={{ width: `${Math.max(word.mastery, 5)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Review;
