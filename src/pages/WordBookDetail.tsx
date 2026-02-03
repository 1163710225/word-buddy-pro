import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockWordBooks, mockWords } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Search,
  Play,
  Volume2,
  Star,
  Filter,
  BookOpen,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const WordBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [starredWords, setStarredWords] = useState<Set<string>>(new Set());

  const book = mockWordBooks.find((b) => b.id === id);

  if (!book) {
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

  const filters = [
    { id: 'all', label: '全部', count: mockWords.length },
    { id: 'new', label: '新词', count: 2 },
    { id: 'learning', label: '学习中', count: 3 },
    { id: 'mastered', label: '已掌握', count: 1 },
  ];

  const filteredWords = mockWords.filter((word) => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'new') return matchesSearch && word.mastery < 20;
    if (activeFilter === 'learning') return matchesSearch && word.mastery >= 20 && word.mastery < 80;
    if (activeFilter === 'mastered') return matchesSearch && word.mastery >= 80;
    return matchesSearch;
  });

  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const toggleStar = (wordId: string) => {
    setStarredWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-success';
    if (mastery >= 40) return 'text-accent';
    return 'text-muted-foreground';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 80) return '已掌握';
    if (mastery >= 40) return '学习中';
    return '新词';
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{book.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{book.name}</h1>
                <p className="text-muted-foreground text-sm">{book.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-card rounded-2xl p-6 mb-6 shadow-card">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{book.wordCount}</div>
              <div className="text-sm text-muted-foreground">总词数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">
                {Math.round(book.wordCount * book.progress / 100)}
              </div>
              <div className="text-sm text-muted-foreground">已学习</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {Math.round(book.wordCount * 0.15)}
              </div>
              <div className="text-sm text-muted-foreground">待复习</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{book.level}</div>
              <div className="text-sm text-muted-foreground">难度等级</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">学习进度</span>
              <span className="font-medium">{book.progress}%</span>
            </div>
            <Progress value={book.progress} className="h-3" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              className="flex-1 gradient-primary shadow-primary"
              onClick={() => navigate('/study')}
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

        {/* Search & Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词..."
              className="pl-10"
            />
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
        </div>

        {/* Word List */}
        <div className="space-y-3">
          {filteredWords.map((word, index) => (
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
                      onClick={() => speakWord(word.word)}
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
                    <div className={cn('text-sm font-medium', getMasteryColor(word.mastery))}>
                      {getMasteryLabel(word.mastery)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      掌握度 {word.mastery}%
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
                        strokeDasharray={`${(word.mastery / 100) * 126} 126`}
                        strokeLinecap="round"
                        className={getMasteryColor(word.mastery)}
                      />
                    </svg>
                    {word.mastery >= 80 && (
                      <CheckCircle2 className="absolute inset-0 m-auto w-5 h-5 text-success" />
                    )}
                  </div>

                  {/* Star */}
                  <button
                    onClick={() => toggleStar(word.id)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Star
                      className={cn(
                        'w-5 h-5 transition-colors',
                        starredWords.has(word.id)
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Example */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-foreground italic">"{word.example}"</p>
                <p className="text-xs text-muted-foreground mt-1">{word.exampleTranslation}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">没有找到匹配的单词</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WordBookDetail;
