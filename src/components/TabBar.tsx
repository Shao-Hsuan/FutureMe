import { Book, Image, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function TabBar() {
  const location = useLocation();
  
  const tabs = [
    { icon: Book, label: '日誌', path: '/journal' },
    { icon: Image, label: '收藏庫', path: '/collection' },
    { icon: Settings, label: '設定', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center space-y-1"
            >
              <div className={`${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}