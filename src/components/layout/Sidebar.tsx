import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
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
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Shield,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const descriptionMap: Record<string, string> = {
  home: '学习概览',
  wordbooks: '单词本管理',
  study: '开始背单词',
  review: '巩固记忆',
  games: '趣味记忆',
  plan: '学习规划',
  stats: '数据分析',
  ai: '智能辅导',
};

export function Sidebar() {
  const location = useLocation();
  const { isAdmin, signOut, user } = useAuth();
  const { data: menuSettings } = useMenuSettings();
  const [collapsed, setCollapsed] = useState(false);

  // Filter menu items based on visibility settings
  const visibleMenus = menuSettings?.filter(m => m.is_visible) || [];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
          <span className="text-xl">📖</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-lg text-sidebar-primary-foreground">词忆</h1>
            <p className="text-xs text-sidebar-foreground/60">智能背单词</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
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
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-primary'
                  : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'animate-bounce-soft')} />
              {!collapsed && (
                <div className="animate-fade-in">
                  <span className="font-medium">{menu.menu_name}</span>
                  {isActive && (
                    <p className="text-xs opacity-80">{descriptionMap[menu.menu_key]}</p>
                  )}
                </div>
              )}
            </Link>
          );
        })}

        {/* Admin link - only visible to admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              location.pathname === '/admin'
                ? 'bg-amber-500/20 text-amber-400 shadow-lg'
                : 'hover:bg-sidebar-accent text-amber-400/80 hover:text-amber-400'
            )}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <div className="animate-fade-in">
                <span className="font-medium">管理后台</span>
                {location.pathname === '/admin' && (
                  <p className="text-xs opacity-80">系统管理</p>
                )}
              </div>
            )}
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        {/* User info */}
        {user && !collapsed && (
          <div className="mb-3 px-4 py-2 text-sm text-sidebar-foreground/60 truncate">
            {user.email}
          </div>
        )}

        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium">设置</span>}
        </Link>

        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">退出登录</span>}
        </Button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
