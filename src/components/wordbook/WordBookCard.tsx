import { WordBook } from '@/types/vocabulary';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface WordBookCardProps {
  book: WordBook;
  onClick?: () => void;
}

export function WordBookCard({ book, onClick }: WordBookCardProps) {
  const categoryColors = {
    exam: 'from-blue-500/10 to-cyan-500/10 border-blue-200',
    daily: 'from-green-500/10 to-emerald-500/10 border-green-200',
    business: 'from-purple-500/10 to-pink-500/10 border-purple-200',
    academic: 'from-orange-500/10 to-amber-500/10 border-orange-200',
    custom: 'from-rose-500/10 to-red-500/10 border-rose-200',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-gradient-to-br rounded-2xl p-6 border cursor-pointer',
        'hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300',
        'animate-fade-in group',
        categoryColors[book.category]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-card shadow-sm flex items-center justify-center text-2xl">
            {book.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{book.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{book.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-card">
                {book.wordCount} 词
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-card">
                {book.level}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">学习进度</span>
          <span className="font-medium">{book.progress}%</span>
        </div>
        <div className="h-2 bg-card rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${book.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
