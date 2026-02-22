import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Folder, FileText, Image, Video,
  Share2, MoreVertical, Download, PieChart, FileCheck
} from 'lucide-react';
import Modal from '../../components/Modal';
import dataProvider from '../../services/provider';
import { Class } from '../../types';

interface Resource {
  id: string;
  name: string;
  type: 'doc' | 'image' | 'video' | 'chart' | 'exam';
  thumbnail: string;
  date: string;
  size: string;
  category: string;
  tags: string[];
}

const ResourceBank = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [targetClassId, setTargetClassId] = useState('');

  // New Upload States
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState('doc');
  const [newResourceCategory, setNewResourceCategory] = useState('Giáo án');

  // Initial Data Load
  useEffect(() => {
    const loadClasses = async () => {
      const cls = await dataProvider.getClasses();
      setClasses(cls);
      if (cls.length > 0) setTargetClassId(cls[0].id);
    };
    loadClasses();

    // Mock Resources Data
    const mockResources: Resource[] = [
      { id: '1', name: 'Giáo án Toán tuần 10 - Phép nhân', type: 'doc', thumbnail: '', date: '20/10/2023', size: '1.2 MB', category: 'Giáo án', tags: ['Toán 3', 'Tuần 10'] },
      { id: '2', name: 'Đề thi giữa kỳ 1 Toán 3 (Đề 1)', type: 'exam', thumbnail: '', date: '15/10/2023', size: '500 KB', category: 'Đề thi', tags: ['Toán 3', 'Giữa kỳ'] },
      { id: '3', name: 'Nhân vật hoạt hình 3D Pixar (Tách nền)', type: 'image', thumbnail: 'https://picsum.photos/id/64/300/200', date: '05/10/2023', size: '2.5 MB', category: 'Hình ảnh', tags: ['Minh họa', '3D'] },
      { id: '4', name: 'Video hướng dẫn đặt tính rồi tính', type: 'video', thumbnail: 'https://picsum.photos/id/96/300/200', date: '01/10/2023', size: '45 MB', category: 'Video', tags: ['Toán 3', 'Video'] },
      { id: '5', name: 'Biểu đồ tóm tắt kiến thức hình học', type: 'chart', thumbnail: 'https://picsum.photos/id/20/300/200', date: '28/09/2023', size: '1.8 MB', category: 'Biểu đồ', tags: ['Toán 3', 'Infographic'] },
      { id: '6', name: 'SKKN: Phương pháp dạy tính nhẩm', type: 'doc', thumbnail: '', date: '10/09/2023', size: '3.0 MB', category: 'Sáng kiến', tags: ['Phương pháp', 'Giáo viên'] },
    ];
    setResources(mockResources);
  }, []);

  const folders = [
    { name: 'Giáo án & Kế hoạch', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { name: 'Đề thi chất lượng cao', icon: FileCheck, color: 'bg-red-100 text-red-600' },
    { name: 'Sáng kiến kinh nghiệm', icon: Folder, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Hình ảnh minh họa 3D', icon: Image, color: 'bg-purple-100 text-purple-600' },
    { name: 'Biểu đồ & Infographic', icon: PieChart, color: 'bg-green-100 text-green-600' },
    { name: 'Video bài giảng', icon: Video, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const handlePushToClass = () => {
    if (!selectedResource || !targetClassId) return;
    const clsName = classes.find(c => c.id === targetClassId)?.name;
    alert(`Đã đẩy tài liệu "${selectedResource.name}" vào lớp ${clsName} thành công!`);
    setIsPushModalOpen(false);
  };

  const handleUpload = () => {
    if (!newResourceName) {
      alert("Vui lòng nhập tên tài liệu!");
      return;
    }
    const newRes: Resource = {
      id: Date.now().toString(),
      name: newResourceName,
      type: newResourceType as any,
      thumbnail: '',
      date: new Date().toLocaleDateString('vi-VN'),
      size: '1.2 MB',
      category: newResourceCategory,
      tags: ['Mới']
    };
    setResources([newRes, ...resources]);
    setIsUploadModalOpen(false);
    setNewResourceName('');
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'doc': return <FileText size={40} className="text-blue-500" />;
      case 'image': return <Image size={40} className="text-purple-500" />;
      case 'video': return <Video size={40} className="text-red-500" />;
      case 'chart': return <PieChart size={40} className="text-green-500" />;
      case 'exam': return <FileCheck size={40} className="text-orange-500" />;
      default: return <FileText size={40} className="text-gray-500" />;
    }
  };

  const openPushModal = (res: Resource) => {
    setSelectedResource(res);
    setIsPushModalOpen(true);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 space-y-8">

      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ngân hàng học liệu</h1>
          <p className="text-gray-500 text-sm">Kho lưu trữ, quản lý và tái sử dụng tài nguyên giáo dục.</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-medium"
        >
          <Plus size={20} />
          <span>Tải lên học liệu</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, giáo án, video..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 min-w-[140px]">
            <Filter size={16} className="text-gray-500" />
            <select className="bg-transparent outline-none text-sm font-medium text-gray-700 w-full cursor-pointer">
              <option>Môn học: Tất cả</option>
              <option>Toán 3</option>
              <option>Tiếng Việt 3</option>
              <option>HĐ Trải nghiệm</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 min-w-[140px]">
            <select className="bg-transparent outline-none text-sm font-medium text-gray-700 w-full cursor-pointer">
              <option>Loại: Tất cả</option>
              <option>Văn bản (Doc/PDF)</option>
              <option>Hình ảnh</option>
              <option>Video</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Category Folders */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-900">Danh mục Thư mục</h2>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Xóa bộ lọc thư mục <x size={14} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {folders.map((folder, idx) => {
          const isActive = selectedCategory === folder.name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedCategory(isActive ? null : folder.name)}
              className={`p-4 rounded-xl shadow-sm border transition-all cursor-pointer flex flex-col items-center text-center gap-3 group ${isActive
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-white border-gray-200 hover:shadow-md'
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${folder.color} group-hover:scale-110 transition-transform`}>
                <folder.icon size={24} />
              </div>
              <span className={`text-sm font-bold leading-tight ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                {folder.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Resource Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources
          .filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()))
          .filter(r => {
            if (!selectedCategory) return true;
            // Map folder names to resource categories roughly for the mock data
            const folderMap: Record<string, string[]> = {
              'Giáo án & Kế hoạch': ['Giáo án'],
              'Đề thi chất lượng cao': ['Đề thi', 'Bài tập'],
              'Sáng kiến kinh nghiệm': ['Sáng kiến', 'Tham khảo'],
              'Hình ảnh minh họa 3D': ['Hình ảnh'],
              'Biểu đồ & Infographic': ['Biểu đồ'],
              'Video bài giảng': ['Video']
            };
            const validCategories = folderMap[selectedCategory] || [];
            return validCategories.includes(r.category);
          })
          .map(resource => (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group relative">
              {/* Thumbnail Area */}
              <div className="h-40 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {resource.thumbnail ? (
                  <img src={resource.thumbnail} alt={resource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gray-50 w-full h-full flex items-center justify-center">
                    {getIconByType(resource.type)}
                  </div>
                )}
                {/* Push Button Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openPushModal(resource)}
                    className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1.5 rounded-lg shadow-md font-bold text-xs hover:bg-blue-50"
                    title="Đẩy vào lớp học"
                  >
                    <Share2 size={14} />
                    Đẩy vào lớp
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm h-10" title={resource.name}>{resource.name}</h3>
                  <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {resource.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>{resource.date}</span>
                  <span className="font-mono bg-gray-50 px-1 rounded">{resource.size}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Push To Class Modal */}
      <Modal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        title="Đẩy học liệu vào lớp học"
        footer={
          <>
            <button onClick={() => setIsPushModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
            <button onClick={handlePushToClass} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
              <Share2 size={16} /> Xác nhận đẩy
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-blue-100">
              {selectedResource && getIconByType(selectedResource.type)}
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">Tài liệu đã chọn</p>
              <p className="font-bold text-gray-900">{selectedResource?.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn lớp nhận tài liệu</label>
            <select
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <FileCheck size={14} className="mt-0.5" />
            <p>Tài liệu sẽ được thêm vào thư mục "Tài liệu tham khảo" của lớp đã chọn. Học sinh có thể xem và tải về.</p>
          </div>
        </div>
      </Modal>

      {/* Upload Modal (Mock) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Tải lên học liệu mới"
        footer={
          <>
            <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
            <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Tải lên
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <Download size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="font-medium text-gray-600">Kéo thả file vào đây hoặc nhấn để chọn</p>
            <p className="text-xs text-gray-400 mt-1">Hỗ trợ: PDF, Docx, JPG, MP4 (Max 100MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
            <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="VD: Bài giảng số 1..." value={newResourceName} onChange={(e) => setNewResourceName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg bg-white" value={newResourceCategory} onChange={(e) => setNewResourceCategory(e.target.value)}>
                <option value="Giáo án">Giáo án</option>
                <option value="Đề thi">Đề thi</option>
                <option value="Hình ảnh">Hình ảnh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng (Mô phỏng)</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg bg-white" value={newResourceType} onChange={(e) => setNewResourceType(e.target.value)}>
                <option value="doc">Văn bản (PDF/Doc)</option>
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
                <option value="exam">Đề thi</option>
                <option value="chart">Biểu đồ</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ResourceBank;
