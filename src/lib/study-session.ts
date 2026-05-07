export type SessionMode = 'learn' | 'review';

export interface SessionWord {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  example?: string | null;
  example_translation?: string | null;
  mastery?: number;
  review_count?: number;
  correct_count?: number;
  next_review?: string | null;
  sort_order?: number;
}

const nowValue = () => new Date().getTime();

export function isDueForReview(word: Pick<SessionWord, 'mastery' | 'review_count' | 'next_review'>) {
  const mastery = word.mastery || 0;
  const reviewed = (word.review_count || 0) > 0;
  const dueByTime = !word.next_review || new Date(word.next_review).getTime() <= nowValue();

  return reviewed && mastery < 80 && dueByTime;
}

export function buildSessionQueue(words: SessionWord[], mode: SessionMode) {
  const sorted = [...words];

  if (mode === 'review') {
    return sorted
      .filter((word) => {
        const mastery = word.mastery || 0;
        const reviewed = (word.review_count || 0) > 0;
        const hasStartedLearning = mastery > 0 || reviewed;

        return hasStartedLearning && (mastery < 80 || isDueForReview(word));
      })
      .sort((a, b) => {
        const aWrong = (a.mastery || 0) === 0 && (a.review_count || 0) > 0;
        const bWrong = (b.mastery || 0) === 0 && (b.review_count || 0) > 0;
        if (aWrong !== bWrong) return aWrong ? -1 : 1;

        const aDue = isDueForReview(a);
        const bDue = isDueForReview(b);
        if (aDue !== bDue) return aDue ? -1 : 1;

        if ((a.mastery || 0) !== (b.mastery || 0)) {
          return (a.mastery || 0) - (b.mastery || 0);
        }

        const aNext = a.next_review ? new Date(a.next_review).getTime() : 0;
        const bNext = b.next_review ? new Date(b.next_review).getTime() : 0;
        if (aNext !== bNext) return aNext - bNext;

        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }

  return sorted.sort((a, b) => {
    const aMastery = a.mastery || 0;
    const bMastery = b.mastery || 0;
    const aNew = aMastery === 0 && (a.review_count || 0) === 0;
    const bNew = bMastery === 0 && (b.review_count || 0) === 0;
    if (aNew !== bNew) return aNew ? -1 : 1;

    const aLearning = aMastery > 0 && aMastery < 80;
    const bLearning = bMastery > 0 && bMastery < 80;
    if (aLearning !== bLearning) return aLearning ? 1 : -1;

    if (aLearning && bLearning) {
      const aDue = isDueForReview(a);
      const bDue = isDueForReview(b);
      if (aDue !== bDue) return aDue ? -1 : 1;
      if (aMastery !== bMastery) return aMastery - bMastery;
    }

    return (a.sort_order || 0) - (b.sort_order || 0);
  });
}

export function getResumeIndex(words: SessionWord[], mode: SessionMode) {
  if (words.length === 0) return 0;

  if (mode === 'review') {
    return 0;
  }

  const firstNew = words.findIndex((word) => (word.mastery || 0) === 0 && (word.review_count || 0) === 0);
  if (firstNew >= 0) return firstNew;

  const firstLearning = words.findIndex((word) => (word.mastery || 0) < 80);
  return firstLearning >= 0 ? firstLearning : 0;
}

export function getSessionCopy(mode: SessionMode) {
  return mode === 'review'
    ? {
        title: '复习单词',
        subtitle: '只处理该复习的词，不和新词混在一起',
        primaryAction: '记住了',
        secondaryAction: '没记住',
        emptyTitle: '当前没有需要复习的单词',
        emptyDescription: '先去学习一些新词，系统会按记忆节奏安排后续复习。',
      }
    : {
        title: '学习单词',
        subtitle: '优先学习新词，学过的词留给复习流程处理',
        primaryAction: '认识',
        secondaryAction: '不认识',
        emptyTitle: '这个词库已经学完了',
        emptyDescription: '可以去复习中心巩固，或切换到别的词库继续学习。',
      };
}