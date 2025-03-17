import { Type, Image, Video, Link } from 'lucide-react';
import { useState } from 'react';
import { useGoalStore } from '../../store/goalStore';
import { createCollect, getLinkPreview } from '../../services/collectService';
import { openMediaPicker } from '../../services/mediaService';
import ToolbarButton from '../shared/ToolbarButton';
import CollectionInputSheet from './CollectionInputSheet';
import type { Collect } from '../../types/collect';

interface CollectionToolbarProps {
  onCollectAdded: (collect: Collect) => void;
}

export default function CollectionToolbar({ onCollectAdded }: CollectionToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'link' | null>(null);
  const currentGoal = useGoalStore(state => state.currentGoal);

  const handleTextSubmit = async (data: { content: string; caption?: string }) => {
    if (!currentGoal?.id) {
      alert('請先選擇目標');
      return;
    }

    const collect = await createCollect({
      type: 'text',
      content: data.content,
      caption: data.caption,
      goal_id: currentGoal.id
    });

    onCollectAdded(collect);
  };

  const handleLinkSubmit = async (data: { content: string; caption?: string }) => {
    if (!currentGoal?.id) {
      alert('請先選擇目標');
      return;
    }

    const preview = await getLinkPreview(data.content);
    const collect = await createCollect({
      type: 'link',
      content: data.content,
      caption: data.caption,
      title: preview.title,
      preview_image: preview.image,
      goal_id: currentGoal.id
    });

    onCollectAdded(collect);
  };

  const handleMediaCollect = async (type: 'image' | 'video') => {
    if (!currentGoal?.id) {
      alert('請先選擇目標');
      return;
    }

    try {
      setIsProcessing(true);
      const [media] = await openMediaPicker({ 
        multiple: false,
        accept: type === 'image' ? 'image/*' : 'video/*'
      });

      const collect = await createCollect({
        type,
        content: media.url,
        goal_id: currentGoal.id
      });

      onCollectAdded(collect);
    } catch (error) {
      console.error(`Failed to create ${type} collect:`, error);
      alert('儲存失敗');
    } finally {
      setIsProcessing(false);
    }
  };

  const tools = [
    { icon: Type, label: '文字', onClick: () => setInputType('text') },
    { icon: Image, label: '圖片', onClick: () => handleMediaCollect('image') },
    { icon: Video, label: '影片', onClick: () => handleMediaCollect('video') },
    { icon: Link, label: '連結', onClick: () => setInputType('link') }
  ];

  return (
    <>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex gap-6">
        {tools.map(({ icon, label, onClick }) => (
          <ToolbarButton
            key={label}
            icon={icon}
            label={label}
            onClick={onClick}
            disabled={isProcessing}
          />
        ))}
      </div>

      <CollectionInputSheet
        isOpen={inputType !== null}
        onClose={() => setInputType(null)}
        onSubmit={inputType === 'text' ? handleTextSubmit : handleLinkSubmit}
        type={inputType || 'text'}
      />
    </>
  );
}