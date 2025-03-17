import { useState, useEffect } from 'react';
import { X, Check, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateCollect, deleteCollect } from '../../services/collectService';
import { useConfirm } from '../../hooks/useConfirm';
import type { Collect, TextCollectColor } from '../../types/collect';

interface CollectDetailSheetProps {
  collect: Collect;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCollect: Collect) => void;
}

export default function CollectDetailSheet({
  collect,
  isOpen,
  onClose,
  onUpdate
}: CollectDetailSheetProps) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(collect.content);
  const [caption, setCaption] = useState(collect.caption || '');
  const [color, setColor] = useState<TextCollectColor>(collect.color || 'blue');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localCollect, setLocalCollect] = useState(collect);

  useEffect(() => {
    if (isOpen) {
      setContent(collect.content);
      setCaption(collect.caption || '');
      setColor(collect.color || 'blue');
      setLocalCollect(collect);
      setHasChanges(false);
      setIsEditing(false);
    }
  }, [collect, isOpen]);

  if (!isOpen) return null;

  const handleContentClick = () => {
    switch (localCollect.type) {
      case 'text':
        setIsEditing(true);
        break;
      case 'image':
      case 'video':
        window.open(localCollect.content, '_blank');
        break;
      case 'link':
        window.open(localCollect.content, '_blank');
        break;
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
    setHasChanges(true);
  };

  const handleColorChange = (newColor: TextCollectColor) => {
    setColor(newColor);
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('有未儲存的變更，確定要離開嗎？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const updatedCollect = await updateCollect(localCollect.id, {
        content,
        caption,
        color
      });
      
      setLocalCollect(updatedCollect);
      setContent(updatedCollect.content);
      setCaption(updatedCollect.caption || '');
      setColor(updatedCollect.color || 'blue');
      setHasChanges(false);
      setIsEditing(false);
      
      onUpdate(updatedCollect);
    } catch (error) {
      console.error('Failed to update collect:', error);
      alert('更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const shouldDelete = await confirm('確定要刪除這個收藏嗎？');
    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      await deleteCollect(localCollect.id);
      onClose();
      onUpdate(localCollect);
    } catch (error) {
      console.error('Failed to delete collect:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWriteJournal = () => {
    const textCollect = localCollect.type === 'text' || localCollect.type === 'link' ? {
      type: localCollect.type,
      content: localCollect.content,
      title: localCollect.title,
      preview_image: localCollect.preview_image,
      color: localCollect.type === 'text' ? localCollect.color : undefined
    } : null;

    const mediaUrls = ['image', 'video'].includes(localCollect.type) ? [localCollect.content] : [];

    navigate('/journal/new', { 
      state: { 
        initialTextCollects: textCollect ? [textCollect] : [],
        initialMediaUrls: mediaUrls
      }
    });
  };

  const colorOptions: { value: TextCollectColor; label: string; class: string }[] = [
    { value: 'blue', label: '藍色', class: 'bg-blue-100 hover:bg-blue-200' },
    { value: 'green', label: '綠色', class: 'bg-green-100 hover:bg-green-200' },
    { value: 'yellow', label: '黃色', class: 'bg-yellow-100 hover:bg-yellow-200' },
    { value: 'purple', label: '紫色', class: 'bg-purple-100 hover:bg-purple-200' },
    { value: 'pink', label: '粉色', class: 'bg-pink-100 hover:bg-pink-200' }
  ];

  const renderContent = () => {
    if (localCollect.type === 'text' && isEditing) {
      return (
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className={`w-full h-60 p-6 text-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            color === 'blue' ? 'bg-blue-50' :
            color === 'green' ? 'bg-green-50' :
            color === 'yellow' ? 'bg-yellow-50' :
            color === 'purple' ? 'bg-purple-50' :
            'bg-pink-50'
          }`}
          autoFocus
        />
      );
    }

    switch (localCollect.type) {
      case 'text':
        return (
          <div 
            onClick={handleContentClick}
            className={`w-full min-h-[15rem] p-6 rounded-lg cursor-pointer transition-colors ${
              color === 'blue' ? 'bg-blue-100 hover:bg-blue-200' :
              color === 'green' ? 'bg-green-100 hover:bg-green-200' :
              color === 'yellow' ? 'bg-yellow-100 hover:bg-yellow-200' :
              color === 'purple' ? 'bg-purple-100 hover:bg-purple-200' :
              'bg-pink-100 hover:bg-pink-200'
            }`}
          >
            <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
          </div>
        );
      case 'video':
        return (
          <video
            src={localCollect.content}
            controls
            className="w-full rounded-lg cursor-pointer"
            onClick={handleContentClick}
          />
        );
      case 'link':
        return (
          <div 
            onClick={handleContentClick}
            className="space-y-4 cursor-pointer"
          >
            {localCollect.preview_image && (
              <img
                src={localCollect.preview_image}
                alt={localCollect.title}
                className="w-full rounded-lg"
              />
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-800">
                {localCollect.title || localCollect.content}
              </h3>
              <p className="text-blue-500 text-sm">{localCollect.content}</p>
            </div>
          </div>
        );
      default: // image
        return (
          <img
            src={localCollect.content}
            alt={caption || ''}
            className="w-full rounded-lg cursor-pointer"
            onClick={handleContentClick}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 h-[90vh] bg-white rounded-t-2xl p-4 animate-slide-up overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          {/* 左側刪除按鈕 */}
          <button 
            onClick={handleDelete}
            className="p-2 text-red-500"
            disabled={isDeleting || isSaving}
          >
            <Trash2 className="w-6 h-6" />
          </button>

          {/* 右側按鈕 */}
          {hasChanges ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>儲存</span>
            </button>
          ) : (
            <button onClick={handleClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {renderContent()}

          {/* Color Selection for Text Collects */}
          {localCollect.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                背景顏色
              </label>
              <div className="flex gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleColorChange(option.value)}
                    className={`w-8 h-8 rounded-full ${option.class} ${
                      color === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    title={option.label}
                    type="button"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="mt-4">
            <input
              type="text"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="加入說明文字"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isDeleting || isSaving}
            />
          </div>

          {/* Write Journal Button */}
          <button
            onClick={handleWriteJournal}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={isDeleting || isSaving}
          >
            開始撰寫日誌
          </button>
        </div>
      </div>
    </div>
  );
}