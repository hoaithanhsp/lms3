import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookOpenCheck, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  
  // If already logged in, redirect
  React.useEffect(() => {
     if (user) {
        if (user.role === UserRole.TEACHER) navigate('/admin/dashboard');
        else navigate('/app/dashboard');
     }
  }, [user, navigate]);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        await login({ username, password });
      } else {
        if (!name || !username || !password) {
          throw new Error("Vui lòng nhập đầy đủ thông tin!");
        }
        await register({ name, username, password, role });
      }
      // Navigation is handled in AuthContext or via the useEffect above upon state change
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             {/* Decorative circles */}
             <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
             <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white"></div>
          </div>
          
          <div className="mb-6 bg-white/20 p-4 rounded-full relative z-10">
            <BookOpenCheck size={64} />
          </div>
          <h1 className="text-3xl font-bold mb-4 relative z-10">LMS Toán 3</h1>
          <p className="text-blue-100 text-lg mb-8 relative z-10">Kết Nối Tri Thức Với Cuộc Sống</p>
          <div className="text-sm text-blue-200 relative z-10 max-w-xs">
            Hệ thống quản lý học tập và đánh giá học sinh tiểu học theo Thông tư 27.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex justify-end mb-6">
             <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button 
                  onClick={() => { setMode('LOGIN'); setError(''); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Đăng nhập
                </button>
                <button 
                   onClick={() => { setMode('REGISTER'); setError(''); }}
                   className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Đăng ký
                </button>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {mode === 'LOGIN' ? 'Chào mừng quay lại!' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              {mode === 'LOGIN' ? 'Vui lòng đăng nhập để tiếp tục.' : 'Điền thông tin bên dưới để bắt đầu học tập.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'REGISTER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {mode === 'REGISTER' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Bạn là?</label>
                   <div className="grid grid-cols-2 gap-3">
                     <button
                       type="button"
                       onClick={() => setRole('STUDENT')}
                       className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${role === 'STUDENT' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                     >
                        Học sinh
                     </button>
                     <button
                       type="button"
                       onClick={() => setRole('TEACHER')}
                       className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${role === 'TEACHER' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                     >
                        Giáo viên
                     </button>
                   </div>
                 </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? 'Đang xử lý...' : (
                  <>
                    {mode === 'LOGIN' ? 'Đăng nhập' : 'Đăng ký ngay'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Tài khoản dùng thử: <span className="font-mono bg-gray-100 px-1 rounded">tran_van_nam / 123456</span> (Học sinh) hoặc <span className="font-mono bg-gray-100 px-1 rounded">admin / 123456</span> (Quản trị)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;