import React, { useState } from 'react';
import { Menu, Bell, User as UserIcon, LogOut, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  user: User | null;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`p-2 rounded-full transition-colors ${isNotificationOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Bell size={20} className="currentColor" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Thông báo mới</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">2 chưa đọc</span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-50 flex gap-3 hover:bg-blue-50/50 cursor-pointer transition-colors bg-blue-50/20">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bell size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">Nhắc nhở nộp báo cáo điểm số định kỳ tháng 10.</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">Vừa xong</p>
                  </div>
                </div>

                <div className="p-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 line-clamp-2">Giáo viên <span className="font-bold text-gray-800">Lê Thu Hằng</span> vừa tải lên 2 học liệu mới.</p>
                    <p className="text-xs text-gray-400 mt-1">2 giờ trước</p>
                  </div>
                </div>
              </div>

              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    setIsNotificationOpen(false);
                    // Navigate to appropriate route based on user role
                    if (user?.role === 'TEACHER') {
                      navigate('/admin/announcements');
                    } else {
                      navigate('/app'); // Student dashboard
                    }
                  }}
                  className="w-full py-1.5 text-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
          )}
        </div>

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
