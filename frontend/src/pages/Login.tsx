import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { GraduationCap, Shield, BookOpen, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--navy-900)' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--lightblue-400)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--lightblue-400)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="px-8 pt-10 pb-8 text-center"
            style={{ backgroundColor: 'var(--navy-800)' }}
          >
            {/* College Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center">
                <img
                  src="/assets/generated/college-logo.dim_200x200.png"
                  alt="College Logo"
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white font-poppins mb-1">
              ExamCraft
            </h1>
            <p className="text-sm" style={{ color: 'var(--navy-200)' }}>
              Intelligent Exam Paper Generator
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground font-poppins mb-2">
                Teacher Login
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your institutional identity to access the exam paper generation system.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                { icon: BookOpen, text: 'Manage question banks by subject' },
                { icon: GraduationCap, text: 'Generate multiple paper variants' },
                { icon: Shield, text: 'Secure blockchain-based storage' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--navy-100)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--navy-700)' }} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Login Button */}
            <button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--navy-700)' }}
              onMouseEnter={(e) => !isLoggingIn && (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Login with Internet Identity
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Secured by Internet Computer Protocol
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--navy-300)' }}>
          © {new Date().getFullYear()} ExamCraft &mdash; Built with{' '}
          <span className="text-red-400">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300 hover:text-blue-200"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
