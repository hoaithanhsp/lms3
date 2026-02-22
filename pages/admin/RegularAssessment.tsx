import React, { useEffect, useState } from 'react';
import { Save, Filter, Calendar, Book, Users } from 'lucide-react';
import dataProvider from '../../services/provider';
import { User, Class, Subject, Assignment } from '../../types';

// Types specific to this view
type AssessmentLevel = 'T' | 'H' | 'C'; // T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành

interface AssessmentEntry {
  studentId: string;
  level: AssessmentLevel | null;
  comment: string;
}

const RegularAssessment = () => {
  // Filter States
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('week_9');

  // Data States
  const [students, setStudents] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Record<string, AssessmentEntry>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Assignments
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const all = await dataProvider.getAllAssignments();
        setAssignments(all);
      } catch (error) {
        console.error("Failed to load assignments:", error);
      }
    };
    loadAssignments();
  }, []);

  // Load Initial Filter Data
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

  // Load Students and Mock Assessment Data when Class Changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClassId) return;
      setLoading(true);
      
      const list = await dataProvider.getStudentsByClass(selectedClassId);
      setStudents(list);

      // MOCK DATA: Pre-fill some assessments to simulate existing data
      const mockAssessments: Record<string, AssessmentEntry> = {};
      
      list.forEach((student, index) => {
        // Randomly assign some data for demo purposes
        if (index % 3 === 0) {
          mockAssessments[student.id] = { studentId: student.id, level: 'T', comment: 'Em tiếp thu bài rất nhanh, tích cực phát biểu.' };
        } else if (index % 3 === 1) {
          mockAssessments[student.id] = { studentId: student.id, level: 'H', comment: 'Làm bài đầy đủ nhưng cần cẩn thận hơn khi tính toán.' };
        } else {
           // Leave empty for some
           mockAssessments[student.id] = { studentId: student.id, level: null, comment: '' };
        }
      });
      setAssessments(mockAssessments);
      
      setLoading(false);
    };
    loadStudents();
  }, [selectedClassId, selectedSubjectId, selectedTime]);

  const handleLevelChange = (studentId: string, level: AssessmentLevel) => {
    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        level
      }
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        comment
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    console.log("--- BẮT ĐẦU LƯU ĐÁNH GIÁ ---");
    console.log("Dữ liệu hiện tại (assessments):", assessments);
    console.log("Thông tin ngữ cảnh:", { selectedClassId, selectedSubjectId, selectedTime });

    try {
      // 1. TÌM ASSIGNMENT ID
      // Map selectedTime (ví dụ 'week_9') sang từ khóa tìm kiếm (ví dụ 'Tuần 9')
      const timeToTitleMap: Record<string, string> = {
        'week_9': 'Tuần 9',
        'week_10': 'Tuần 10',
        'month_10': 'Tháng 10',
        'mid_term_1': 'Giữa kỳ 1'
      };
      const searchKeyword = timeToTitleMap[selectedTime] || selectedTime;
      
      console.log(`Đang tìm Assignment với từ khóa: "${searchKeyword}"`);

      // Tìm bài tập có tiêu đề chứa từ khóa
      const targetAssignment = assignments.find(a => 
        a.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );

      if (!targetAssignment) {
        console.error("LỖI: Không tìm thấy AssignmentId tương ứng cho đợt này!");
        console.log("Danh sách Assignment hiện có:", assignments.map(a => ({id: a.id, title: a.title})));
        alert(`Không tìm thấy bài tập đánh giá tương ứng cho "${searchKeyword}".\nVui lòng tạo bài tập có tên chứa "${searchKeyword}" trong mục Bài tập.`);
        setLoading(false);
        return;
      }

      console.log("Đã tìm thấy Assignment:", targetAssignment);

      // 2. LẤY DANH SÁCH SUBMISSION HIỆN CÓ
      // Để biết học sinh nào đã có submission rồi, học sinh nào chưa
      const existingData = await dataProvider.getSubmissionsByAssignment(targetAssignment.id);
      console.log("Submissions hiện có:", existingData);

      // 3. DUYỆT QUA DANH SÁCH ĐÁNH GIÁ VÀ LƯU
      const updates = Object.values(assessments).filter(entry => entry.level || entry.comment);
      console.log(`Có ${updates.length} học sinh cần lưu đánh giá.`);

      let successCount = 0;

      for (const entry of updates) {
        if (!entry.studentId) continue;

        console.log(`Đang xử lý học sinh: ${entry.studentId}`, entry);

        try {
            // Tìm submission của học sinh này
            const existingSubmission = existingData.find(s => s.student.id === entry.studentId)?.submission;
            let submissionId = existingSubmission?.id;

            // Nếu chưa có submission -> Tạo mới (evaluations.add)
            if (!submissionId) {
                console.log(`Học sinh ${entry.studentId} chưa có submission -> Tạo mới...`);
                const newSub = await dataProvider.submitAssignment({
                    assignmentId: targetAssignment.id,
                    studentId: entry.studentId,
                    content: "Đánh giá thường xuyên" // Nội dung mặc định
                });
                submissionId = newSub.id;
                console.log(`Đã tạo submission mới: ${submissionId}`);
            }

            // Cập nhật đánh giá (evaluations.grade)
            // Lưu ý: Hàm gradeSubmission trong sheetProvider đang map:
            // assessment -> assessmentLevel
            // feedback -> teacherFeedback
            await dataProvider.gradeSubmission(
                submissionId,
                10, // Grade (điểm số), có thể để mặc định hoặc map từ Level
                entry.level || 'C', // Assessment Level (T/H/C)
                entry.comment || '' // Teacher Comment
            );
            console.log(`-> Lưu thành công cho học sinh ${entry.studentId}`);
            successCount++;

        } catch (err) {
            console.error(`LỖI khi lưu học sinh ${entry.studentId}:`, err);
        }
      }

      if (successCount > 0) {
        alert(`Đã lưu thành công đánh giá cho ${successCount} học sinh!`);
      } else {
        alert("Không có dữ liệu nào được lưu. Vui lòng kiểm tra lại.");
      }
      
    } catch (error) {
      console.error("LỖI CHUNG KHI LƯU:", error);
      alert("Có lỗi xảy ra khi lưu đánh giá. Vui lòng xem console để biết chi tiết.");
    } finally {
      setLoading(false);
      console.log("--- KẾT THÚC LƯU ĐÁNH GIÁ ---");
    }
  };

  const LevelButton = ({ current, target, label, colorClass, onClick }: any) => (
    <button
      onClick={onClick}
      className={`
        w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm transition-all
        ${current === target 
          ? `${colorClass} text-white shadow-md scale-110 border-transparent` 
          : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'}
      `}
      title={label}
    >
      {target}
    </button>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sổ đánh giá thường xuyên</h1>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi và đánh giá sự tiến bộ của học sinh theo Thông tư 27.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
        >
          <Save size={20} />
          <span>Lưu đánh giá</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
          <select 
            className="flex-1 md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Book size={20} /></div>
          <select 
            className="flex-1 md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-green-50 p-2 rounded-lg text-green-600"><Calendar size={20} /></div>
          <select 
            className="flex-1 md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="week_9">Tuần 9 (Tháng 10)</option>
            <option value="week_10">Tuần 10 (Tháng 10)</option>
            <option value="month_10">Đánh giá Tháng 10</option>
            <option value="mid_term_1">Giữa Học kỳ 1</option>
          </select>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600 w-16 text-center">STT</th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600 min-w-[200px]">Họ và tên học sinh</th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600 min-w-[250px]">
                  Mức độ hoàn thành
                  <div className="text-[10px] font-normal text-gray-500 mt-1">
                    (T: Tốt, H: Hoàn thành, C: Chưa hoàn thành)
                  </div>
                </th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600 min-w-[300px]">Nhận xét sự tiến bộ, năng lực, phẩm chất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Đang tải danh sách...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Chưa có học sinh trong lớp này.</td></tr>
              ) : (
                students.map((student, index) => {
                  const entry = assessments[student.id] || { level: null, comment: '' };
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 text-center font-medium text-gray-500">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{student.name}</div>
                        <div className="text-xs text-gray-400 hidden group-hover:block">{student.username}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <LevelButton 
                            current={entry.level} target="T" label="Hoàn thành tốt" 
                            colorClass="bg-blue-600"
                            onClick={() => handleLevelChange(student.id, 'T')} 
                          />
                          <LevelButton 
                            current={entry.level} target="H" label="Hoàn thành" 
                            colorClass="bg-yellow-500"
                            onClick={() => handleLevelChange(student.id, 'H')} 
                          />
                          <LevelButton 
                            current={entry.level} target="C" label="Chưa hoàn thành" 
                            colorClass="bg-red-500"
                            onClick={() => handleLevelChange(student.id, 'C')} 
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <textarea 
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-16 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="Nhập nhận xét..."
                          value={entry.comment}
                          onChange={(e) => handleCommentChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
           <span>Tổng số: {students.length} học sinh</span>
           <span>Hệ thống tự động lưu nháp mỗi 5 phút.</span>
        </div>
      </div>
    </div>
  );
};

export default RegularAssessment;