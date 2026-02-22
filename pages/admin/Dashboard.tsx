import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, FileCheck, AlertCircle } from 'lucide-react';
import dataProvider from '../../services/provider';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ classCount: 0, studentCount: 0, assignmentCount: 0 });

  useEffect(() => {
    const loadData = async () => {
      const s = await dataProvider.getDashboardStats();
      setStats(s);
    };
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan lớp học</h1>
          <p className="text-gray-500">Chào mừng cô giáo quay trở lại!</p>
        </div>
        <button
          onClick={() => navigate('/admin/assignments')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          + Tạo bài tập mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Users className="text-blue-600" />}
          title="Tổng số Học sinh"
          value={stats.studentCount.toString()}
          color="bg-blue-50"
        />
        <StatsCard
          icon={<BookOpen className="text-green-600" />}
          title="Tổng số Lớp học"
          value={stats.classCount.toString()}
          color="bg-green-50"
        />
        <StatsCard
          icon={<FileCheck className="text-purple-600" />}
          title="Bài tập sắp nộp"
          value={stats.assignmentCount.toString()}
          color="bg-purple-50"
        />
        <StatsCard
          icon={<AlertCircle className="text-orange-600" />}
          title="Cần đánh giá"
          value="2"
          color="bg-orange-50"
        />
      </div>

      {/* Helper info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="text-blue-900 font-bold mb-2">Hướng dẫn nhanh:</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Vào mục <strong>Quản lý Lớp học</strong> để tạo lớp mới và lấy Mã tham gia.</li>
          <li>Vào mục <strong>Quản lý Học sinh</strong> để thêm học sinh vào các lớp.</li>
          <li>Vào mục <strong>Môn học & Chủ đề</strong> để soạn khung chương trình giảng dạy.</li>
        </ul>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, title, value, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;
