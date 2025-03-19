import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import TabBar from './components/layout/TabBar';
import CollectionPage from './pages/CollectionPage';
import JournalPage from './pages/JournalPage';
import JournalDetailPage from './pages/JournalDetailPage';
import JournalEditPage from './pages/JournalEditPage';
import JournalNewPage from './pages/JournalNewPage';
import SettingsPage from './pages/SettingsPage';
import FutureMePage from './pages/FutureMePage';
import LetterDetailPage from './pages/LetterDetailPage';
import GoalSetupPage from './pages/GoalSetupPage';
import WelcomePage from './pages/WelcomePage';
import AuthForm from './components/auth/AuthForm';
import AuthRequired from './components/auth/AuthRequired';
import UsageGuideSheet from './components/settings/UsageGuideSheet';
import GlobalLoading from './components/shared/GlobalLoading';
import { supabase } from './services/supabase';
import { LinkPreviewExample } from './examples/LinkPreviewExample';

function App() {
  const [showGuide, setShowGuide] = useState(false);

  const handleGuideClose = async () => {
    try {
      // 更新使用者設定，標記已看過指南
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .update({ has_seen_guide: true })
          .eq('user_id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to update user settings:', error);
    }
    setShowGuide(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthForm />} />
        
        {/* Protected routes */}
        <Route element={<AuthRequired onFirstLogin={() => setShowGuide(true)} />}>
          {/* Goal setup and welcome routes - no TabBar */}
          <Route path="/goal-setup" element={<GoalSetupPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          
          {/* Main app routes (with TabBar) */}
          <Route element={
            <div className="min-h-screen bg-gray-50 pb-16">
              <Outlet />
              <TabBar />
            </div>
          }>
            <Route path="/" element={<Navigate to="/journal" replace />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/new" element={<JournalNewPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/future-me" element={<FutureMePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/link-preview-demo" element={<LinkPreviewExample />} />
          </Route>
          
          {/* Detail pages (without TabBar) */}
          <Route path="/journal/:id" element={<JournalDetailPage />} />
          <Route path="/journal/:id/edit" element={<JournalEditPage />} />
          <Route path="/future-me/:id" element={<LetterDetailPage />} />
        </Route>
      </Routes>
      <UsageGuideSheet isOpen={showGuide} onClose={handleGuideClose} />
      <GlobalLoading />
    </Router>
  );
}

export default App;