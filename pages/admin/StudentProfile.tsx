import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, MapPin, BookOpen, Filter, Search } from 'lucide-react';
import dataProvider from '../../services/provider';
import { User, Class } from '../../types';

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<User | null>(null);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineFilter, setTimelineFilter] = useState('All');

  // Mock Data for Visualization
  const subjectProgress = [
    { name: 'Toán', percent: 75, color: 'bg-blue-500' },
    { name: 'Tiếng Việt', percent: 82, color: 'bg-green-500' },
    { name: 'Tự nhiên & Xã hội', percent: 60, color: 'bg-yellow-500' },
    { name: 'Hoạt động trải nghiệm', percent: 90, color: 'bg-purple-500' },
  ];

  // Monthly Stacked Data (Count of T, H, C)
  const monthlyData = [
    { month: 'T9', t: 8, h: 10, c: 0 },
    { month: 'T10', t: 10, h: 8, c: 1 },
    { month: 'T11', t: 12, h: 6, c: 0 },
    { month: 'T12', t: 9, h: 10, c: 1 },
    { month: 'T1', t: 15, h: 5, c: 0 },
  ];

  const feedbackTimeline = [
    { id: 1, date: '15/10/2023', subject: 'Toán', level: 'T', comment: 'Em làm bài rất tốt, tính toán nhanh và chính xác.' },
    { id: 2, date: '12/10/2023', subject: 'Tiếng Việt', level: 'H', comment: 'Chữ viết có tiến bộ, cần chú ý lỗi chính tả.' },
    { id: 3, date: '05/10/2023', subject: 'Toán', level: 'C', comment: 'Chưa thuộc bảng cửu chương 7, cần ôn tập thêm ở nhà.' },
    { id: 4, date: '28/09/2023', subject: 'Tự nhiên & Xã hội', level: 'T', comment: 'Hăng hái phát biểu xây dựng bài.' },
  ];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const allStudents = await dataProvider.getAllStudents();
      const found = allStudents.find(s => s.id === id);
      setStudent(found || null);

      if (found && found.classId) {
        const classes = await dataProvider.getClasses();
        const cls = classes.find(c => c.id === found.classId);
        setStudentClass(cls || null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải hồ sơ...</div>;
  if (!student) return <div className="p-6">Không tìm thấy học sinh.</div>;

  const filteredTimeline = timelineFilter === 'All' 
    ? feedbackTimeline 
    : feedbackTimeline.filter(item => item.subject === timelineFilter);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'T': return 'bg-green-500 text-white border-green-200';
      case 'H': return 'bg-blue-500 text-white border-blue-200';
      case 'C': return 'bg-red-500 text-white border-red-200';
      default: return 'bg-gray-400';
    }
  };

  const getLevelBadge = (level: string) => {
      switch (level) {
        case 'T': return 'Hoàn thành tốt';
        case 'H': return 'Hoàn thành';
        case 'C': return 'Chưa hoàn thành';
        default: return '';
      }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto pb-20">
      {/* Navigation */}
      <button 
        onClick={() => navigate('/admin/students')} 
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium mb-2"
      >
        <ArrowLeft size={20} />
        <span>Quay lại danh sách lớp</span>
      </button>

      {/* 1. Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-50">
              <img src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}`} alt={student.name} className="w-full h-full object-cover" />
           </div>
           <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
             <p className="text-blue-600 font-medium">Học sinh Lớp {studentClass?.name || 'N/A'}</p>
           </div>
           
           <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                 <Calendar size={16} className="text-gray-400" />
                 <span>Ngày sinh: <span className="font-semibold text-gray-800">{student.dob || 'Chưa cập nhật'}</span></span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                 <Phone size={16} className="text-gray-400" />
                 <span>Phụ huynh: <span className="font-semibold text-gray-800">{student.parentPhone || 'Chưa cập nhật'}</span></span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                 <MapPin size={16} className="text-gray-400" />
                 <span>Mã học sinh: <span className="font-mono font-semibold text-gray-800">{student.username.toUpperCase()}</span></span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Learning Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
           <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             <BookOpen className="text-blue-600" />
             Tiến độ chương trình
           </h2>
           <div className="space-y-6">
              {subjectProgress.map((sub, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                    <span className="text-sm font-bold text-gray-900">{sub.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${sub.color}`} style={{ width: `${sub.percent}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* 3. Monthly Performance Chart (Stacked Bar - No Scores) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Biểu đồ sức học từng tháng</h2>
                <p className="text-sm text-gray-500">Thống kê mức độ hoàn thành (Thông tư 27)</p>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Hoàn thành tốt</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Hoàn thành</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Chưa hoàn thành</div>
              </div>
           </div>

           {/* Custom CSS Stacked Chart */}
           <div className="h-64 flex items-end justify-between gap-4 px-4 pt-4 border-b border-gray-200">
              {monthlyData.map((data, idx) => {
                const total = data.t + data.h + data.c;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                     {/* The Stacked Bar */}
                     <div className="w-full max-w-[40px] bg-gray-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full relative hover:opacity-90 transition-opacity cursor-pointer">
                        {/* C segment */}
                        <div style={{ height: `${(data.c / total) * 100}%` }} className="bg-red-500 w-full transition-all duration-500"></div>
                        {/* H segment */}
                        <div style={{ height: `${(data.h / total) * 100}%` }} className="bg-blue-500 w-full transition-all duration-500"></div>
                        {/* T segment */}
                        <div style={{ height: `${(data.t / total) * 100}%` }} className="bg-green-500 w-full transition-all duration-500"></div>
                     </div>
                     <span className="text-sm font-bold text-gray-600">{data.month}</span>
                  </div>
                );
              })}
           </div>
           <div className="text-center text-xs text-gray-400 mt-2 italic">
              * Biểu đồ thể hiện số lượng bài tập/hoạt động đạt từng mức đánh giá.
           </div>
        </div>
      </div>

      {/* 4. Feedback Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <h2 className="text-lg font-bold text-gray-900">Lịch sử nhận xét của giáo viên</h2>
           
           <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg">
              <Filter size={16} className="text-gray-400" />
              <select 
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
                value={timelineFilter}
                onChange={(e) => setTimelineFilter(e.target.value)}
              >
                <option value="All">Tất cả môn học</option>
                <option value="Toán">Toán</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
              </select>
           </div>
        </div>

        <div className="p-6 md:p-8">
           <div className="relative border-l-2 border-gray-200 space-y-8 pl-8 md:pl-10">
              {filteredTimeline.map((item) => (
                <div key={item.id} className="relative group">
                   {/* Timeline Dot */}
                   <div className={`
                      absolute -left-[41px] md:-left-[49px] top-0 
                      w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center font-bold text-sm
                      ${getLevelColor(item.level)}
                   `}>
                      {item.level}
                   </div>

                   {/* Content */}
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow hover:bg-white hover:border-blue-100">
                      <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-1">
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-900">{item.subject}</span>
                           <span className="text-gray-400">•</span>
                           <span className="text-sm text-gray-500">{item.date}</span>
                         </div>
                         <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase w-fit ${getLevelColor(item.level).replace('text-white', '').replace('border-', 'text-').replace('bg-', 'bg-opacity-20 text-')}`}>
                           {getLevelBadge(item.level)}
                         </span>
                      </div>
                      <p className="text-gray-700">"{item.comment}"</p>
                   </div>
                </div>
              ))}
              
              {filteredTimeline.length === 0 && (
                <div className="text-gray-500 italic">Không có nhận xét nào cho môn học này.</div>
              )}
           </div>
        </div>
      </div>

    </div>
  );
};

export default StudentProfile;