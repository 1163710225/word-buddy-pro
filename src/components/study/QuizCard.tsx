import { useState } from 'react';
import { Word } from '@/types/vocabulary';
import { cn } from '@/lib/utils';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { speakWord as speak } from '@/lib/speech';

interface QuizCardProps {
  word: Word;
  options: string[];
  mode: 'word-meaning' | 'meaning-word';
  onAnswer: (isCorrect: boolean) => void;
}

export function QuizCard({ word, options, mode, onAnswer }: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const correctAnswer = mode === 'word-meaning' ? word.meaning : word.word;
  const question = mode === 'word-meaning' ? word.word : word.meaning;

  const handleSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedIndex(index);
    setShowResult(true);
    
    const isCorrect = options[index] === correctAnswer;
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedIndex(null);
      setShowResult(false);
    }, 1500);
  };

  const handleSpeak = () => {
    speak(word.word);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="bg-card rounded-3xl shadow-card p-8">
        {/* Question */}
        <div className="text-center mb-8">
          {mode === 'word-meaning' ? (
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-4xl font-bold text-foreground">{question}</h2>
              <button
                onClick={handleSpeak}
                className="p-3 rounded-full hover:bg-secondary transition-colors"
              >
                <Volume2 className="w-6 h-6 text-primary" />
              </button>
            </div>
          ) : (
            <p className="text-2xl text-foreground">{question}</p>
          )}
          {mode === 'word-meaning' && (
            <p className="text-muted-foreground mt-2">{word.phonetic}</p>
          )}
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
                  <span className="text-lg">{option}</span>
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
