import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMenuSettings } from '@/hooks/useMenuSettings';
import {
  Home,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Calendar,
  Brain,
  Sparkles,
  Gamepad2,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  wordbooks: BookOpen,
  study: GraduationCap,
  review: Brain,
  games: Gamepad2,
  plan: Calendar,
  stats: BarChart3,
  ai: Sparkles,
};

const pathMap: Record<string, string> = {
  home: '/',
  wordbooks: '/wordbooks',
  study: '/study',
  review: '/review',
  games: '/games',
  plan: '/plan',
  stats: '/stats',
  ai: '/ai',
};

export function MobileNav() {
  const location = useLocation();
  const { data: menuSettings, isLoading } = useMenuSettings();

  // Default fallback menus to prevent flash while loading
  const defaultMenus = [
    { id: 'home', menu_key: 'home', menu_name: '首页', is_visible: true },
    { id: 'wordbooks', menu_key: 'wordbooks', menu_name: '词库', is_visible: true },
    { id: 'study', menu_key: 'study', menu_name: '学习', is_visible: true },
    { id: 'review', menu_key: 'review', menu_name: '复习', is_visible: true },
    { id: 'games', menu_key: 'games', menu_name: '小游戏', is_visible: true },
  ];
  const visibleMenus = (menuSettings?.filter(m => m.is_visible).slice(0, 5) || (isLoading ? defaultMenus : []));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleMenus.map((menu) => {
          const Icon = iconMap[menu.menu_key] || Home;
          const path = pathMap[menu.menu_key] || '/';
          const isActive = location.pathname === path || 
            (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={menu.id}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className="text-xs font-medium truncate">{menu.menu_name}</span>
            </Link>
          );
        })}
        <Link
          to="/settings"
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
            location.pathname === '/settings'
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs font-medium">设置</span>
        </Link>
      </div>
    </nav>
  );
}
