 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 
 interface StudyWord {
   id: string;
   word: string;
   phonetic: string | null;
   meaning: string;
   example: string | null;
   example_translation: string | null;
   frequency_rank: number;
   is_high_frequency: boolean;
   exam_priority: number;
   wordbook_id: string;
   meanings?: WordMeaning[];
   videos?: WordVideo[];
   mastery?: number;
   review_count?: number;
 }
 
 interface WordMeaning {
   id: string;
   meaning: string;
   meaning_order: number;
   frequency_score: number;
   is_primary: boolean;
   is_exam_focus: boolean;
   part_of_speech: string | null;
   example: string | null;
   example_translation: string | null;
   usage_note: string | null;
 }
 
 interface WordVideo {
   id: string;
   video_url: string;
   video_source: string;
   video_title: string | null;
   start_time: number | null;
   end_time: number | null;
   transcript: string | null;
   transcript_translation: string | null;
   thumbnail_url: string | null;
   difficulty: string | null;
 }
 
 interface StudyQueueOptions {
   wordbookId?: string;
   limit?: number;
   prioritizeHighFrequency?: boolean;
   prioritizeExamFocus?: boolean;
   includeReview?: boolean;
 }
 
 // 智能学习队列：按词频和考试优先级排序
 export function useSmartStudyQueue(options: StudyQueueOptions = {}) {
   const { user } = useAuth();
   const {
     wordbookId,
     limit = 20,
     prioritizeHighFrequency = true,
     prioritizeExamFocus = true,
     includeReview = true,
   } = options;
 
   return useQuery({
     queryKey: ['smart-study-queue', wordbookId, limit, prioritizeHighFrequency, prioritizeExamFocus],
     queryFn: async () => {
       // 获取单词，按优先级排序
       let query = supabase
         .from('words')
         .select(`
           *,
           word_meanings (*),
           word_videos (*)
         `)
         .order('exam_priority', { ascending: false })
         .order('frequency_rank', { ascending: true })
         .limit(limit * 2); // 获取更多以便筛选
 
       if (wordbookId) {
         query = query.eq('wordbook_id', wordbookId);
       }
 
       const { data: words, error: wordsError } = await query;
       if (wordsError) throw wordsError;
 
       // 获取用户进度
       let progressData: any[] = [];
       if (user) {
         const wordIds = words?.map(w => w.id) || [];
         const { data: progress } = await supabase
           .from('user_word_progress')
           .select('*')
           .eq('user_id', user.id)
           .in('word_id', wordIds);
         progressData = progress || [];
       }
 
       // 合并进度数据
       const wordsWithProgress = words?.map(word => {
         const progress = progressData.find(p => p.word_id === word.id);
         return {
           ...word,
           meanings: word.word_meanings?.sort((a: WordMeaning, b: WordMeaning) => 
             b.frequency_score - a.frequency_score
           ),
           videos: word.word_videos,
           mastery: progress?.mastery || 0,
           review_count: progress?.review_count || 0,
           next_review: progress?.next_review,
         };
       }) || [];
 
       // 智能排序算法
       const sortedWords = wordsWithProgress.sort((a, b) => {
         // 1. 需要复习的词优先（如果启用）
         if (includeReview) {
           const aNeedsReview = a.next_review && new Date(a.next_review) <= new Date();
           const bNeedsReview = b.next_review && new Date(b.next_review) <= new Date();
           if (aNeedsReview && !bNeedsReview) return -1;
           if (!aNeedsReview && bNeedsReview) return 1;
         }
 
         // 2. 未学习的词优先
         if (a.mastery === 0 && b.mastery > 0) return -1;
         if (a.mastery > 0 && b.mastery === 0) return 1;
 
         // 3. 考试优先级
         if (prioritizeExamFocus) {
           if (b.exam_priority !== a.exam_priority) {
             return b.exam_priority - a.exam_priority;
           }
         }
 
         // 4. 高频词优先
         if (prioritizeHighFrequency) {
           if (a.is_high_frequency && !b.is_high_frequency) return -1;
           if (!a.is_high_frequency && b.is_high_frequency) return 1;
           return a.frequency_rank - b.frequency_rank;
         }
 
         return 0;
       });
 
       return sortedWords.slice(0, limit) as StudyWord[];
     },
     enabled: true,
   });
 }
 
 // 获取单词的所有词义
 export function useWordMeanings(wordId: string | undefined) {
   return useQuery({
     queryKey: ['word-meanings', wordId],
     queryFn: async () => {
       if (!wordId) return [];
       
       const { data, error } = await supabase
         .from('word_meanings')
         .select('*')
         .eq('word_id', wordId)
         .order('frequency_score', { ascending: false });
 
       if (error) throw error;
       return data as WordMeaning[];
     },
     enabled: !!wordId,
   });
 }
 
 // 获取单词的视频例句
 export function useWordVideos(wordId: string | undefined, meaningId?: string) {
   return useQuery({
     queryKey: ['word-videos', wordId, meaningId],
     queryFn: async () => {
       if (!wordId && !meaningId) return [];
       
       let query = supabase.from('word_videos').select('*');
       
       if (meaningId) {
         query = query.eq('meaning_id', meaningId);
       } else if (wordId) {
         query = query.eq('word_id', wordId);
       }
 
       const { data, error } = await query;
       if (error) throw error;
       return data as WordVideo[];
     },
     enabled: !!wordId || !!meaningId,
   });
 }
 
 // 更新词义掌握进度
 export function useUpdateMeaningProgress() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({ 
       meaningId, 
       isCorrect 
     }: { 
       meaningId: string; 
       isCorrect: boolean;
     }) => {
       if (!user) throw new Error('User not authenticated');
 
       // 获取现有进度
       const { data: existing } = await supabase
         .from('user_meaning_progress')
         .select('*')
         .eq('user_id', user.id)
         .eq('meaning_id', meaningId)
         .maybeSingle();
 
       const currentMastery = existing?.mastery || 0;
       const currentReviewCount = existing?.review_count || 0;
       const currentCorrectCount = existing?.correct_count || 0;
 
       // 计算新的掌握度
       const masteryChange = isCorrect ? 15 : -10;
       const newMastery = Math.max(0, Math.min(100, currentMastery + masteryChange));
 
       // 计算下次复习时间（艾宾浩斯曲线）
       const reviewIntervals = [1, 2, 4, 7, 15, 30]; // 天数
       const intervalIndex = Math.min(Math.floor(newMastery / 20), reviewIntervals.length - 1);
       const nextReviewDate = new Date();
       nextReviewDate.setDate(nextReviewDate.getDate() + reviewIntervals[intervalIndex]);
 
       const progressData = {
         user_id: user.id,
         meaning_id: meaningId,
         mastery: newMastery,
         review_count: currentReviewCount + 1,
         correct_count: isCorrect ? currentCorrectCount + 1 : currentCorrectCount,
         last_reviewed: new Date().toISOString(),
         next_review: nextReviewDate.toISOString(),
       };
 
       if (existing) {
         const { error } = await supabase
           .from('user_meaning_progress')
           .update(progressData)
           .eq('id', existing.id);
         if (error) throw error;
       } else {
         const { error } = await supabase
           .from('user_meaning_progress')
           .insert(progressData);
         if (error) throw error;
       }
 
       return { newMastery };
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['word-meanings'] });
       queryClient.invalidateQueries({ queryKey: ['smart-study-queue'] });
     },
   });
 }
 
 // 获取熟词生义列表（考试重点词义）
 export function useExamFocusMeanings(wordbookId?: string) {
   return useQuery({
     queryKey: ['exam-focus-meanings', wordbookId],
     queryFn: async () => {
       let query = supabase
         .from('word_meanings')
         .select(`
           *,
           words!inner (
             id,
             word,
             phonetic,
             wordbook_id
           )
         `)
         .eq('is_exam_focus', true)
         .order('frequency_score', { ascending: false });
 
       if (wordbookId) {
         query = query.eq('words.wordbook_id', wordbookId);
       }
 
       const { data, error } = await query;
       if (error) throw error;
       return data;
     },
   });
 }