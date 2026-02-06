import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import { useState } from 'react';

const routeTitles: Record<string, string> = {
  '/': '首页',
  '/wordbooks': '词库',
  '/study': '学习',
  '/review': '复习',
  '/games': '游戏',
  '/plan': '计划',
  '/stats': '统计',
  '/ai': 'AI助手',
  '/settings': '设置',
  '/admin': '管理后台',
};

export function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const isDetailPage = location.pathname.includes('/wordbooks/');
  const isRootPage = ['/', '/wordbooks', '/study', '/review', '/games', '/plan', '/stats', '/ai', '/settings'].includes(location.pathname);
  
  const getTitle = () => {
    if (isDetailPage) return '词库详情';
    return routeTitles[location.pathname] || '词忆';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {!isRootPage ? (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <MobileSidebar onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
        
        <h1 className="text-lg font-semibold text-foreground">{getTitle()}</h1>
        
        <div className="w-10" /> {/* Spacer for balance */}
      </div>
    </header>
  );
}
