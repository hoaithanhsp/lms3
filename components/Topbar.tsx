import React from 'react';
import { Menu, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  user: User | null;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick }) => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
             K
           </div>
           <span className="font-bold text-lg hidden sm:block text-blue-900">Kết Nối Tri Thức</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Người dùng'}</p>
            <p className="text-xs text-gray-500">{user?.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <UserIcon size={20} />
              </div>
            )}
          </div>
          <button 
            onClick={() => logout()} 
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;