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
  const { loadGoals, reset: resetGoals, goals, goalsLoaded } = useGoalStore();

  // 導向流程的函數
  const checkGoalsAndRedirect = () => {
    console.log('檢查目標並重定向，當前目標數量:', goals.length, '當前路徑:', location.pathname, '目標載入狀態:', goalsLoaded);
    
    // 檢查目標是否已加載完成
    if (!goalsLoaded) {
      console.log('目標尚未載入完成，暫不執行重定向');
      return false;
    }
    
    const isGoalRelatedPath = location.pathname.includes('goal');
    if (goals.length === 0 && !isGoalRelatedPath) {
      console.log('沒有目標且不在目標相關頁面，導向到目標設置頁面');
      navigate('/goal-setup', { replace: true });
      return true;
    }
    return false;
  };

  const checkAuthStatus = () => {
    if (status === AuthStatus.AUTHENTICATED && user) {
      console.log('認證狀態變為已認證，檢查目標狀態');
      checkGoalsAndRedirect();
    } else {
      console.log('等待認證完成...', { status, hasUser: !!user });
      // 如果認證尚未完成，稍後再試
      setTimeout(checkAuthStatus, 500);
    }
  };

  useEffect(() => {
    if (status === AuthStatus.INITIALIZING) {
      let mounted = true;
      let cleanupFn: (() => void) | undefined;

      const initializeAuth = async () => {
        try {
          console.log('🔐 Initializing auth...');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (!session) {
            console.log('🔓 No session found, setting status to unauthenticated');
            if (mounted) {
              setStatus(AuthStatus.UNAUTHENTICATED);
            }
            return;
          }
          
          console.log('🔒 Session found, setting user and loading goals...');
          if (mounted) {
            setUser(session.user);
                      
            // 載入用戶的目標
            try {
              await loadGoals();
              console.log('✅ Goals loaded successfully');
              
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
              
              // 檢查是否需要根據目標狀態進行導向
              const redirected = checkGoalsAndRedirect();
              
              // 只有在沒有重定向時才設置狀態為已認證
              if (!redirected && mounted) {
                console.log('👤 Authentication complete, setting status to authenticated');
                setStatus(AuthStatus.AUTHENTICATED);
              }
            } catch (error) {
              console.error('Failed to initialize user:', error);
              throw error;
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
                      const redirected = checkGoalsAndRedirect();
                      if (!redirected) {
                        setStatus(AuthStatus.AUTHENTICATED);
                      }
                    } catch (error) {
                      console.error('Failed to load goals after auth change:', error);
                      setStatus(AuthStatus.AUTHENTICATED);
                    }
                  }
                  break;
                case 'SIGNED_OUT':
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
      };

      // 啟動認證流程
      initializeAuth().then(cleanup => {
        if (mounted && cleanup) {
          cleanupFn = cleanup;
        }
      });

      return () => {
        mounted = false;
        if (cleanupFn) {
          cleanupFn();
        }
      };
    }
  }, [status === AuthStatus.INITIALIZING]);

  // 監聽認證狀態變化，在認證成功後檢查目標
  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED && user) {
      console.log('認證狀態變為已認證，檢查目標狀態');
      checkGoalsAndRedirect();
    }
  }, [status, user, goalsLoaded]);

  // 監聽認證成功事件，觸發導向邏輯
  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('🔔 Auth success event received, checking goals and redirecting...');
      checkAuthStatus();
    };
    
    window.addEventListener('auth.success', handleAuthSuccess);
    
    return () => {
      window.removeEventListener('auth.success', handleAuthSuccess);
    };
  }, []);

  // 如果是登出事件，直接導向到登入頁面
  if (status === AuthStatus.UNAUTHENTICATED && !PUBLIC_ROUTES.includes(location.pathname)) {
    console.log('🚫 User not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // 處理已登入狀態訪問登入頁面
  if (status === AuthStatus.AUTHENTICATED && PUBLIC_ROUTES.includes(location.pathname)) {
    console.log('👤 User authenticated, checking for goals before redirecting');
    
    // 優先檢查目標狀態，如果沒有目標且目標載入完成，導向到目標設置頁面
    if (goals.length === 0 && goalsLoaded) {
      console.log('🎯 No goals found, redirecting to goal setup');
      return <Navigate to="/goal-setup" replace />;
    }
    
    // 有目標時才導向到日誌頁面
    console.log('👤 User has goals, redirecting to journal');
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