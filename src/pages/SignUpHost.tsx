import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function SignUpHost() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    companyName: '',
    businessNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name || 
        !formData.phoneNumber || !formData.companyName || !formData.businessNumber) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await authApi.signUpHost(formData);
      toast.success('호스트 회원가입 요청이 완료되었습니다! 관리자 승인을 기다려주세요.');
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
            <h2 className="text-3xl font-bold text-gray-900">호스트 회원가입</h2>
            <p className="text-gray-600 mt-2">이벤트를 주최하고 관리하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="input" 
                placeholder="example@email.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="input" 
                placeholder="8자 이상, 영문+숫자 포함" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="input" 
                placeholder="홍길동" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <input 
                type="text" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                className="input" 
                placeholder="01012345678 (하이픈 제외)" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
              <input 
                type="text" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange} 
                className="input" 
                placeholder="(주)이벤트컴퍼니" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사업자 등록번호</label>
              <input 
                type="text" 
                name="businessNumber" 
                value={formData.businessNumber} 
                onChange={handleChange} 
                className="input" 
                placeholder="123-45-67890" 
              />
              <p className="text-xs text-gray-500 mt-1">형식: 000-00-00000</p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full"
            >
              {loading ? '가입 중...' : '호스트 회원가입'}
            </button>
          </form>

          <div className="mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ 호스트 회원가입은 관리자의 승인이 필요합니다.<br/>
                승인 후 로그인이 가능합니다.
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-600">
                일반 사용자이신가요?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  일반 회원가입
                </Link>
              </p>
              <p className="text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}