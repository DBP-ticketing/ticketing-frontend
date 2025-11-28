import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { data } = response.data;
      
      if (data && data.userId) {
        console.log('Login successful - userId:', data.userId);
        
        login(
          { 
            userId: data.userId,
            email: data.email, 
            name: data.name, 
            role: data.role 
          },
          data.accessToken
        );
        
        toast.success('로그인 성공!');
        
        // 역할에 따라 다른 페이지로 이동
        if (data.role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else if (data.role === 'ROLE_HOST') {
          navigate('/host');
        } else {
          navigate('/events');
        }
      } else {
        toast.error('사용자 정보를 불러올 수 없습니다');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="MOL" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
            <p className="text-gray-600 mt-2">MOL ticket 계정으로 로그인하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
