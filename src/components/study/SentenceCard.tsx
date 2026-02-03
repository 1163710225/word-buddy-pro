import { useState } from 'react';
import { Word } from '@/types/vocabulary';
import { cn } from '@/lib/utils';
import { Volume2, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SentenceCardProps {
  word: Word;
  onAnswer: (isCorrect: boolean) => void;
}

export function SentenceCard({ word, onAnswer }: SentenceCardProps) {
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Create sentence with blank
  const sentenceWithBlank = word.example.replace(
    new RegExp(`\\b${word.word}\\b`, 'gi'),
    '_____'
  );

  const speakSentence = () => {
    const utterance = new SpeechSynthesisUtterance(word.example);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handleSubmit = () => {
    if (!userInput.trim() || showResult) return;

    const correct = userInput.toLowerCase().trim() === word.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
      setUserInput('');
      setShowResult(false);
      setShowHint(false);
      setIsCorrect(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getHint = () => {
    const length = word.word.length;
    const showChars = Math.ceil(length / 3);
    return word.word.slice(0, showChars) + '_'.repeat(length - showChars);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="bg-card rounded-3xl shadow-card p-8">
        {/* Meaning */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary">
            <span className="text-sm font-medium">{word.meaning}</span>
          </span>
        </div>

        {/* Sentence with blank */}
        <div className="bg-secondary/50 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <p className="text-xl text-foreground leading-relaxed flex-1">
              {sentenceWithBlank}
            </p>
            <button
              onClick={speakSentence}
              className="p-2 rounded-full hover:bg-secondary transition-colors ml-4"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            {word.exampleTranslation}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="填入正确的单词..."
              disabled={showResult}
              className={cn(
                'text-center text-xl py-6 rounded-xl border-2 transition-all',
                showResult && isCorrect && 'border-success bg-success/10',
                showResult && !isCorrect && 'border-destructive bg-destructive/10 animate-shake'
              )}
            />
            {showResult && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <span className="text-destructive font-medium">{word.word}</span>
                )}
              </div>
            )}
          </div>

          {/* Hint */}
          {showHint && !showResult && (
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-accent">
                <Lightbulb className="w-4 h-4" />
                提示：{getHint()}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!showHint && !showResult && (
              <Button
                variant="outline"
                onClick={() => setShowHint(true)}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                提示
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!userInput.trim() || showResult}
              className="gradient-primary px-8"
            >
              确认
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
