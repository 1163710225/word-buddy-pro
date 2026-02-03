import { useState, useEffect } from 'react';
import { Word } from '@/types/vocabulary';
import { cn } from '@/lib/utils';
import { Volume2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListeningCardProps {
  word: Word;
  options: string[];
  onAnswer: (isCorrect: boolean) => void;
}

export function ListeningCard({ word, options, onAnswer }: ListeningCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const correctAnswer = word.word;

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
    setHasPlayed(true);
  };

  useEffect(() => {
    // Auto play on mount
    const timer = setTimeout(() => {
      speakWord();
    }, 500);
    return () => clearTimeout(timer);
  }, [word.id]);

  const handleSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedIndex(index);
    setShowResult(true);
    
    const isCorrect = options[index] === correctAnswer;
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedIndex(null);
      setShowResult(false);
      setHasPlayed(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="bg-card rounded-3xl shadow-card p-8">
        {/* Audio Section */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center">
            <button
              onClick={speakWord}
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
                'bg-primary/10 hover:bg-primary/20 hover:scale-105 active:scale-95',
                hasPlayed && 'ring-4 ring-primary/30'
              )}
            >
              <Volume2 className="w-12 h-12 text-primary" />
            </button>
            <p className="text-muted-foreground mt-4 text-lg">点击播放发音，选择正确的单词</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={speakWord}
              className="mt-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              再听一次
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = option === correctAnswer;
            
            let optionStyle = 'bg-secondary hover:bg-secondary/80 border-transparent';
            if (showResult) {
              if (isCorrect) {
                optionStyle = 'bg-success/10 border-success text-success';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-destructive/10 border-destructive text-destructive animate-shake';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={showResult}
                className={cn(
                  'p-5 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  optionStyle
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-medium">{option}</span>
                    {showResult && isCorrect && (
                      <p className="text-sm mt-1 text-muted-foreground">{word.meaning}</p>
                    )}
                  </div>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
