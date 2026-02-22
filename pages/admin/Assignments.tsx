import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dataProvider from '../../services/provider';
import { Assignment, AssignmentType, Lesson } from '../../types';
import Modal from '../../components/Modal';

const AdminAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]); // To map Lesson names if needed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  
  // Helpers
  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
  };

  const loadData = async () => {
    const data = await dataProvider.getAllAssignments();
    setAssignments(data);
    // In a real app we might fetch topics -> lessons to populate a select box
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!currentAssignment.title || !currentAssignment.dueDate) {
      alert("Vui lòng nhập tiêu đề và hạn nộp");
      return;
    }

    const payload = {
      ...currentAssignment,
      type: currentAssignment.type || AssignmentType.ESSAY,
      points: currentAssignment.points || 10,
      lessonId: currentAssignment.lessonId || '', // Optional
    };

    if (currentAssignment.id) {
      await dataProvider.updateAssignment(currentAssignment.id, payload);
    } else {
      await dataProvider.createAssignment(payload as Assignment);
    }
    
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa bài tập này? Dữ liệu bài nộp của học sinh cũng sẽ bị ảnh hưởng.")) {
      await dataProvider.deleteAssignment(id);
      loadData();
    }
  };

  const openModal = (assign?: Assignment) => {
    setCurrentAssignment(assign || { 
      title: '', 
      description: '', 
      type: AssignmentType.ESSAY, 
      points: 10,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rubric: ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài tập</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Tạo bài tập</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignments.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
            Chưa có bài tập nào. Hãy tạo bài tập mới!
          </div>
        ) : (
          assignments.map(assign => (
            <div key={assign.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${assign.type === AssignmentType.FILE ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                    {assign.type === AssignmentType.FILE ? 'Nộp File' : 'Tự luận'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{assign.title}</h3>
                </div>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{assign.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}</span>
                  <span>•</span>
                  <span>Điểm tối đa: {assign.points}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                 <button 
                  onClick={() => navigate(`/admin/assignments/${assign.id}/grade`)}
                  className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors min-w-[80px]"
                >
                  <ClipboardList size={20} className="mb-1" />
                  <span className="text-xs font-bold">Chấm bài</span>
                </button>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => openModal(assign)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    title="Sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(assign.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentAssignment.id ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy bỏ</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Lưu lại</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài tập <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentAssignment.title || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
              placeholder="VD: Bài tập về nhà..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Đề bài</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              value={currentAssignment.description || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài tập</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={currentAssignment.type}
                onChange={(e) => setCurrentAssignment({...currentAssignment, type: e.target.value as AssignmentType})}
              >
                <option value={AssignmentType.ESSAY}>Tự luận (Nhập text)</option>
                <option value={AssignmentType.FILE}>Nộp File/Link</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tối đa</label>
               <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentAssignment.points || 10}
                onChange={(e) => setCurrentAssignment({...currentAssignment, points: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp <span className="text-red-500">*</span></label>
             <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formatDate(currentAssignment.dueDate || '')}
              onChange={(e) => setCurrentAssignment({...currentAssignment, dueDate: new Date(e.target.value).toISOString()})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu chí chấm điểm (Rubric)</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              value={currentAssignment.rubric || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, rubric: e.target.value})}
              placeholder="VD: Đúng chính tả (2đ), Đủ ý (8đ)..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAssignments;