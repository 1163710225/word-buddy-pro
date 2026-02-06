import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudyModeCard } from '@/components/study/StudyModeCard';
import { FlashCard } from '@/components/study/FlashCard';
import { QuizCard } from '@/components/study/QuizCard';
import { SpellingCard } from '@/components/study/SpellingCard';
import { ListeningCard } from '@/components/study/ListeningCard';
import { SentenceCard } from '@/components/study/SentenceCard';
import { StudyProgress } from '@/components/study/StudyProgress';
import { studyModes } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import { StudyMode, Word } from '@/types/vocabulary';
import { useWordbooks, useWords } from '@/hooks/useWordbooks';
import { useUpdateWordProgress, useUpdateDailyStats } from '@/hooks/useUserStats';

const Study = () => {
  const location = useLocation();
  const initialWordbookId = location.state?.wordbookId || '';
  
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);
  const [selectedWordbookId, setSelectedWordbookId] = useState(initialWordbookId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const { data: wordbooks, isLoading: wordbooksLoading } = useWordbooks();
  const { data: words, isLoading: wordsLoading } = useWords(selectedWordbookId);
  const updateProgress = useUpdateWordProgress();
  const updateDailyStats = useUpdateDailyStats();

  const currentWord = words?.[currentIndex];

  useEffect(() => {
    if (selectedMode && !startTime) {
      setStartTime(new Date());
    }
  }, [selectedMode, startTime]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setCorrectCount((c) => c + 1);
    
    // Update word progress
    if (currentWord) {
      updateProgress.mutate({ wordId: currentWord.id, correct: isCorrect });
    }
    
    if (words && currentIndex < words.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    } else {
      // Session complete - update daily stats
      const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : 1;
      updateDailyStats.mutate({
        newWords: words?.length || 0,
        studyMinutes: Math.max(1, duration),
      });
    }
  };

  const handleExit = () => {
    setSelectedMode(null);
    setCurrentIndex(0);
    setCorrectCount(0);
    setStartTime(null);
  };

  const generateOptions = (correctAnswer: string, isWord: boolean) => {
    if (!words) return [correctAnswer];
    
    const allOptions = isWord
      ? words.map((w) => w.word)
      : words.map((w) => w.meaning);
    
    const otherOptions = allOptions
      .filter((o) => o !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return [...otherOptions, correctAnswer].sort(() => Math.random() - 0.5);
  };

  const convertToLegacyWord = (word: typeof words extends (infer T)[] ? T : never): Word => ({
    id: word.id,
    word: word.word,
    phonetic: word.phonetic || '',
    meaning: word.meaning,
    example: word.example || '',
    exampleTranslation: word.example_translation || '',
    audioUrl: word.audio_url || undefined,
    category: '',
    difficulty: (word.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
    mastery: 0,
    reviewCount: 0,
    correctCount: 0,
  });

  if (!selectedMode) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">选择学习模式</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">根据你的需求选择合适的学习方式</p>
          </div>

          {/* Wordbook Selection */}
          <div className="mb-6 md:mb-8">
            <label className="block text-sm font-medium mb-2">选择词库</label>
            {wordbooksLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                加载中...
              </div>
            ) : (
              <Select value={selectedWordbookId} onValueChange={setSelectedWordbookId}>
                <SelectTrigger className="w-full md:max-w-md">
                  <SelectValue placeholder="请选择要学习的词库" />
                </SelectTrigger>
                <SelectContent>
                  {wordbooks?.map((wb) => (
                    <SelectItem key={wb.id} value={wb.id}>
                      {wb.icon} {wb.name} ({wb.word_count}词)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {studyModes.map((mode, index) => (
              <div
                key={mode.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <StudyModeCard
                  {...mode}
                  color={mode.color as 'primary' | 'accent' | 'success' | 'warning'}
                  onClick={() => {
                    if (!selectedWordbookId) {
                      return;
                    }
                    setSelectedMode(mode.id as StudyMode);
                  }}
                />
              </div>
            ))}
          </div>

          {!selectedWordbookId && (
            <p className="text-center text-amber-500 mt-4 text-sm md:text-base">请先选择词库</p>
          )}
        </div>
      </AppLayout>
    );
  }

  if (wordsLoading || !words || !currentWord) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const legacyWord = convertToLegacyWord(currentWord);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h2 className="text-xl font-semibold">
            {studyModes.find((m) => m.id === selectedMode)?.name}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <StudyProgress
          current={currentIndex + 1}
          total={words.length}
          correctCount={correctCount}
        />

        {/* Study Card */}
        <div className="mt-8">
          {selectedMode === 'flashcard' && (
            <FlashCard
              key={currentWord.id}
              word={legacyWord}
              onKnow={() => handleAnswer(true)}
              onDontKnow={() => handleAnswer(false)}
            />
          )}
          
          {selectedMode === 'word-meaning' && (
            <QuizCard
              key={currentWord.id}
              word={legacyWord}
              mode="word-meaning"
              options={generateOptions(currentWord.meaning, false)}
              onAnswer={handleAnswer}
            />
          )}
          
          {selectedMode === 'meaning-word' && (
            <QuizCard
              key={currentWord.id}
              word={legacyWord}
              mode="meaning-word"
              options={generateOptions(currentWord.word, true)}
              onAnswer={handleAnswer}
            />
          )}
          
          {selectedMode === 'spelling' && (
            <SpellingCard
              key={currentWord.id}
              word={legacyWord}
              onAnswer={handleAnswer}
            />
          )}

          {selectedMode === 'listening' && (
            <ListeningCard
              key={currentWord.id}
              word={legacyWord}
              options={generateOptions(currentWord.word, true)}
              onAnswer={handleAnswer}
            />
          )}

          {selectedMode === 'sentence' && (
            <SentenceCard
              key={currentWord.id}
              word={legacyWord}
              onAnswer={handleAnswer}
            />
          )}
        </div>

        {/* Completion */}
        {currentIndex >= words.length - 1 && (
          <div className="text-center py-8 animate-fade-in">
            <p className="text-2xl mb-2">🎉 学习完成！</p>
            <p className="text-muted-foreground">
              正确率：{Math.round((correctCount / words.length) * 100)}%
            </p>
            <Button onClick={handleExit} className="mt-4 gradient-primary">
              继续学习
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Study;
