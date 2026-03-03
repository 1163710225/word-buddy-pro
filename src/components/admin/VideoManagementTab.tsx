import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWordbooks, useWords } from '@/hooks/useWordbooks';
import { supabase } from '@/integrations/supabase/client';
import { Video, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const VideoManagementTab = () => {
  const { data: wordbooks } = useWordbooks();
  const queryClient = useQueryClient();

  const [selectedWordbookId, setSelectedWordbookId] = useState('');
  const [selectedWordId, setSelectedWordId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: words } = useWords(selectedWordbookId || undefined);

  const [form, setForm] = useState({
    video_url: '',
    video_title: '',
    video_source: 'youtube',
    start_time: '',
    end_time: '',
    transcript: '',
    transcript_translation: '',
    difficulty: 'medium',
  });

  // Fetch existing videos for selected word
  const { data: existingVideos, isLoading: videosLoading } = useQuery({
    queryKey: ['admin-word-videos', selectedWordId],
    queryFn: async () => {
      if (!selectedWordId) return [];
      const { data, error } = await supabase
        .from('word_videos')
        .select('*')
        .eq('word_id', selectedWordId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedWordId,
  });

  const handleSubmit = async () => {
    if (!selectedWordId) {
      toast.error('请先选择单词');
      return;
    }
    if (!form.video_url) {
      toast.error('请输入视频链接');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('word_videos').insert({
        word_id: selectedWordId,
        video_url: form.video_url,
        video_title: form.video_title || null,
        video_source: form.video_source || 'youtube',
        start_time: form.start_time ? parseInt(form.start_time) : 0,
        end_time: form.end_time ? parseInt(form.end_time) : null,
        transcript: form.transcript || null,
        transcript_translation: form.transcript_translation || null,
        difficulty: form.difficulty,
      });

      if (error) throw error;

      toast.success('视频添加成功');
      setForm({
        video_url: '',
        video_title: '',
        video_source: 'youtube',
        start_time: '',
        end_time: '',
        transcript: '',
        transcript_translation: '',
        difficulty: 'medium',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-word-videos', selectedWordId] });
      queryClient.invalidateQueries({ queryKey: ['word-videos'] });
    } catch (error) {
      console.error(error);
      toast.error('添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    const { error } = await supabase.from('word_videos').delete().eq('id', videoId);
    if (error) {
      toast.error('删除失败');
      return;
    }
    toast.success('已删除');
    queryClient.invalidateQueries({ queryKey: ['admin-word-videos', selectedWordId] });
    queryClient.invalidateQueries({ queryKey: ['word-videos'] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            上传单词视频
          </CardTitle>
          <CardDescription>为单词添加视频例句，帮助用户在真实语境中学习</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select wordbook & word */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>选择词库</Label>
              <select
                className="w-full p-2 border rounded-md bg-background text-foreground"
                value={selectedWordbookId}
                onChange={(e) => {
                  setSelectedWordbookId(e.target.value);
                  setSelectedWordId('');
                }}
              >
                <option value="">-- 请选择词库 --</option>
                {wordbooks?.map((wb) => (
                  <option key={wb.id} value={wb.id}>
                    {wb.icon} {wb.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>选择单词</Label>
              <select
                className="w-full p-2 border rounded-md bg-background text-foreground"
                value={selectedWordId}
                onChange={(e) => setSelectedWordId(e.target.value)}
                disabled={!selectedWordbookId}
              >
                <option value="">-- 请选择单词 --</option>
                {words?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.word} - {w.meaning}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Video form */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>视频链接 *</Label>
                <Input
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label>视频标题</Label>
                <Input
                  value={form.video_title}
                  onChange={(e) => setForm({ ...form, video_title: e.target.value })}
                  placeholder="视频标题"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>来源</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                  value={form.video_source}
                  onChange={(e) => setForm({ ...form, video_source: e.target.value })}
                >
                  <option value="youtube">YouTube</option>
                  <option value="bilibili">Bilibili</option>
                  <option value="movie">电影</option>
                  <option value="tv">电视剧</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>开始时间(秒)</Label>
                <Input
                  type="number"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>结束时间(秒)</Label>
                <Input
                  type="number"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  placeholder=""
                />
              </div>
              <div className="space-y-2">
                <Label>难度</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>字幕原文</Label>
              <Textarea
                value={form.transcript}
                onChange={(e) => setForm({ ...form, transcript: e.target.value })}
                placeholder="The sentence from the video..."
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label>字幕翻译</Label>
              <Textarea
                value={form.transcript_translation}
                onChange={(e) => setForm({ ...form, transcript_translation: e.target.value })}
                placeholder="字幕的中文翻译..."
                className="min-h-[60px]"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedWordId}
              className="gradient-primary"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              添加视频
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing videos */}
      {selectedWordId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">已关联视频</CardTitle>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : existingVideos && existingVideos.length > 0 ? (
              <div className="space-y-3">
                {existingVideos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{v.video_title || v.video_url}</p>
                      <p className="text-xs text-muted-foreground">{v.video_source} · {v.difficulty}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(v.id)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">暂无关联视频</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoManagementTab;
