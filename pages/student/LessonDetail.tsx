import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Video, FileText } from 'lucide-react';
import dataProvider from '../../services/provider';
import { Lesson, User } from '../../types';

const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const l = await dataProvider.getLessonById(id);
      setLesson(l || null);

      const u = await dataProvider.getCurrentUser();
      setUser(u);
      
      if (u) {
        const progress = await dataProvider.getStudentProgress(u.id);
        const isDone = progress.some(p => p.lessonId === id && p.completed);
        setCompleted(isDone);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleComplete = async () => {
    if (!user || !lesson) return;
    const newState = !completed;
    setCompleted(newState);
    await dataProvider.updateLessonProgress(user.id, lesson.id, newState);
    
    if (newState) {
      // Optional: Show celebration animation here
      alert("Chúc mừng em đã hoàn thành bài học! 🎉");
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải bài học...</div>;
  if (!lesson) return <div className="p-8 text-center">Không tìm thấy bài học. <button onClick={() => navigate(-1)} className="text-blue-600 underline">Quay lại</button></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      <button 
        onClick={() => navigate('/app/lessons')} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        <span>Quay lại danh sách</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Bài học</span>
             <span>•</span>
             <span>Thời lượng: Tự do</span>
          </div>
        </div>

        {/* Video Section */}
        {lesson.videoUrl && (
          <div className="aspect-video w-full bg-black">
             <iframe 
               width="100%" 
               height="100%" 
               src={lesson.videoUrl} 
               title={lesson.title}
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
             ></iframe>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 md:p-8">
           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             <FileText size={20} className="text-blue-600" />
             Nội dung bài học
           </h3>
           <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
             {lesson.content}
           </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
           <button
             onClick={handleComplete}
             className={`
               flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95
               ${completed 
                 ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                 : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}
             `}
           >
             {completed ? <CheckCircle size={24} /> : <Circle size={24} />}
             <span>{completed ? 'Đã hoàn thành' : 'Đánh dấu đã học xong'}</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;