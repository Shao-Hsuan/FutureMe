import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useAuthStore } from '../../store/authStore';
import { getCurrentSession } from '../../services/auth';
import { AlertCircle } from 'lucide-react';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const { user, setUser, status, setStatus } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setError(undefined);
        const session = await getCurrentSession();
        
        if (session?.user) {
          console.log('User already authenticated, redirecting...');
          setUser(session.user);
          navigate('/journal', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setError(error instanceof Error ? error.message : '認證檢查失敗');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Watch for auth status changes
  useEffect(() => {
    if (status === 'AUTHENTICATED' && user) {
      console.log('Auth status changed to authenticated, redirecting...', { userId: user.id });
      navigate('/journal', { replace: true });
    }
  }, [status, user, navigate]);

  // Listen for custom auth events
  useEffect(() => {
    const handleSignIn = () => {
      console.log('Sign in event received, redirecting...');
      navigate('/journal', { replace: true });
    };

    window.addEventListener('supabase.auth.signin', handleSignIn);
    return () => window.removeEventListener('supabase.auth.signin', handleSignIn);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? '建立帳號' : '登入帳號'}
          </h2>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        {isSignUp ? (
          <SignUpForm setError={setError} />
        ) : (
          <SignInForm setError={setError} />
        )}
        
        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(undefined);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isSignUp ? '已有帳號？登入' : '還沒有帳號？註冊'}
          </button>
        </div>
      </div>
    </div>
  );
}