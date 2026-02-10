 import { useState } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { WordMeaningCard } from './WordMeaningCard';
 import { VideoExamplePlayer } from './VideoExamplePlayer';
 import { useWordMeanings, useWordVideos } from '@/hooks/useSmartStudy';
 import { 
   Volume2, 
   Star, 
   Flame, 
   TrendingUp, 
   Video,
   BookOpen,
   Loader2 
 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { speakWord as speak, speakText } from '@/lib/speech';
 
 interface Word {
   id: string;
   word: string;
   phonetic: string | null;
   meaning: string;
   example: string | null;
   example_translation: string | null;
   frequency_rank: number;
   is_high_frequency: boolean;
   exam_priority: number;
   is_starred?: boolean;
 }
 
 interface WordDetailModalProps {
   word: Word | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onToggleStar?: (wordId: string, isStarred: boolean) => void;
 }
 
 export function WordDetailModal({ 
   word, 
   open, 
   onOpenChange,
   onToggleStar,
 }: WordDetailModalProps) {
   const { data: meanings, isLoading: meaningsLoading } = useWordMeanings(word?.id);
   const { data: videos, isLoading: videosLoading } = useWordVideos(word?.id);
   const [isStarred, setIsStarred] = useState(word?.is_starred || false);
 
    const handleSpeak = () => {
      if (word) speak(word.word);
    };

    const handleSpeakText = (text: string) => {
      speakText(text);
    };
 
   const handleToggleStar = () => {
     if (word && onToggleStar) {
       onToggleStar(word.id, isStarred);
       setIsStarred(!isStarred);
     }
   };
 
   if (!word) return null;
 
   const hasMultipleMeanings = meanings && meanings.length > 0;
   const hasVideos = videos && videos.length > 0;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
         <DialogHeader>
           <div className="flex items-start justify-between">
             <div className="flex items-center gap-3">
               <DialogTitle className="text-3xl font-bold">{word.word}</DialogTitle>
               <span className="text-lg text-muted-foreground">{word.phonetic}</span>
               <button
                 onClick={handleSpeak}
                 className="p-2 rounded-full hover:bg-secondary transition-colors"
               >
                 <Volume2 className="w-5 h-5 text-primary" />
               </button>
             </div>
             <button
               onClick={handleToggleStar}
               className="p-2 rounded-full hover:bg-secondary transition-colors"
             >
               <Star
                 className={cn(
                   'w-6 h-6 transition-colors',
                   isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                 )}
               />
             </button>
           </div>
 
           {/* Word badges */}
           <div className="flex flex-wrap gap-2 mt-3">
             {word.is_high_frequency && (
               <Badge className="bg-red-500 text-white">
                 <Flame className="w-3 h-3 mr-1" />
                 高频词
               </Badge>
             )}
             {word.exam_priority > 80 && (
               <Badge className="bg-amber-500 text-white">
                 <TrendingUp className="w-3 h-3 mr-1" />
                 考试重点
               </Badge>
             )}
             <Badge variant="outline">
               词频排名 #{word.frequency_rank || '-'}
             </Badge>
           </div>
         </DialogHeader>
 
         <Tabs defaultValue="meanings" className="mt-4">
           <TabsList className="grid w-full grid-cols-2">
             <TabsTrigger value="meanings" className="gap-2">
               <BookOpen className="w-4 h-4" />
               词义详解 {hasMultipleMeanings && `(${meanings.length})`}
             </TabsTrigger>
             <TabsTrigger value="videos" className="gap-2">
               <Video className="w-4 h-4" />
               视频例句 {hasVideos && `(${videos.length})`}
             </TabsTrigger>
           </TabsList>
 
           <ScrollArea className="h-[400px] mt-4 pr-4">
             <TabsContent value="meanings" className="mt-0">
               {meaningsLoading ? (
                 <div className="flex justify-center py-8">
                   <Loader2 className="w-6 h-6 animate-spin text-primary" />
                 </div>
               ) : hasMultipleMeanings ? (
                 <div className="space-y-4">
                   {meanings.map((meaning) => (
                     <WordMeaningCard
                       key={meaning.id}
                       meaning={meaning}
                       onPlayExample={handleSpeakText}
                     />
                   ))}
                 </div>
               ) : (
                 <div className="bg-card rounded-xl p-4 border border-border">
                   <p className="text-lg font-medium text-foreground mb-3">
                     {word.meaning}
                   </p>
                   {word.example && (
                     <div className="border-t border-border pt-3">
                       <div className="flex items-start gap-2">
                         <button
                           onClick={() => handleSpeakText(word.example!)}
                           className="p-1.5 rounded-full hover:bg-secondary transition-colors shrink-0"
                         >
                           <Volume2 className="w-4 h-4 text-primary" />
                         </button>
                         <div>
                           <p className="text-sm text-foreground italic">
                             "{word.example}"
                           </p>
                           {word.example_translation && (
                             <p className="text-xs text-muted-foreground mt-1">
                               {word.example_translation}
                             </p>
                           )}
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </TabsContent>
 
             <TabsContent value="videos" className="mt-0">
               {videosLoading ? (
                 <div className="flex justify-center py-8">
                   <Loader2 className="w-6 h-6 animate-spin text-primary" />
                 </div>
               ) : hasVideos ? (
                 <div className="space-y-4">
                   {videos.map((video) => (
                     <VideoExamplePlayer key={video.id} video={video} />
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <Video className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                   <p className="text-muted-foreground">暂无视频例句</p>
                   <p className="text-sm text-muted-foreground/70 mt-1">
                     管理员可在后台添加视频
                   </p>
                 </div>
               )}
             </TabsContent>
           </ScrollArea>
         </Tabs>
 
         <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             关闭
           </Button>
           <Button className="gradient-primary">
             开始学习
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }