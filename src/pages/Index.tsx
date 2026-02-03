import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TodayTask } from '@/components/dashboard/TodayTask';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { WordBookCard } from '@/components/wordbook/WordBookCard';
import { mockUserStats, mockWordBooks } from '@/data/mockData';
import { BookOpen, Brain, Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const stats = mockUserStats;

  const handleBookClick = (bookId: string) => {
    navigate(`/wordbooks/${bookId}`);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">欢迎回来！</h1>
          <p className="text-muted-foreground mt-1">今天也要加油背单词哦 ✨</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="累计学习"
            value={stats.totalWords}
            subtitle="个单词"
            icon={<BookOpen className="w-6 h-6" />}
            variant="primary"
          />
          <StatsCard
            title="已掌握"
            value={stats.masteredWords}
            subtitle="个单词"
            icon={<Trophy className="w-6 h-6" />}
            variant="success"
          />
          <StatsCard
            title="学习中"
            value={stats.learningWords}
            subtitle="个单词"
            icon={<Brain className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="连续打卡"
            value={stats.streak}
            subtitle="天"
            icon={<Flame className="w-6 h-6" />}
            variant="accent"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            <TodayTask
              newWords={{ current: stats.todayNewWords, target: 20 }}
              reviewWords={{ current: stats.todayReviewWords, target: 50 }}
              studyMinutes={{ current: stats.todayStudyMinutes, target: 30 }}
            />
            <WeeklyChart data={stats.weeklyProgress} />
          </div>

          {/* Right Column - Recent Books */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">正在学习</h2>
              <Link to="/wordbooks" className="text-primary text-sm hover:underline">
                查看全部
              </Link>
            </div>
            <div className="space-y-4">
              {mockWordBooks.slice(0, 3).map((book) => (
                <WordBookCard 
                  key={book.id} 
                  book={book} 
                  onClick={() => handleBookClick(book.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
