import { LogOut, Trash2, Download, Upload, FileText, Mail, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../layout/PageHeader';
import SettingsSection from '../settings/SettingsSection';
import SettingsButton from '../settings/SettingsButton';
import ImportDataSheet from '../settings/ImportDataSheet';
import UsageGuideSheet from '../settings/UsageGuideSheet';
import { signOut } from '../../services/auth';
import { clearUserData, exportGoalData, exportGoalDataAsPDF } from '../../services/dataService';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { useGoalStore } from '../../store/goalStore';
import { useAuthStore } from '../../store/authStore';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [isGuideSheetOpen, setIsGuideSheetOpen] = useState(false);
  const [exportType, setExportType] = useState<'zip' | 'pdf' | null>(null);
  const confirm = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  const { setCurrentGoal, setGoals, currentGoal } = useGoalStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (await confirm('確定要登出嗎？')) {
      try {
        setIsLoading(true);
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('登出失敗:', error);
        showToast('登出失敗，請稍後再試', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearData = async () => {
    if (!await confirm('確定要清除所有資料嗎？此操作無法復原！')) {
      return;
    }

    setIsLoading(true);
    try {
      await clearUserData();
      setCurrentGoal(null);
      setGoals([]);
      showToast('資料已清除', 'success');
      setTimeout(() => {
        navigate('/journal');
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('清除資料失敗:', error);
      showToast(
        error instanceof Error ? error.message : '清除資料失敗，請稍後再試',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!currentGoal) {
      setExportType('zip');
      setIsGoalSelectorOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      await exportGoalData(currentGoal.id.toString());
      showToast('資料匯出成功', 'success');
    } catch (error) {
      console.error('匯出資料失敗:', error);
      showToast(
        error instanceof Error ? error.message : '匯出資料失敗，請稍後再試',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!currentGoal) {
      setExportType('pdf');
      setIsGoalSelectorOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      await exportGoalDataAsPDF(currentGoal.id.toString());
      showToast('PDF 匯出成功', 'success');
    } catch (error) {
      console.error('匯出 PDF 失敗:', error);
      showToast(
        error instanceof Error ? error.message : '匯出 PDF 失敗，請稍後再試',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSuccess = () => {
    showToast('資料匯入成功', 'success');
    navigate('/journal');
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader pageName="設定" />
      
      <SettingsSection title="帳號">
        {/* Account Info */}
        <div className="px-4 py-3 mb-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Mail className="w-5 h-5" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="text-xs text-gray-500">
            註冊時間：{new Date(user?.created_at || '').toLocaleDateString()}
          </div>
        </div>

        <SettingsButton
          icon={LogOut}
          label="登出"
          onClick={handleSignOut}
          disabled={isLoading}
        />
      </SettingsSection>

      <SettingsSection title="使用說明">
        <div className="px-4 py-3 mb-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Goal Journal 是一個幫助你追蹤目標進度的工具。你可以記錄日誌、收藏靈感、獲得反饋，並透過 AI 生成的信件來回顧你的成長。
          </p>
          <button
            onClick={() => setIsGuideSheetOpen(true)}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            第一次使用請看一下這邊的說明
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="資料">
        <SettingsButton
          icon={Upload}
          label="匯入資料"
          onClick={() => setIsImportSheetOpen(true)}
          disabled={isLoading}
        />
        <SettingsButton
          icon={Download}
          label={`匯出${currentGoal ? ` ${currentGoal.title} 的` : ''}資料`}
          onClick={handleExportData}
          disabled={isLoading}
        />
        <SettingsButton
          icon={FileText}
          label={`匯出${currentGoal ? ` ${currentGoal.title} 的` : ''} PDF`}
          onClick={handleExportPDF}
          disabled={isLoading}
        />
        <SettingsButton
          icon={Trash2}
          label="清除所有資料"
          onClick={handleClearData}
          variant="danger"
          disabled={isLoading}
        />
      </SettingsSection>

      <ImportDataSheet
        isOpen={isImportSheetOpen}
        onClose={() => setIsImportSheetOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <UsageGuideSheet
        isOpen={isGuideSheetOpen}
        onClose={() => setIsGuideSheetOpen(false)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.type === 'loading' ? undefined : 3000}
        />
      )}
    </div>
  );
}