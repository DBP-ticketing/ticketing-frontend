import { useState, useEffect } from 'react';
import { adminApi, placeApi } from '../services/api';
import type { Host } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'hosts' | 'places'>('hosts');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>

        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab('hosts')} 
            className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'hosts' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            호스트 관리
          </button>
          <button 
            onClick={() => setActiveTab('places')} 
            className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'places' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            장소 관리
          </button>
        </div>

        {activeTab === 'hosts' && <HostsTab />}
        {activeTab === 'places' && <PlacesTab />}
      </div>
    </div>
  );
}

function HostsTab() {
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
    <div>
      <div className="mb-6 flex space-x-2">
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'pending' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
          승인 대기
        </button>
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
          전체 호스트
        </button>
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
  );
}

function PlacesTab() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [formData, setFormData] = useState({
    placeName: '',
    address: '',
    sections: [{ sectionName: '', rows: 1, columns: 1 }]
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await placeApi.getAllPlaces();
      setPlaces(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch places:', error);
      toast.error('장소 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlace = async (placeId: number) => {
    try {
      const response = await placeApi.getPlace(placeId);
      setSelectedPlace(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '장소 정보를 불러오는데 실패했습니다');
    }
  };

  const handleDeletePlace = async (placeId: number) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await placeApi.deletePlace(placeId);
      toast.success('장소가 삭제되었습니다');
      fetchPlaces();
      if (selectedPlace?.placeId === placeId) {
        setSelectedPlace(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '삭제에 실패했습니다');
    }
  };

  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { sectionName: '', rows: 1, columns: 1 }]
    });
  };

  const handleRemoveSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placeName || !formData.address) {
      toast.error('장소명과 주소를 입력해주세요');
      return;
    }

    if (formData.sections.some(s => !s.sectionName || s.rows < 1 || s.columns < 1)) {
      toast.error('모든 구역 정보를 올바르게 입력해주세요');
      return;
    }

    try {
      await placeApi.createPlace(formData);
      toast.success('장소가 생성되었습니다');
      setShowCreateForm(false);
      setFormData({
        placeName: '',
        address: '',
        sections: [{ sectionName: '', rows: 1, columns: 1 }]
      });
      fetchPlaces();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '장소 생성에 실패했습니다');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? '취소' : '+ 새 장소 생성'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card mb-6">
          <h3 className="text-2xl font-bold mb-6">새 장소 생성</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">장소명</label>
              <input
                type="text"
                value={formData.placeName}
                onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                className="input"
                placeholder="예: 올림픽공원 체조경기장"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                placeholder="예: 서울특별시 송파구 올림픽로 424"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">구역 설정</label>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="text-sm text-primary hover:underline"
                >
                  + 구역 추가
                </button>
              </div>

              {formData.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">구역 {index + 1}</h4>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">구역명</label>
                      <input
                        type="text"
                        value={section.sectionName}
                        onChange={(e) => handleSectionChange(index, 'sectionName', e.target.value)}
                        className="input"
                        placeholder="예: A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">행 수</label>
                      <input
                        type="number"
                        min="1"
                        value={section.rows}
                        onChange={(e) => handleSectionChange(index, 'rows', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">열 수</label>
                      <input
                        type="number"
                        min="1"
                        value={section.columns}
                        onChange={(e) => handleSectionChange(index, 'columns', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full">
              장소 생성
            </button>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-4">장소 목록</h3>
          {places.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 장소가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {places.map((place) => (
                <div
                  key={place.placeId}
                  className={`card cursor-pointer transition ${selectedPlace?.placeId === place.placeId ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleViewPlace(place.placeId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{place.placeName}</h4>
                      <p className="text-gray-600 text-sm">{place.address}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlace(place.placeId);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">장소 상세 정보</h3>
          {selectedPlace ? (
            <div className="card">
              <h4 className="text-2xl font-bold mb-2">{selectedPlace.placeName}</h4>
              <p className="text-gray-600 mb-6">{selectedPlace.address}</p>

              <h5 className="font-bold mb-4">구역 정보</h5>
              {selectedPlace.sections && selectedPlace.sections.length > 0 ? (
                <div className="space-y-3">
                  {selectedPlace.sections.map((section: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{section.sectionName} 구역</span>
                        <span className="text-gray-600">
                          {section.rowCount}행 × {section.colCount}열 = {section.rowCount * section.colCount}석
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">구역 정보가 없습니다</p>
              )}
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              장소를 선택하면 상세 정보가 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}