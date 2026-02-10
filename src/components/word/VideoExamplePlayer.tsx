import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, ExternalLink, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { speakText } from '@/lib/speech';
 
 interface WordVideo {
   id: string;
   video_url: string;
   video_source: string;
   video_title?: string;
   start_time?: number;
   end_time?: number;
   transcript?: string;
   transcript_translation?: string;
   thumbnail_url?: string;
   difficulty?: string;
 }
 
 interface VideoExamplePlayerProps {
   video: WordVideo;
   className?: string;
 }
 
 // 从YouTube URL提取视频ID
 function extractYouTubeId(url: string): string | null {
   const patterns = [
     /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
     /youtube\.com\/shorts\/([^&\n?#]+)/,
   ];
   
   for (const pattern of patterns) {
     const match = url.match(pattern);
     if (match) return match[1];
   }
   return null;
 }
 
 export function VideoExamplePlayer({ video, className }: VideoExamplePlayerProps) {
   const [isPlaying, setIsPlaying] = useState(false);
   const [showTranscript, setShowTranscript] = useState(false);
 
   const youtubeId = extractYouTubeId(video.video_url);
   const startParam = video.start_time ? `&start=${video.start_time}` : '';
   const endParam = video.end_time ? `&end=${video.end_time}` : '';
   
   const embedUrl = youtubeId 
     ? `https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}${startParam}${endParam}&enablejsapi=1`
     : null;
 
   const thumbnailUrl = video.thumbnail_url || 
     (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);
 
   const getDifficultyColor = (difficulty?: string) => {
     switch (difficulty) {
       case 'easy': return 'bg-green-500';
       case 'medium': return 'bg-amber-500';
       case 'hard': return 'bg-red-500';
       default: return 'bg-slate-400';
     }
   };
 
   const getDifficultyLabel = (difficulty?: string) => {
     switch (difficulty) {
       case 'easy': return '简单';
       case 'medium': return '中等';
       case 'hard': return '困难';
       default: return '未知';
     }
   };
 
    const speakTranscript = () => {
      if (video.transcript) speakText(video.transcript);
    };
 
   return (
     <div className={cn('rounded-xl overflow-hidden bg-card border border-border', className)}>
       {/* Video Player / Thumbnail */}
       <div className="relative aspect-video bg-black">
         {isPlaying && embedUrl ? (
           <iframe
             src={embedUrl}
             className="absolute inset-0 w-full h-full"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           />
         ) : (
           <div className="absolute inset-0 flex items-center justify-center">
             {thumbnailUrl ? (
               <img 
                 src={thumbnailUrl} 
                 alt={video.video_title || 'Video thumbnail'}
                 className="absolute inset-0 w-full h-full object-cover"
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                 <Film className="w-16 h-16 text-slate-500" />
               </div>
             )}
             
             {/* Play overlay */}
             <button
               onClick={() => setIsPlaying(true)}
               className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
             >
               <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Play className="w-8 h-8 text-primary-foreground ml-1" />
               </div>
             </button>
 
             {/* Time badge */}
             {video.start_time !== undefined && (
               <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
                 {formatTime(video.start_time)} - {formatTime(video.end_time || video.start_time + 30)}
               </Badge>
             )}
           </div>
         )}
       </div>
 
       {/* Video Info */}
       <div className="p-4">
         <div className="flex items-start justify-between gap-3 mb-3">
           <div className="flex-1">
             <h4 className="font-medium text-foreground line-clamp-2">
               {video.video_title || '视频例句'}
             </h4>
             <div className="flex items-center gap-2 mt-1">
               <Badge variant="outline" className="text-xs capitalize">
                 {video.video_source}
               </Badge>
               <Badge className={cn('text-white text-xs', getDifficultyColor(video.difficulty))}>
                 {getDifficultyLabel(video.difficulty)}
               </Badge>
             </div>
           </div>
           
           {isPlaying && (
             <Button
               variant="outline"
               size="sm"
               onClick={() => setIsPlaying(false)}
             >
               <Pause className="w-4 h-4" />
             </Button>
           )}
         </div>
 
         {/* Transcript */}
         {video.transcript && (
           <div className="border-t border-border pt-3">
             <button
               onClick={() => setShowTranscript(!showTranscript)}
               className="text-sm text-primary hover:underline mb-2"
             >
               {showTranscript ? '隐藏字幕' : '显示字幕'}
             </button>
             
             {showTranscript && (
               <div className="bg-secondary/50 rounded-lg p-3">
                 <div className="flex items-start gap-2">
                   <button
                     onClick={speakTranscript}
                     className="p-1.5 rounded-full hover:bg-secondary transition-colors shrink-0"
                   >
                     <Volume2 className="w-4 h-4 text-primary" />
                   </button>
                   <div>
                     <p className="text-sm text-foreground italic">
                       "{video.transcript}"
                     </p>
                     {video.transcript_translation && (
                       <p className="text-xs text-muted-foreground mt-1">
                         {video.transcript_translation}
                       </p>
                     )}
                   </div>
                 </div>
               </div>
             )}
           </div>
         )}
 
         {/* External link */}
         <a
           href={video.video_url}
           target="_blank"
           rel="noopener noreferrer"
           className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-3"
         >
           <ExternalLink className="w-3 h-3" />
           在新窗口打开
         </a>
       </div>
     </div>
   );
 }
 
 function formatTime(seconds: number): string {
   const mins = Math.floor(seconds / 60);
   const secs = seconds % 60;
   return `${mins}:${secs.toString().padStart(2, '0')}`;
 }