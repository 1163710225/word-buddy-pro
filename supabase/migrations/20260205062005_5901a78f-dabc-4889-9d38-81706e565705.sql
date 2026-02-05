
-- 扩展 words 表，添加词频和优先级字段
ALTER TABLE public.words 
ADD COLUMN frequency_rank integer DEFAULT 0,
ADD COLUMN is_high_frequency boolean DEFAULT false,
ADD COLUMN exam_priority integer DEFAULT 0;

-- 创建索引优化查询
CREATE INDEX idx_words_frequency ON public.words(frequency_rank);
CREATE INDEX idx_words_exam_priority ON public.words(exam_priority DESC);

-- 创建词义表，支持一词多义和词义频率
CREATE TABLE public.word_meanings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    word_id uuid NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
    meaning text NOT NULL,
    meaning_order integer NOT NULL DEFAULT 0,
    frequency_score integer NOT NULL DEFAULT 50,
    is_primary boolean DEFAULT false,
    is_exam_focus boolean DEFAULT false,
    part_of_speech text,
    example text,
    example_translation text,
    usage_note text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 创建词义索引
CREATE INDEX idx_word_meanings_word_id ON public.word_meanings(word_id);
CREATE INDEX idx_word_meanings_frequency ON public.word_meanings(frequency_score DESC);

-- 启用RLS
ALTER TABLE public.word_meanings ENABLE ROW LEVEL SECURITY;

-- 词义表的RLS策略
CREATE POLICY "Everyone can view word meanings"
ON public.word_meanings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage word meanings"
ON public.word_meanings FOR ALL
USING (is_admin());

-- 创建视频例句表
CREATE TABLE public.word_videos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    word_id uuid REFERENCES public.words(id) ON DELETE CASCADE,
    meaning_id uuid REFERENCES public.word_meanings(id) ON DELETE CASCADE,
    video_url text NOT NULL,
    video_source text DEFAULT 'youtube',
    video_title text,
    start_time integer DEFAULT 0,
    end_time integer,
    transcript text,
    transcript_translation text,
    thumbnail_url text,
    difficulty text DEFAULT 'medium',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT word_or_meaning_required CHECK (word_id IS NOT NULL OR meaning_id IS NOT NULL)
);

-- 创建视频索引
CREATE INDEX idx_word_videos_word_id ON public.word_videos(word_id);
CREATE INDEX idx_word_videos_meaning_id ON public.word_videos(meaning_id);

-- 启用RLS
ALTER TABLE public.word_videos ENABLE ROW LEVEL SECURITY;

-- 视频表的RLS策略
CREATE POLICY "Everyone can view word videos"
ON public.word_videos FOR SELECT
USING (true);

CREATE POLICY "Admins can manage word videos"
ON public.word_videos FOR ALL
USING (is_admin());

-- 创建用户词义进度表（跟踪每个词义的掌握情况）
CREATE TABLE public.user_meaning_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    meaning_id uuid NOT NULL REFERENCES public.word_meanings(id) ON DELETE CASCADE,
    mastery integer NOT NULL DEFAULT 0,
    review_count integer NOT NULL DEFAULT 0,
    correct_count integer NOT NULL DEFAULT 0,
    last_reviewed timestamp with time zone,
    next_review timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, meaning_id)
);

-- 创建用户词义进度索引
CREATE INDEX idx_user_meaning_progress_user_id ON public.user_meaning_progress(user_id);
CREATE INDEX idx_user_meaning_progress_meaning_id ON public.user_meaning_progress(meaning_id);

-- 启用RLS
ALTER TABLE public.user_meaning_progress ENABLE ROW LEVEL SECURITY;

-- 用户词义进度的RLS策略
CREATE POLICY "Users can manage own meaning progress"
ON public.user_meaning_progress FOR ALL
USING (user_id = auth.uid());

-- 添加触发器更新 updated_at
CREATE TRIGGER update_word_meanings_updated_at
    BEFORE UPDATE ON public.word_meanings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_word_videos_updated_at
    BEFORE UPDATE ON public.word_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_meaning_progress_updated_at
    BEFORE UPDATE ON public.user_meaning_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 插入示例数据：以 "run" 为例展示一词多义
