import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Timer, Trophy, Zap, Target, Puzzle, Loader2 } from 'lucide-react';
import { WordMatchGame } from '@/components/games/WordMatchGame';
import { SpeedChallengeGame } from '@/components/games/SpeedChallengeGame';
import { WordPuzzleGame } from '@/components/games/WordPuzzleGame';
import { useWordbooks, useWords } from '@/hooks/useWordbooks';

type GameType = 'menu' | 'match' | 'speed' | 'puzzle';

const games = [
  { id: 'match', name: '单词配对', description: '找出单词与释义的正确配对', icon: Target, color: 'from-blue-500 to-cyan-500', difficulty: '简单' },
  { id: 'speed', name: '极速挑战', description: '限时答题，60秒内答对多少题', icon: Zap, color: 'from-orange-500 to-amber-500', difficulty: '中等' },
  { id: 'puzzle', name: '字母拼图', description: '打乱字母重新排列拼单词', icon: Puzzle, color: 'from-purple-500 to-pink-500', difficulty: '困难' },
];

const Games = () => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const [highScores, setHighScores] = useState({ match: 0, speed: 0, puzzle: 0 });
  const [selectedWbId, setSelectedWbId] = useState('');

  const { data: wordbooks, isLoading: wbLoading } = useWordbooks();
  const { data: words } = useWords(selectedWbId || undefined);

  const handleGameComplete = (game: 'match' | 'speed' | 'puzzle', score: number) => {
    setHighScores(prev => ({ ...prev, [game]: Math.max(prev[game], score) }));
    setActiveGame('menu');
  };

  const handleStartGame = (gameId: string) => {
    if (!selectedWbId) {
      return;
    }
    if (!words || words.length < 4) {
      return;
    }
    setActiveGame(gameId as GameType);
  };

  if (activeGame !== 'menu') {
    const GameComponent = { match: WordMatchGame, speed: SpeedChallengeGame, puzzle: WordPuzzleGame }[activeGame];
    return (
      <AppLayout>
        <GameComponent
          onComplete={(score: number) => handleGameComplete(activeGame as 'match' | 'speed' | 'puzzle', score)}
          onBack={() => setActiveGame('menu')}
          words={words || []}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 md:gap-3">
            <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            单词小游戏
          </h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-base">趣味学习，轻松记忆</p>
        </div>

        {/* Wordbook selector */}
        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium mb-2">选择词库</label>
          {wbLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          ) : (
            <Select value={selectedWbId} onValueChange={setSelectedWbId}>
              <SelectTrigger className="w-full md:max-w-md">
                <SelectValue placeholder="请选择词库开始游戏" />
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
          {!selectedWbId && (
            <p className="text-amber-500 text-xs mt-2">请先选择词库</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
          {[
            { icon: Trophy, value: Object.values(highScores).reduce((a, b) => a + b, 0), label: '总积分' },
            { icon: Timer, value: words?.length || 0, label: '可用单词' },
            { icon: Zap, value: selectedWbId ? '✓' : '-', label: '词库状态' },
          ].map((s) => (
            <Card key={s.label} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-4 md:pt-6 text-center">
                <s.icon className="w-5 h-5 md:w-8 md:h-8 mx-auto text-primary mb-1 md:mb-2" />
                <div className="text-lg md:text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-[10px] md:text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {games.map((game, i) => (
            <Card
              key={game.id}
              className="group cursor-pointer hover:shadow-card-hover transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02] overflow-hidden"
              onClick={() => handleStartGame(game.id)}
            >
              <div className={`h-1.5 md:h-2 bg-gradient-to-r ${game.color}`} />
              <CardHeader className="pb-2 md:pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${game.color} text-white`}>
                    <game.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-secondary">{game.difficulty}</span>
                </div>
                <CardTitle className="mt-2 md:mt-4 text-sm md:text-base">{game.name}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    最高分：<span className="font-semibold text-foreground">{highScores[game.id as keyof typeof highScores]}</span>
                  </span>
                  <Button size="sm" className={`bg-gradient-to-r ${game.color} border-0 text-white text-xs md:text-sm h-7 md:h-9`}>
                    开始
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Games;
