import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  streak: number;
  totalStudyDays: number;
  todayNewWords: number;
  todayReviewWords: number;
  todayStudyMinutes: number;
  weeklyProgress: number[];
}

export function useUserStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userStats', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<UserStats> => {
      if (!user) {
        return {
          totalWords: 0,
          masteredWords: 0,
          learningWords: 0,
          streak: 0,
          totalStudyDays: 0,
          todayNewWords: 0,
          todayReviewWords: 0,
          todayStudyMinutes: 0,
          weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
        };
      }

      // Get user progress data
      const { data: progressData } = await supabase
        .from('user_word_progress')
        .select('mastery, review_count')
        .eq('user_id', user.id);

      const totalWords = progressData?.length || 0;
      const masteredWords = progressData?.filter(p => p.mastery >= 80).length || 0;
      const learningWords = progressData?.filter(p => p.mastery > 0 && p.mastery < 80).length || 0;

      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayStats } = await supabase
        .from('user_daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Get weekly progress (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data: weeklyData } = await supabase
        .from('user_daily_stats')
        .select('date, new_words, review_words')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .order('date');

      // Create weekly progress array
      const weeklyProgress = Array(7).fill(0);
      const todayDate = new Date();
      
      weeklyData?.forEach(day => {
        const dayDate = new Date(day.date);
        const diffDays = Math.floor((todayDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
        const index = 6 - diffDays;
        if (index >= 0 && index < 7) {
          weeklyProgress[index] = (day.new_words || 0) + (day.review_words || 0);
        }
      });

      // Calculate streak
      const { data: allDailyStats } = await supabase
        .from('user_daily_stats')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      let streak = 0;
      if (allDailyStats && allDailyStats.length > 0) {
        const todayOrYesterday = new Date();
        todayOrYesterday.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < allDailyStats.length; i++) {
          const statDate = new Date(allDailyStats[i].date);
          statDate.setHours(0, 0, 0, 0);
          
          const expectedDate = new Date(todayOrYesterday);
          expectedDate.setDate(expectedDate.getDate() - i);
          
          if (statDate.getTime() === expectedDate.getTime()) {
            streak++;
          } else if (i === 0 && statDate.getTime() === expectedDate.getTime() - 86400000) {
            // Allow for yesterday as the last study day
            streak++;
          } else {
            break;
          }
        }
      }

      const totalStudyDays = allDailyStats?.length || 0;

      return {
        totalWords,
        masteredWords,
        learningWords,
        streak,
        totalStudyDays,
        todayNewWords: todayStats?.new_words || 0,
        todayReviewWords: todayStats?.review_words || 0,
        todayStudyMinutes: todayStats?.study_minutes || 0,
        weeklyProgress,
      };
    },
  });
}

export function useUpdateDailyStats() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: { newWords?: number; reviewWords?: number; studyMinutes?: number }) => {
      if (!user) throw new Error('User not logged in');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get existing stats for today
      const { data: existing } = await supabase
        .from('user_daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_daily_stats')
          .update({
            new_words: (existing.new_words || 0) + (updates.newWords || 0),
            review_words: (existing.review_words || 0) + (updates.reviewWords || 0),
            study_minutes: (existing.study_minutes || 0) + (updates.studyMinutes || 0),
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_daily_stats')
          .insert({
            user_id: user.id,
            date: today,
            new_words: updates.newWords || 0,
            review_words: updates.reviewWords || 0,
            study_minutes: updates.studyMinutes || 0,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
}

export function useUpdateWordProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ wordId, correct }: { wordId: string; correct: boolean }) => {
      if (!user) throw new Error('User not logged in');
      
      // Get existing progress
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('word_id', wordId)
        .maybeSingle();

      const now = new Date().toISOString();
      const masteryChange = correct ? 20 : -10;

      if (existing) {
        const newMastery = Math.max(0, Math.min(100, (existing.mastery || 0) + masteryChange));
        const { error } = await supabase
          .from('user_word_progress')
          .update({
            mastery: newMastery,
            review_count: (existing.review_count || 0) + 1,
            correct_count: (existing.correct_count || 0) + (correct ? 1 : 0),
            last_reviewed: now,
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_word_progress')
          .insert({
            user_id: user.id,
            word_id: wordId,
            mastery: correct ? 20 : 0,
            review_count: 1,
            correct_count: correct ? 1 : 0,
            last_reviewed: now,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['wordbook'] });
    },
  });
}
