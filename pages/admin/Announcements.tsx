import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Megaphone, Users, Calendar } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Announcement, AnnouncementTarget, Class } from '../../types';
import Modal from '../../components/Modal';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnn, setCurrentAnn] = useState<Partial<Announcement>>({
    target: AnnouncementTarget.ALL,
    title: '',
    content: ''
  });

  const loadData = async () => {
    const anns = await dataProvider.getAnnouncements();
    setAnnouncements(anns);
    const cls = await dataProvider.getClasses();
    setClasses(cls);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!currentAnn.title || !currentAnn.content) {
      alert("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    
    try {
      // Auto set authorId (mock)
      await dataProvider.createAnnouncement({
        title: currentAnn.title,
        content: currentAnn.content,
        target: currentAnn.target || AnnouncementTarget.ALL,
        classId: currentAnn.classId,
        authorId: 'u1' 
      });

      setIsModalOpen(false);
      loadData();
      alert("Gửi thông báo thành công!");
    } catch (error: any) {
      console.error("Failed to create announcement:", error);
      alert("Gửi thông báo thất bại: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa thông báo này?")) {
      await dataProvider.deleteAnnouncement(id);
      loadData();
    }
  };

  const openModal = () => {
    setCurrentAnn({ target: AnnouncementTarget.ALL, title: '', content: '' });
    setIsModalOpen(true);
  };

  const getTargetBadge = (target: AnnouncementTarget, classId?: string) => {
    let text = 'Tất cả';
    let color = 'bg-gray-100 text-gray-800';
    
    if (target === AnnouncementTarget.STUDENT) {
       text = 'Học sinh';
       color = 'bg-blue-100 text-blue-800';
    } else if (target === AnnouncementTarget.PARENT) {
       text = 'Phụ huynh';
       color = 'bg-purple-100 text-purple-800';
    }

    const className = classes.find(c => c.id === classId)?.name;
    const scope = className ? ` - Lớp ${className}` : ' - Toàn trường';

    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>{text}{scope}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Thông báo</h1>
        <button 
          onClick={openModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Tạo thông báo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            Chưa có thông báo nào.
          </div>
        ) : (
          announcements.map(ann => (
            <div key={ann.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   {getTargetBadge(ann.target, ann.classId)}
                   <span className="text-gray-400 text-sm flex items-center gap-1">
                     <Calendar size={14} />
                     {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                   </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{ann.title}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{ann.content}</p>
              </div>
              <div>
                 <button 
                   onClick={() => handleDelete(ann.id)}
                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                 >
                   <Trash2 size={20} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo thông báo mới"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Gửi thông báo</button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentAnn.title}
              onChange={(e) => setCurrentAnn({...currentAnn, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gửi đến</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  value={currentAnn.target}
                  onChange={(e) => setCurrentAnn({...currentAnn, target: e.target.value as AnnouncementTarget})}
                >
                  <option value={AnnouncementTarget.ALL}>Tất cả mọi người</option>
                  <option value={AnnouncementTarget.STUDENT}>Học sinh</option>
                  <option value={AnnouncementTarget.PARENT}>Phụ huynh</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phạm vi lớp</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  value={currentAnn.classId || ''}
                  onChange={(e) => setCurrentAnn({...currentAnn, classId: e.target.value || undefined})}
                >
                  <option value="">Toàn trường</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentAnn.content}
              onChange={(e) => setCurrentAnn({...currentAnn, content: e.target.value})}
              placeholder="Nhập nội dung thông báo..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;