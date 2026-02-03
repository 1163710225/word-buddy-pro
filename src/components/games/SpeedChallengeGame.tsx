import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { mockWords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface SpeedChallengeGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function SpeedChallengeGame({ onComplete, onBack }: SpeedChallengeGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const words = [...mockWords, ...mockWords].sort(() => Math.random() - 0.5);
  const currentWord = words[currentIndex % words.length];

  useEffect(() => {
    generateOptions();
  }, [currentIndex]);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, isGameOver]);

  const generateOptions = () => {
    const correctAnswer = currentWord.meaning;
    const otherOptions = mockWords
      .filter((w) => w.meaning !== correctAnswer)
      .map((w) => w.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setOptions([...otherOptions, correctAnswer].sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (answer: string) => {
    if (isGameOver || showFeedback) return;

    const isCorrect = answer === currentWord.meaning;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      
      // Score with streak bonus
      const streakBonus = Math.min(newStreak, 5);
      setScore((s) => s + 10 + streakBonus * 2);
      setShowFeedback('correct');
    } else {
      setStreak(0);
      setShowFeedback('wrong');
    }

    setTimeout(() => {
      setShowFeedback(null);
      setCurrentIndex((i) => i + 1);
    }, 300);
  };

  const endGame = () => {
    setIsGameOver(true);
    onComplete(score);
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(60);
    setIsGameOver(false);
    setShowFeedback(null);
  };

  if (isGameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-card rounded-3xl shadow-card p-8">
          <Zap className="w-16 h-16 mx-auto text-accent mb-4" />
          <h2 className="text-3xl font-bold mb-2">时间到！</h2>
          <p className="text-muted-foreground mb-6">极速挑战结束</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">总得分</div>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-success">{currentIndex}</div>
              <div className="text-sm text-muted-foreground">答题数</div>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-accent">{maxStreak}</div>
              <div className="text-sm text-muted-foreground">最高连击</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={onBack}>
              返回菜单
            </Button>
            <Button onClick={restartGame} className="gradient-primary">
              <RotateCcw className="w-4 h-4 mr-2" />
              再玩一次
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h2 className="text-xl font-semibold">极速挑战</h2>
        <div className="w-20" />
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow">
          <Clock className={cn('w-5 h-5', timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary')} />
          <span className="font-mono text-xl font-bold">{timeLeft}s</span>
        </div>
        
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full animate-fade-in">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-bold text-accent">{streak}连击!</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-mono text-xl font-bold">{score}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className={cn(
        'bg-card rounded-3xl shadow-card p-8 transition-all duration-200',
        showFeedback === 'correct' && 'ring-4 ring-success',
        showFeedback === 'wrong' && 'ring-4 ring-destructive animate-shake'
      )}>
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">第 {currentIndex + 1} 题</p>
          <h2 className="text-4xl font-bold text-foreground">{currentWord.word}</h2>
          <p className="text-muted-foreground mt-2">{currentWord.phonetic}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback !== null}
              className={cn(
                'p-5 rounded-xl border-2 text-left transition-all duration-200',
                'hover:scale-[1.02] active:scale-[0.98] bg-secondary border-transparent',
                'hover:bg-secondary/80'
              )}
            >
              <span className="text-lg">{option}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {showFeedback === 'correct' ? (
              <CheckCircle2 className="w-24 h-24 text-success animate-bounce" />
            ) : (
              <XCircle className="w-24 h-24 text-destructive animate-shake" />
            )}
          </div>
        )}
      </div>

      <p className="text-center text-muted-foreground mt-6">
        快速选择正确的释义，连击可获得额外分数！
      </p>
    </div>
  );
}
