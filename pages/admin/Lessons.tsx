import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit2, Trash2, Video, FileText, CheckCircle, 
  ChevronRight, ChevronDown, Paperclip, ClipboardList, 
  MoreVertical, File, PlayCircle, BookOpen 
} from 'lucide-react';
import dataProvider from '../../services/provider';
import { Subject, Topic, Lesson, LessonStatus, Assignment } from '../../types';
import Modal from '../../components/Modal';

const AdminLessons = () => {
  // Data States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // UI States
  const [expandedLessonIds, setExpandedLessonIds] = useState<Set<string>>(new Set());
  
  // Modals
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({});
  const [targetTopicId, setTargetTopicId] = useState<string>('');

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  const [targetLessonId, setTargetLessonId] = useState<string>('');

  // Initial Load
  useEffect(() => {
    const loadSubjects = async () => {
      const data = await dataProvider.getSubjects();
      setSubjects(data);
      if (data.length > 0) setSelectedSubjectId(data[0].id);
    };
    loadSubjects();
  }, []);

  // Load Content when Subject changes
  useEffect(() => {
    const loadContent = async () => {
      if (!selectedSubjectId) return;
      
      // 1. Fetch Topics
      const tps = await dataProvider.getTopics(selectedSubjectId);
      setTopics(tps);

      // 2. Fetch ALL Lessons & Assignments in parallel (Optimization)
      const [allLessons, allAssigns] = await Promise.all([
        dataProvider.getAllLessons ? dataProvider.getAllLessons() : [], // Support new method
        dataProvider.getAllAssignments()
      ]);
      
      setAssignments(allAssigns);

      // 3. Group Lessons by Topic (Client-side)
      const lMap: Record<string, Lesson[]> = {};
      
      // Initialize map for all topics
      tps.forEach(t => lMap[t.id] = []);

      // Distribute lessons
      allLessons.forEach(l => {
        // Check both moduleId (backend) and topicId (frontend)
        const tid = l.moduleId || l.topicId;
        if (tid && lMap[tid]) {
          lMap[tid].push(l);
        }
      });

      // Sort lessons by order
      Object.keys(lMap).forEach(tid => {
        lMap[tid].sort((a, b) => (a.order || 0) - (b.order || 0));
      });

      setLessonsMap(lMap);
      
      // Auto expand first lesson of first topic for demo
      if (tps.length > 0 && lMap[tps[0].id]?.length > 0) {
        setExpandedLessonIds(new Set([lMap[tps[0].id][0].id]));
      }
    };
    loadContent();
  }, [selectedSubjectId]);

  // --- Handlers ---

  const toggleLesson = (lessonId: string) => {
    const newSet = new Set(expandedLessonIds);
    if (newSet.has(lessonId)) {
      newSet.delete(lessonId);
    } else {
      newSet.add(lessonId);
    }
    setExpandedLessonIds(newSet);
  };

  // Lesson CRUD
  const handleSaveLesson = async () => {
    if (!currentLesson.title || !targetTopicId) return;
    const payload = {
      ...currentLesson,
      topicId: targetTopicId,
      status: currentLesson.status || LessonStatus.DRAFT,
      title: currentLesson.title!,
      content: currentLesson.content || '',
      order: currentLesson.order || 1
    };
    
    if (currentLesson.id) {
      await dataProvider.updateLesson(currentLesson.id, payload);
    } else {
      await dataProvider.createLesson(payload as Lesson);
    }
    
    setIsLessonModalOpen(false);
    // Refresh lessons for topic
    const updatedLessons = await dataProvider.getLessons(targetTopicId);
    setLessonsMap(prev => ({ ...prev, [targetTopicId]: updatedLessons }));
  };

  const handleDeleteLesson = async (e: React.MouseEvent, id: string, topicId: string) => {
    e.stopPropagation();
    if (confirm("Xóa bài học này?")) {
      await dataProvider.deleteLesson(id);
      const updatedLessons = await dataProvider.getLessons(topicId);
      setLessonsMap(prev => ({ ...prev, [topicId]: updatedLessons }));
    }
  };

  // Assignment CRUD (Simplified inline)
  const handleSaveAssignment = async () => {
     if (!currentAssignment.title || !targetLessonId) return;
     const payload = {
       ...currentAssignment,
       lessonId: targetLessonId,
       dueDate: currentAssignment.dueDate || new Date().toISOString(),
       type: currentAssignment.type || 'ESSAY',
       points: 10
     };
     
     // Only create supported for this demo quick action
     await dataProvider.createAssignment(payload as Assignment);
     setIsAssignmentModalOpen(false);
     const allAssigns = await dataProvider.getAllAssignments();
     setAssignments(allAssigns);
  };

  const handleDeleteAssignment = async (id: string) => {
     if (confirm("Xóa bài tập này?")) {
       await dataProvider.deleteAssignment(id);
       const allAssigns = await dataProvider.getAllAssignments();
       setAssignments(allAssigns);
     }
  };

  const openAddLesson = (topicId: string) => {
    setTargetTopicId(topicId);
    setCurrentLesson({ title: '', status: LessonStatus.DRAFT });
    setIsLessonModalOpen(true);
  };

  const openAddAssignment = (lessonId: string) => {
    setTargetLessonId(lessonId);
    setCurrentAssignment({ title: '', dueDate: new Date().toISOString() });
    setIsAssignmentModalOpen(true);
  };

  // Function to simulate adding a file
  const handleAddFile = async (lessonId: string, topicId: string) => {
    const lesson = lessonsMap[topicId]?.find(l => l.id === lessonId);
    if (!lesson) return;
    
    // Create mock file name
    const newFileName = `Tai_lieu_tham_khao_${Math.floor(Math.random() * 1000)}.pdf`;
    const attachments = lesson.attachments ? [...lesson.attachments, newFileName] : [newFileName];
    
    // Assume dataProvider correctly saves it
    await dataProvider.updateLesson(lessonId, { ...lesson, attachments });
    
    // Refresh UI
    const updatedLessons = await dataProvider.getLessons(topicId);
    setLessonsMap(prev => ({ ...prev, [topicId]: updatedLessons }));
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 min-h-screen">
      {/* 1. Page Header & Subject Filter */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Soạn bài giảng</h1>
           <p className="text-gray-500 text-sm">Quản lý nội dung học tập theo mô-đun.</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center">
             <span className="px-3 text-sm font-bold text-gray-500 uppercase">Môn học:</span>
             <select 
               className="p-2 bg-transparent font-bold text-blue-700 outline-none cursor-pointer"
               value={selectedSubjectId}
               onChange={(e) => setSelectedSubjectId(e.target.value)}
             >
               {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
        </div>
      </div>

      {/* 2. Main Content: Module List */}
      <div className="space-y-8 max-w-5xl mx-auto w-full pb-20">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {/* Topic Header */}
             <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                   <BookOpen size={20} className="text-blue-600"/>
                   {topic.name}
                </h2>
                <button 
                  onClick={() => openAddLesson(topic.id)}
                  className="text-sm font-medium text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={16} /> Thêm bài học
                </button>
             </div>

             {/* Lessons List */}
             <div className="divide-y divide-gray-100">
               {lessonsMap[topic.id]?.length === 0 ? (
                 <div className="p-8 text-center text-gray-400 italic">Chưa có bài học nào trong chủ đề này.</div>
               ) : (
                 lessonsMap[topic.id]?.map((lesson) => {
                   const isExpanded = expandedLessonIds.has(lesson.id);
                   const lessonAssignments = assignments.filter(a => a.lessonId === lesson.id);
                   
                   return (
                     <div key={lesson.id} className={`transition-colors ${isExpanded ? 'bg-blue-50/20' : 'bg-white'}`}>
                       
                       {/* Lesson Accordion Header */}
                       <div 
                         onClick={() => toggleLesson(lesson.id)}
                         className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 group"
                       >
                         <div className="flex items-center gap-3">
                           <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-600' : 'text-gray-400'}`}>
                              <ChevronRight size={20} />
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800">{lesson.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${lesson.status === LessonStatus.PUBLISHED ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {lesson.status === LessonStatus.PUBLISHED ? 'Đã xuất bản' : 'Nháp'}
                              </span>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setCurrentLesson(lesson); setTargetTopicId(topic.id); setIsLessonModalOpen(true); }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteLesson(e, lesson.id, topic.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                       </div>

                       {/* Lesson Body (Expanded) */}
                       {isExpanded && (
                         <div className="pl-12 pr-4 pb-6 animate-in slide-in-from-top-2 duration-200">
                           
                           {/* Inline Actions Toolbar */}
                           <div className="flex items-center gap-3 mb-4">
                              <button 
                                onClick={() => handleAddFile(lesson.id, topic.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                              >
                                <Paperclip size={16} />
                                + Thêm tài liệu
                              </button>
                              <button 
                                onClick={() => openAddAssignment(lesson.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                              >
                                <ClipboardList size={16} />
                                + Thêm bài tập
                              </button>
                           </div>

                           {/* Tree View Container */}
                           <div className="border-l-2 border-gray-200 pl-6 space-y-3 relative">
                              
                              {/* 1. Attachments (PDFs/Files) */}
                              {lesson.attachments && lesson.attachments.map((file, idx) => (
                                <div key={`file-${idx}`} className="flex items-center justify-between group p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                                   <div className="flex items-center gap-3">
                                      <div className="bg-red-100 p-2 rounded text-red-600">
                                        <FileText size={18} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{file}</p>
                                        <p className="text-xs text-gray-500">Tài liệu PDF</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={14} /></button>
                                      <button className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                                   </div>
                                </div>
                              ))}

                              {/* 2. Video Material */}
                              {lesson.videoUrl && (
                                <div className="flex items-center justify-between group p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                                   <div className="flex items-center gap-3">
                                      <div className="bg-purple-100 p-2 rounded text-purple-600">
                                        <Video size={18} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Video bài giảng</p>
                                        <p className="text-xs text-gray-500 truncate max-w-md">{lesson.videoUrl}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={14} /></button>
                                      <button className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                                   </div>
                                </div>
                              )}

                              {/* 3. Assignments */}
                              {lessonAssignments.map(assign => (
                                <div key={assign.id} className="flex items-center justify-between group p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                                   <div className="flex items-center gap-3">
                                      <div className="bg-green-100 p-2 rounded text-green-600">
                                        <CheckCircle size={18} />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-medium text-gray-900">{assign.title}</p>
                                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Đã xuất bản</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={14} /></button>
                                      <button 
                                        onClick={() => handleDeleteAssignment(assign.id)}
                                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                   </div>
                                </div>
                              ))}

                              {/* Empty State Helper */}
                              {(!lesson.attachments?.length && !lesson.videoUrl && lessonAssignments.length === 0) && (
                                <div className="text-sm text-gray-400 italic py-2">Chưa có nội dung nào. Hãy thêm tài liệu hoặc bài tập.</div>
                              )}
                           </div>
                         </div>
                       )}
                     </div>
                   );
                 })
               )}
             </div>
          </div>
        ))}
        
        {topics.length === 0 && (
           <div className="text-center py-12 text-gray-500">Vui lòng chọn môn học có dữ liệu hoặc tạo chủ đề mới.</div>
        )}
      </div>

      {/* Lesson Modal */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title={currentLesson.id ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
        footer={
          <>
            <button onClick={() => setIsLessonModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy bỏ</button>
            <button onClick={handleSaveLesson} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Lưu lại</button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentLesson.title || ''}
              onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
              placeholder="VD: Bài 1: ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Video (YouTube)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentLesson.videoUrl || ''}
              onChange={(e) => setCurrentLesson({...currentLesson, videoUrl: e.target.value})}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="flex items-center gap-3">
             <input 
               type="checkbox" 
               checked={currentLesson.status === LessonStatus.PUBLISHED}
               onChange={(e) => setCurrentLesson({...currentLesson, status: e.target.checked ? LessonStatus.PUBLISHED : LessonStatus.DRAFT})}
               className="w-5 h-5 text-blue-600 rounded"
             />
             <label className="text-sm text-gray-700">Xuất bản ngay</label>
          </div>
        </div>
      </Modal>

      {/* Assignment Quick Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Thêm bài tập nhanh"
        footer={
          <>
            <button onClick={() => setIsAssignmentModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy bỏ</button>
            <button onClick={handleSaveAssignment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Tạo bài tập</button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài tập</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentAssignment.title || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLessons;