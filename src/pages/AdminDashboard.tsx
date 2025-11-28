import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import type { Host } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHosts();
  }, [filter]);

  const fetchHosts = async () => {
    try {
      const response = filter === 'pending' 
        ? await adminApi.getPendingHosts()
        : await adminApi.getAllHosts();
      setHosts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch hosts:', error);
      toast.error('호스트 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hostId: number) => {
    try {
      await adminApi.approveHost(hostId);
      toast.success('호스트가 승인되었습니다');
      fetchHosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '승인에 실패했습니다');
    }
  };

  const handleReject = async (hostId: number) => {
    if (!confirm('정말 거부하시겠습니까?')) return;
    try {
      await adminApi.rejectHost(hostId);
      toast.success('호스트가 거부되었습니다');
      fetchHosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '거부에 실패했습니다');
    }
  };

  const handleSuspend = async (hostId: number) => {
    if (!confirm('정말 정지하시겠습니까?')) return;
    try {
      await adminApi.suspendHost(hostId);
      toast.success('호스트가 정지되었습니다');
      fetchHosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '정지에 실패했습니다');
    }
  };

  const handleActivate = async (hostId: number) => {
    try {
      await adminApi.activateHost(hostId);
      toast.success('호스트가 활성화되었습니다');
      fetchHosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '활성화에 실패했습니다');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: '활성' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '대기' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: '거부' },
      SUSPENDED: { bg: 'bg-gray-100', text: 'text-gray-700', label: '정지' },
    };
    const badge = badges[status] || badges.PENDING;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">관리자 대시보드</h1>
          <div className="flex space-x-2">
            <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'pending' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              승인 대기
            </button>
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              전체 호스트
            </button>
          </div>
        </div>

        {hosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">호스트가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hosts.map((host) => (
              <div key={host.hostId} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{host.name}</h3>
                      {getStatusBadge(host.status)}
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <p>회사: {host.companyName}</p>
                      <p>이메일: {host.email}</p>
                      <p>전화번호: {host.phoneNumber}</p>
                      <p>사업자번호: {host.businessNumber}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col space-y-2">
                    {host.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(host.hostId)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition">승인</button>
                        <button onClick={() => handleReject(host.hostId)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition">거부</button>
                      </>
                    )}
                    {host.status === 'ACTIVE' && (
                      <button onClick={() => handleSuspend(host.hostId)} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition">정지</button>
                    )}
                    {host.status === 'SUSPENDED' && (
                      <button onClick={() => handleActivate(host.hostId)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">활성화</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
