import React, { useEffect, useState } from 'react';
import { Users, FileCheck, AlertTriangle, TrendingUp, Eye, Calendar, BookOpen, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dataProvider from '../../services/provider';
import { Class, Subject } from '../../types';

const Reports = () => {
  const navigate = useNavigate();
  // Filter States
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('mid_term_1');

  // Load Filter Data
  useEffect(() => {
    const init = async () => {
      const [cls, subs] = await Promise.all([
        dataProvider.getClasses(),
        dataProvider.getSubjects()
      ]);
      setClasses(cls);
      setSubjects(subs);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    };
    init();
  }, []);

  // Mock Data for Visualization (matching requirements)
  const stats = {
    classSize: 31,
    submissionRate: 95,
    atRiskCount: 2,
    avgPeriodicScore: 8.2
  };

  const regularAssessmentData = [
    { label: 'Hoàn thành tốt (T)', code: 'T', count: 12, percentage: 39, color: 'bg-green-500', textColor: 'text-green-700' },
    { label: 'Hoàn thành (H)', code: 'H', count: 17, percentage: 55, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { label: 'Chưa hoàn thành (C)', code: 'C', count: 2, percentage: 6, color: 'bg-red-500', textColor: 'text-red-700' }
  ];

  const periodicScoreDistribution = [
    { score: 1, count: 0 }, { score: 2, count: 0 }, { score: 3, count: 0 }, { score: 4, count: 1 },
    { score: 5, count: 2 }, { score: 6, count: 4 }, { score: 7, count: 6 }, { score: 8, count: 8 },
    { score: 9, count: 6 }, { score: 10, count: 4 }
  ];

  // We mock IDs that exist in mockProvider usually, but here we hardcode specific mock IDs for visualization
  // In a real app, this would come from the API
  const atRiskStudents = [
    { id: 'u2', name: 'Trần Văn Nam', issue: 'Tính nhẩm phép chia còn chậm, chưa thuộc bảng cửu chương 7.' },
    { id: 'u3', name: 'Lê Thị Hoa', issue: 'Thường xuyên quên làm bài tập về nhà, chữ viết chưa cẩn thận.' }
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50/50 space-y-8">
      
      {/* 1. Header & Filters */}
      <div className="flex flex-col gap-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
           <p className="text-gray-500 text-sm mt-1">Theo dõi chất lượng giáo dục theo Thông tư 27.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
           <div className="flex items-center gap-2 flex-1">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Lớp học</label>
                <select 
                  className="w-full font-medium bg-transparent outline-none text-gray-900 cursor-pointer"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.name}</option>)}
                </select>
              </div>
           </div>
           
           <div className="w-px bg-gray-200 hidden md:block"></div>

           <div className="flex items-center gap-2 flex-1">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><BookOpen size={20} /></div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Môn học</label>
                <select 
                  className="w-full font-medium bg-transparent outline-none text-gray-900 cursor-pointer"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
           </div>

           <div className="w-px bg-gray-200 hidden md:block"></div>

           <div className="flex items-center gap-2 flex-1">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Calendar size={20} /></div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Giai đoạn</label>
                <select 
                  className="w-full font-medium bg-transparent outline-none text-gray-900 cursor-pointer"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="month_9">Tháng 9</option>
                  <option value="month_10">Tháng 10</option>
                  <option value="mid_term_1">Giữa Học kỳ 1</option>
                  <option value="end_term_1">Cuối Học kỳ 1</option>
                </select>
              </div>
           </div>
           
           <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg">
             Xem báo cáo
           </button>
        </div>
      </div>

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Sĩ số lớp" 
          value={`${stats.classSize} học sinh`} 
          icon={<Users size={24} />} 
          colorClass="bg-blue-50 text-blue-600" 
        />
        <StatsCard 
          title="Tỷ lệ nộp bài tập" 
          value={`${stats.submissionRate}%`} 
          icon={<FileCheck size={24} />} 
          colorClass="bg-green-50 text-green-600" 
          trend="Cao"
        />
        <StatsCard 
          title="Học sinh cần hỗ trợ" 
          value={`${stats.atRiskCount} em`} 
          icon={<AlertTriangle size={24} />} 
          colorClass="bg-red-50 text-red-600" 
          isAlert
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Regular Assessment (Process) - Horizontal Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
           <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Đánh giá thường xuyên</h2>
              <p className="text-sm text-gray-500">Thống kê mức độ hoàn thành quá trình học tập.</p>
           </div>
           
           <div className="flex-1 flex flex-col justify-center space-y-6">
              {regularAssessmentData.map((item) => (
                <div key={item.code}>
                  <div className="flex justify-between items-end mb-2">
                    <span className={`font-bold text-sm ${item.textColor}`}>{item.label}</span>
                    <span className="text-gray-900 font-bold">{item.count} HS <span className="text-gray-400 font-normal text-xs ml-1">({item.percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
           <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 italic text-center">
             * Dữ liệu dựa trên quan sát và nhận xét hàng ngày của giáo viên.
           </div>
        </div>

        {/* Right: Periodic Assessment (Exams) - Vertical Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
           <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thống kê điểm thi định kỳ</h2>
                <p className="text-sm text-gray-500">Phổ điểm bài kiểm tra {selectedPeriod === 'mid_term_1' ? 'Giữa kỳ 1' : 'Định kỳ'}.</p>
              </div>
              <div className="bg-indigo-50 px-3 py-2 rounded-lg text-indigo-700 text-right">
                 <div className="text-xs uppercase font-bold text-indigo-400">Điểm TB</div>
                 <div className="text-2xl font-bold">{stats.avgPeriodicScore}</div>
              </div>
           </div>

           <div className="flex-1 flex items-end justify-between gap-2 h-64 pt-4 px-2">
              {periodicScoreDistribution.map((item) => {
                const heightPercent = (item.count / stats.classSize) * 100 * 3; // Scale up for visual
                return (
                  <div key={item.score} className="flex flex-col items-center gap-2 group w-full">
                     <div className="relative w-full flex justify-center items-end h-full">
                        <div 
                          className="w-full max-w-[24px] bg-indigo-200 group-hover:bg-indigo-500 rounded-t-sm transition-all duration-300 relative"
                          style={{ height: `${heightPercent}%` }}
                        >
                           {/* Tooltipish count */}
                           <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                             {item.count}
                           </span>
                        </div>
                     </div>
                     <span className="text-xs font-bold text-gray-500">{item.score}</span>
                  </div>
                );
              })}
           </div>
           <div className="text-center text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Thang điểm 10</div>
        </div>
      </div>

      {/* 4. At Risk List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-200 bg-red-50/30 flex items-center justify-between">
            <h2 className="font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} />
              Danh sách Học sinh cần hỗ trợ
            </h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Mức độ C</span>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                 <tr>
                   <th className="p-4 border-b">Học sinh</th>
                   <th className="p-4 border-b w-1/2">Vấn đề cần cải thiện</th>
                   <th className="p-4 border-b text-right">Tác vụ</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {atRiskStudents.map(student => (
                   <tr key={student.id} className="hover:bg-gray-50">
                     <td className="p-4 font-bold text-gray-900">{student.name}</td>
                     <td className="p-4 text-gray-600">{student.issue}</td>
                     <td className="p-4 text-right">
                        <button 
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={16} />
                          Xem hồ sơ
                        </button>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

// Sub-component for Cards
const StatsCard = ({ title, value, icon, colorClass, isAlert, trend }: any) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 ${isAlert ? 'ring-1 ring-red-100' : ''}`}>
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{value}</h3>
      {trend && (
         <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-1">
           <TrendingUp size={12} />
           <span>{trend}</span>
         </div>
      )}
    </div>
  </div>
);

export default Reports;