import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name || !formData.phoneNumber) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await authApi.signUpUser(formData);
      toast.success('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error: any) {
      console.error('SignUp error:', error);
      toast.error(error.response?.data?.message || '회원가입에 실패했습니다');
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
            <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
            <p className="text-gray-600 mt-2">새로운 계정을 만드세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" placeholder="8자 이상, 영문+숫자 포함" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="홍길동" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="input" placeholder="01012345678 (하이픈 제외)" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">로그인</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
