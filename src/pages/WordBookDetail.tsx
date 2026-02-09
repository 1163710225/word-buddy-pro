import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWordbookWithProgress, useToggleStarWord } from '@/hooks/useWordbooks';
import { WordDetailModal } from '@/components/word/WordDetailModal';
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
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { speakWord } from '@/lib/speech';

const WORDS_PER_PAGE = 20;

const WordBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: wordbook, isLoading } = useWordbookWithProgress(id);
  const toggleStar = useToggleStarWord();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showWordDetail, setShowWordDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const playAudio = (word: string) => {
    speakWord(word);
  };

  const handleToggleStar = (wordId: string, isStarred: boolean) => {
    toggleStar.mutate({ wordId, isStarred });
  };

  const handleWordClick = (word: any) => {
    setSelectedWord(word);
    setShowWordDetail(true);
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

  // Pagination
  const totalPages = Math.ceil(filteredWords.length / WORDS_PER_PAGE);
  const paginatedWords = filteredWords.slice((currentPage - 1) * WORDS_PER_PAGE, currentPage * WORDS_PER_PAGE);
  
  // Reset page when filter changes
  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

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
        {/* Header - Hidden on mobile since MobileHeader shows back button */}
        <div className="hidden md:flex items-center gap-4 mb-6">
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

        {/* Mobile Header */}
        <div className="flex md:hidden items-center gap-3 mb-4">
          <span className="text-2xl">{wordbook.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-foreground">{wordbook.name}</h1>
            <p className="text-muted-foreground text-xs">{wordbook.description}</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-card">
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary">{wordbook.word_count}</div>
              <div className="text-xs md:text-sm text-muted-foreground">总词数</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-success">{wordbook.masteredCount || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">已掌握</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-warning">{wordbook.learningCount || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">学习中</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-foreground">{wordbook.level}</div>
              <div className="text-xs md:text-sm text-muted-foreground">难度</div>
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <div className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-muted-foreground">学习进度</span>
              <span className="font-medium">{wordbook.progress}%</span>
            </div>
            <Progress value={wordbook.progress} className="h-2 md:h-3" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
            <Button
              className="flex-1 gradient-primary shadow-primary text-sm md:text-base"
              onClick={() => navigate('/study', { state: { wordbookId: id } })}
            >
              <Play className="w-4 h-4 mr-2" />
              开始学习
            </Button>
            <Button variant="outline" className="flex-1 text-sm md:text-base" onClick={() => navigate('/review')}>
              <Brain className="w-4 h-4 mr-2" />
              复习单词
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Word List */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {/* Search & Filter */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索单词..."
                  className="pl-9 md:pl-10 text-sm md:text-base"
                />
              </div>
              <Button
                variant={showStarredOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowStarredOnly(!showStarredOnly)}
              >
                <Star className={`w-4 h-4 ${showStarredOnly ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline ml-1">收藏</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(filter.id as typeof activeFilter)}
                  className={`${activeFilter === filter.id ? 'gradient-primary' : ''} whitespace-nowrap flex-shrink-0 text-xs md:text-sm`}
                >
                  {filter.label}
                  <span className="ml-1 text-xs opacity-70">({filter.count})</span>
                </Button>
              ))}
            </div>

            <div className="space-y-2 md:space-y-3">
              {paginatedWords.map((word: any, index: number) => (
                <div
                  key={word.id}
                  className="bg-card rounded-lg md:rounded-xl p-3 md:p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleWordClick(word)}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    {/* Word Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <span className="text-base md:text-xl font-semibold text-foreground">{word.word}</span>
                        <span className="text-muted-foreground text-xs md:text-sm hidden sm:inline">{word.phonetic}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(word.word);
                          }}
                          className="p-1 md:p-1.5 rounded-full hover:bg-secondary transition-colors"
                        >
                          <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                        </button>
                        {word.is_high_frequency && (
                          <Badge className="bg-destructive text-destructive-foreground text-xs scale-90 md:scale-100">
                            <Flame className="w-3 h-3 mr-0.5" />
                            高频
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm md:text-base line-clamp-2">{word.meaning}</p>
                    </div>

                    {/* Mastery - Simplified on mobile */}
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <div className={cn('text-xs md:text-sm font-medium', getMasteryColor(word.mastery || 0))}>
                          {getMasteryLabel(word.mastery || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {word.mastery || 0}%
                        </div>
                      </div>

                      {/* Progress Ring - Smaller on mobile */}
                      <div className="relative w-8 h-8 md:w-12 md:h-12">
                        <svg className="w-8 h-8 md:w-12 md:h-12 -rotate-90">
                          <circle
                            cx="50%"
                            cy="50%"
                            r="35%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-secondary"
                          />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="35%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${((word.mastery || 0) / 100) * 70} 100`}
                            strokeLinecap="round"
                            className={getMasteryColor(word.mastery || 0)}
                          />
                        </svg>
                      </div>

                      {/* Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(word.id, word.is_starred);
                        }}
                        className="p-1.5 md:p-2 rounded-full hover:bg-secondary transition-colors"
                      >
                        <Star
                          className={cn(
                            'w-4 h-4 md:w-5 md:h-5 transition-colors',
                            word.is_starred
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredWords.length === 0 && (
                <div className="text-center py-12 md:py-16">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base">没有找到匹配的单词</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs md:text-sm text-muted-foreground px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="text-[10px] md:text-xs text-muted-foreground ml-2">
                  共 {filteredWords.length} 词
                </span>
              </div>
            )}
          </div>

          {/* Chart - Hidden on mobile, shown on lg+ */}
          <Card className="glass-card h-fit hidden lg:block">
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

        {/* Word Detail Modal */}
        <WordDetailModal
          word={selectedWord}
          open={showWordDetail}
          onOpenChange={setShowWordDetail}
          onToggleStar={handleToggleStar}
        />
      </div>
    </AppLayout>
  );
};

export default WordBookDetail;
