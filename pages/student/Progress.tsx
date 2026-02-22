import React, { useEffect, useState } from 'react';
import { Star, FileCheck, Trophy, Download, BookOpen, Calendar, MessageCircle, Award, Smile } from 'lucide-react';
import dataProvider from '../../services/provider';
import { User, Assignment, Submission, AssessmentLevel } from '../../types';

const Progress = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stats State (Gamified)
  const [stats, setStats] = useState({ 
    totalStars: 0, 
    excellentCount: 0, 
    generalAssessment: 'Chăm ngoan' 
  });

  // Topic Progress State (Mocked)
  const [topicProgress, setTopicProgress] = useState([
    { id: 't1', name: 'Chủ đề 1: Ôn tập và bổ sung', percent: 100, color: 'bg-green-500' },
    { id: 't2', name: 'Chủ đề 2: Phép nhân, phép chia trong phạm vi 1000', percent: 50, color: 'bg-blue-500' },
    { id: 't3', name: 'Chủ đề 3: Làm quen với hình phẳng, hình khối', percent: 20, color: 'bg-yellow-500' }
  ]);

  // Detailed Gradebook State
  const [gradebook, setGradebook] = useState<{
    assignment: Assignment, 
    submission: Submission
  }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await dataProvider.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load real assignments and submissions
        const myAssignments = await dataProvider.getMyAssignments(currentUser.id);
        const graded = myAssignments
          .filter(item => item.submission && item.submission.status === 'GRADED')
          .map(item => ({ assignment: item.assignment, submission: item.submission! }));
        
        setGradebook(graded);

        // Calculate Gamified Stats
        let stars = 0;
        let excellent = 0;
        graded.forEach(item => {
           if (item.submission.assessment === AssessmentLevel.HTT) {
             stars += 3;
             excellent++;
           } else if (item.submission.assessment === AssessmentLevel.HT) {
             stars += 1;
           }
        });
        
        setStats({
          totalStars: stars,
          excellentCount: excellent,
          generalAssessment: excellent > 5 ? 'Xuất sắc' : 'Chăm chỉ'
        });
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const renderAssessmentIcon = (assessment?: AssessmentLevel) => {
    if (assessment === AssessmentLevel.HTT) {
      return (
        <div className="flex flex-col items-center gap-1">
           <div className="flex">
             <Star size={18} className="fill-yellow-400 text-yellow-400" />
             <Star size={18} className="fill-yellow-400 text-yellow-400 -mt-2" />
             <Star size={18} className="fill-yellow-400 text-yellow-400" />
           </div>
           <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Hoàn thành tốt</span>
        </div>
      );
    }
    if (assessment === AssessmentLevel.HT) {
      return (
        <div className="flex flex-col items-center gap-1">
           <Star size={20} className="fill-yellow-400 text-yellow-400" />
           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Hoàn thành</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-1">
         <Smile size={20} className="text-orange-400" />
         <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Cần cố gắng</span>
      </div>
    );
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 bg-white min-h-screen print:p-0">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
           <h1 className="text-2xl font-extrabold text-blue-900">Bảng vàng thành tích</h1>
           <p className="text-gray-500 text-sm font-medium">Hành trình chinh phục tri thức của em.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full hover:bg-blue-200 transition-all font-bold"
        >
          <Download size={20} />
          <span>Tải phiếu khen (PDF)</span>
        </button>
      </div>

      {/* 2. PDF Header (Hidden on screen) */}
      <div className="hidden print:block mb-8 border-b-2 border-gray-900 pb-6">
        <div className="text-center mt-8">
            <h1 className="text-3xl font-bold text-blue-900 uppercase mb-2">Phiếu Khen Thưởng</h1>
            <p className="text-lg font-medium text-gray-700">Năm học: 2023 - 2024</p>
        </div>
        <div className="mt-6 flex justify-center gap-8 text-sm font-medium">
            <p>Học sinh: <span className="font-bold text-lg">{user?.name}</span></p>
            <p>Lớp: <span className="font-bold text-lg">3/2</span></p>
        </div>
      </div>

      {/* 3. Overview Stats Cards (Rounded & Playful) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        {/* Total Stars */}
        <div className="bg-gradient-to-br from-yellow-100 to-orange-50 p-6 rounded-3xl border-2 border-yellow-200 flex flex-col items-center text-center shadow-sm">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm mb-3">
             <Star size={36} fill="currentColor" className="animate-[spin_3s_linear_infinite]" />
           </div>
           <h3 className="text-4xl font-black text-yellow-600 mb-1">{stats.totalStars}</h3>
           <p className="text-yellow-800 font-bold text-sm uppercase tracking-wide">Sao vàng lấp lánh</p>
        </div>

        {/* Excellent Assignments */}
        <div className="bg-gradient-to-br from-green-100 to-emerald-50 p-6 rounded-3xl border-2 border-green-200 flex flex-col items-center text-center shadow-sm">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm mb-3">
             <Trophy size={36} />
           </div>
           <h3 className="text-4xl font-black text-green-600 mb-1">{stats.excellentCount}</h3>
           <p className="text-green-800 font-bold text-sm uppercase tracking-wide">Huy hiệu xuất sắc</p>
        </div>

        {/* General Assessment */}
        <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-6 rounded-3xl border-2 border-purple-200 flex flex-col items-center text-center shadow-sm">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm mb-3">
             <Award size={36} />
           </div>
           <h3 className="text-2xl font-black text-purple-600 mb-1 mt-2">{stats.generalAssessment}</h3>
           <p className="text-purple-800 font-bold text-sm uppercase tracking-wide">Danh hiệu hiện tại</p>
        </div>
      </div>

      {/* 4. Progress Visualization */}
      <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-6 print:border print:p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
           <BookOpen className="text-blue-500" />
           Chặng đường chinh phục kiến thức
        </h2>
        
        <div className="space-y-6">
           {topicProgress.map((item) => (
             <div key={item.id}>
               <div className="flex justify-between mb-2">
                 <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                 <span className="font-bold text-blue-600">{item.percent}%</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                 <div 
                   className={`h-4 rounded-full transition-all duration-1000 ${item.color} flex items-center justify-end pr-1`}
                   style={{ width: `${item.percent}%` }}
                 >
                    {item.percent >= 100 && <Star size={10} className="text-white fill-white" />}
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 5. Detailed Gradebook Table (NO SCORES) */}
      <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden print:border print:rounded-none">
        <div className="p-6 border-b border-gray-100 bg-gray-50 print:bg-white print:px-4">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="text-blue-500" />
              Chi tiết nhận xét của cô giáo
           </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm font-bold border-b border-gray-200 print:bg-gray-50">
                <th className="p-4 w-1/3">Bài tập</th>
                <th className="p-4 text-center">Kết quả</th>
                <th className="p-4 w-1/2">Lời cô dặn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gradebook.length > 0 ? gradebook.map(({ assignment, submission }) => (
                <tr key={assignment.id} className="hover:bg-blue-50/50 print:hover:bg-white transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900 mb-1">{assignment.title}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="p-4 text-center align-middle">
                     {renderAssessmentIcon(submission.assessment)}
                  </td>
                  <td className="p-4 align-middle">
                    {submission.feedback ? (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 relative">
                         <MessageCircle size={16} className="text-blue-300 absolute -top-2 -left-2 bg-white rounded-full" />
                         <span className="text-sm text-gray-600 font-medium italic">"{submission.feedback}"</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300 italic">Chưa có nhận xét</span>
                    )}
                  </td>
                </tr>
              )) : (
                 <tr className="bg-white">
                    <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                      Em chưa có bài tập nào được đánh giá. Hãy làm bài tập ngay nhé!
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Progress;