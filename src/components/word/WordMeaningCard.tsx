 import { cn } from '@/lib/utils';
 import { Volume2, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 
 interface WordMeaning {
   id: string;
   meaning: string;
   meaning_order: number;
   frequency_score: number;
   is_primary: boolean;
   is_exam_focus: boolean;
   part_of_speech?: string;
   example?: string;
   example_translation?: string;
   usage_note?: string;
 }
 
 interface WordMeaningCardProps {
   meaning: WordMeaning;
   onPlayExample?: (text: string) => void;
 }
 
 export function WordMeaningCard({ meaning, onPlayExample }: WordMeaningCardProps) {
   const getFrequencyLabel = (score: number) => {
     if (score >= 80) return { label: '极高频', color: 'bg-red-500' };
     if (score >= 60) return { label: '高频', color: 'bg-orange-500' };
     if (score >= 40) return { label: '中频', color: 'bg-yellow-500' };
     return { label: '低频', color: 'bg-slate-400' };
   };
 
   const frequencyInfo = getFrequencyLabel(meaning.frequency_score);
 
   const speakExample = () => {
     if (meaning.example && onPlayExample) {
       onPlayExample(meaning.example);
     }
   };
 
   return (
     <div className={cn(
       'rounded-xl p-4 transition-all duration-300',
       meaning.is_primary 
         ? 'bg-primary/10 border-2 border-primary/30' 
         : 'bg-card border border-border',
       meaning.is_exam_focus && 'ring-2 ring-amber-400/50'
     )}>
       {/* Header with badges */}
       <div className="flex items-center gap-2 mb-3 flex-wrap">
         <span className="text-lg font-bold text-foreground">
           {meaning.meaning_order}.
         </span>
         
         {meaning.part_of_speech && (
           <Badge variant="outline" className="text-xs">
             {meaning.part_of_speech}
           </Badge>
         )}
         
         {meaning.is_primary && (
           <Badge className="bg-primary text-primary-foreground text-xs">
             <Flame className="w-3 h-3 mr-1" />
             主要含义
           </Badge>
         )}
         
         {meaning.is_exam_focus && (
           <Badge className="bg-amber-500 text-white text-xs">
             <AlertTriangle className="w-3 h-3 mr-1" />
             考试重点
           </Badge>
         )}
         
         <Badge className={cn('text-white text-xs', frequencyInfo.color)}>
           <TrendingUp className="w-3 h-3 mr-1" />
           {frequencyInfo.label}
         </Badge>
       </div>
 
       {/* Meaning */}
       <p className="text-foreground font-medium text-lg mb-2">
         {meaning.meaning}
       </p>
 
       {/* Frequency bar */}
       <div className="flex items-center gap-2 mb-3">
         <span className="text-xs text-muted-foreground">词义频率</span>
         <Progress value={meaning.frequency_score} className="h-1.5 flex-1" />
         <span className="text-xs font-medium text-muted-foreground">
           {meaning.frequency_score}%
         </span>
       </div>
 
       {/* Usage note */}
       {meaning.usage_note && (
         <div className="bg-secondary/50 rounded-lg px-3 py-2 mb-3">
           <p className="text-sm text-muted-foreground">
             💡 {meaning.usage_note}
           </p>
         </div>
       )}
 
       {/* Example */}
       {meaning.example && (
         <div className="border-t border-border pt-3">
           <div className="flex items-start gap-2">
             <button
               onClick={speakExample}
               className="p-1.5 rounded-full hover:bg-secondary transition-colors shrink-0 mt-0.5"
             >
               <Volume2 className="w-4 h-4 text-primary" />
             </button>
             <div>
               <p className="text-sm text-foreground italic">
                 "{meaning.example}"
               </p>
               {meaning.example_translation && (
                 <p className="text-xs text-muted-foreground mt-1">
                   {meaning.example_translation}
                 </p>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }