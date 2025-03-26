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
  const [showLoginForm, setShowLoginForm] = useState(false); // 新增狀態控制是否顯示登入表單
  const navigate = useNavigate();
  const { user, setUser, status } = useAuthStore();

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
      console.log('Auth status changed to authenticated, no longer directly redirecting');
      // 移除主動導向，讓 AuthRequired 元件處理所有的導向邏輯
      // navigate('/journal', { replace: true });
    }
  }, [status, user, navigate]);

  // Listen for custom auth events
  useEffect(() => {
    const handleSignIn = () => {
      console.log('Sign in event received...');
      // 不直接導向到 journal 頁面，而是讓 AuthRequired 組件處理導向邏輯
      // 這樣可以確保目標檢查在登入後執行
      // navigate('/journal', { replace: true });
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

  // 說明頁元件
  const IntroductionPage = () => (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-20 px-10 sm:px-12 lg:px-16">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-left text-3xl font-extrabold text-gray-900">
            Goal Journal
          </h2>
          <p className="mt-2 text-left text-lg text-gray-600">
            專屬於你的目標的秘密基地
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div>
            <p className="text-gray-800">
              為了顧及你的使用體驗，請你先按照以下步驟做（iPhone 使用者）：
            </p>
            <ol className="mt-4 space-y-2 text-gray-700 list-decimal pl-5">
              <li>點擊 <span className="font-medium inline-flex items-center">
                <img src="/square-and-arrow-up.svg" className="w-5 h-5 mr-1" alt="分享圖標" /> 
              </span> 按鈕</li>
              <li>往下滑動點擊「新增至主畫面」</li>
              <li>從主畫面中點擊 Goal Journal</li>
            </ol>
            <p className="mt-4 text-gray-800">
              這樣就不會使用瀏覽器打開啦！
            </p>
          </div>
          
          <button
            onClick={() => setShowLoginForm(true)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );

  // 主要登入表單元件
  const LoginFormContent = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Goal Journal
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600 mb-6">
            專屬於你的目標的秘密基地
          </p>
          <h3 className="text-center text-xl font-bold text-gray-900">
            {isSignUp ? '建立帳號' : '登入帳號'}
          </h3>
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
          
          {!isSignUp && (
            <div className="mt-2">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                忘記密碼？
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 根據狀態顯示說明頁或登入表單
  return showLoginForm ? <LoginFormContent /> : <IntroductionPage />;
}