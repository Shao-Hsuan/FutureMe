import React, { useState } from 'react';
import { LinkPreview, LinkPreviewEditor, LinkPreviewCard } from '../components/LinkPreview';

// 示例收藏連結類型
interface SavedLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  addedAt: Date;
}

export const LinkPreviewExample: React.FC = () => {
  // 日誌編輯器中的連結
  const [editorLink, setEditorLink] = useState<string>('');
  
  // 收藏的連結列表
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([
    {
      id: '1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: '我的收藏音樂',
      addedAt: new Date()
    },
    {
      id: '2',
      url: 'https://github.com/facebook/react',
      addedAt: new Date()
    }
  ]);

  // 處理添加連結到編輯器
  const handleAddToEditor = (url: string) => {
    setEditorLink(url);
  };

  // 處理添加連結到收藏
  const handleSaveLink = () => {
    if (editorLink) {
      const newLink: SavedLink = {
        id: Date.now().toString(),
        url: editorLink,
        addedAt: new Date()
      };
      
      setSavedLinks([newLink, ...savedLinks]);
      setEditorLink(''); // 清空編輯器連結
    }
  };

  // 處理從收藏中刪除連結
  const handleDeleteLink = (id: string) => {
    setSavedLinks(savedLinks.filter(link => link.id !== id));
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">連結預覽範例</h1>
      
      {/* 日誌編輯器示例 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">日誌編輯器中的連結預覽</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <LinkPreviewEditor 
            onLinkAdd={handleAddToEditor} 
            className="mb-4"
          />
          
          {editorLink && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">預覽結果</h3>
                <button 
                  onClick={handleSaveLink}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  保存到收藏
                </button>
              </div>
              <LinkPreview url={editorLink} />
            </div>
          )}
        </div>
      </section>
      
      {/* 收藏頁面示例 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">收藏頁面中的連結預覽</h2>
        
        {savedLinks.length === 0 ? (
          <p className="text-gray-500">暫無收藏的連結</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedLinks.map(link => (
              <LinkPreviewCard
                key={link.id}
                url={link.url}
                title={link.title}
                description={link.description}
                onDelete={() => handleDeleteLink(link.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
