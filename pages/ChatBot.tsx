import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, MessageCircle, KeyRound, ExternalLink, X, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessage, hasApiKey, setApiKey } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

const WELCOME_MESSAGE = `Cô Ngọc xin chào ba mẹ và các con yêu quý! 🌟

Hôm nay cô có thể hỗ trợ gì cho việc học Toán của lớp mình ạ? Cô có thể giúp:

📚 **Giải thích kiến thức** — Bất kỳ bài toán nào trong SGK "Kết nối tri thức"
📝 **Hướng dẫn làm bài** — Gợi ý phương pháp giải, không làm thay con nhé!
📊 **Tra cứu kết quả** — Điểm số, nhận xét (cần Mã Học Sinh)

Hãy đặt câu hỏi cho cô nhé! 😊`;

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Simple markdown-like rendering
function renderContent(text: string): React.ReactNode {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bold
        let processed: React.ReactNode[] = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                processed.push(line.slice(lastIndex, match.index));
            }
            processed.push(<strong key={`b-${i}-${match.index}`}>{match[1]}</strong>);
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < line.length) {
            processed.push(line.slice(lastIndex));
        }
        if (processed.length === 0) processed.push(line);

        return (
            <React.Fragment key={i}>
                {processed}
                {i < lines.length - 1 && <br />}
            </React.Fragment>
        );
    });
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            CN
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-white/50">
            <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    </div>
);

// API Key Modal
const ApiKeyModal: React.FC<{
    show: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    isRequired: boolean;
}> = ({ show, onClose, onSave, isRequired }) => {
    const [key, setKey] = useState('');

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-[fadeIn_0.3s_ease-out]">
                {!isRequired && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <KeyRound className="text-white" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Nhập API Key</h3>
                    <p className="text-gray-500 text-sm mt-2">
                        Để sử dụng Trợ lý Toán 3, bạn cần có API Key từ Google AI Studio
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <ExternalLink size={14} />
                        Lấy API Key miễn phí tại Google AI Studio
                    </a>

                    <button
                        onClick={() => {
                            if (key.trim()) {
                                onSave(key.trim());
                                setKey('');
                            }
                        }}
                        disabled={!key.trim()}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                        Lưu và bắt đầu
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatBotPage: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            content: WELCOME_MESSAGE,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showApiModal, setShowApiModal] = useState(!hasApiKey());
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        if (!hasApiKey()) {
            setShowApiModal(true);
            return;
        }

        const userMsg: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Pass all messages except the welcome message for context
            const historyForApi = messages.filter((m) => m.id !== 'welcome');
            const reply = await sendMessage(historyForApi, trimmed);

            const botMsg: ChatMessage = {
                id: generateId(),
                role: 'model',
                content: reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err: any) {
            if (err.message === 'NO_API_KEY') {
                setShowApiModal(true);
            } else {
                setError(err.message);
                const errorMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    content: `⚠️ Xin lỗi, cô gặp sự cố kỹ thuật rồi. Vui lòng thử lại nhé!\n\n_Lỗi: ${err.message}_`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMsg]);
            }
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'model',
                content: WELCOME_MESSAGE,
                timestamp: new Date(),
            },
        ]);
        setError(null);
    };

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        setShowApiModal(false);
    };

    // Quick suggestion chips
    const suggestions = [
        '📐 Cách tính chu vi hình chữ nhật?',
        '➗ Hướng dẫn phép chia có dư',
        '🔢 Cách đặt tính nhân số có 2 chữ số',
        '📏 Đơn vị đo độ dài lớp 3',
    ];

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* API Key Modal */}
            <ApiKeyModal
                show={showApiModal}
                onClose={() => setShowApiModal(false)}
                onSave={handleSaveApiKey}
                isRequired={!hasApiKey()}
            />

            {/* Chat Header */}
            <div className="bg-white/70 backdrop-blur-md border-b border-white/50 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                            CN
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 flex items-center gap-2">
                            Cô Ngọc
                            <Sparkles size={16} className="text-yellow-500" />
                        </h1>
                        <p className="text-xs text-green-500 font-medium">Trợ lý Toán 3 • Đang hoạt động</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowApiModal(true)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        title="Cài đặt API Key"
                    >
                        <KeyRound size={18} />
                    </button>
                    <button
                        onClick={clearChat}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa lịch sử chat"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-1">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                                CN
                            </div>
                        )}

                        <div
                            className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                                    : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md border border-white/50'
                                }`}
                        >
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {renderContent(msg.content)}
                            </div>
                            <div
                                className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'
                                    }`}
                            >
                                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && <TypingIndicator />}

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                        <strong>Lỗi:</strong> {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (only show when few messages) */}
            {messages.length <= 1 && !isLoading && (
                <div className="px-4 lg:px-6 pb-2">
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setInput(s);
                                    inputRef.current?.focus();
                                }}
                                className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white/70 backdrop-blur-md border-t border-white/50 px-4 lg:px-6 py-3">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Hỏi Cô Ngọc bất kỳ câu hỏi Toán nào..."
                            rows={1}
                            className="w-full resize-none px-4 py-3 pr-12 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400"
                            style={{ maxHeight: '120px' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex-shrink-0"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    Cô Ngọc — Trợ lý AI hỗ trợ học Toán lớp 3 • Kết Nối Tri Thức
                </p>
            </div>
        </div>
    );
};

export default ChatBotPage;
