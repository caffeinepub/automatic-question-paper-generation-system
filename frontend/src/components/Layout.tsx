import React from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  PlusCircle,
  Wand2,
  LogOut,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/question-bank', label: 'Question Bank', icon: BookOpen },
  { path: '/add-question', label: 'Add Question', icon: PlusCircle },
  { path: '/generate-paper', label: 'Generate Paper', icon: Wand2 },
  { path: '/generated-papers', label: 'Generated Papers', icon: FileText },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const principalStr = identity?.getPrincipal().toString() ?? '';
  const shortPrincipal = principalStr.length > 12
    ? `${principalStr.slice(0, 6)}...${principalStr.slice(-4)}`
    : principalStr;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full w-64 flex flex-col shadow-sidebar z-30"
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-3 px-6 py-5 border-b"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--sidebar-active)' }}
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm font-poppins leading-tight">
              ExamCraft
            </p>
            <p className="text-xs" style={{ color: 'var(--sidebar-text)', opacity: 0.7 }}>
              Paper Generator
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          {shortPrincipal && (
            <div className="mb-3 px-2">
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--sidebar-text)', opacity: 0.6 }}>
                Logged in as
              </p>
              <p className="text-xs font-mono truncate" style={{ color: 'var(--sidebar-text)' }}>
                {shortPrincipal}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-nav-item w-full text-left hover:bg-red-900/30"
            style={{ color: 'oklch(0.75 0.12 25)' }}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="flex-1 p-8">
          {children}
        </div>
        <footer className="px-8 py-4 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ExamCraft &mdash; Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </main>
    </div>
  );
}
