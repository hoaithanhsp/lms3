import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Class } from '../../types';
import Modal from '../../components/Modal';

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<Partial<Class>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadClasses = async () => {
    const data = await dataProvider.getClasses();
    setClasses(data);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleSave = async () => {
    if (!currentClass.name || !currentClass.academicYear) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }

    if (currentClass.id) {
      // Edit
      await dataProvider.updateClass(currentClass.id, currentClass);
    } else {
      // Create - auto assign current teacher (mocking user u1)
      await dataProvider.createClass({
        name: currentClass.name,
        academicYear: currentClass.academicYear,
        teacherId: 'u1', 
        joinCode: currentClass.joinCode || Math.random().toString(36).substr(2, 6).toUpperCase()
      });
    }
    setIsModalOpen(false);
    loadClasses();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa lớp này?")) {
      await dataProvider.deleteClass(id);
      loadClasses();
    }
  };

  const openModal = (cls?: Class) => {
    setCurrentClass(cls || { name: '', academicYear: '', joinCode: '' });
    setIsModalOpen(true);
  };

  const filteredClasses = classes.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.joinCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Lớp học</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Thêm lớp mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên lớp hoặc mã..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm font-semibold border-b border-gray-200">
                <th className="p-4">Tên lớp</th>
                <th className="p-4">Niên khóa</th>
                <th className="p-4">Giáo viên CN</th>
                <th className="p-4">Mã tham gia</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length > 0 ? filteredClasses.map((cls) => (
                <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{cls.name}</td>
                  <td className="p-4 text-gray-600">{cls.academicYear}</td>
                  <td className="p-4 text-gray-600">Nguyễn Thị Lan</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono font-bold">
                      {cls.joinCode}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openModal(cls)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cls.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Không tìm thấy lớp học nào.
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
        title={currentClass.id ? "Cập nhật thông tin lớp" : "Thêm lớp học mới"}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy bỏ</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Lưu lại</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentClass.name || ''}
              onChange={(e) => setCurrentClass({...currentClass, name: e.target.value})}
              placeholder="VD: 3A1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niên khóa <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentClass.academicYear || ''}
              onChange={(e) => setCurrentClass({...currentClass, academicYear: e.target.value})}
              placeholder="VD: 2023-2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã tham gia (Tự động nếu để trống)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentClass.joinCode || ''}
              onChange={(e) => setCurrentClass({...currentClass, joinCode: e.target.value})}
              placeholder="VD: TOAN3A1"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Classes;