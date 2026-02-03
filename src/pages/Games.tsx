import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Timer, Trophy, Zap, Target, Puzzle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WordMatchGame } from '@/components/games/WordMatchGame';
import { SpeedChallengeGame } from '@/components/games/SpeedChallengeGame';
import { WordPuzzleGame } from '@/components/games/WordPuzzleGame';

type GameType = 'menu' | 'match' | 'speed' | 'puzzle';

const games = [
  {
    id: 'match',
    name: '单词配对',
    description: '找出单词与释义的正确配对，锻炼快速记忆能力',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    difficulty: '简单',
  },
  {
    id: 'speed',
    name: '极速挑战',
    description: '限时答题，看看你能在60秒内答对多少题',
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
    difficulty: '中等',
  },
  {
    id: 'puzzle',
    name: '字母拼图',
    description: '打乱的字母重新排列，拼出正确的单词',
    icon: Puzzle,
    color: 'from-purple-500 to-pink-500',
    difficulty: '困难',
  },
];

const Games = () => {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const [highScores, setHighScores] = useState({
    match: 0,
    speed: 0,
    puzzle: 0,
  });

  const handleGameComplete = (game: 'match' | 'speed' | 'puzzle', score: number) => {
    setHighScores((prev) => ({
      ...prev,
      [game]: Math.max(prev[game], score),
    }));
    setActiveGame('menu');
  };

  if (activeGame === 'match') {
    return (
      <AppLayout>
        <WordMatchGame onComplete={(score) => handleGameComplete('match', score)} onBack={() => setActiveGame('menu')} />
      </AppLayout>
    );
  }

  if (activeGame === 'speed') {
    return (
      <AppLayout>
        <SpeedChallengeGame onComplete={(score) => handleGameComplete('speed', score)} onBack={() => setActiveGame('menu')} />
      </AppLayout>
    );
  }

  if (activeGame === 'puzzle') {
    return (
      <AppLayout>
        <WordPuzzleGame onComplete={(score) => handleGameComplete('puzzle', score)} onBack={() => setActiveGame('menu')} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-primary" />
              单词小游戏
            </h1>
            <p className="text-muted-foreground mt-1">趣味学习，轻松记忆</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-primary">
                {Object.values(highScores).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-muted-foreground">总积分</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-6 text-center">
              <Timer className="w-8 h-8 mx-auto text-success mb-2" />
              <div className="text-2xl font-bold text-success">12</div>
              <div className="text-sm text-muted-foreground">今日游戏</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 mx-auto text-accent mb-2" />
              <div className="text-2xl font-bold text-accent">98%</div>
              <div className="text-sm text-muted-foreground">最高正确率</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <Card
              key={game.id}
              className="group cursor-pointer hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setActiveGame(game.id as GameType)}
            >
              <div className={`h-2 bg-gradient-to-r ${game.color}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${game.color} text-white`}>
                    <game.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {game.difficulty}
                  </span>
                </div>
                <CardTitle className="mt-4">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    最高分：<span className="font-semibold text-foreground">{highScores[game.id as keyof typeof highScores]}</span>
                  </div>
                  <Button size="sm" className={`bg-gradient-to-r ${game.color} border-0 text-white`}>
                    开始游戏
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