-- 首先插入一个示例单词到现有词库
INSERT INTO public.words (word, phonetic, meaning, wordbook_id, frequency_rank, is_high_frequency, exam_priority, example, example_translation)
SELECT 
    'run',
    '/rʌn/',
    '跑；运行；经营',
    id,
    1,
    true,
    95,
    'I run every morning.',
    '我每天早上跑步。'
FROM public.wordbooks 
WHERE name = 'CET-4核心词汇'
LIMIT 1;

-- 为 run 添加多个词义
INSERT INTO public.word_meanings (word_id, meaning, meaning_order, frequency_score, is_primary, is_exam_focus, part_of_speech, example, example_translation, usage_note)
SELECT 
    w.id,
    meanings.meaning,
    meanings.meaning_order,
    meanings.frequency_score,
    meanings.is_primary,
    meanings.is_exam_focus,
    meanings.part_of_speech,
    meanings.example,
    meanings.example_translation,
    meanings.usage_note
FROM public.words w
CROSS JOIN (VALUES
    ('跑，奔跑', 1, 95, true, false, 'v.', 'She runs five miles every day.', '她每天跑五英里。', '最基本、最常用的含义'),
    ('运行，运转', 2, 85, false, false, 'v.', 'The software runs smoothly on my computer.', '这个软件在我电脑上运行流畅。', '常用于描述机器、程序的运作'),
    ('经营，管理', 3, 75, false, true, 'v.', 'He runs a successful restaurant.', '他经营着一家成功的餐厅。', '【考研熟词生义】商务场景常考'),
    ('竞选', 4, 60, false, true, 'v.', 'She decided to run for president.', '她决定竞选总统。', '【考研熟词生义】政治话题常考'),
    ('（颜色）褪色', 5, 40, false, true, 'v.', 'The red shirt ran in the wash.', '那件红衬衫洗的时候褪色了。', '【考研熟词生义】日常生活场景'),
    ('（液体）流淌', 6, 55, false, false, 'v.', 'Tears ran down her cheeks.', '眼泪顺着她的脸颊流下。', '文学作品中常见表达'),
    ('持续，延续', 7, 50, false, true, 'v.', 'The play ran for three years.', '这部剧上演了三年。', '【考研熟词生义】描述时间跨度')
) AS meanings(meaning, meaning_order, frequency_score, is_primary, is_exam_focus, part_of_speech, example, example_translation, usage_note)
WHERE w.word = 'run';

-- 再添加几个高频词示例
INSERT INTO public.words (word, phonetic, meaning, wordbook_id, frequency_rank, is_high_frequency, exam_priority, example, example_translation)
SELECT 
    words_data.word,
    words_data.phonetic,
    words_data.meaning,
    wb.id,
    words_data.frequency_rank,
    words_data.is_high_frequency,
    words_data.exam_priority,
    words_data.example,
    words_data.example_translation
FROM public.wordbooks wb
CROSS JOIN (VALUES
    ('address', '/əˈdres/', '地址；演说；处理', 2, true, 90, 'Please address this issue immediately.', '请立即处理这个问题。'),
    ('bank', '/bæŋk/', '银行；河岸；储存', 3, true, 85, 'We walked along the river bank.', '我们沿着河岸散步。'),
    ('court', '/kɔːrt/', '法庭；球场；追求', 4, true, 88, 'The company is being taken to court.', '这家公司正被告上法庭。'),
    ('drive', '/draɪv/', '驾驶；驱动；动力', 5, true, 87, 'What drives you to succeed?', '是什么驱使你成功？'),
    ('figure', '/ˈfɪɡər/', '数字；人物；弄清楚', 6, true, 92, 'I can''t figure out this problem.', '我弄不清楚这个问题。')
) AS words_data(word, phonetic, meaning, frequency_rank, is_high_frequency, exam_priority, example, example_translation)
WHERE wb.name = 'CET-4核心词汇';
