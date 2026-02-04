import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWordbookWithProgress, useToggleStarWord } from '@/hooks/useWordbooks';
import {
  ArrowLeft,
  Search,
  Star,
  Volume2,
  BookOpen,
  Trophy,
  Brain,
  Loader2,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const WordBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: wordbook, isLoading } = useWordbookWithProgress(id);
  const toggleStar = useToggleStarWord();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');

  const playAudio = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const handleToggleStar = (wordId: string, isStarred: boolean) => {
    toggleStar.mutate({ wordId, isStarred });
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-500';
    if (mastery >= 40) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 80) return '已掌握';
    if (mastery >= 40) return '学习中';
    return '新词';
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

  if (!wordbook) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">词库不存在</p>
          <Button onClick={() => navigate('/wordbooks')} className="mt-4">
            返回词库列表
          </Button>
        </div>
      </AppLayout>
    );
  }

  const filteredWords = wordbook.words?.filter((word: any) => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStarred = !showStarredOnly || word.is_starred;
    
    let matchesFilter = true;
    const mastery = word.mastery || 0;
    if (activeFilter === 'new') matchesFilter = mastery < 20;
    else if (activeFilter === 'learning') matchesFilter = mastery >= 20 && mastery < 80;
    else if (activeFilter === 'mastered') matchesFilter = mastery >= 80;
    
    return matchesSearch && matchesStarred && matchesFilter;
  }) || [];

  const filters = [
    { id: 'all', label: '全部', count: wordbook.words?.length || 0 },
    { id: 'new', label: '新词', count: wordbook.newCount || 0 },
    { id: 'learning', label: '学习中', count: wordbook.learningCount || 0 },
    { id: 'mastered', label: '已掌握', count: wordbook.masteredCount || 0 },
  ];

  const chartData = [
    { name: '已掌握', value: wordbook.masteredCount || 0, color: '#10b981' },
    { name: '学习中', value: wordbook.learningCount || 0, color: '#f59e0b' },
    { name: '未学习', value: wordbook.newCount || 0, color: '#64748b' },
  ].filter(d => d.value > 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/wordbooks')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{wordbook.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{wordbook.name}</h1>
                <p className="text-muted-foreground text-sm">{wordbook.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-card rounded-2xl p-6 mb-6 shadow-card">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{wordbook.word_count}</div>
              <div className="text-sm text-muted-foreground">总词数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{wordbook.masteredCount || 0}</div>
              <div className="text-sm text-muted-foreground">已掌握</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{wordbook.learningCount || 0}</div>
              <div className="text-sm text-muted-foreground">学习中</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{wordbook.level}</div>
              <div className="text-sm text-muted-foreground">难度等级</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">学习进度</span>
              <span className="font-medium">{wordbook.progress}%</span>
            </div>
            <Progress value={wordbook.progress} className="h-3" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              className="flex-1 gradient-primary shadow-primary"
              onClick={() => navigate('/study', { state: { wordbookId: id } })}
            >
              <Play className="w-4 h-4 mr-2" />
              开始学习
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/review')}>
              <Brain className="w-4 h-4 mr-2" />
              复习单词
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Word List */}
          <div className="col-span-2 space-y-4">
            {/* Search & Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索单词..."
                  className="pl-10"
                />
              </div>
              <Button
                variant={showStarredOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowStarredOnly(!showStarredOnly)}
              >
                <Star className={`w-4 h-4 mr-1 ${showStarredOnly ? 'fill-current' : ''}`} />
                收藏
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                  className={activeFilter === filter.id ? 'gradient-primary' : ''}
                >
                  {filter.label}
                  <span className="ml-1.5 text-xs opacity-70">({filter.count})</span>
                </Button>
              ))}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredWords.map((word: any, index: number) => (
                <div
                  key={word.id}
                  className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Word Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold text-foreground">{word.word}</span>
                        <span className="text-muted-foreground text-sm">{word.phonetic}</span>
                        <button
                          onClick={() => playAudio(word.word)}
                          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                        >
                          <Volume2 className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                      <p className="text-muted-foreground mt-1">{word.meaning}</p>
                    </div>

                    {/* Mastery */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={cn('text-sm font-medium', getMasteryColor(word.mastery || 0))}>
                          {getMasteryLabel(word.mastery || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          掌握度 {word.mastery || 0}%
                        </div>
                      </div>

                      {/* Progress Ring */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-secondary"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${((word.mastery || 0) / 100) * 126} 126`}
                            strokeLinecap="round"
                            className={getMasteryColor(word.mastery || 0)}
                          />
                        </svg>
                        {(word.mastery || 0) >= 80 && (
                          <CheckCircle2 className="absolute inset-0 m-auto w-5 h-5 text-green-500" />
                        )}
                      </div>

                      {/* Star */}
                      <button
                        onClick={() => handleToggleStar(word.id, word.is_starred)}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                      >
                        <Star
                          className={cn(
                            'w-5 h-5 transition-colors',
                            word.is_starred
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Example */}
                  {word.example && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-foreground italic">"{word.example}"</p>
                      <p className="text-xs text-muted-foreground mt-1">{word.example_translation}</p>
                    </div>
                  )}
                </div>
              ))}

              {filteredWords.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">没有找到匹配的单词</p>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <Card className="glass-card h-fit">
            <CardHeader>
              <CardTitle>掌握程度分布</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无学习数据</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default WordBookDetail;
