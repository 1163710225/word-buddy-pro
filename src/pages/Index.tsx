import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TodayTask } from '@/components/dashboard/TodayTask';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { WordBookCard } from '@/components/wordbook/WordBookCard';
import { useUserStats } from '@/hooks/useUserStats';
import { useWordbooks } from '@/hooks/useWordbooks';
import { BookOpen, Brain, Flame, Trophy, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: wordbooks, isLoading: wordbooksLoading } = useWordbooks();

  const handleBookClick = (bookId: string) => {
    navigate(`/wordbooks/${bookId}`);
  };

  if (statsLoading || wordbooksLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const displayStats = stats || {
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    streak: 0,
    todayNewWords: 0,
    todayReviewWords: 0,
    todayStudyMinutes: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">欢迎回来！</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">今天也要加油背单词哦 ✨</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatsCard
            title="累计学习"
            value={displayStats.totalWords}
            subtitle="个单词"
            icon={<BookOpen className="w-5 h-5 md:w-6 md:h-6" />}
            variant="primary"
          />
          <StatsCard
            title="已掌握"
            value={displayStats.masteredWords}
            subtitle="个单词"
            icon={<Trophy className="w-5 h-5 md:w-6 md:h-6" />}
            variant="success"
          />
          <StatsCard
            title="学习中"
            value={displayStats.learningWords}
            subtitle="个单词"
            icon={<Brain className="w-5 h-5 md:w-6 md:h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="连续打卡"
            value={displayStats.streak}
            subtitle="天"
            icon={<Flame className="w-5 h-5 md:w-6 md:h-6" />}
            variant="accent"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <TodayTask
              newWords={{ current: displayStats.todayNewWords, target: 20 }}
              reviewWords={{ current: displayStats.todayReviewWords, target: 50 }}
              studyMinutes={{ current: displayStats.todayStudyMinutes, target: 30 }}
            />
            <WeeklyChart data={displayStats.weeklyProgress} />
          </div>

          {/* Right Column - Recent Books */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">正在学习</h2>
              <Link to="/wordbooks" className="text-primary text-sm hover:underline">
                查看全部
              </Link>
            </div>
            <div className="space-y-3 md:space-y-4">
              {wordbooks?.slice(0, 3).map((book) => (
                <WordBookCard 
                  key={book.id} 
                  book={{
                    id: book.id,
                    name: book.name,
                    description: book.description || '',
                    icon: book.icon,
                    wordCount: book.word_count || 0,
                    progress: book.progress || 0,
                    category: book.category as 'exam' | 'daily' | 'business' | 'academic' | 'custom',
                    level: book.level,
                  }}
                  onClick={() => handleBookClick(book.id)}
                />
              ))}
              {(!wordbooks || wordbooks.length === 0) && (
                <p className="text-muted-foreground text-center py-8">暂无词库</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
