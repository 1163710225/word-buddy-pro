import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { WordMeaningCard } from '@/components/word/WordMeaningCard';
import { VideoExamplePlayer } from '@/components/word/VideoExamplePlayer';
import { useWords, useToggleStarWord } from '@/hooks/useWordbooks';
import { useWordMeanings, useWordVideos } from '@/hooks/useSmartStudy';
import { speakWord, speakText } from '@/lib/speech';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Star,
  Flame,
  TrendingUp,
  Video,
  BookOpen,
  Loader2,
} from 'lucide-react';

const WordLearn = () => {
  const { id: wordbookId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startIndex = parseInt(searchParams.get('start') || '0', 10);

  const { data: words, isLoading } = useWords(wordbookId);
  const toggleStar = useToggleStarWord();

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentWord = words?.[currentIndex];

  const { data: meanings, isLoading: meaningsLoading } = useWordMeanings(currentWord?.id);
  const { data: videos, isLoading: videosLoading } = useWordVideos(currentWord?.id);

  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    setIsStarred((currentWord as any)?.is_starred || false);
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
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const handleToggleStar = () => {
    if (currentWord) {
      toggleStar.mutate({ wordId: currentWord.id, isStarred });
      setIsStarred(!isStarred);
    }
  };

  const handleSpeak = () => {
    if (currentWord) speakWord(currentWord.word);
  };

  const handleSpeakText = (text: string) => {
    speakText(text);
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

  if (!words || words.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">该词库暂无单词</p>
          <Button onClick={() => navigate(-1)} className="mt-4">返回</Button>
        </div>
      </AppLayout>
    );
  }

  if (!currentWord) return null;

  const progress = ((currentIndex + 1) / words.length) * 100;
  const hasMultipleMeanings = meanings && meanings.length > 0;
  const hasVideos = videos && videos.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/wordbooks/${wordbookId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{currentIndex + 1} / {words.length}</span>
            </div>
            <Progress value={progress} className="h-1.5 mt-1" />
          </div>
          <button
            onClick={handleToggleStar}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Star
              className={cn(
                'w-5 h-5 transition-colors',
                isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
          {/* Word Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">{currentWord.word}</h1>
              <button
                onClick={handleSpeak}
                className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-5 h-5 text-primary" />
              </button>
            </div>
            <p className="text-lg text-muted-foreground mb-3">{currentWord.phonetic}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {currentWord.is_high_frequency && (
                <Badge className="bg-destructive text-destructive-foreground">
                  <Flame className="w-3 h-3 mr-1" />
                  高频词
                </Badge>
              )}
              {(currentWord.exam_priority ?? 0) > 80 && (
                <Badge className="bg-amber-500 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  考试重点
                </Badge>
              )}
              <Badge variant="outline">
                词频排名 #{currentWord.frequency_rank || '-'}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="meanings">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="meanings" className="gap-2">
                <BookOpen className="w-4 h-4" />
                词义详解 {hasMultipleMeanings && `(${meanings.length})`}
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="w-4 h-4" />
                视频例句 {hasVideos && `(${videos.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meanings" className="mt-0">
              {meaningsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : hasMultipleMeanings ? (
                <div className="space-y-4">
                  {meanings.map((meaning) => (
                    <WordMeaningCard
                      key={meaning.id}
                      meaning={meaning}
                      onPlayExample={handleSpeakText}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <p className="text-lg font-medium text-foreground mb-3">
                    {currentWord.meaning}
                  </p>
                  {currentWord.example && (
                    <div className="border-t border-border pt-3">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleSpeakText(currentWord.example!)}
                          className="p-1.5 rounded-full hover:bg-secondary transition-colors shrink-0"
                        >
                          <Volume2 className="w-4 h-4 text-primary" />
                        </button>
                        <div>
                          <p className="text-sm text-foreground italic">
                            "{currentWord.example}"
                          </p>
                          {currentWord.example_translation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentWord.example_translation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-0">
              {videosLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : hasVideos ? (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <VideoExamplePlayer key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">暂无视频例句</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border safe-area-bottom z-20">
        <div className="flex items-center justify-between gap-4 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            上一个
          </Button>
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {currentIndex + 1} / {words.length}
          </span>
          <Button
            size="lg"
            onClick={goNext}
            disabled={currentIndex === words.length - 1}
            className="flex-1 gradient-primary"
          >
            下一个
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WordLearn;
