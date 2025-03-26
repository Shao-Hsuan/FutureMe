import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserPassword, getCurrentSession } from '../services/auth';
import { Card, Button, TextField, Typography, Box, Alert, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../services/supabase';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 檢查用戶是否已經通過認證（通過重置密碼鏈接）
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session) {
          console.log('用戶已通過認證，可以重置密碼');
          setIsAuthenticated(true);
        } else {
          setError('無效的重置密碼鏈接或鏈接已過期，請重新申請密碼重置。');
        }
      } catch (err) {
        console.error('檢查會話錯誤:', err);
        setError('無法驗證您的身份，請重新申請密碼重置。');
      } finally {
        setIsCheckingSession(false);
      }
    };

    // 監聽授權狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsAuthenticated(true);
        setIsCheckingSession(false);
      }
    });

    checkSession();

    // 清理訂閱
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string): boolean => {
    // 密碼至少需要8個字符
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setError('密碼必須至少包含8個字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateUserPassword(newPassword);
      setSuccess(true);
      
      // 3秒後自動導航到登入頁面
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      console.error('更新密碼錯誤:', err);
      setError(err instanceof Error ? err.message : '更新密碼時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 載入中狀態
  if (isCheckingSession) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          正在驗證您的請求...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          重置密碼
        </Typography>
        
        {!isAuthenticated ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || '無效的重置密碼鏈接或鏈接已過期，請重新申請密碼重置。'}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/forgot-password')}
              >
                重新申請密碼重置
              </Button>
            </Box>
          </Alert>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              請設定您的新密碼，密碼必須至少包含8個字符。
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  密碼已成功重置！您將在3秒後被重定向到登入頁面。
                </Alert>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/auth')}
                  sx={{ mt: 2 }}
                >
                  立即返回登入頁面
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  label="新密碼"
                  type="password"
                  variant="outlined"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  autoFocus
                  InputProps={{
                    autoComplete: 'new-password'
                  }}
                />
                
                <TextField
                  label="確認新密碼"
                  type="password"
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  InputProps={{
                    autoComplete: 'new-password'
                  }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3, mb: 2, height: 48 }}
                  disabled={isLoading}
                  startIcon={<LockIcon />}
                >
                  {isLoading ? '處理中...' : '設定新密碼'}
                </Button>
              </form>
            )}
          </>
        )}
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;
