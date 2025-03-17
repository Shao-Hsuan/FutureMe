import { Check } from 'lucide-react';
import type { Collect } from '../../types/collect';

interface CollectCardProps {
  collect: Collect;
  onClick: (collect: Collect) => void;
  isSelecting: boolean;
  isSelected: boolean;
}

export default function CollectCard({ 
  collect, 
  onClick, 
  isSelecting,
  isSelected 
}: CollectCardProps) {
  const getBackgroundColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 hover:bg-blue-200';
      case 'green': return 'bg-green-100 hover:bg-green-200';
      case 'yellow': return 'bg-yellow-100 hover:bg-yellow-200';
      case 'purple': return 'bg-purple-100 hover:bg-purple-200';
      case 'pink': return 'bg-pink-100 hover:bg-pink-200';
      default: return 'bg-blue-100 hover:bg-blue-200';
    }
  };

  const renderContent = () => {
    switch (collect.type) {
      case 'text':
        return (
          <div className={`w-full aspect-square ${getBackgroundColor(collect.color)} transition-colors overflow-hidden`}>
            <div className="w-full h-full flex items-center p-6">
              <p className="text-gray-800 text-left line-clamp-6">{collect.content}</p>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="w-full aspect-video">
            {collect.content.includes('youtube.com') || collect.content.includes('youtu.be') ? (
              <iframe
                src={collect.content.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={collect.content}
                className="w-full h-full object-cover"
                controls={false}
              />
            )}
          </div>
        );
      case 'link':
        return (
          <div className="w-full">
            <img
              src={collect.preview_image}
              alt={collect.title}
              className="w-full h-full object-cover"
            />
          </div>
        );
      default:
        return (
          <div className="w-full">
            <img
              src={collect.content}
              alt={collect.caption || ''}
              className="w-full h-full object-cover"
            />
          </div>
        );
    }
  };

  return (
    <button
      onClick={() => onClick(collect)}
      className="group relative w-full rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {renderContent()}
      
      {isSelecting && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
            ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white'}`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}
      
      {(collect.caption || collect.title) && !isSelecting && (
        <div className="p-2 bg-white border-t border-gray-100">
          {collect.caption && (
            <p className="text-sm text-gray-800 line-clamp-2">{collect.caption}</p>
          )}
          {collect.title && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{collect.title}</p>
          )}
        </div>
      )}
    </button>
  );
}