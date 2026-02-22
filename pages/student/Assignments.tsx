import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, CheckCircle, Star, Smile } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Assignment, Submission, SubmissionStatus, AssessmentLevel } from '../../types';

interface AssignmentItem {
  assignment: Assignment;
  submission?: Submission;
}

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'DONE'>('ALL');

  useEffect(() => {
    const load = async () => {
      const u = await dataProvider.getCurrentUser();
      if (u) {
        const data = await dataProvider.getMyAssignments(u.id);
        setItems(data);
      }
    };
    load();
  }, []);

  const getStatusColor = (item: AssignmentItem) => {
    if (item.submission) {
      if (item.submission.status === SubmissionStatus.GRADED) return 'bg-green-100 text-green-700 ring-1 ring-green-200';
      return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
    }
    const isLate = new Date() > new Date(item.assignment.dueDate);
    if (isLate) return 'bg-red-100 text-red-700 ring-1 ring-red-200';
    return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200';
  };

  const getStatusText = (item: AssignmentItem) => {
    if (item.submission) {
       if (item.submission.status === SubmissionStatus.GRADED) return 'Đã được cô khen';
       return 'Đã nộp bài';
    }
    const isLate = new Date() > new Date(item.assignment.dueDate);
    if (isLate) return 'Đã quá hạn';
    return 'Cần làm ngay';
  };

  const renderReward = (submission: Submission) => {
     if (submission.assessment === AssessmentLevel.HTT) {
       return (
         <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
           <div className="flex text-yellow-500">
             <Star size={16} fill="currentColor" className="animate-pulse" />
             <Star size={16} fill="currentColor" className="animate-bounce delay-75" />
             <Star size={16} fill="currentColor" className="animate-pulse delay-150" />
           </div>
           <span className="text-xs font-bold text-yellow-700 ml-1">Xuất sắc!</span>
         </div>
       );
     }
     if (submission.assessment === AssessmentLevel.HT) {
        return (
          <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            <Star size={16} fill="currentColor" className="text-yellow-500" />
            <span className="text-xs font-bold text-blue-700 ml-1">Làm tốt lắm!</span>
          </div>
        );
     }
     return (
        <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          <Smile size={16} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-600 ml-1">Cố gắng lên!</span>
        </div>
     );
  };

  const filteredItems = items.filter(item => {
    if (filter === 'TODO') return !item.submission;
    if (filter === 'DONE') return !!item.submission;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
         <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
            <FileText size={32} />
         </div>
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Bài tập của em</h1>
            <p className="text-gray-500 text-sm font-medium">Hoàn thành bài tập để nhận thật nhiều Sao nhé!</p>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setFilter('TODO')}
          className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${filter === 'TODO' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Chưa làm
        </button>
        <button 
          onClick={() => setFilter('DONE')}
          className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${filter === 'DONE' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Đã nộp
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
           <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
             <div className="mb-2 text-6xl">🌟</div>
             <p className="font-medium">Không có bài tập nào ở đây cả.</p>
           </div>
        ) : (
          filteredItems.map(({ assignment, submission }) => (
            <div 
              key={assignment.id}
              onClick={() => navigate(`/app/assignments/${assignment.id}`)}
              className="bg-white p-5 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center group gap-4"
            >
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl flex-shrink-0 transition-colors ${submission ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                  {submission ? <CheckCircle size={28} /> : <FileText size={28} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{assignment.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 font-medium">
                     <span className="flex items-center gap-1">
                       <Calendar size={16} />
                       Hạn: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                     </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pl-16 md:pl-0">
                 {/* Show Reward if Graded */}
                 {submission && submission.status === SubmissionStatus.GRADED && renderReward(submission)}

                 <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${getStatusColor({assignment, submission})}`}>
                   {getStatusText({assignment, submission})}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;