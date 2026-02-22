import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, FileText,
  BarChart2, Settings, GraduationCap, UserPlus, Library, Bell,
  NotebookPen, Folder, Gamepad2, MessageCircle
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const teacherLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/admin/announcements', icon: Bell, label: 'Thông báo' },
    { to: '/admin/classes', icon: Users, label: 'Quản lý Lớp học' },
    { to: '/admin/students', icon: UserPlus, label: 'Quản lý Học sinh' },
    { to: '/admin/curriculum', icon: BookOpen, label: 'Môn học & Chủ đề' },
    { to: '/admin/lessons', icon: Library, label: 'Soạn bài giảng' },
    { to: '/admin/resources', icon: Folder, label: 'Ngân hàng học liệu' },
    { to: '/admin/assignments', icon: FileText, label: 'Bài tập & Chấm bài' },
    { to: '/admin/regular-assessment', icon: NotebookPen, label: 'Sổ đánh giá' },
    { to: '/admin/reports', icon: BarChart2, label: 'Báo cáo & Thống kê' },
    { to: '/admin/chatbot', icon: MessageCircle, label: 'Trợ lý Toán 3' },
  ];

  const studentLinks = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Góc học tập' },
    { to: '/app/lessons', icon: BookOpen, label: 'Bài giảng' },
    { to: '/app/assignments', icon: FileText, label: 'Bài tập của em' },
    { to: '/app/games', icon: Gamepad2, label: 'Khu vui chơi' },
    { to: '/app/progress', icon: GraduationCap, label: 'Kết quả học tập' },
    { to: '/app/chatbot', icon: MessageCircle, label: 'Trợ lý Toán 3' },
  ];

  const links = role === UserRole.TEACHER ? teacherLinks : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)]
      `}>
        <div className="p-4">
          <div className="mb-6 px-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu Chính
            </h2>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings size={20} />
            <span>Cài đặt</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;