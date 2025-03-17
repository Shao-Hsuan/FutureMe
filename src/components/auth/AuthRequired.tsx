import { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useGoalStore } from '../../store/goalStore';
import { AuthStatus } from '../../services/auth';

// 定義公開路由
const PUBLIC_ROUTES = ['/auth'];

interface AuthRequiredProps {
  onFirstLogin: () => void;
}

export default function AuthRequired({ onFirstLogin }: AuthRequiredProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, user, setUser, setStatus, setError } = useAuthStore();
  const { loadGoals, reset: resetGoals, goals } = useGoalStore();

  // 檢查目標並導向適當頁面
  const checkGoalsAndRedirect = () => {
    // 如果在目標相關頁面，不需要重定向
    const isGoalRelatedPath = ['/goal-setup', '/welcome'].some(path => 
      location.pathname.startsWith(path)
    );

    // 如果沒有目標且不在目標相關頁面，導向到目標設置頁面
    if (goals.length === 0 && !isGoalRelatedPath) {
      console.log('🎯 No goals found, redirecting to goal setup');
      navigate('/goal-setup', { replace: true });
      return true;
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (status === AuthStatus.INITIALIZING) {
        console.log('🔄 Initializing auth...', {
          pathname: location.pathname,
          status,
          hasUser: !!user
        });

        try {
          // Check current auth status
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (mounted) {
            console.log('📡 Auth session:', {
              hasSession: !!session,
              userId: session?.user?.id
            });

            if (session?.user) {
              console.log('👤 User authenticated, checking settings...');
              setUser(session.user);

              try {
                // 載入目標
                await loadGoals();

                // 檢查使用者設定
                const { data: settings, error: settingsError } = await supabase
                  .from('user_settings')
                  .select('last_login, has_seen_guide')
                  .eq('user_id', session.user.id)
                  .maybeSingle();

                if (settingsError) throw settingsError;

                // 如果沒有設定記錄，建立新記錄
                if (!settings) {
                  console.log('🆕 Creating new user settings');
                  const { error: insertError } = await supabase
                    .from('user_settings')
                    .insert({ 
                      user_id: session.user.id,
                      last_login: new Date().toISOString(),
                      has_seen_guide: false
                    });
                  
                  if (insertError) throw insertError;
                  
                  // 顯示使用說明
                  onFirstLogin();
                } else if (!settings.has_seen_guide) {
                  // 有設定記錄但未看過指南
                  console.log('📖 User has not seen guide');
                  onFirstLogin();
                }

                // 檢查目標狀態並導向
                checkGoalsAndRedirect();
                setStatus(AuthStatus.AUTHENTICATED);
              } catch (error) {
                console.error('Failed to initialize user:', error);
                throw error;
              }
            } else {
              setUser(null);
              resetGoals();
              setStatus(AuthStatus.UNAUTHENTICATED);
            }
          }

          // Set up auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('🔄 Auth state changed:', { event, userId: session?.user?.id });

            try {
              switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                case 'USER_UPDATED':
                case 'INITIAL_SESSION':
                  if (session?.user) {
                    setUser(session.user);
                    try {
                      await loadGoals();
                      checkGoalsAndRedirect();
                    } catch (error) {
                      console.error('Failed to load goals after auth change:', error);
                    }
                    setStatus(AuthStatus.AUTHENTICATED);
                  }
                  break;
                case 'SIGNED_OUT':
                case 'USER_DELETED':
                  console.log('User signed out, clearing state...');
                  setUser(null);
                  resetGoals();
                  setStatus(AuthStatus.UNAUTHENTICATED);
                  break;
              }
            } catch (err) {
              console.error('Auth state change error:', err);
              setError(err instanceof Error ? err : new Error('認證狀態更新失敗'));
              setStatus(AuthStatus.ERROR);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('❌ Auth initialization error:', err);
          if (mounted) {
            setError(err instanceof Error ? err : new Error('認證初始化失敗'));
            setStatus(AuthStatus.ERROR);
          }
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [status === AuthStatus.INITIALIZING]);

  // 如果是登出事件，直接導向到登入頁面
  if (status === AuthStatus.UNAUTHENTICATED && !PUBLIC_ROUTES.includes(location.pathname)) {
    console.log('🚫 User not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // 處理已登入狀態訪問登入頁面
  if (status === AuthStatus.AUTHENTICATED && PUBLIC_ROUTES.includes(location.pathname)) {
    console.log('👤 User authenticated, redirecting to journal');
    return <Navigate to="/journal" replace />;
  }

  // 處理初始化狀態
  if (status === AuthStatus.INITIALIZING && !PUBLIC_ROUTES.includes(location.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 處理錯誤狀態
  if (status === AuthStatus.ERROR) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-500 p-4">
          <p>系統發生錯誤</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            重新整理
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}