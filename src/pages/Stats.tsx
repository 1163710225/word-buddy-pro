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

  const d = stats || {
    totalWords: 0, masteredWords: 0, learningWords: 0, streak: 0,
    totalStudyDays: 0, todayNewWords: 0, todayReviewWords: 0, todayStudyMinutes: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  };

  const masteryData = [
    { name: '已掌握', value: d.masteredWords, color: 'hsl(150, 60%, 45%)' },
    { name: '学习中', value: d.learningWords, color: 'hsl(200, 80%, 45%)' },
  ];

  const difficultyData = [
    { level: '简单', count: Math.round(d.totalWords * 0.3) },
    { level: '中等', count: Math.round(d.totalWords * 0.5) },
    { level: '困难', count: Math.round(d.totalWords * 0.2) },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">学习统计</h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-base">查看你的学习数据和进步</p>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          {[
            { value: d.totalWords, label: '累计学习', cls: 'text-gradient-primary' },
            { value: d.masteredWords, label: '已掌握', cls: 'text-success' },
            { value: d.streak, label: '连续打卡', cls: 'text-warning' },
            { value: d.totalStudyDays, label: '总天数', cls: 'text-primary' },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl md:rounded-2xl p-3 md:p-6 shadow-card text-center">
              <p className={`text-2xl md:text-4xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-muted-foreground text-xs md:text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
          <WeeklyChart data={d.weeklyProgress} />

          {/* Mastery */}
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card">
            <h3 className="font-semibold text-sm md:text-lg mb-4">掌握程度分布</h3>
            <div className="flex items-center justify-around">
              <div className="h-36 md:h-48 w-36 md:w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={masteryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {masteryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {masteryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.value} 词</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Difficulty */}
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card">
            <h3 className="font-semibold text-sm md:text-lg mb-4">难度分布</h3>
            <div className="h-36 md:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="level" type="category" axisLine={false} tickLine={false} width={40} tick={{ fontSize: 12 }} />
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

          {/* Today */}
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card">
            <h3 className="font-semibold text-sm md:text-lg mb-4">今日学习</h3>
            <div className="flex items-center justify-around">
              {[
                { value: d.todayNewWords, label: '新词', max: 20 },
                { value: d.todayReviewWords, label: '复习', max: 50 },
                { value: d.todayStudyMinutes, label: '分钟', max: 30 },
              ].map((item) => (
                <ProgressRing key={item.label} progress={Math.min(100, Math.round((item.value / item.max) * 100))} size={80} strokeWidth={6}>
                  <div className="text-center">
                    <p className="text-sm md:text-lg font-bold">{item.value}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </ProgressRing>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Stats;
