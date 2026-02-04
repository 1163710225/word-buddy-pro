import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStats } from '@/hooks/useUserStats';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Loader2 } from 'lucide-react';

const Stats = () => {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading) {
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
    totalStudyDays: 0,
    todayNewWords: 0,
    todayReviewWords: 0,
    todayStudyMinutes: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  };

  const masteryData = [
    { name: '已掌握', value: displayStats.masteredWords, color: 'hsl(150, 60%, 45%)' },
    { name: '学习中', value: displayStats.learningWords, color: 'hsl(200, 80%, 45%)' },
  ];

  const difficultyData = [
    { level: '简单', count: Math.round(displayStats.totalWords * 0.3) },
    { level: '中等', count: Math.round(displayStats.totalWords * 0.5) },
    { level: '困难', count: Math.round(displayStats.totalWords * 0.2) },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">学习统计</h1>
          <p className="text-muted-foreground mt-1">查看你的学习数据和进步</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-card text-center">
            <p className="text-4xl font-bold text-gradient-primary">{displayStats.totalWords}</p>
            <p className="text-muted-foreground text-sm mt-1">累计学习单词</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card text-center">
            <p className="text-4xl font-bold text-green-500">{displayStats.masteredWords}</p>
            <p className="text-muted-foreground text-sm mt-1">已掌握单词</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card text-center">
            <p className="text-4xl font-bold text-amber-500">{displayStats.streak}</p>
            <p className="text-muted-foreground text-sm mt-1">连续打卡天数</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card text-center">
            <p className="text-4xl font-bold text-primary">{displayStats.totalStudyDays}</p>
            <p className="text-muted-foreground text-sm mt-1">总学习天数</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Weekly Chart */}
          <WeeklyChart data={displayStats.weeklyProgress} />

          {/* Mastery Distribution */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-4">掌握程度分布</h3>
            <div className="flex items-center justify-around">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {masteryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {masteryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.value} 词</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Difficulty Distribution */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-4">难度分布</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="level"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="count" fill="url(#difficultyGradient)" radius={[0, 8, 8, 0]} />
                  <defs>
                    <linearGradient id="difficultyGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(200 80% 50%)" />
                      <stop offset="100%" stopColor="hsl(25 95% 55%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-4">今日学习</h3>
            <div className="flex items-center justify-around">
              <ProgressRing
                progress={Math.min(100, Math.round((displayStats.todayNewWords / 20) * 100))}
                size={100}
                strokeWidth={8}
              >
                <div className="text-center">
                  <p className="text-lg font-bold">{displayStats.todayNewWords}</p>
                  <p className="text-xs text-muted-foreground">新词</p>
                </div>
              </ProgressRing>
              <ProgressRing
                progress={Math.min(100, Math.round((displayStats.todayReviewWords / 50) * 100))}
                size={100}
                strokeWidth={8}
              >
                <div className="text-center">
                  <p className="text-lg font-bold">{displayStats.todayReviewWords}</p>
                  <p className="text-xs text-muted-foreground">复习</p>
                </div>
              </ProgressRing>
              <ProgressRing
                progress={Math.min(100, Math.round((displayStats.todayStudyMinutes / 30) * 100))}
                size={100}
                strokeWidth={8}
              >
                <div className="text-center">
                  <p className="text-lg font-bold">{displayStats.todayStudyMinutes}</p>
                  <p className="text-xs text-muted-foreground">分钟</p>
                </div>
              </ProgressRing>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Stats;
