import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Folder, ChevronRight, Book, ChevronDown, Video, FileText } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Subject, Topic, Lesson, LessonStatus } from '../../types';
import Modal from '../../components/Modal';

const Curriculum = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  // Accordion & Lesson State
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});

  // Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({});
  const [currentTopic, setCurrentTopic] = useState<Partial<Topic>>({});
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({});
  const [targetTopicId, setTargetTopicId] = useState<string>('');

  const loadSubjects = async () => {
    const data = await dataProvider.getSubjects();
    setSubjects(data);
    if (data.length > 0 && !selectedSubject) {
      handleSelectSubject(data[0]);
    }
  };

  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    const data = await dataProvider.getTopics(sub.id);
    setTopics(data);
    setExpandedTopicId(null); // Reset expansion on subject change
    setLessonsMap({}); // Clear loaded lessons
  };

  const toggleTopic = async (topicId: string) => {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
    } else {
      setExpandedTopicId(topicId);
      // Fetch lessons if not already loaded or to refresh
      const lessons = await dataProvider.getLessons(topicId);
      setLessonsMap(prev => ({ ...prev, [topicId]: lessons }));
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // --- Subject Actions ---
  const saveSubject = async () => {
    if (!currentSubject.name) {
      alert("Vui lòng nhập tên môn học");
      return;
    }
    try {
      if (currentSubject.id) {
        await dataProvider.updateSubject(currentSubject.id, currentSubject);
      } else {
        await dataProvider.createSubject({ name: currentSubject.name, description: currentSubject.description });
      }
      setIsSubModalOpen(false);
      loadSubjects();
      alert("Lưu môn học thành công!");
    } catch (error: any) {
      console.error("Failed to save subject:", error);
      alert("Lưu thất bại: " + (error.message || "Lỗi không xác định"));
    }
  };

  const deleteSubject = async (id: string) => {
    if (confirm("Xóa môn học này sẽ xóa toàn bộ chủ đề liên quan. Tiếp tục?")) {
      try {
        await dataProvider.deleteSubject(id);
        loadSubjects();
        setSelectedSubject(null);
        setTopics([]);
      } catch (error: any) {
        alert("Xóa thất bại: " + error.message);
      }
    }
  };

  // --- Topic Actions ---
  const saveTopic = async () => {
    if (!currentTopic.name || !selectedSubject) {
      alert("Vui lòng nhập tên chủ đề");
      return;
    }
    try {
      if (currentTopic.id) {
        await dataProvider.updateTopic(currentTopic.id, currentTopic);
      } else {
        await dataProvider.createTopic({ 
          name: currentTopic.name, 
          subjectId: selectedSubject.id, 
          order: topics.length + 1 
        });
      }
      setIsTopicModalOpen(false);
      handleSelectSubject(selectedSubject);
      alert("Lưu chủ đề thành công!");
    } catch (error: any) {
      alert("Lưu thất bại: " + error.message);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!selectedSubject) return;
    if (confirm("Xóa chủ đề này?")) {
      try {
        await dataProvider.deleteTopic(id);
        handleSelectSubject(selectedSubject);
      } catch (error: any) {
        alert("Xóa thất bại: " + error.message);
      }
    }
  };

  // --- Lesson Actions ---
  const openAddLesson = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    setTargetTopicId(topicId);
    setCurrentLesson({ status: LessonStatus.PUBLISHED, order: (lessonsMap[topicId]?.length || 0) + 1 });
    setIsLessonModalOpen(true);
  };

  const openEditLesson = (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation();
    setTargetTopicId(lesson.topicId);
    setCurrentLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const saveLesson = async () => {
    if (!currentLesson.title || !targetTopicId) {
      alert("Vui lòng nhập tiêu đề bài học");
      return;
    }
    
    const payload = {
      ...currentLesson,
      topicId: targetTopicId,
      title: currentLesson.title!,
      content: currentLesson.content || 'Nội dung bài học...',
      status: currentLesson.status || LessonStatus.PUBLISHED,
    };

    try {
      if (currentLesson.id) {
        await dataProvider.updateLesson(currentLesson.id, payload);
      } else {
        await dataProvider.createLesson(payload as Lesson);
      }

      setIsLessonModalOpen(false);
      // Refresh lessons for the topic
      const updatedLessons = await dataProvider.getLessons(targetTopicId);
      setLessonsMap(prev => ({ ...prev, [targetTopicId]: updatedLessons }));
      alert("Lưu bài học thành công!");
    } catch (error: any) {
      alert("Lưu thất bại: " + error.message);
    }
  };

  const deleteLesson = async (e: React.MouseEvent, id: string, topicId: string) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      try {
        await dataProvider.deleteLesson(id);
        const updatedLessons = await dataProvider.getLessons(topicId);
        setLessonsMap(prev => ({ ...prev, [topicId]: updatedLessons }));
      } catch (error: any) {
        alert("Xóa thất bại: " + error.message);
      }
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex-shrink-0">Quản lý Môn học & Chủ đề</h1>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left: Subjects List */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-gray-700">Danh sách Môn học</h2>
            <button 
              onClick={() => { setCurrentSubject({}); setIsSubModalOpen(true); }}
              className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {subjects.map(sub => (
              <div 
                key={sub.id}
                onClick={() => handleSelectSubject(sub)}
                className={`
                  group p-3 rounded-lg cursor-pointer flex items-center justify-between border transition-colors
                  ${selectedSubject?.id === sub.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg 
                    ${selectedSubject?.id === sub.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
                  `}>
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${selectedSubject?.id === sub.id ? 'text-blue-900' : 'text-gray-900'}`}>{sub.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{sub.description || 'Không có mô tả'}</p>
                  </div>
                </div>
                {selectedSubject?.id === sub.id && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentSubject(sub); setIsSubModalOpen(true); }}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSubject(sub.id); }}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Topics List */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
            <h2 className="font-bold text-gray-700">
              {selectedSubject ? `Chủ đề: ${selectedSubject.name}` : 'Chọn môn học'}
            </h2>
            <button 
              disabled={!selectedSubject}
              onClick={() => { setCurrentTopic({}); setIsTopicModalOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Plus size={16} />
              <span>Thêm chủ đề</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
            {!selectedSubject ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Book size={48} className="mb-2 opacity-20" />
                <p>Vui lòng chọn môn học để xem nội dung</p>
              </div>
            ) : topics.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Folder size={48} className="mb-2 opacity-20" />
                <p>Môn học này chưa có chủ đề nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topics.map(topic => {
                  const isExpanded = expandedTopicId === topic.id;
                  const lessons = lessonsMap[topic.id] || [];
                  const lessonCount = lessonsMap[topic.id]?.length !== undefined ? lessonsMap[topic.id].length : '...';

                  return (
                    <div 
                      key={topic.id} 
                      className={`
                        border rounded-xl bg-white overflow-hidden transition-all duration-300
                        ${isExpanded ? 'shadow-md border-blue-200 ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-sm'}
                      `}
                    >
                      {/* Topic Header */}
                      <div 
                        onClick={() => toggleTopic(topic.id)}
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                            ${isExpanded ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-600'}
                          `}>
                            {topic.order}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg transition-colors ${isExpanded ? 'text-blue-900' : 'text-gray-900'}`}>
                              {topic.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {isExpanded ? `Đang hiển thị ${lessons.length} bài học` : `Chứa ${lessonCount === '...' ? 'các' : lessonCount} bài học`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           {/* Topic Actions (Prevent Bubble) */}
                           <div className="flex gap-1 mr-2 border-r pr-2 border-gray-200">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentTopic(topic); setIsTopicModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Sửa tên chủ đề"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Xóa chủ đề"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                           <ChevronDown 
                             size={20} 
                             className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                           />
                        </div>
                      </div>

                      {/* Accordion Body (Lessons List) */}
                      <div 
                         className={`
                           transition-all duration-300 ease-in-out grid
                           ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                         `}
                      >
                        <div className="overflow-hidden min-h-0 bg-gray-50/50">
                           <div className="p-4 pt-0 space-y-2">
                              {/* Divider */}
                              <div className="h-px bg-gray-100 mb-2"></div>
                              
                              {lessons.length > 0 ? lessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group">
                                  <div className="flex items-center gap-3">
                                    <div className="text-gray-400">
                                      {lesson.videoUrl ? <Video size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800 text-sm">{lesson.title}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => openEditLesson(e, lesson)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                      title="Chỉnh sửa bài học"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => deleteLesson(e, lesson.id, topic.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Xóa bài học"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              )) : (
                                <div className="text-center py-4 text-sm text-gray-400 italic">Chưa có bài học nào trong chủ đề này.</div>
                              )}

                              {/* Add Lesson Button */}
                              <button 
                                onClick={(e) => openAddLesson(e, topic.id)}
                                className="w-full py-2.5 mt-2 flex items-center justify-center gap-2 border border-dashed border-blue-300 text-blue-600 bg-blue-50/50 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium text-sm"
                              >
                                <Plus size={16} />
                                Thêm bài học
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Modal */}
      <Modal 
        isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} 
        title={currentSubject.id ? "Sửa môn học" : "Thêm môn học"}
        footer={<><button onClick={saveSubject} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button></>}
      >
        <div className="space-y-4">
           <input type="text" placeholder="Tên môn học" className="w-full p-2 border rounded" value={currentSubject.name || ''} onChange={e => setCurrentSubject({...currentSubject, name: e.target.value})} />
           <input type="text" placeholder="Mô tả" className="w-full p-2 border rounded" value={currentSubject.description || ''} onChange={e => setCurrentSubject({...currentSubject, description: e.target.value})} />
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal 
        isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} 
        title={currentTopic.id ? "Sửa chủ đề" : "Thêm chủ đề mới"}
        footer={<><button onClick={saveTopic} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button></>}
      >
         <div className="space-y-4">
           <input type="text" placeholder="Tên chủ đề" className="w-full p-2 border rounded" value={currentTopic.name || ''} onChange={e => setCurrentTopic({...currentTopic, name: e.target.value})} />
           <input type="number" placeholder="Thứ tự" className="w-full p-2 border rounded" value={currentTopic.order || 0} onChange={e => setCurrentTopic({...currentTopic, order: parseInt(e.target.value)})} />
        </div>
      </Modal>

      {/* Lesson Modal (Quick Add/Edit) */}
      <Modal 
        isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} 
        title={currentLesson.id ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
        footer={<><button onClick={saveLesson} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu bài học</button></>}
      >
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
             <input 
               type="text" 
               placeholder="VD: Bài 1: Ôn tập..." 
               className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
               value={currentLesson.title || ''} 
               onChange={e => setCurrentLesson({...currentLesson, title: e.target.value})} 
             />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={currentLesson.order || 1} 
                  onChange={e => setCurrentLesson({...currentLesson, order: parseInt(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentLesson.status}
                  onChange={e => setCurrentLesson({...currentLesson, status: e.target.value as LessonStatus})}
                >
                  <option value={LessonStatus.DRAFT}>Nháp</option>
                  <option value={LessonStatus.PUBLISHED}>Xuất bản</option>
                </select>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Video (Tùy chọn)</label>
              <input 
                type="text" 
                placeholder="https://youtube.com/..." 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={currentLesson.videoUrl || ''} 
                onChange={e => setCurrentLesson({...currentLesson, videoUrl: e.target.value})} 
              />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung tóm tắt</label>
             <textarea 
               className="w-full p-2.5 border border-gray-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
               value={currentLesson.content || ''}
               onChange={e => setCurrentLesson({...currentLesson, content: e.target.value})}
               placeholder="Nhập nội dung..."
             />
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Curriculum;