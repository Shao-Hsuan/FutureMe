import { X } from 'lucide-react';

interface TextPreviewProps {
  texts: Array<{
    type: 'text' | 'link';
    content: string;
    title?: string;
    preview_image?: string;
  }>;
  onRemove: (index: number) => void;
}

export default function TextPreview({ texts, onRemove }: TextPreviewProps) {
  if (texts.length === 0) return null;

  const renderContent = (text: TextPreviewProps['texts'][0]) => {
    if (text.type === 'link') {
      const isYoutube = text.content.includes('youtube.com') || text.content.includes('youtu.be');
      let youtubeId = '';
      if (isYoutube) {
        youtubeId = text.content.includes('youtu.be')
          ? text.content.split('youtu.be/')[1]?.split('?')[0]
          : new URLSearchParams(new URL(text.content).search).get('v') || '';
      }

      if (youtubeId) {
        return (
          <div className="w-full h-full">
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="YouTube thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-white text-sm">YouTube Video</div>
            </div>
          </div>
        );
      }

      if (text.preview_image) {
        return (
          <div className="w-full h-full">
            <img
              src={text.preview_image}
              alt={text.title || ''}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm line-clamp-2">{text.title || text.content}</p>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="font-medium text-sm line-clamp-2">{text.title || text.content}</p>
            <p className="text-blue-500 text-xs line-clamp-1">{text.content}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
        <p className="text-gray-800 line-clamp-4 text-center p-4">{text.content}</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {texts.map((text, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
          <div className="absolute inset-0">
            {renderContent(text)}
          </div>
          <button
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="移除"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}