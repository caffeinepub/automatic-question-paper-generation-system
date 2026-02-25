import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, BookOpen, PlusCircle, FileText, List, LogOut, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, img: '/assets/generated/icon-dashboard.dim_24x24.png' },
  { path: '/question-bank', label: 'Question Bank', icon: BookOpen, img: '/assets/generated/icon-question-bank.dim_24x24.png' },
  { path: '/add-question', label: 'Add Question', icon: PlusCircle, img: '/assets/generated/icon-add-question.dim_24x24.png' },
  { path: '/generate-paper', label: 'Generate Paper', icon: FileText, img: '/assets/generated/icon-generate.dim_24x24.png' },
  { path: '/generated-papers', label: 'Generated Papers', icon: List, img: '/assets/generated/icon-papers.dim_24x24.png' },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principalId = identity?.getPrincipal().toString() ?? '';
  const shortPrincipal = principalId ? `${principalId.slice(0, 8)}...` : '';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <img
                src="/assets/generated/college-logo.dim_200x200.png"
                alt="Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs font-poppins leading-tight">Automatic Question Paper Generation System</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lightblue-600 text-white'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-navy-700">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-lightblue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-navy-300 truncate">Teacher</p>
              <p className="text-xs text-navy-400 truncate font-mono">{shortPrincipal}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-navy-700">
          <p className="text-navy-500 text-xs text-center">
            © {new Date().getFullYear()} Automatic Question Paper Generation System.{' '}
            Built with ❤ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'unknown-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-400 hover:text-white transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
