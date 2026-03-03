import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WordMeaningCard } from '@/components/word/WordMeaningCard';
import { VideoExamplePlayer } from '@/components/word/VideoExamplePlayer';
import { useWords, useToggleStarWord } from '@/hooks/useWordbooks';
import { useWordMeanings, useWordVideos } from '@/hooks/useSmartStudy';
import { useUpdateWordProgress } from '@/hooks/useUserStats';
import { speakWord, speakText } from '@/lib/speech';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Volume2,
  Star,
  Flame,
  TrendingUp,
  Video,
  BookOpen,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from 'lucide-react';

const WordLearn = () => {
  const { id: wordbookId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startIndex = parseInt(searchParams.get('start') || '-1', 10);
  const isMobile = useIsMobile();

  const { data: words, isLoading } = useWords(wordbookId);
  const toggleStar = useToggleStarWord();
  const updateProgress = useUpdateWordProgress();

  // Find first unlearned word (mastery < 80) as default start
  const resumeIndex = useMemo(() => {
    if (!words || words.length === 0) return 0;
    if (startIndex >= 0) return startIndex;
    const idx = words.findIndex((w: any) => (w.mastery || 0) < 80);
    return idx >= 0 ? idx : 0;
  }, [words, startIndex]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    if (words && words.length > 0) {
      setCurrentIndex(resumeIndex);
    }
  }, [resumeIndex, words]);

  const currentWord = words?.[currentIndex];
  const { data: meanings, isLoading: meaningsLoading } = useWordMeanings(currentWord?.id);
  const { data: videos, isLoading: videosLoading } = useWordVideos(currentWord?.id);

  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    setIsStarred((currentWord as any)?.is_starred || false);
    setAnswered(false);
    setShowMeaning(false);
  }, [currentWord]);

  const goNext = useCallback(() => {
    if (words && currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [words, currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setShowMeaning(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const handleAnswer = (correct: boolean) => {
    if (!currentWord || answered) return;
    setAnswered(true);
    updateProgress.mutate({ wordId: currentWord.id, correct });
    // Auto advance after short delay
    setTimeout(() => {
      goNext();
    }, 600);
  };

  const handleToggleStar = () => {
    if (currentWord) {
      toggleStar.mutate({ wordId: currentWord.id, isStarred });
      setIsStarred(!isStarred);
    }
  };

  const handleSpeak = () => {
    if (currentWord) speakWord(currentWord.word);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-16 h-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">该词库暂无单词</p>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  if (!currentWord) return null;

  const progress = ((currentIndex + 1) / words.length) * 100;
  const hasMultipleMeanings = meanings && meanings.length > 0;
  const hasVideos = videos && videos.length > 0;
  const currentMastery = (currentWord as any).mastery || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-2.5 max-w-6xl mx-auto">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(`/wordbooks/${wordbookId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-medium">{currentIndex + 1} / {words.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          <button
            onClick={handleToggleStar}
            className="p-2 rounded-full hover:bg-secondary transition-colors shrink-0"
          >
            <Star className={cn('w-5 h-5 transition-colors', isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          {/* Word Header Card */}
          <div className="bg-card rounded-2xl p-5 md:p-8 border border-border shadow-card mb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">{currentWord.word}</h1>
                  <button
                    onClick={handleSpeak}
                    className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-3">{currentWord.phonetic}</p>
                <div className="flex flex-wrap gap-2">
                  {currentWord.is_high_frequency && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      <Flame className="w-3 h-3 mr-1" />高频词
                    </Badge>
                  )}
                  {(currentWord.exam_priority ?? 0) > 80 && (
                    <Badge className="bg-amber-500 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />考试重点
                    </Badge>
                  )}
                  <Badge variant="outline">词频 #{currentWord.frequency_rank || '-'}</Badge>
                </div>
              </div>

              {/* Mastery indicator */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative w-14 h-14 md:w-16 md:h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-secondary" />
                    <circle
                      cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(currentMastery / 100) * 94.2} 94.2`}
                      className={cn(
                        currentMastery >= 80 ? 'stroke-green-500' :
                        currentMastery >= 40 ? 'stroke-amber-500' : 'stroke-muted-foreground'
                      )}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                    {currentMastery}%
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {currentMastery >= 80 ? '已掌握' : currentMastery >= 40 ? '学习中' : '新词'}
                </span>
              </div>
            </div>

            {/* Quick meaning preview (always visible) */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-base md:text-lg font-medium text-foreground">{currentWord.meaning}</p>
              {currentWord.example && (
                <div className="flex items-start gap-2 mt-2">
                  <button
                    onClick={() => speakText(currentWord.example!)}
                    className="p-1 rounded-full hover:bg-secondary transition-colors shrink-0 mt-0.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <div>
                    <p className="text-sm text-muted-foreground italic">"{currentWord.example}"</p>
                    {currentWord.example_translation && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{currentWord.example_translation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Content - Side by side on tablet/desktop */}
          <div className={cn(
            'grid gap-5',
            !isMobile && (hasMultipleMeanings || hasVideos) ? 'md:grid-cols-2' : 'grid-cols-1'
          )}>
            {/* Meanings Column */}
            {(meaningsLoading || hasMultipleMeanings) && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  词义详解 {hasMultipleMeanings && <span className="text-xs">({meanings.length})</span>}
                </h3>
                {meaningsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meanings!.map((meaning) => (
                      <WordMeaningCard key={meaning.id} meaning={meaning} onPlayExample={speakText} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos Column */}
            {(videosLoading || hasVideos) && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  视频例句 {hasVideos && <span className="text-xs">({videos.length})</span>}
                </h3>
                {videosLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {videos!.map((video) => (
                      <VideoExamplePlayer key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Empty state when no extra content */}
          {!meaningsLoading && !videosLoading && !hasMultipleMeanings && !hasVideos && (
            <div className="text-center py-8 text-muted-foreground/50">
              <p className="text-sm">暂无详细词义和视频数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border safe-area-bottom z-20">
        <div className="flex items-center gap-3 px-4 py-3 max-w-6xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAnswer(false)}
            disabled={answered}
            className={cn(
              'flex-1 h-12 text-base font-medium transition-all',
              answered && 'opacity-50'
            )}
          >
            <ThumbsDown className="w-5 h-5 mr-2 text-destructive" />
            不认识
          </Button>

          <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[60px]">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-[10px] text-muted-foreground">{currentIndex + 1}/{words.length}</span>
          </div>

          <Button
            size="lg"
            onClick={() => handleAnswer(true)}
            disabled={answered}
            className={cn(
              'flex-1 h-12 text-base font-medium gradient-primary transition-all',
              answered && 'opacity-50'
            )}
          >
            <ThumbsUp className="w-5 h-5 mr-2" />
            认识
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WordLearn;
