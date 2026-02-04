-- 创建角色类型枚举
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 创建用户角色表
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 创建用户资料表
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建菜单配置表
CREATE TABLE public.menu_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_key TEXT UNIQUE NOT NULL,
    menu_name TEXT NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建词库表
CREATE TABLE public.wordbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚',
    category TEXT NOT NULL DEFAULT 'exam',
    level TEXT DEFAULT '中级',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建单词表
CREATE TABLE public.words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wordbook_id UUID REFERENCES public.wordbooks(id) ON DELETE CASCADE NOT NULL,
    word TEXT NOT NULL,
    phonetic TEXT,
    meaning TEXT NOT NULL,
    example TEXT,
    example_translation TEXT,
    audio_url TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建用户学习进度表
CREATE TABLE public.user_word_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    mastery INTEGER NOT NULL DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 100),
    review_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, word_id)
);

-- 创建用户收藏单词表
CREATE TABLE public.user_starred_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, word_id)
);

-- 创建学习会话记录表
CREATE TABLE public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    wordbook_id UUID REFERENCES public.wordbooks(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    words_studied INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建用户每日统计表
CREATE TABLE public.user_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    new_words INTEGER NOT NULL DEFAULT 0,
    review_words INTEGER NOT NULL DEFAULT 0,
    study_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, date)
);

-- 创建管理员检查函数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- 创建角色检查函数
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 启用RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wordbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_starred_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- user_roles 策略
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin());

-- profiles 策略
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- menu_settings 策略
CREATE POLICY "Everyone can view visible menus" ON public.menu_settings
    FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admins can manage menus" ON public.menu_settings
    FOR ALL USING (public.is_admin());

-- wordbooks 策略 (所有人可读活跃的词库，管理员可管理)
CREATE POLICY "Everyone can view active wordbooks" ON public.wordbooks
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage wordbooks" ON public.wordbooks
    FOR ALL USING (public.is_admin());

-- words 策略 (所有人可读)
CREATE POLICY "Everyone can view words" ON public.words
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage words" ON public.words
    FOR ALL USING (public.is_admin());

-- user_word_progress 策略
CREATE POLICY "Users can manage own progress" ON public.user_word_progress
    FOR ALL USING (user_id = auth.uid());

-- user_starred_words 策略
CREATE POLICY "Users can manage own starred words" ON public.user_starred_words
    FOR ALL USING (user_id = auth.uid());

-- study_sessions 策略
CREATE POLICY "Users can manage own sessions" ON public.study_sessions
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all sessions" ON public.study_sessions
    FOR SELECT USING (public.is_admin());

-- user_daily_stats 策略
CREATE POLICY "Users can manage own stats" ON public.user_daily_stats
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all stats" ON public.user_daily_stats
    FOR SELECT USING (public.is_admin());

-- 创建自动创建用户资料的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 添加更新时间戳触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_settings_updated_at BEFORE UPDATE ON public.menu_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wordbooks_updated_at BEFORE UPDATE ON public.wordbooks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON public.words
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_word_progress_updated_at BEFORE UPDATE ON public.user_word_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_daily_stats_updated_at BEFORE UPDATE ON public.user_daily_stats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 插入默认菜单配置
INSERT INTO public.menu_settings (menu_key, menu_name, is_visible, sort_order) VALUES
    ('home', '首页', true, 1),
    ('wordbooks', '词库', true, 2),
    ('study', '学习', true, 3),
    ('review', '复习', true, 4),
    ('games', '小游戏', true, 5),
    ('plan', '计划', true, 6),
    ('stats', '统计', true, 7),
    ('ai', 'AI助手', true, 8);

-- 插入示例词库
INSERT INTO public.wordbooks (id, name, description, icon, category, level) VALUES
    ('11111111-1111-1111-1111-111111111111', 'CET-4 核心词汇', '大学英语四级考试必备词汇，精选2000+高频词', '📚', 'exam', '中级'),
    ('22222222-2222-2222-2222-222222222222', 'CET-6 进阶词汇', '大学英语六级考试核心词汇', '🎓', 'exam', '高级'),
    ('33333333-3333-3333-3333-333333333333', '雅思高频词汇', 'IELTS考试必备词汇，涵盖听说读写', '✈️', 'exam', '高级'),
    ('44444444-4444-4444-4444-444444444444', '日常口语800句', '生活场景常用表达，提升口语能力', '💬', 'daily', '初级'),
    ('55555555-5555-5555-5555-555555555555', '商务英语精选', '职场必备词汇，涵盖会议、邮件、谈判', '💼', 'business', '中级');

