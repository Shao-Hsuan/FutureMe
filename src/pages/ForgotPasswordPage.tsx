import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPasswordForEmail } from '../services/auth';
import { Card, Button, TextField, Typography, Box, Alert, Link } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('請輸入您的電子郵件');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPasswordForEmail(email);
      setSuccess(true);
    } catch (err) {
      console.error('重置密碼錯誤:', err);
      setError(err instanceof Error ? err.message : '發送重置密碼郵件時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/auth')}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            返回登入
          </Button>
        </Box>

        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          忘記密碼
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          請輸入您的電子郵件，我們將向您發送重置密碼的連結。
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              重置密碼郵件已發送！請檢查您的收件箱，並點擊郵件中的連結來重置密碼。
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              如果您沒有收到郵件，請檢查垃圾郵件文件夾，或者稍後再試。
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/auth')}
              sx={{ mt: 2 }}
            >
              返回登入頁面
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="電子郵件"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              InputProps={{
                autoComplete: 'email'
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isLoading}
              endIcon={<SendIcon />}
            >
              {isLoading ? '發送中...' : '發送重置郵件'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                onClick={() => navigate('/auth')} 
                sx={{ cursor: 'pointer', textDecoration: 'none' }}
              >
                返回登入
              </Link>
            </Box>
          </form>
        )}
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
