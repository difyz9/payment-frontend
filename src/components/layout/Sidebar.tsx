'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  CreditCard, 
  Settings, 
  BarChart3, 
  Users, 
  FileText, 
  TestTube,
  ChevronLeft,
  ChevronRight,
  Home,
  LogIn,
  LogOut,
  User,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserDisplayName } from '@/lib/auth';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { 
    title: '首页', 
    href: '/', 
    icon: Home,
    badge: null,
    requireAuth: false
  },
  { 
    title: '个人资料', 
    href: '/profile', 
    icon: User,
    badge: null,
    requireAuth: true
  },
  { 
    title: '应用管理', 
    href: '/apps', 
    icon: CreditCard,
    badge: null,
    requireAuth: true
  },
  { 
    title: '订单管理', 
    href: '/orders', 
    icon: FileText,
    badge: null,
    requireAuth: true
  },
  { 
    title: '支付测试', 
    href: '/payment-test', 
    icon: TestTube,
    badge: 'NEW',
    requireAuth: false
  },
  { 
    title: '数据统计', 
    href: '/analytics', 
    icon: BarChart3,
    badge: null,
    requireAuth: true
  },
  { 
    title: '用户管理', 
    href: '/users', 
    icon: Users,
    badge: null,
    requireAuth: true
  },
  { 
    title: '系统设置', 
    href: '/settings', 
    icon: Settings,
    badge: null,
    requireAuth: true
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">支付服务</h1>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn("p-2", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isLoading && (
        <div className="p-4 border-b border-gray-200">
          {isAuthenticated && user ? (
            <div className={cn("flex items-center", collapsed && "justify-center")}>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              {!collapsed && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getUserDisplayName(user)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
              {collapsed ? (
                <>
                  <Link href="/auth/login" title="登录">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/register" title="注册">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <LogIn className="h-4 w-4 mr-2" />
                      登录
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button variant="default" size="sm" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      注册
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems
            .filter(item => !item.requireAuth || isAuthenticated)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-gray-100",
                      isActive 
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                        : "text-gray-700"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      collapsed ? "mx-auto" : "mr-3",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        {/* Logout Button */}
        {isAuthenticated && (
          <div className="p-4 border-t border-gray-200">
            {collapsed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full p-2"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            )}
          </div>
        )}

        {/* Stats Info */}
        {!collapsed && isAuthenticated && (
          <div className="p-4 border-t border-gray-200">
            <Card>
              <CardContent className="p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>API调用</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>今日订单</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>总收入</span>
                    <span className="font-medium text-green-600">¥1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
