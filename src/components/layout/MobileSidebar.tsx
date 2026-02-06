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

interface MobileSidebarProps {
  onClose: () => void;
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const location = useLocation();
  const { isAdmin, signOut, user } = useAuth();
  const { data: menuSettings } = useMenuSettings();

  const visibleMenus = menuSettings?.filter(m => m.is_visible) || [];

  const handleNavClick = () => {
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
          <span className="text-xl">📖</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-sidebar-primary-foreground">词忆</h1>
          <p className="text-xs text-sidebar-foreground/60">智能背单词</p>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 py-3 text-sm text-sidebar-foreground/60 truncate border-b border-sidebar-border">
          {user.email}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleMenus.map((menu) => {
          const Icon = iconMap[menu.menu_key] || Home;
          const path = pathMap[menu.menu_key] || '/';
          const isActive = location.pathname === path || 
            (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={menu.id}
              to={path}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{menu.menu_name}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            to="/admin"
            onClick={handleNavClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              location.pathname === '/admin'
                ? 'bg-amber-500/20 text-amber-400'
                : 'hover:bg-sidebar-accent text-amber-400/80 hover:text-amber-400'
            )}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">管理后台</span>
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          to="/settings"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">设置</span>
        </Link>

        <Button
          variant="ghost"
          onClick={() => {
            signOut();
            handleNavClick();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </Button>
      </div>
    </div>
  );
}
