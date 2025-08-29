import { Button } from '@/components/ui/button';
import { Home, BookOpen, Search, Settings, BarChart3, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/browse', icon: Search, label: 'Browse' },
    { path: '/insights', icon: BarChart3, label: 'Insights' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={isActive(item.path) ? 'default' : 'ghost'}
          size="sm"
          asChild
          className="hidden md:flex"
        >
          <Link to={item.path} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
      
      <Button
        variant="journal"
        size="sm"
        asChild
        className="ml-2"
      >
        <Link to="/new-entry" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Entry</span>
        </Link>
      </Button>
    </nav>
  );
}