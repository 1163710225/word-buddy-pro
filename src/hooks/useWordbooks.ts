import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Wordbook {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  level: string;
  is_active: boolean;
  created_at: string;
  word_count?: number;
  progress?: number;
}

export interface Word {
  id: string;
  wordbook_id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  example_translation: string | null;
  audio_url: string | null;
  difficulty: string;
  sort_order: number;
}

export function useWordbooks() {
  return useQuery({
    queryKey: ['wordbooks'],
    queryFn: async () => {
      const { data: wordbooks, error } = await supabase
        .from('wordbooks')
        .select('*')
        .order('created_at');
      
      if (error) throw error;

      // Get word counts for each wordbook
      const wordbooksWithCounts = await Promise.all(
        wordbooks.map(async (wb) => {
          const { count } = await supabase
            .from('words')
            .select('*', { count: 'exact', head: true })
            .eq('wordbook_id', wb.id);
          
          return {
            ...wb,
            word_count: count || 0,
            progress: 0, // Will be calculated with user progress
          };
        })
      );

      return wordbooksWithCounts as Wordbook[];
    },
  });
}

interface WordWithProgress extends Word {
  mastery?: number;
  review_count?: number;
  correct_count?: number;
  is_starred?: boolean;
}

export function useWordbookWithProgress(wordbookId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wordbook', wordbookId, user?.id],
    enabled: !!wordbookId,
    queryFn: async () => {
      if (!wordbookId) return null;

      // Get wordbook
      const { data: wordbook, error: wbError } = await supabase
        .from('wordbooks')
        .select('*')
        .eq('id', wordbookId)
        .single();
      
      if (wbError) throw wbError;

      // Get all words in this wordbook
      const { data: words, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('wordbook_id', wordbookId)
        .order('sort_order');
      
      if (wordsError) throw wordsError;

      let progress = 0;
      let masteredCount = 0;
      let learningCount = 0;
      let newCount = 0;
      let wordsWithProgress: WordWithProgress[] = words.map(w => ({ ...w }));

      if (user) {
        // Get user progress for these words
        const { data: progressData } = await supabase
          .from('user_word_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('word_id', words.map(w => w.id));
        
        const progressMap = new Map(progressData?.map(p => [p.word_id, p]) || []);
        
        wordsWithProgress = words.map(word => ({
          ...word,
          mastery: progressMap.get(word.id)?.mastery || 0,
          review_count: progressMap.get(word.id)?.review_count || 0,
          correct_count: progressMap.get(word.id)?.correct_count || 0,
        }));

        // Calculate stats
        wordsWithProgress.forEach(w => {
          const mastery = w.mastery || 0;
          if (mastery >= 80) masteredCount++;
          else if (mastery > 0) learningCount++;
          else newCount++;
        });

        if (words.length > 0) {
          progress = Math.round((masteredCount / words.length) * 100);
        }

        // Get starred words
        const { data: starredData } = await supabase
          .from('user_starred_words')
          .select('word_id')
          .eq('user_id', user.id)
          .in('word_id', words.map(w => w.id));
        
        const starredSet = new Set(starredData?.map(s => s.word_id) || []);
        
        wordsWithProgress = wordsWithProgress.map(word => ({
          ...word,
          is_starred: starredSet.has(word.id),
        }));
      }

      return {
        ...wordbook,
        words: wordsWithProgress,
        word_count: words.length,
        progress,
        masteredCount,
        learningCount,
        newCount,
      };
    },
  });
}

export function useWords(wordbookId: string | undefined) {
  return useQuery({
    queryKey: ['words', wordbookId],
    enabled: !!wordbookId,
    queryFn: async () => {
      if (!wordbookId) return [];
      
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('wordbook_id', wordbookId)
        .order('sort_order');
      
      if (error) throw error;
      return data as Word[];
    },
  });
}

export function useToggleStarWord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ wordId, isStarred }: { wordId: string; isStarred: boolean }) => {
      if (!user) throw new Error('User not logged in');
      
      if (isStarred) {
        // Remove star
        const { error } = await supabase
          .from('user_starred_words')
          .delete()
          .eq('user_id', user.id)
          .eq('word_id', wordId);
        
        if (error) throw error;
      } else {
        // Add star
        const { error } = await supabase
          .from('user_starred_words')
          .insert({ user_id: user.id, word_id: wordId });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordbook'] });
    },
  });
}

export function useCreateWordbook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wordbook: { name: string; description?: string; icon?: string; category?: string; level?: string }) => {
      const { data, error } = await supabase
        .from('wordbooks')
        .insert({
          name: wordbook.name,
          description: wordbook.description || null,
          icon: wordbook.icon || '📚',
          category: wordbook.category || 'exam',
          level: wordbook.level || '中级',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordbooks'] });
      toast.success('词库创建成功');
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message });
    },
  });
}

export function useImportWords() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ wordbookId, words }: { wordbookId: string; words: { word: string; meaning: string; phonetic?: string; example?: string; example_translation?: string; difficulty?: string }[] }) => {
      const wordsWithBookId = words.map((word, index) => ({
        word: word.word,
        meaning: word.meaning,
        phonetic: word.phonetic || null,
        example: word.example || null,
        example_translation: word.example_translation || null,
        difficulty: word.difficulty || 'medium',
        wordbook_id: wordbookId,
        sort_order: index + 1,
      }));
      
      const { error } = await supabase
        .from('words')
        .insert(wordsWithBookId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordbooks'] });
      queryClient.invalidateQueries({ queryKey: ['words'] });
      toast.success('单词导入成功');
    },
    onError: (error) => {
      toast.error('导入失败', { description: error.message });
    },
  });
}
