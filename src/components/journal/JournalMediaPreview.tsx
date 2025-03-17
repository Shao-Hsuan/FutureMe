import { X } from 'lucide-react';

interface JournalMediaPreviewProps {
  media: string[];
  onRemove: (index: number) => void;
}

export default function JournalMediaPreview({ media, onRemove }: JournalMediaPreviewProps) {
  return (
    <div className="relative">
      <div className="aspect-[4/3] bg-gray-100">
        {media.map((url, index) => (
          <div key={url} className="absolute inset-0">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white"
              aria-label="移除媒體"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}