import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Users, FileText, Shield } from 'lucide-react';

export default function Login() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Question Bank',
      description: 'Manage thousands of questions organized by subject and category',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Auto Paper Generation',
      description: 'Generate multiple exam variants automatically with one click',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Multi-Teacher Support',
      description: 'Each teacher manages their own question bank and papers',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure & Decentralized',
      description: 'Built on Internet Computer for maximum security and reliability',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Panel - Branding */}
        <div className="text-white space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <img
                src="/assets/generated/college-logo.dim_200x200.png"
                alt="College Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-poppins">ExamCraft</h1>
              <p className="text-navy-200 text-sm">Intelligent Exam Paper Generator</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold font-poppins leading-tight mb-3">
              Create Perfect Exam Papers in Minutes
            </h2>
            <p className="text-navy-200 text-lg leading-relaxed">
              A powerful platform for teachers to manage question banks and generate professional exam papers automatically.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-lightblue-500/20 border border-lightblue-400/30 flex items-center justify-center text-lightblue-300 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-navy-300 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 bg-navy-50 flex items-center justify-center">
              <img
                src="/assets/generated/college-logo.dim_200x200.png"
                alt="College Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 font-poppins">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Sign in to access your exam management dashboard</p>
          </div>

          <div className="space-y-6">
            <div className="bg-navy-50 rounded-2xl p-4 border border-navy-100">
              <h3 className="font-semibold text-navy-800 mb-2 text-sm">Secure Authentication</h3>
              <p className="text-navy-600 text-xs leading-relaxed">
                ExamCraft uses Internet Identity for secure, passwordless authentication. Your identity is cryptographically secured and never stored on any server.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Sign in with Internet Identity</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By signing in, you agree to use this platform for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
