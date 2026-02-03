import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Volume2, 
  Moon, 
  Globe, 
  Download, 
  Trash2,
  User,
  Shield
} from 'lucide-react';

const Settings = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">设置</h1>
          <p className="text-muted-foreground mt-1">个性化你的学习体验</p>
        </div>

        <div className="space-y-6">
          {/* Account */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              账户设置
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">昵称</p>
                  <p className="text-sm text-muted-foreground">学习者</p>
                </div>
                <Button variant="outline" size="sm">修改</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">邮箱</p>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
                <Button variant="outline" size="sm">修改</Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知设置
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">学习提醒</p>
                  <p className="text-sm text-muted-foreground">每天提醒你完成学习任务</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">打卡提醒</p>
                  <p className="text-sm text-muted-foreground">保持连续打卡不断档</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Study Settings */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              学习设置
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">自动播放发音</p>
                  <p className="text-sm text-muted-foreground">显示单词时自动播放</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">震动反馈</p>
                  <p className="text-sm text-muted-foreground">答题时提供震动反馈</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">发音口音</p>
                  <p className="text-sm text-muted-foreground">美式英语</p>
                </div>
                <Button variant="outline" size="sm">切换</Button>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              数据管理
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">导出学习数据</p>
                  <p className="text-sm text-muted-foreground">下载你的学习记录</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">清除学习记录</p>
                  <p className="text-sm text-muted-foreground text-destructive">此操作不可恢复</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
