import React, { useState } from 'react';
import { Gamepad2, Play, X, Star, Trophy } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  source: string;
  category: string;
  embedUrl: string;
  color: string;
}

const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Giải cứu công chúa - Ôn tập phép cộng',
    thumbnail: 'https://picsum.photos/seed/game1/400/300',
    source: 'Trò chơi của Cô Ngọc',
    category: 'Chủ đề 1: Ôn tập',
    embedUrl: 'https://wordwall.net/embed/play/123/456/789', // Example URL
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Đua xe - Bảng cửu chương 5',
    thumbnail: 'https://picsum.photos/seed/game2/400/300',
    source: 'Quizizz',
    category: 'Chủ đề 2: Phép nhân, phép chia',
    embedUrl: 'https://quizizz.com/join/game/123456', // Example URL
    color: 'bg-purple-500'
  },
  {
    id: '3',
    title: 'Săn kho báu - Hình học',
    thumbnail: 'https://picsum.photos/seed/game3/400/300',
    source: 'Wordwall',
    category: 'Chủ đề 1: Ôn tập',
    embedUrl: 'https://wordwall.net/embed/play/987/654/321', // Example URL
    color: 'bg-orange-500'
  },
  {
    id: '4',
    title: 'Ong tìm mật - Phép chia hết',
    thumbnail: 'https://picsum.photos/seed/game4/400/300',
    source: 'Trò chơi của Cô Ngọc',
    category: 'Chủ đề 2: Phép nhân, phép chia',
    embedUrl: 'https://wordwall.net/embed/play/111/222/333', // Example URL
    color: 'bg-green-500'
  }
];

const FILTERS = ['Tất cả', 'Chủ đề 1: Ôn tập', 'Chủ đề 2: Phép nhân, phép chia'];

const StudentGames: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filteredGames = activeFilter === 'Tất cả' 
    ? MOCK_GAMES 
    : MOCK_GAMES.filter(game => game.category === activeFilter);

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <Gamepad2 size={18} className="text-white" />
              <span className="text-sm font-medium">Khu vui chơi Toán học</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Vừa học vừa chơi, săn ngay sao vàng!
            </h1>
            <p className="text-yellow-50 text-lg">
              Tham gia các trò chơi thú vị để ôn tập kiến thức và nhận quà hấp dẫn.
            </p>
          </div>
          
          {/* Placeholder for Mascot */}
          <div className="hidden md:block relative w-32 h-32 lg:w-48 lg:h-48">
            {/* Using a trophy icon as a placeholder for the mascot */}
            <div className="absolute inset-0 flex items-center justify-center animate-bounce">
              <Trophy size={120} className="text-yellow-100 drop-shadow-lg" />
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === filter
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <div 
            key={game.id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
              <img 
                src={game.thumbnail} 
                alt={game.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md font-medium">
                  {game.source}
                </span>
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button 
                  onClick={() => setSelectedGame(game)}
                  className="bg-white text-blue-600 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg"
                >
                  <Play size={32} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-gray-500 mb-1 font-medium">{game.category}</div>
              <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 flex-1">
                {game.title}
              </h3>
              
              <button
                onClick={() => setSelectedGame(game)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                Chơi ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedGame(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedGame.color} text-white`}>
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{selectedGame.title}</h3>
                  <p className="text-xs text-gray-500">{selectedGame.source}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGame(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 bg-gray-900 relative">
              <iframe
                src={selectedGame.embedUrl}
                title={selectedGame.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGames;
