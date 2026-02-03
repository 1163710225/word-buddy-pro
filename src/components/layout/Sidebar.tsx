import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页', description: '学习概览' },
  { path: '/wordbooks', icon: BookOpen, label: '词库', description: '单词本管理' },
  { path: '/study', icon: GraduationCap, label: '学习', description: '开始背单词' },
  { path: '/review', icon: Brain, label: '复习', description: '巩固记忆' },
  { path: '/plan', icon: Calendar, label: '计划', description: '学习规划' },
  { path: '/stats', icon: BarChart3, label: '统计', description: '数据分析' },
  { path: '/ai', icon: Sparkles, label: 'AI助手', description: '智能辅导' },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-primary'
                  : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'animate-bounce-soft')} />
              {!collapsed && (
                <div className="animate-fade-in">
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <p className="text-xs opacity-80">{item.description}</p>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium">设置</span>}
        </Link>

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
