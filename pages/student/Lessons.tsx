
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, PlayCircle, Gamepad2, PenTool, CheckCircle, 
  ChevronDown, Star, Lock 
} from 'lucide-react';
import dataProvider from '../../services/provider';
import { Subject, Topic, Lesson, LessonStatus, Resource, ResourceType, Submission, AssessmentLevel } from '../../types';

// Extended type for UI logic
interface LessonData extends Lesson {
  resources: {
    data: Resource;
    submission?: Submission;
    isCompleted: boolean;
  }[];
  overallStatus: 'LOCKED' | 'OPEN' | 'COMPLETED';
}

const StudentLessons = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, LessonData[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const subs = await dataProvider.getSubjects();
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedSubjectId) return;
      const currentUser = await dataProvider.getCurrentUser();
      if (!currentUser) return;

      // Parallel data fetching
      const [fetchedTopics, myAssignments, progressList] = await Promise.all([
        dataProvider.getTopics(selectedSubjectId),
        dataProvider.getMyAssignments(currentUser.id),
        dataProvider.getStudentProgress(currentUser.id)
      ]);

      setTopics(fetchedTopics);

      const lMap: Record<string, LessonData[]> = {};
      const completedResourceIds = new Set(progressList.filter(p => p.completed).map(p => p.resourceId));

      for (const t of fetchedTopics) {
        // Use DataProvider to get lessons
        const ls = await dataProvider.getLessons(t.id);
        const publishedLessons = ls.filter(l => l.status === LessonStatus.PUBLISHED);
        
        // Build lesson data with resources
        const lessonDataPromises = publishedLessons.map(async (lesson) => {
          // Fetch resources for this specific lesson
          const resources = await dataProvider.getResourcesByLesson(lesson.id);
          
          const mappedResources = resources.map(res => {
            // Find submission if type is worksheet
            const sub = myAssignments.find(ma => ma.assignment.id === res.id)?.submission;
            const isCompleted = completedResourceIds.has(res.id) || !!sub;
            return {
              data: res,
              submission: sub,
              isCompleted
            };
          });

          const isLessonFullyDone = mappedResources.every(r => !r.data.isRequired || r.isCompleted);
          
          return {
            ...lesson,
            resources: mappedResources,
            overallStatus: isLessonFullyDone ? 'COMPLETED' : 'OPEN' // Logic for locked can be added here
          } as LessonData;
        });

        lMap[t.id] = await Promise.all(lessonDataPromises);
      }
      setLessonsMap(lMap);
    };
    loadContent();
  }, [selectedSubjectId]);

  const toggleLesson = (lessonId: string) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  const getResourceIcon = (type: ResourceType) => {
    switch(type) {
      case ResourceType.VIDEO: return <PlayCircle size={20} />;
      case ResourceType.GAME: return <Gamepad2 size={20} />;
      case ResourceType.WORKSHEET: return <PenTool size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  const getResourceColor = (type: ResourceType) => {
    switch(type) {
      case ResourceType.VIDEO: return 'bg-blue-500 text-white border-blue-50';
      case ResourceType.GAME: return 'bg-purple-500 text-white border-purple-50';
      case ResourceType.WORKSHEET: return 'bg-green-500 text-white border-green-50';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Render Stars for Graded Submissions
  const renderStars = (stars: number) => {
    return (
      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} size={14} fill="#FCD34D" className="text-yellow-400" />
        ))}
        {stars === 0 && <span className="text-xs text-gray-500 font-bold">Chưa đạt sao</span>}
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu học tập...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900">Lộ trình học tập</h1>
        <p className="text-blue-600 font-medium mt-1">Hoàn thành từng bước để nhận Sao và Huy hiệu nhé!</p>
      </div>

      <div className="space-y-8">
        {topics.map(topic => (
          <div key={topic.id}>
             <div className="inline-block bg-blue-600 text-white px-5 py-2 rounded-t-2xl font-bold text-sm shadow-sm ml-4">
               {topic.name}
             </div>
             
             <div className="bg-white rounded-3xl shadow-sm border-2 border-blue-50 p-4 md:p-6 space-y-4">
                {lessonsMap[topic.id]?.map((lesson) => {
                  const isExpanded = expandedLessonId === lesson.id;
                  const completedCount = lesson.resources.filter(r => r.isCompleted).length;
                  const totalCount = lesson.resources.length;

                  return (
                    <div key={lesson.id} className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-300 bg-blue-50/20' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                       {/* Header */}
                       <div onClick={() => toggleLesson(lesson.id)} className="p-4 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${lesson.overallStatus === 'COMPLETED' ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-blue-100 text-blue-500'}`}>
                                {lesson.overallStatus === 'COMPLETED' ? <CheckCircle size={24} /> : <BookOpen size={24} />}
                             </div>
                             <div>
                               <h3 className="font-bold text-lg text-gray-800">{lesson.title}</h3>
                               <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                 Tiến độ: {completedCount}/{totalCount} hoạt động
                               </p>
                             </div>
                          </div>
                          <ChevronDown size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                       </div>

                       {/* Stepper Body */}
                       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="p-4 md:p-6 md:pl-8 bg-white/50 border-t-2 border-blue-50">
                             <div className="relative pl-8 space-y-6">
                                {/* Vertical Line */}
                                <div className="absolute left-3 top-2 bottom-4 w-1 bg-gray-200 rounded-full"></div>

                                {lesson.resources.map((res, idx) => (
                                  <div key={res.data.id} className="relative z-10">
                                     <div className="flex items-start gap-4">
                                        {/* Icon Node */}
                                        <div className="absolute -left-[34px] bg-white p-1 rounded-full border-2 border-white shadow-sm">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${getResourceColor(res.data.type)}`}>
                                              {getResourceIcon(res.data.type)}
                                           </div>
                                        </div>

                                        {/* Card */}
                                        <div className={`flex-1 bg-white p-4 rounded-2xl border-2 shadow-sm transition-all ${res.isCompleted ? 'border-green-100 bg-green-50/20' : 'border-gray-100 hover:border-blue-200'}`}>
                                           <div className="flex justify-between items-start mb-2">
                                              <div>
                                                 <h4 className="font-bold text-gray-800 text-sm md:text-base">Bước {idx + 1}: {res.data.title}</h4>
                                                 <p className="text-xs text-gray-500 mt-1">
                                                   {res.data.type === ResourceType.VIDEO ? 'Xem kỹ video để hiểu bài.' : 
                                                    res.data.type === ResourceType.GAME ? 'Chơi game để luyện tập.' : 'Làm bài tập nhận sao.'}
                                                 </p>
                                              </div>
                                              {res.isCompleted && <CheckCircle size={18} className="text-green-500" />}
                                           </div>

                                           {/* Action Area */}
                                           <div className="mt-3 flex items-center justify-between">
                                              {res.data.type === ResourceType.WORKSHEET ? (
                                                <div className="flex items-center gap-3 w-full justify-between">
                                                   <button 
                                                     onClick={() => navigate(`/app/assignments/${res.data.id}`)}
                                                     className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 ${res.submission ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                   >
                                                     {res.submission ? (res.submission.isGraded ? 'Xem kết quả' : 'Đã nộp bài') : 'Làm bài ngay'}
                                                   </button>
                                                   {res.submission?.isGraded && renderStars(res.submission.starsEarned)}
                                                </div>
                                              ) : (
                                                <button 
                                                  onClick={() => {
                                                    if (res.data.url) window.open(res.data.url, '_blank'); // Mock action
                                                    // In real app, this would verify completion via API
                                                    // Here we assume clicking opens it and might mark complete
                                                  }}
                                                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100"
                                                >
                                                  {res.data.type === ResourceType.VIDEO ? 'Xem Video' : 'Chơi Game'}
                                                </button>
                                              )}
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentLessons;
