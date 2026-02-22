import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Send, Paperclip, Star, Smile, Gift } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Assignment, Submission, User, AssignmentType, SubmissionStatus, AssessmentLevel } from '../../types';

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const u = await dataProvider.getCurrentUser();
      setUser(u);
      
      const assign = await dataProvider.getAssignmentById(id);
      if (assign) setAssignment(assign);

      if (u && assign) {
        const myAssigns = await dataProvider.getMyAssignments(u.id);
        const found = myAssigns.find(a => a.assignment.id === id);
        if (found?.submission) {
          setSubmission(found.submission);
          setContent(found.submission.content);
        }
      }
    };
    load();
  }, [id]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung bài làm");
      return;
    }
    if (!user || !assignment) return;

    setSubmitting(true);
    const sub = await dataProvider.submitAssignment({
      assignmentId: assignment.id,
      studentId: user.id,
      content: content
    });
    setSubmission(sub);
    setSubmitting(false);
    alert("Nộp bài thành công!");
  };

  const renderGamifiedResult = (sub: Submission) => {
     let icon, title, colorClass, textColor, bgClass;
     
     if (sub.assessment === AssessmentLevel.HTT) {
        title = "Cô khen!";
        bgClass = "bg-green-50 border-green-200";
        textColor = "text-green-700";
        icon = (
          <div className="flex gap-2 mb-2">
            <Star size={40} fill="#FCD34D" className="text-yellow-400 animate-[bounce_1s_infinite]" />
            <Star size={48} fill="#FCD34D" className="text-yellow-400 animate-[bounce_1s_infinite_100ms] -mt-4" />
            <Star size={40} fill="#FCD34D" className="text-yellow-400 animate-[bounce_1s_infinite_200ms]" />
          </div>
        );
     } else if (sub.assessment === AssessmentLevel.HT) {
        title = "Làm tốt lắm!";
        bgClass = "bg-blue-50 border-blue-200";
        textColor = "text-blue-700";
        icon = (
          <div className="mb-2">
            <Star size={48} fill="#FCD34D" className="text-yellow-400 animate-pulse" />
          </div>
        );
     } else {
        title = "Cùng cố gắng nhé!";
        bgClass = "bg-orange-50 border-orange-200";
        textColor = "text-orange-700";
        icon = (
          <div className="mb-2">
            <Smile size={48} className="text-orange-400" />
          </div>
        );
     }

     return (
        <div className={`p-6 rounded-3xl border-2 ${bgClass} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
           <div className="absolute top-0 left-0 w-full h-full bg-white opacity-40 blur-xl"></div>
           <div className="relative z-10 flex flex-col items-center">
              {icon}
              <h2 className={`text-2xl font-black ${textColor} uppercase tracking-wider mb-2`}>{title}</h2>
              <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-white/50 w-full">
                 <p className="text-gray-500 text-xs font-bold uppercase mb-1">Lời cô dặn</p>
                 <p className="text-gray-800 font-medium italic">"{sub.feedback}"</p>
              </div>
           </div>
        </div>
     );
  };

  if (!assignment) return <div className="p-6">Đang tải...</div>;

  const isGraded = submission?.status === SubmissionStatus.GRADED;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      <button 
        onClick={() => navigate('/app/assignments')} 
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 w-fit"
      >
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Assignment Info */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-gray-100">
              <div className="flex justify-between items-start mb-4">
                 <h1 className="text-2xl font-extrabold text-gray-900">{assignment.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl w-fit">
                 <span className="flex items-center gap-2"><Calendar size={18} className="text-blue-500"/> Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Đề bài:</h3>
              <div className="text-gray-700 whitespace-pre-wrap bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-50 text-base leading-relaxed">
                {assignment.description}
              </div>

              {assignment.rubric && (
                <div className="mt-6">
                   <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                      <Gift size={16} className="text-pink-500"/> Phần thưởng & Tiêu chí:
                   </h3>
                   <p className="text-sm text-gray-600 bg-pink-50 p-3 rounded-xl border border-pink-100">{assignment.rubric}</p>
                </div>
              )}
           </div>

           {/* Grading Result (Gamified) */}
           {isGraded && submission && renderGamifiedResult(submission)}
        </div>

        {/* Right: Submission Form */}
        <div>
           <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-blue-100 sticky top-20">
             <h3 className="font-bold text-gray-900 mb-4 text-lg">Bài làm của em</h3>
             
             {isGraded ? (
               <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 text-gray-600 font-medium">
                 {submission?.content}
               </div>
             ) : (
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">
                     {assignment.type === AssignmentType.FILE ? 'Dán liên kết (Link) bài làm:' : 'Nhập câu trả lời của em:'}
                   </label>
                   {assignment.type === AssignmentType.FILE ? (
                     <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-3 bg-white focus-within:border-blue-400 transition-colors">
                        <Paperclip size={20} className="text-gray-400" />
                        <input 
                          type="text" 
                          className="flex-1 outline-none text-sm font-medium"
                          placeholder="https://..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                     </div>
                   ) : (
                     <textarea 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 h-40 resize-none font-medium"
                        placeholder="Em hãy làm bài vào đây nhé..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                     />
                   )}
                 </div>
                 
                 <button 
                   onClick={handleSubmit}
                   disabled={submitting}
                   className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95"
                 >
                   {submitting ? 'Đang gửi...' : (submission ? 'Nộp lại bài' : 'Nộp bài ngay')}
                   {!submitting && <Send size={20} />}
                 </button>
                 
                 {submission && !isGraded && (
                   <p className="text-xs text-center text-gray-500 font-medium bg-gray-100 py-2 rounded-lg">
                     Em đã nộp bài vào {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                   </p>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;