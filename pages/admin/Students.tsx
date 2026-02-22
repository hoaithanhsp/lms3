import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dataProvider from '../../services/provider';
import { User, Class } from '../../types';
import Modal from '../../components/Modal';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Partial<User>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    const cls = await dataProvider.getClasses();
    setClasses(cls);
    const stds = await dataProvider.getAllStudents();
    setStudents(stds);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!currentStudent.name || !currentStudent.username || !currentStudent.classId) {
      alert("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }

    if (currentStudent.id) {
      await dataProvider.updateStudent(currentStudent.id, currentStudent);
    } else {
      await dataProvider.createStudent({
        name: currentStudent.name,
        username: currentStudent.username,
        password: currentStudent.password || '123456',
        classId: currentStudent.classId,
        dob: currentStudent.dob,
        parentPhone: currentStudent.parentPhone,
        role: 'STUDENT' as any
      });
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Xóa học sinh này khỏi hệ thống?")) {
      await dataProvider.deleteStudent(id);
      loadData();
    }
  };

  const openModal = (e: React.MouseEvent, student?: User) => {
    e.stopPropagation();
    setCurrentStudent(student || { name: '', username: '', password: '', classId: classes.length > 0 ? classes[0].id : '', parentPhone: '', dob: '' });
    setIsModalOpen(true);
  };

  const viewProfile = (id: string) => {
    navigate(`/admin/students/${id}`);
  };

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Học sinh</h1>
        <button 
          onClick={(e) => openModal(e)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Thêm học sinh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên hoặc tài khoản..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="all">Tất cả lớp học</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm font-semibold border-b border-gray-200">
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Ngày sinh</th>
                <th className="p-4">SĐT Phụ huynh</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map((std) => (
                <tr 
                  key={std.id} 
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => viewProfile(std.id)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={std.avatar || `https://ui-avatars.com/api/?name=${std.name}&background=random`} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">{std.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-sm">{std.username}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">
                      {classes.find(c => c.id === std.classId)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{std.dob || '-'}</td>
                  <td className="p-4 text-gray-600">{std.parentPhone || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); viewProfile(std.id); }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        title="Xem hồ sơ"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => openModal(e, std)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, std.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy học sinh nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentStudent.id ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy bỏ</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Lưu lại</button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentStudent.name || ''}
              onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản đăng nhập <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentStudent.username || ''}
              onChange={(e) => setCurrentStudent({...currentStudent, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentStudent.password || ''}
              onChange={(e) => setCurrentStudent({...currentStudent, password: e.target.value})}
              placeholder="Mặc định: 123456"
            />
          </div>

          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học <span className="text-red-500">*</span></label>
             <select 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
               value={currentStudent.classId || ''}
               onChange={(e) => setCurrentStudent({...currentStudent, classId: e.target.value})}
             >
               <option value="">-- Chọn lớp --</option>
               {classes.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentStudent.dob || ''}
              onChange={(e) => setCurrentStudent({...currentStudent, dob: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT Phụ huynh</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentStudent.parentPhone || ''}
              onChange={(e) => setCurrentStudent({...currentStudent, parentPhone: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;