import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface WordRecord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  mastery: number;
  last_reviewed: string | null;
  wordbook_name: string;
  wordbook_icon: string | null;
}

const WordHistory = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const type = searchParams.get('type') || 'all'; // 'all' | 'mastered'

  const { data, isLoading } = useQuery({
    queryKey: ['wordHistory', type, user?.id],
    queryFn: async () => {
      if (!user) return { words: [] as WordRecord[], grouped: {} as Record<string, WordRecord[]> };

      const query = supabase
        .from('user_word_progress')
        .select(`
          id, mastery, last_reviewed, correct_count, review_count,
          word_id,
          words!inner(id, word, phonetic, meaning, wordbook_id,
            wordbooks!inner(name, icon)
          )
        `)
        .eq('user_id', user.id)
        .order('last_reviewed', { ascending: false });

      if (type === 'mastered') {
        query.gte('mastery', 80);
      }

      const { data: records, error } = await query;
      if (error) throw error;

      const words: WordRecord[] = (records || []).map((r: any) => ({
        id: r.word_id,
        word: r.words.word,
        phonetic: r.words.phonetic,
        meaning: r.words.meaning,
        mastery: r.mastery,
        last_reviewed: r.last_reviewed,
        wordbook_name: r.words.wordbooks.name,
        wordbook_icon: r.words.wordbooks.icon,
      }));

      // Group by date
      const grouped: Record<string, WordRecord[]> = {};
      words.forEach((w) => {
        const dateKey = w.last_reviewed
          ? format(new Date(w.last_reviewed), 'yyyy-MM-dd')
          : '未复习';
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(w);
      });

      return { words, grouped };
    },
    enabled: !!user,
  });

  const title = type === 'mastered' ? '已掌握单词' : '累计学习单词';
  const totalCount = data?.words.length || 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm">共 {totalCount} 个单词</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无学习记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(data!.grouped)
              .sort(([a], [b]) => (a === '未复习' ? 1 : b === '未复习' ? -1 : b.localeCompare(a)))
              .map(([dateKey, words]) => (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      {dateKey === '未复习'
                        ? '未复习'
                        : format(new Date(dateKey), 'yyyy年M月d日 EEEE', { locale: zhCN })}
                    </h2>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {words.length} 词
                    </span>
                  </div>

                  {/* Word list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {words.map((w) => (
                      <div
                        key={w.id}
                        className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center gap-3"
                        onClick={() => navigate(`/wordbooks`)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{w.word}</span>
                            {w.phonetic && (
                              <span className="text-xs text-muted-foreground">{w.phonetic}</span>
                            )}
                            {w.mastery >= 80 && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">{w.meaning}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-lg">{w.wordbook_icon || '📚'}</span>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground truncate max-w-[80px]">{w.wordbook_name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${w.mastery}%`,
                                    backgroundColor: w.mastery >= 80 ? 'hsl(150, 60%, 45%)' : 'hsl(200, 80%, 50%)',
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{w.mastery}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WordHistory;
