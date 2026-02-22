import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Star, Clock, Trophy, Megaphone, Gift, ChevronRight,
  Users, CheckCircle, AlertCircle, Quote, Bot, Send, X, MessageSquare
} from 'lucide-react';
import dataProvider from '../../services/provider';
import { User, Assignment, Announcement, AnnouncementTarget, AssessmentLevel } from '../../types';

// Chat Message Interface
interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  type?: 'text' | 'options';
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Gamification Stats
  const [totalStars, setTotalStars] = useState(0);
  const [nextRewardAt, setNextRewardAt] = useState(50);

  // Parent Summary Stats
  const [weeklyStats, setWeeklyStats] = useState({
    completed: 0,
    pending: 0,
    latestFeedback: "Chưa có nhận xét mới."
  });

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Xin chào! Tớ là trợ lý Toán học. Cậu cần tớ hướng dẫn bài nào, hay bố mẹ muốn xem tóm tắt tình hình học tập tuần này?', sender: 'bot', type: 'options' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const u = await dataProvider.getCurrentUser();
      setUser(u);
      if (u) {
        // Fetch assignments
        const myAssignments = await dataProvider.getMyAssignments(u.id);

        // Calculate pending
        const pendingList = myAssignments
          .filter(item => !item.submission)
          .map(item => item.assignment);
        setAssignments(pendingList);

        // Calculate Stars & Stats
        let stars = 0;
        let completedCount = 0;
        let latestFeed = "Cô Ngọc khen Nam tuần này tính nhẩm các phép chia rất nhanh, nhưng cần cẩn thận hơn khi chép đề bài."; // Default mock if empty

        // Sort to find real latest feedback if available
        const graded = myAssignments.filter(m => m.submission?.feedback);
        if (graded.length > 0) {
          // In a real app, sort by date. Here we take the first one.
          latestFeed = graded[0].submission?.feedback || latestFeed;
        }

        myAssignments.forEach(item => {
          if (item.submission) {
            completedCount++;
            if (item.submission.assessment === AssessmentLevel.HTT) stars += 3;
            else if (item.submission.assessment === AssessmentLevel.HT) stars += 1;
          }
        });

        setTotalStars(stars);
        setNextRewardAt(Math.ceil((stars + 1) / 50) * 50);

        setWeeklyStats({
          completed: completedCount,
          pending: pendingList.length,
          latestFeedback: latestFeed
        });

        // Fetch announcements
        const anns = await dataProvider.getAnnouncements(u.classId, AnnouncementTarget.STUDENT);
        setAnnouncements(anns);
      }
    };
    init();
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newMessage: ChatMessage = { id: Date.now().toString(), text, sender: 'user' };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // Simulate Bot Response
    setTimeout(() => {
      let botResponse = "Tớ đang học hỏi thêm, câu này khó quá! Cậu thử hỏi cô giáo xem sao nhé.";
      if (text.includes("giải bài")) botResponse = "Để giải bài này, cậu hãy nhớ quy tắc: Nhân chia trước, cộng trừ sau. Cậu thử tính lại xem?";
      else if (text.includes("báo cáo") || text.includes("tình hình")) botResponse = `Tuần này cậu đã làm xong ${weeklyStats.completed} bài tập và có ${weeklyStats.pending} bài chưa làm. Cố gắng lên nhé!`;

      setChatMessages(prev => [...prev, { id: Date.now().toString(), text: botResponse, sender: 'bot' }]);
    }, 1000);
  };

  const progressPercent = Math.min(100, (totalStars / nextRewardAt) * 100);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto relative min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-8">

          {/* GAMIFICATION HERO SECTION */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Xin chào, {user?.name || 'Học sinh'}! 👋</h1>
                <p className="font-medium text-yellow-50 text-lg">Hôm nay em đã sẵn sàng thu thập thêm Sao chưa?</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 min-w-[280px]">
                <div className="bg-yellow-300 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
                  <Star size={32} className="text-yellow-700 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-100">Tổng sao tích lũy</span>
                    <span className="text-2xl font-black text-white">{totalStars}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-3 mb-1">
                    <div
                      className="bg-yellow-200 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-white flex items-center justify-end gap-1">
                      Mục tiêu: {nextRewardAt} <Gift size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/app/lessons')}
              className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
              </div>
              <h3 className="font-bold text-xl text-blue-900 mb-1">Vào học ngay</h3>
              <p className="text-sm text-blue-600 font-medium">Tiếp tục bài học đang dang dở</p>
            </div>

            <div
              onClick={() => navigate('/app/assignments')}
              className="bg-green-50 p-6 rounded-3xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-500 mb-4 shadow-sm group-hover:scale-110 transition-transform relative">
                <Clock size={28} />
                {assignments.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                    {assignments.length}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-xl text-green-900 mb-1">Bài tập về nhà</h3>
              <p className="text-sm text-green-600 font-medium">Hoàn thành để nhận sao!</p>
            </div>

            <div
              onClick={() => navigate('/app/progress')}
              className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-purple-500 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <h3 className="font-bold text-xl text-purple-900 mb-1">Bộ sưu tập</h3>
              <p className="text-sm text-purple-600 font-medium">Xem huy hiệu & phần thưởng</p>
            </div>
          </div>

          {/* Featured Lesson */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-56 h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src="https://picsum.photos/300/200"
                    alt="Lesson thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-extrabold uppercase mb-3">Bài mới</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Chủ đề 2: Phép nhân, phép chia trong phạm vi 1000</h3>
                  <p className="text-gray-600 text-base mb-6">Cùng khám phá cách thực hiện phép tính với các số lớn hơn nào!</p>
                  <button
                    onClick={() => navigate('/app/lessons')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Bắt đầu học <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Bulletin */}
        <div className="w-full lg:w-80 space-y-6">

          {/* 1. Parent Weekly Summary Card */}
          <div className="bg-indigo-50/80 rounded-3xl shadow-sm border-2 border-indigo-100 overflow-hidden relative">
            <div className="p-5 border-b border-indigo-100 flex items-center gap-2">
              <div className="bg-white p-2 rounded-full text-indigo-600 shadow-sm">
                <Users size={20} />
              </div>
              <h2 className="font-bold text-indigo-900 text-lg">Tóm tắt tuần này</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-50 shadow-sm">
                <span className="text-gray-600 font-medium text-sm">Đã hoàn thành</span>
                <div className="flex items-center gap-1.5 text-green-600 font-bold">
                  <CheckCircle size={18} />
                  <span className="text-lg">{weeklyStats.completed} bài</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-50 shadow-sm">
                <span className="text-gray-600 font-medium text-sm">Chưa làm/Còn nợ</span>
                <div className={`flex items-center gap-1.5 font-bold ${weeklyStats.pending > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  <AlertCircle size={18} />
                  <span className="text-lg">{weeklyStats.pending} bài</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                  <Quote size={16} className="rotate-180" />
                  <span className="text-xs font-bold uppercase">Lời cô dặn</span>
                </div>
                <p className="text-sm text-gray-700 italic font-medium leading-relaxed">
                  "{weeklyStats.latestFeedback}"
                </p>
              </div>
            </div>
            <div className="px-5 pb-4 text-center">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Dành cho phụ huynh</span>
            </div>
          </div>

          {/* 2. Announcements */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-blue-100 overflow-hidden">
            <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <Megaphone size={20} className="text-blue-600" />
              <h2 className="font-bold text-blue-900 text-lg">Loa Phường Lớp 3A1</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto p-2">
              {announcements.length > 0 ? announcements.map(ann => (
                <div key={ann.id} className="p-3 hover:bg-gray-50 rounded-xl transition-colors mb-1">
                  <p className="text-xs text-gray-400 font-bold mb-1">{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</p>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{ann.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 text-sm">Chưa có tin tức mới.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MATH ASSISTANT CHATBOT --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

        {/* Chat Window */}
        {isChatOpen && (
          <div className="mb-4 w-[350px] bg-white rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Bot size={20} />
                </div>
                <h3 className="font-bold text-sm">Trợ lý học tập Toán 3</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-[350px] bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                         max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                         ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                      `}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Quick Actions (Only show if last message was initial bot greeting) */}
              {chatMessages.length === 1 && (
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => handleSendMessage("Giúp em giải bài tập này")}
                    className="bg-white border-2 border-blue-100 text-blue-700 p-3 rounded-xl text-sm font-bold hover:bg-blue-50 hover:border-blue-200 transition-all text-left flex items-center gap-2"
                  >
                    ✏️ Giúp em giải bài tập này
                  </button>
                  <button
                    onClick={() => handleSendMessage("Báo cáo tình hình học tập của con")}
                    className="bg-white border-2 border-indigo-100 text-indigo-700 p-3 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left flex items-center gap-2"
                  >
                    👨‍👩‍👧‍👦 Báo cáo tình hình học tập của con
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                placeholder="Nhập tin nhắn..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
              />
              <button
                onClick={() => handleSendMessage(chatInput)}
                disabled={!chatInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group relative"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-white transform transition-transform group-hover:scale-110 group-active:scale-95">
            {isChatOpen ? <X size={32} /> : <Bot size={32} />}
          </div>
          {!isChatOpen && (
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
