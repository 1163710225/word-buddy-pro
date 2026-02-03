import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Lightbulb, BookOpen, MessageCircle } from 'lucide-react';

const AI = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    {
      role: 'ai',
      content: '你好！我是你的 AI 学习助手 ✨ 我可以帮你解释单词、造句、讲解语法，还能根据你的学习情况给出建议。有什么想问的吗？',
    },
  ]);

  const suggestions = [
    { icon: '📝', text: '帮我用 accomplish 造个句子' },
    { icon: '🔍', text: '解释一下 abundant 的用法' },
    { icon: '📊', text: '分析一下我的学习弱点' },
    { icon: '💡', text: '给我一些记忆技巧' },
  ];

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '这是一个很好的问题！让我来帮你解答...\n\n（这里是 AI 助手的回复演示，实际使用需要接入 AI API）',
        },
      ]);
    }, 1000);

    setMessage('');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl gradient-primary shadow-primary">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI 学习助手</h1>
              <p className="text-muted-foreground text-sm">智能辅导，个性化学习建议</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card rounded-2xl shadow-card p-6 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">试试问我：</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion.text)}
                    className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-left text-sm"
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的问题..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="gradient-primary shadow-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-accent" />
            <span className="text-sm">记忆技巧</span>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm">语法讲解</span>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-success" />
            <span className="text-sm">场景对话</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AI;
