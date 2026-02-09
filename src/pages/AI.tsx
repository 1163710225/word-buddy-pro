import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是你的 AI 学习助手 ✨ 我可以帮你解释单词、造句、讲解语法，还能根据你的学习情况给出建议。有什么想问的吗？',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { icon: '📝', text: '帮我用 accomplish 造个句子' },
    { icon: '🔍', text: '解释一下 abundant 的用法' },
    { icon: '📊', text: '对比 affect 和 effect 的区别' },
    { icon: '💡', text: '给我一些记忆技巧' },
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: newMessages.map(m => ({ role: m.role, content: m.content })) },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络异常，请稍后重试 😅' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="mb-3 md:mb-6 flex items-center gap-3">
          <div className="p-2 md:p-3 rounded-xl gradient-primary shadow-primary">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-foreground">AI 学习助手</h1>
            <p className="text-muted-foreground text-xs md:text-sm">智能辅导，个性化学习建议</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card rounded-2xl shadow-card p-3 md:p-6 flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base ${
                  msg.role === 'user'
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && !loading && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">试试问我：</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-left text-xs md:text-sm"
                  >
                    <span>{s.icon}</span>
                    <span className="line-clamp-1">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 md:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的问题..."
              className="flex-1 text-sm md:text-base"
              disabled={loading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="gradient-primary shadow-primary"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AI;
