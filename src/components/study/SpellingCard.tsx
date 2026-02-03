import { useState, useEffect, useRef } from 'react';
import { Word } from '@/types/vocabulary';
import { cn } from '@/lib/utils';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SpellingCardProps {
  word: Word;
  onAnswer: (isCorrect: boolean) => void;
}

export function SpellingCard({ word, onAnswer }: SpellingCardProps) {
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [word]);

  const handleSubmit = () => {
    if (!input.trim() || showResult) return;
    
    const correct = input.trim().toLowerCase() === word.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    onAnswer(isCorrect);
    setInput('');
    setShowResult(false);
  };

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showResult) {
        handleNext();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-card rounded-3xl shadow-card p-8">
        {/* Meaning */}
        <div className="text-center mb-8">
          <p className="text-2xl text-foreground mb-4">{word.meaning}</p>
          <button
            onClick={speakWord}
            className="p-3 rounded-full hover:bg-secondary transition-colors mx-auto"
          >
            <Volume2 className="w-6 h-6 text-primary" />
          </button>
          <p className="text-sm text-muted-foreground mt-2">点击播放发音提示</p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入单词..."
              disabled={showResult}
              className={cn(
                'text-center text-2xl py-6 rounded-xl border-2',
                showResult && isCorrect && 'border-success bg-success/5',
                showResult && !isCorrect && 'border-destructive bg-destructive/5'
              )}
            />
            {showResult && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
              </div>
            )}
          </div>

          {showResult && !isCorrect && (
            <div className="text-center py-4 bg-secondary/50 rounded-xl">
              <p className="text-muted-foreground text-sm">正确答案</p>
              <p className="text-2xl font-bold text-foreground mt-1">{word.word}</p>
              <p className="text-muted-foreground">{word.phonetic}</p>
            </div>
          )}

          <div className="flex justify-center">
            {!showResult ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="px-12 gradient-primary"
              >
                确认
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleNext}
                className="px-12 gradient-primary"
              >
                下一个
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
