import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, CheckCircle, Clock } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Assignment, Submission, User, AssessmentLevel, SubmissionStatus } from '../../types';
import Modal from '../../components/Modal';

interface StudentSubmission {
  student: User;
  submission?: Submission;
}

const Grading = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [items, setItems] = useState<StudentSubmission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGrading, setCurrentGrading] = useState<{
    submissionId?: string,
    studentName: string,
    content: string,
    grade: number,
    assessment: AssessmentLevel,
    feedback: string
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const assign = await dataProvider.getAssignmentById(id);
      if (assign) {
        setAssignment(assign);
        const subs = await dataProvider.getSubmissionsByAssignment(id);
        setItems(subs);
      }
    };
    loadData();
  }, [id]);

  const openGradeModal = (item: StudentSubmission) => {
    if (!item.submission) return; // Cannot grade if no submission
    setCurrentGrading({
      submissionId: item.submission.id,
      studentName: item.student.name,
      content: item.submission.content,
      grade: item.submission.grade || 0,
      assessment: item.submission.assessment || AssessmentLevel.HT,
      feedback: item.submission.feedback || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!currentGrading || !currentGrading.submissionId) return;
    
    await dataProvider.gradeSubmission(
      currentGrading.submissionId,
      currentGrading.grade,
      currentGrading.assessment,
      currentGrading.feedback
    );

    setIsModalOpen(false);
    // Refresh list
    if (id) {
       const subs = await dataProvider.getSubmissionsByAssignment(id);
       setItems(subs);
    }
  };

  if (!assignment) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6">
      <button 
        onClick={() => navigate('/admin/assignments')} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 font-medium"
      >
        <ArrowLeft size={20} />
        <span>Quay lại danh sách bài tập</span>
      </button>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
        <p className="text-gray-600 mb-4">{assignment.description}</p>
        <div className="flex gap-6 text-sm">
          <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg">
            <strong>Tiêu chí:</strong> {assignment.rubric || 'Không có'}
          </div>
          <div className="bg-orange-50 text-orange-800 px-3 py-1 rounded-lg">
            <strong>Tổng số HS:</strong> {items.length}
          </div>
          <div className="bg-green-50 text-green-800 px-3 py-1 rounded-lg">
            <strong>Đã nộp:</strong> {items.filter(i => i.submission).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-gray-100 text-gray-600 text-sm font-semibold border-b border-gray-200">
               <th className="p-4">Học sinh</th>
               <th className="p-4">Trạng thái</th>
               <th className="p-4">Nội dung bài nộp</th>
               <th className="p-4">Điểm số</th>
               <th className="p-4">Đánh giá (TT27)</th>
               <th className="p-4 text-center">Hành động</th>
             </tr>
          </thead>
          <tbody>
            {items.map(({student, submission}) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {student.avatar ? <img src={student.avatar} className="w-full h-full rounded-full object-cover" /> : <UserIcon size={16} />}
                     </div>
                     <div>
                       <div className="font-medium text-gray-900">{student.name}</div>
                       <div className="text-xs text-gray-500">{student.username}</div>
                     </div>
                  </div>
                </td>
                <td className="p-4">
                  {submission ? (
                     <span className={`px-2 py-1 rounded text-xs font-bold ${submission.status === SubmissionStatus.GRADED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                       {submission.status === SubmissionStatus.GRADED ? 'Đã chấm' : 'Đã nộp'}
                     </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500">Chưa nộp</span>
                  )}
                </td>
                <td className="p-4 max-w-xs truncate text-gray-600">
                   {submission ? submission.content : '-'}
                </td>
                <td className="p-4 font-bold text-gray-900">
                   {submission?.grade !== undefined ? `${submission.grade}/${assignment.points || 10}` : '-'}
                </td>
                <td className="p-4">
                   {submission?.assessment || '-'}
                </td>
                <td className="p-4 text-center">
                   {submission ? (
                     <button 
                       onClick={() => openGradeModal({student, submission})}
                       className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                     >
                       {submission.status === SubmissionStatus.GRADED ? 'Sửa điểm' : 'Chấm điểm'}
                     </button>
                   ) : (
                     <span className="text-gray-400 text-sm">Đợi nộp</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentGrading && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Chấm bài: ${currentGrading.studentName}`}
          footer={
            <>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy bỏ</button>
              <button onClick={handleSaveGrade} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Lưu đánh giá</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bài làm của học sinh</label>
              <p className="text-gray-900 whitespace-pre-wrap">{currentGrading.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số (Thang 10)</label>
                 <input 
                   type="number" 
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                   value={currentGrading.grade}
                   onChange={(e) => setCurrentGrading({...currentGrading, grade: Number(e.target.value)})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ hoàn thành (TT27)</label>
                 <select 
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                   value={currentGrading.assessment}
                   onChange={(e) => setCurrentGrading({...currentGrading, assessment: e.target.value as AssessmentLevel})}
                 >
                   <option value={AssessmentLevel.HTT}>Hoàn thành tốt</option>
                   <option value={AssessmentLevel.HT}>Hoàn thành</option>
                   <option value={AssessmentLevel.CHT}>Chưa hoàn thành</option>
                 </select>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lời phê / Nhận xét</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                value={currentGrading.feedback}
                onChange={(e) => setCurrentGrading({...currentGrading, feedback: e.target.value})}
                placeholder="Nhập lời phê của giáo viên..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Grading;