-- 插入示例单词
INSERT INTO public.words (wordbook_id, word, phonetic, meaning, example, example_translation, difficulty, sort_order) VALUES
    ('11111111-1111-1111-1111-111111111111', 'accomplish', '/əˈkɑːmplɪʃ/', 'v. 完成，实现；达到（目的）', 'She accomplished her goal of running a marathon.', '她实现了跑马拉松的目标。', 'medium', 1),
    ('11111111-1111-1111-1111-111111111111', 'abundant', '/əˈbʌndənt/', 'adj. 丰富的，充裕的', 'The region has abundant natural resources.', '这个地区自然资源丰富。', 'medium', 2),
    ('11111111-1111-1111-1111-111111111111', 'acknowledge', '/əkˈnɑːlɪdʒ/', 'v. 承认；致谢；告知收到', 'He refused to acknowledge his mistake.', '他拒绝承认自己的错误。', 'hard', 3),
    ('11111111-1111-1111-1111-111111111111', 'adequate', '/ˈædɪkwət/', 'adj. 足够的，充分的；适当的', 'Make sure you have adequate time to prepare.', '确保你有足够的时间准备。', 'medium', 4),
    ('11111111-1111-1111-1111-111111111111', 'anticipate', '/ænˈtɪsɪpeɪt/', 'v. 预期，预料；期望', 'We anticipate that sales will rise next year.', '我们预计明年销售额会上升。', 'medium', 5),
    ('11111111-1111-1111-1111-111111111111', 'appropriate', '/əˈproʊpriət/', 'adj. 适当的，恰当的', 'Wear appropriate clothing for the occasion.', '穿适合场合的衣服。', 'easy', 6),
    ('11111111-1111-1111-1111-111111111111', 'available', '/əˈveɪləbl/', 'adj. 可用的，可获得的', 'The book is available in all bookstores.', '这本书在所有书店都有售。', 'easy', 7),
    ('11111111-1111-1111-1111-111111111111', 'benefit', '/ˈbenɪfɪt/', 'n. 利益，好处；v. 使受益', 'Exercise has many health benefits.', '锻炼对健康有很多好处。', 'easy', 8),
    ('11111111-1111-1111-1111-111111111111', 'capable', '/ˈkeɪpəbl/', 'adj. 有能力的，能干的', 'She is capable of handling difficult situations.', '她能够处理困难的情况。', 'medium', 9),
    ('11111111-1111-1111-1111-111111111111', 'challenge', '/ˈtʃælɪndʒ/', 'n. 挑战；v. 向...挑战', 'Learning a new language is a challenge.', '学习一门新语言是一个挑战。', 'easy', 10),
    ('22222222-2222-2222-2222-222222222222', 'ambiguous', '/æmˈbɪɡjuəs/', 'adj. 模糊的，含糊不清的', 'The contract contains some ambiguous clauses.', '合同中有一些含糊不清的条款。', 'hard', 1),
    ('22222222-2222-2222-2222-222222222222', 'comprehensive', '/ˌkɑːmprɪˈhensɪv/', 'adj. 全面的，综合的', 'We need a comprehensive review of the policy.', '我们需要对政策进行全面审查。', 'hard', 2),
    ('22222222-2222-2222-2222-222222222222', 'controversy', '/ˈkɑːntrəvɜːrsi/', 'n. 争论，争议', 'The decision sparked considerable controversy.', '这个决定引发了相当大的争议。', 'hard', 3),
    ('22222222-2222-2222-2222-222222222222', 'deteriorate', '/dɪˈtɪriəreɪt/', 'v. 恶化，变坏', 'His health began to deteriorate rapidly.', '他的健康状况开始迅速恶化。', 'hard', 4),
    ('22222222-2222-2222-2222-222222222222', 'elaborate', '/ɪˈlæbərət/', 'adj. 精心制作的；v. 详细阐述', 'Could you elaborate on your proposal?', '你能详细阐述一下你的提案吗？', 'hard', 5),
    ('33333333-3333-3333-3333-333333333333', 'analyze', '/ˈænəlaɪz/', 'v. 分析，解析', 'We need to analyze the data carefully.', '我们需要仔细分析数据。', 'medium', 1),
    ('33333333-3333-3333-3333-333333333333', 'perspective', '/pərˈspektɪv/', 'n. 观点，看法；透视', 'Try to see things from a different perspective.', '试着从不同的角度看问题。', 'hard', 2),
    ('33333333-3333-3333-3333-333333333333', 'phenomenon', '/fəˈnɑːmɪnən/', 'n. 现象', 'This is a common phenomenon in nature.', '这是自然界中常见的现象。', 'hard', 3),
    ('44444444-4444-4444-4444-444444444444', 'appreciate', '/əˈpriːʃieɪt/', 'v. 感激，欣赏', 'I really appreciate your help.', '我真的很感激你的帮助。', 'easy', 1),
    ('44444444-4444-4444-4444-444444444444', 'definitely', '/ˈdefɪnətli/', 'adv. 肯定地，确定地', 'I will definitely be there on time.', '我一定会准时到那儿。', 'easy', 2),
    ('55555555-5555-5555-5555-555555555555', 'negotiate', '/nɪˈɡoʊʃieɪt/', 'v. 谈判，协商', 'We need to negotiate a better deal.', '我们需要协商一个更好的交易。', 'medium', 1),
    ('55555555-5555-5555-5555-555555555555', 'collaborate', '/kəˈlæbəreɪt/', 'v. 合作，协作', 'The two companies will collaborate on this project.', '两家公司将在这个项目上合作。', 'medium', 2);