import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function Login() {
  const { login, isLoggingIn, isLoginSuccess, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoginSuccess && identity && !identity.getPrincipal().isAnonymous()) {
      navigate({ to: '/' });
    }
  }, [isLoginSuccess, identity, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/college-logo.dim_200x200.png" 
              alt="College Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            Automatic Question Paper Generation System
          </CardTitle>
          <CardDescription className="text-base">
            Secure teacher login portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={login} 
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-medium bg-navy hover:bg-navy/90"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>
          
          <div className="text-center">
            <a 
              href="https://identity.ic0.app/faq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-light-blue hover:underline"
            >
              Forgot your Internet Identity?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
