import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { mockWords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Trophy, Lightbulb, Volume2, CheckCircle2 } from 'lucide-react';

interface WordPuzzleGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function WordPuzzleGame({ onComplete, onBack }: WordPuzzleGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ letter: string; index: number }[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const words = mockWords.slice(0, 5);
  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord) {
      shuffleWord();
    }
  }, [currentIndex]);

  const shuffleWord = () => {
    const letters = currentWord.word.toUpperCase().split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
    setSelectedLetters([]);
    setIsCorrect(false);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (isCorrect) return;

    // Check if already selected
    const isSelected = selectedLetters.some((s) => s.index === index);
    
    if (isSelected) {
      // Deselect
      setSelectedLetters((prev) => prev.filter((s) => s.index !== index));
    } else {
      // Select
      const newSelected = [...selectedLetters, { letter, index }];
      setSelectedLetters(newSelected);

      // Check if complete
      if (newSelected.length === currentWord.word.length) {
        const answer = newSelected.map((s) => s.letter).join('');
        if (answer === currentWord.word.toUpperCase()) {
          handleCorrect();
        }
      }
    }
  };

  const handleCorrect = () => {
    setIsCorrect(true);
    const bonus = Math.max(10, 30 - hintsUsed * 5);
    setScore((s) => s + bonus);

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((i) => i + 1);
        setHintsUsed(0);
      } else {
        endGame();
      }
    }, 1500);
  };

  const handleHint = () => {
    if (hintsUsed >= 3) return;

    const correctWord = currentWord.word.toUpperCase();
    const currentAnswer = selectedLetters.map((s) => s.letter).join('');
    
    // Find the next correct letter position
    const nextPosition = currentAnswer.length;
    const nextLetter = correctWord[nextPosition];
    
    // Find this letter in shuffled letters that hasn't been selected
    const availableIndex = shuffledLetters.findIndex(
      (l, i) => l === nextLetter && !selectedLetters.some((s) => s.index === i)
    );

    if (availableIndex !== -1) {
      setSelectedLetters((prev) => [...prev, { letter: nextLetter, index: availableIndex }]);
      setHintsUsed((h) => h + 1);

      // Check if complete after hint
      const newSelected = [...selectedLetters, { letter: nextLetter, index: availableIndex }];
      if (newSelected.length === currentWord.word.length) {
        const answer = newSelected.map((s) => s.letter).join('');
        if (answer === correctWord) {
          handleCorrect();
        }
      }
    }
  };

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const endGame = () => {
    setIsGameOver(true);
    onComplete(score);
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setHintsUsed(0);
    setIsGameOver(false);
    setSelectedLetters([]);
    setIsCorrect(false);
  };

  if (isGameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-card rounded-3xl shadow-card p-8">
          <Trophy className="w-16 h-16 mx-auto text-accent mb-4" />
          <h2 className="text-3xl font-bold mb-2">太棒了！</h2>
          <p className="text-muted-foreground mb-6">你完成了所有字母拼图</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">总得分</div>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-success">{words.length}</div>
              <div className="text-sm text-muted-foreground">完成单词</div>
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
        <h2 className="text-xl font-semibold">字母拼图</h2>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-mono text-lg font-bold">{score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        {words.map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full transition-colors',
              i < currentIndex ? 'bg-success' : i === currentIndex ? 'bg-primary' : 'bg-secondary'
            )}
          />
        ))}
      </div>

      {/* Game Card */}
      <div className={cn(
        'bg-card rounded-3xl shadow-card p-8 transition-all',
        isCorrect && 'ring-4 ring-success'
      )}>
        {/* Meaning */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary">
            <span className="font-medium">{currentWord.meaning}</span>
          </span>
          <button
            onClick={speakWord}
            className="ml-2 p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Volume2 className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Answer Slots */}
        <div className="flex justify-center gap-2 mb-8">
          {currentWord.word.split('').map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all',
                selectedLetters[i]
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-secondary border-border'
              )}
            >
              {selectedLetters[i]?.letter || ''}
            </div>
          ))}
        </div>

        {/* Shuffled Letters */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {shuffledLetters.map((letter, index) => {
            const isSelected = selectedLetters.some((s) => s.index === index);
            return (
              <button
                key={index}
                onClick={() => handleLetterClick(letter, index)}
                disabled={isCorrect}
                className={cn(
                  'w-14 h-14 rounded-xl text-xl font-bold transition-all',
                  'hover:scale-105 active:scale-95',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-primary'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedLetters([])}
            disabled={isCorrect || selectedLetters.length === 0}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            清空
          </Button>
          <Button
            variant="outline"
            onClick={handleHint}
            disabled={isCorrect || hintsUsed >= 3}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            提示 ({3 - hintsUsed})
          </Button>
        </div>

        {/* Success Feedback */}
        {isCorrect && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-success text-success-foreground px-6 py-3 rounded-full animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold">正确！</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-muted-foreground mt-6">
        将打乱的字母重新排列，拼出正确的单词
      </p>
    </div>
  );
}
