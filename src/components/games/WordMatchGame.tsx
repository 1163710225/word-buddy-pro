import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { mockWords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react';

interface WordMatchGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface MatchItem {
  id: string;
  content: string;
  type: 'word' | 'meaning';
  wordId: string;
  isMatched: boolean;
}

export function WordMatchGame({ onComplete, onBack }: WordMatchGameProps) {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, isGameOver]);

  const initGame = () => {
    const gameWords = mockWords.slice(0, 6);
    const newItems: MatchItem[] = [];

    gameWords.forEach((word) => {
      newItems.push({
        id: `word-${word.id}`,
        content: word.word,
        type: 'word',
        wordId: word.id,
        isMatched: false,
      });
      newItems.push({
        id: `meaning-${word.id}`,
        content: word.meaning,
        type: 'meaning',
        wordId: word.id,
        isMatched: false,
      });
    });

    setItems(newItems.sort(() => Math.random() - 0.5));
    setSelectedItem(null);
    setMatchedPairs(new Set());
    setScore(0);
    setMoves(0);
    setTimeLeft(120);
    setIsGameOver(false);
  };

  const handleItemClick = (item: MatchItem) => {
    if (item.isMatched || isGameOver) return;

    if (!selectedItem) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.id === item.id) {
      setSelectedItem(null);
      return;
    }

    setMoves((m) => m + 1);

    // Check if match
    if (selectedItem.wordId === item.wordId && selectedItem.type !== item.type) {
      // Correct match
      const newMatchedPairs = new Set(matchedPairs);
      newMatchedPairs.add(selectedItem.wordId);
      setMatchedPairs(newMatchedPairs);

      setItems((prev) =>
        prev.map((i) =>
          i.wordId === item.wordId ? { ...i, isMatched: true } : i
        )
      );

      const bonus = Math.max(10, 30 - moves);
      setScore((s) => s + bonus);

      // Check if all matched
      if (newMatchedPairs.size === 6) {
        const timeBonus = timeLeft * 2;
        setScore((s) => s + timeBonus);
        setTimeout(() => endGame(), 500);
      }
    }

    setSelectedItem(null);
  };

  const endGame = () => {
    setIsGameOver(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-card rounded-3xl shadow-card p-8">
          <Trophy className="w-16 h-16 mx-auto text-accent mb-4" />
          <h2 className="text-3xl font-bold mb-2">游戏结束！</h2>
          <p className="text-muted-foreground mb-6">
            {matchedPairs.size === 6 ? '恭喜你完成了所有配对！' : '时间到了，再接再厉！'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">得分</div>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-success">{matchedPairs.size}/6</div>
              <div className="text-sm text-muted-foreground">配对成功</div>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="text-2xl font-bold text-accent">{moves}</div>
              <div className="text-sm text-muted-foreground">尝试次数</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={onBack}>
              返回菜单
            </Button>
            <Button onClick={initGame} className="gradient-primary">
              <RotateCcw className="w-4 h-4 mr-2" />
              再玩一次
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h2 className="text-xl font-semibold">单词配对</h2>
        <Button variant="ghost" size="icon" onClick={initGame}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-mono text-lg font-bold">{score}</span>
        </div>
        <div className="text-muted-foreground">
          配对：{matchedPairs.size}/6
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.isMatched}
            className={cn(
              'p-4 rounded-xl border-2 transition-all duration-200 min-h-[100px]',
              'hover:scale-[1.02] active:scale-[0.98]',
              item.isMatched && 'bg-success/10 border-success opacity-60',
              selectedItem?.id === item.id && 'border-primary bg-primary/10 scale-[1.02]',
              !item.isMatched && selectedItem?.id !== item.id && 'bg-card border-border hover:border-primary/50'
            )}
          >
            <span className={cn(
              'text-sm',
              item.type === 'word' ? 'font-semibold text-foreground' : 'text-muted-foreground'
            )}>
              {item.content}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-muted-foreground mt-6">
        点击单词和对应的释义进行配对
      </p>
    </div>
  );
}
