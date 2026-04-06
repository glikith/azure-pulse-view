import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Server, Activity, FileText, Bell, Settings
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/resources', label: 'Resources', icon: Server },
  { path: '/metrics', label: 'Metrics', icon: Activity },
  { path: '/logs', label: 'Logs', icon: FileText },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const activeAlerts = useAppSelector((s) => s.azureAlerts.active.length);
  const degradedResources = useAppSelector((s) =>
    s.azureResources.resources.filter((r) => r.healthState !== 'Healthy').length
  );

  const getBadge = (path: string): number | null => {
    if (path === '/alerts') return activeAlerts || null;
    if (path === '/resources') return degradedResources || null;
    return null;
  };

  return (
    <aside className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 ${sidebarOpen ? 'w-56' : 'w-14'}`}>

      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const badge = getBadge(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && badge !== null && badge > 0 && (
                <span className="ml-auto text-xs bg-destructive/20 text-destructive rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};

export default AppSidebar;
