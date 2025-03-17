import { ReactNode, useEffect } from 'react';

interface MenuListProps {
  children: ReactNode;
  onClose: () => void;
}

export default function MenuList({ children, onClose }: MenuListProps) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
        {children}
      </div>
    </>
  );
}