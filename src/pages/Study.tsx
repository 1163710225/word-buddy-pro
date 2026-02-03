import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudyModeCard } from '@/components/study/StudyModeCard';
import { FlashCard } from '@/components/study/FlashCard';
import { QuizCard } from '@/components/study/QuizCard';
import { SpellingCard } from '@/components/study/SpellingCard';
import { StudyProgress } from '@/components/study/StudyProgress';
import { studyModes, mockWords } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { StudyMode } from '@/types/vocabulary';

const Study = () => {
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const words = mockWords;
  const currentWord = words[currentIndex];

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setCorrectCount((c) => c + 1);
    
    if (currentIndex < words.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const handleExit = () => {
    setSelectedMode(null);
    setCurrentIndex(0);
    setCorrectCount(0);
  };

  const generateOptions = (correctAnswer: string, isWord: boolean) => {
    const allOptions = isWord
      ? words.map((w) => w.word)
      : words.map((w) => w.meaning);
    
    const otherOptions = allOptions
      .filter((o) => o !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return [...otherOptions, correctAnswer].sort(() => Math.random() - 0.5);
  };

  if (!selectedMode) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">选择学习模式</h1>
            <p className="text-muted-foreground mt-1">根据你的需求选择合适的学习方式</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {studyModes.map((mode, index) => (
              <div
                key={mode.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <StudyModeCard
                  {...mode}
                  color={mode.color as 'primary' | 'accent' | 'success' | 'warning'}
                  onClick={() => setSelectedMode(mode.id as StudyMode)}
                />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

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
              word={currentWord}
              onKnow={() => handleAnswer(true)}
              onDontKnow={() => handleAnswer(false)}
            />
          )}
          
          {selectedMode === 'word-meaning' && (
            <QuizCard
              key={currentWord.id}
              word={currentWord}
              mode="word-meaning"
              options={generateOptions(currentWord.meaning, false)}
              onAnswer={handleAnswer}
            />
          )}
          
          {selectedMode === 'meaning-word' && (
            <QuizCard
              key={currentWord.id}
              word={currentWord}
              mode="meaning-word"
              options={generateOptions(currentWord.word, true)}
              onAnswer={handleAnswer}
            />
          )}
          
          {selectedMode === 'spelling' && (
            <SpellingCard
              key={currentWord.id}
              word={currentWord}
              onAnswer={handleAnswer}
            />
          )}

          {(selectedMode === 'listening' || selectedMode === 'sentence') && (
            <div className="text-center py-16">
              <p className="text-2xl mb-4">🚧</p>
              <p className="text-muted-foreground">该模式正在开发中...</p>
              <Button onClick={handleExit} className="mt-4">
                返回选择其他模式
              </Button>
            </div>
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
