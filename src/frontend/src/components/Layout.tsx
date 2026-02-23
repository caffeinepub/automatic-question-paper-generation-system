import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  FileText, 
  Files, 
  LogOut 
} from 'lucide-react';

export default function Layout() {
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/add-question', label: 'Add Questions', icon: PlusCircle },
    { path: '/question-bank', label: 'Question Bank', icon: BookOpen },
    { path: '/generate-paper', label: 'Generate Paper', icon: FileText },
    { path: '/generated-papers', label: 'Generated Papers', icon: Files },
  ];

  const handleLogout = () => {
    clear();
    navigate({ to: '/login' });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white fixed h-full shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">AQPGS</h1>
          <p className="text-xs text-white/70 mt-1">Question Paper System</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-light-blue text-white' 
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
