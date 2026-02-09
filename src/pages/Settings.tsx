import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Volume2, User, Shield, Download, Trash2 } from 'lucide-react';

const Settings = () => {
  const sections = [
    {
      title: '账户设置', icon: User,
      items: [
        { label: '昵称', desc: '学习者', action: <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-9">修改</Button> },
        { label: '邮箱', desc: 'user@example.com', action: <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-9">修改</Button> },
      ],
    },
    {
      title: '通知设置', icon: Bell,
      items: [
        { label: '学习提醒', desc: '每天提醒你完成学习任务', action: <Switch defaultChecked /> },
        { label: '打卡提醒', desc: '保持连续打卡不断档', action: <Switch defaultChecked /> },
      ],
    },
    {
      title: '学习设置', icon: Volume2,
      items: [
        { label: '自动播放发音', desc: '显示单词时自动播放', action: <Switch defaultChecked /> },
        { label: '震动反馈', desc: '答题时提供震动反馈', action: <Switch /> },
        { label: '发音口音', desc: '美式英语', action: <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-9">切换</Button> },
      ],
    },
    {
      title: '数据管理', icon: Shield,
      items: [
        { label: '导出学习数据', desc: '下载你的学习记录', action: <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-9"><Download className="w-3.5 h-3.5 mr-1" />导出</Button> },
        { label: '清除学习记录', desc: '此操作不可恢复', action: <Button variant="destructive" size="sm" className="text-xs md:text-sm h-7 md:h-9"><Trash2 className="w-3.5 h-3.5 mr-1" />清除</Button>, destructive: true },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">设置</h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-base">个性化你的学习体验</p>
        </div>

        <div className="space-y-3 md:space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card">
              <h2 className="font-semibold text-sm md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                <section.icon className="w-4 h-4 md:w-5 md:h-5" />
                {section.title}
              </h2>
              <div className="space-y-0">
                {section.items.map((item, i) => (
                  <div key={item.label} className={`flex items-center justify-between py-3 ${i < section.items.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-sm md:text-base">{item.label}</p>
                      <p className={`text-xs md:text-sm ${item.destructive ? 'text-destructive' : 'text-muted-foreground'}`}>{item.desc}</p>
                    </div>
                    {item.action}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
