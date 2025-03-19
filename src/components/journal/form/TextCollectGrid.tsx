import { X } from 'lucide-react';
import LinkPreview from '../../shared/LinkPreview';

interface TextCollect {
  type: 'text' | 'link';
  content: string;
  title?: string;
  preview_image?: string;
  color?: string;
}

interface TextCollectGridProps {
  collects: TextCollect[];
  onDelete: (index: number) => void;
}

export default function TextCollectGrid({ collects, onDelete }: TextCollectGridProps) {
  if (collects.length === 0) return null;
  
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {collects.map((collect, index) => (
        <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <button 
            onClick={() => onDelete(index)}
            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full z-10 hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
          
          {collect.type === 'text' ? (
            <div 
              className={`p-4 ${
                collect.color === 'blue' ? 'bg-blue-50' :
                collect.color === 'green' ? 'bg-green-50' :
                collect.color === 'yellow' ? 'bg-yellow-50' :
                collect.color === 'purple' ? 'bg-purple-50' :
                collect.color === 'pink' ? 'bg-pink-50' : 'bg-gray-50'
              }`}
            >
              <p className="text-gray-800 whitespace-pre-wrap">{collect.content}</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <LinkPreview 
                url={collect.content}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
