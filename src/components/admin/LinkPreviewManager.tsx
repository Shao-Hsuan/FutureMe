import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { clearLinkPreviewCache } from '../../services/linkService';

// 緩存記錄類型
interface CacheRecord {
  id: number;
  url: string;
  preview_data: any;
  created_at: string;
  updated_at: string;
}

// 緩存統計信息
interface CacheStats {
  total: number;
  lastDay: number;
  lastWeek: number;
  oldestRecord?: string;
  mostAccessed?: string;
}

export default function LinkPreviewManager() {
  const [cacheRecords, setCacheRecords] = useState<CacheRecord[]>([]);
  const [stats, setStats] = useState<CacheStats>({
    total: 0,
    lastDay: 0,
    lastWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCacheData();
  }, []);

  const loadCacheData = async () => {
    setIsLoading(true);
    
    try {
      // 獲取所有緩存記錄
      const { data, error } = await supabase
        .from('link_preview_cache')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setCacheRecords(data || []);
      
      // 計算統計信息
      if (data && data.length > 0) {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const lastDayCount = data.filter(r => new Date(r.updated_at) >= oneDayAgo).length;
        const lastWeekCount = data.filter(r => new Date(r.updated_at) >= oneWeekAgo).length;
        
        setStats({
          total: data.length,
          lastDay: lastDayCount,
          lastWeek: lastWeekCount,
          oldestRecord: data[data.length - 1]?.created_at,
          mostAccessed: data[0]?.url
        });
      }
    } catch (err) {
      console.error('載入緩存數據失敗:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearAll = async () => {
    if (!confirm('確定要清除所有緩存嗎？')) return;
    
    try {
      const { error } = await supabase
        .from('link_preview_cache')
        .delete()
        .gt('id', 0);
        
      if (error) throw error;
      
      // 同時清除記憶體緩存
      clearLinkPreviewCache();
      
      alert('所有緩存已清除');
      setCacheRecords([]);
      setStats({
        total: 0,
        lastDay: 0,
        lastWeek: 0
      });
    } catch (err) {
      console.error('清除緩存失敗:', err);
      alert('清除緩存失敗，請查看控制台獲取詳細信息');
    }
  };
  
  const handleDeleteRecord = async (id: number, url: string) => {
    try {
      const { error } = await supabase
        .from('link_preview_cache')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // 同時清除記憶體緩存
      clearLinkPreviewCache(url);
      
      setCacheRecords(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (err) {
      console.error('刪除記錄失敗:', err);
      alert('刪除失敗，請查看控制台獲取詳細信息');
    }
  };
  
  const handleCleanExpired = async () => {
    try {
      // 執行存儲過程清理過期記錄
      const { error } = await supabase.rpc('clean_expired_link_previews');
      
      if (error) throw error;
      
      alert('過期緩存已清理');
      loadCacheData(); // 重新載入數據
    } catch (err) {
      console.error('清理過期緩存失敗:', err);
      alert('清理失敗，請查看控制台獲取詳細信息');
    }
  };
  
  const filteredRecords = searchQuery
    ? cacheRecords.filter(r => r.url.toLowerCase().includes(searchQuery.toLowerCase()))
    : cacheRecords;
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">連結預覽緩存管理</h1>
      
      {/* 統計面板 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">緩存統計</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">總緩存數</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">過去24小時</p>
            <p className="text-2xl font-bold">{stats.lastDay}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">過去7天</p>
            <p className="text-2xl font-bold">{stats.lastWeek}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">緩存節省率</p>
            <p className="text-2xl font-bold">
              {stats.total > 0 
                ? `${Math.round((stats.total - stats.lastDay) / stats.total * 100)}%` 
                : '0%'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 操作面板 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          清除所有緩存
        </button>
        <button 
          onClick={handleCleanExpired}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          清理過期緩存
        </button>
        <button 
          onClick={loadCacheData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          刷新數據
        </button>
      </div>
      
      {/* 搜索框 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜索URL..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* 緩存列表 */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">載入中...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {searchQuery ? '沒有符合搜索條件的緩存記錄' : '緩存中沒有記錄'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">URL</th>
                <th className="py-3 px-4 text-left">標題</th>
                <th className="py-3 px-4 text-left">更新時間</th>
                <th className="py-3 px-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{record.id}</td>
                  <td className="py-3 px-4">
                    <a 
                      href={record.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate block max-w-xs"
                    >
                      {record.url}
                    </a>
                  </td>
                  <td className="py-3 px-4">{record.preview_data.title || '無標題'}</td>
                  <td className="py-3 px-4">
                    {new Date(record.updated_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleDeleteRecord(record.id, record.url)}
                      className="text-red-500 hover:text-red-700"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
