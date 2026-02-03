import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface WeeklyChartProps {
  data: number[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  const chartData = data.map((value, index) => ({
    day: days[index],
    words: value,
  }));

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-in">
      <h3 className="font-semibold text-lg mb-4">本周学习情况</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value} 词`, '学习']}
            />
            <Bar 
              dataKey="words" 
              fill="url(#barGradient)" 
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200 80% 50%)" />
                <stop offset="100%" stopColor="hsl(200 80% 35%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
