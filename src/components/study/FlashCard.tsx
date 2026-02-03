import { useState } from 'react';
import { Word } from '@/types/vocabulary';
import { cn } from '@/lib/utils';
import { Volume2, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlashCardProps {
  word: Word;
  onKnow?: () => void;
  onDontKnow?: () => void;
}

export function FlashCard({ word, onKnow, onDontKnow }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div
        onClick={handleFlip}
        className={cn(
          'relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-preserve-3d',
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-card rounded-3xl shadow-card p-8 flex flex-col items-center justify-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord();
              }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsStarred(!isStarred);
              }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Star
                className={cn(
                  'w-5 h-5 transition-colors',
                  isStarred ? 'fill-accent text-accent' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>

          <h2 className="text-5xl font-bold text-foreground mb-4">{word.word}</h2>
          <p className="text-xl text-muted-foreground">{word.phonetic}</p>
          
          <p className="mt-8 text-sm text-muted-foreground">点击卡片查看释义</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-card rounded-3xl shadow-card p-8 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="absolute top-4 left-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground mb-6">{word.meaning}</p>
            
            <div className="bg-secondary/50 rounded-xl p-4 text-left">
              <p className="text-foreground italic">"{word.example}"</p>
              <p className="text-muted-foreground text-sm mt-2">{word.exampleTranslation}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                onDontKnow?.();
              }}
              className="px-8"
            >
              不认识
            </Button>
            <Button
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                onKnow?.();
              }}
              className="px-8 gradient-success"
            >
              认识
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
