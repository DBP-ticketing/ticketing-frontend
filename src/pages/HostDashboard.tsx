import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi, placeApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'create'>('events');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">호스트 대시보드</h1>

        <div className="flex space-x-4 mb-8">
          <button onClick={() => setActiveTab('events')} className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'events' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            내 이벤트 관리
          </button>
          <button onClick={() => setActiveTab('create')} className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'create' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            이벤트 생성
          </button>
        </div>

        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'create' && <CreateEventTab />}
      </div>
    </div>
  );
}

function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventApi.getMyHostEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('이벤트 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      SCHEDULED: { bg: 'bg-gray-100', text: 'text-gray-700', label: '예매 전' },
      OPEN: { bg: 'bg-green-100', text: 'text-green-700', label: '예매 중' },
      CLOSED: { bg: 'bg-red-100', text: 'text-red-700', label: '마감' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: '취소' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', label: '종료' },
    };
    const badge = badges[status] || badges.SCHEDULED;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
        return '날짜 정보 없음'; 
    }
    
    const isoString = dateString.replace(' ', 'T'); 
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      console.error(`Invalid Date string received: ${dateString}`);
      return `날짜 형식 오류: ${dateString}`; 
    }

    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <Loading />;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">내 이벤트 목록</h2>
      {events.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg">아직 생성한 이벤트가 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">이벤트 생성 탭에서 새 이벤트를 만들어보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            if (!event) return null; 

            return (
              <div key={event.eventId} className="border rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.eventName}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>장소: {event.placeName ?? '장소 정보 없음'}</p>
                      <p>공연 일시: {formatDate(event.date)}</p>
                      <p>예매 시작: {formatDate(event.ticketingStartAt)}</p>
                    </div>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateEventTab() {
  const [formData, setFormData] = useState({
    placeId: '',
    eventName: '',
    category: 'CONCERT',
    date: '',
    ticketingStartAt: '',
    seatForm: 'ASSIGNED',
  });
  const [places, setPlaces] = useState<{ placeId: number; placeName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
  try {
    const response = await placeApi.getAllPlaces();
    console.log('Place API full response:', response);
    console.log('Response data:', response.data);
    
    if (response.data && Array.isArray(response.data)) {
      setPlaces(response.data.map((place: any) => ({
        placeId: place.placeId,
        placeName: place.placeName
      })));
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      setPlaces(response.data.data.map((place: any) => ({
        placeId: place.placeId,
        placeName: place.placeName
      })));
    } else {
      console.error('Unexpected response structure:', response.data);
      setPlaces([]);
    }
    } catch (error) {
      console.error('Failed to fetch places:', error);
      toast.error('장소 목록을 불러오는데 실패했습니다');
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placeId || !formData.eventName || !formData.date || !formData.ticketingStartAt) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    const eventData = {
      placeId: Number(formData.placeId),
      eventName: formData.eventName,
      category: formData.category,
      date: formData.date,
      ticketingStartAt: formData.ticketingStartAt,
      seatForm: formData.seatForm,
      seatSettings: [
        { sectionName: 'A', seatLevel: 'VIP', price: 100000 },
      ],
    };

    setLoading(true);
    try {
      await eventApi.createEvent(eventData);
      toast.success('이벤트가 생성되었습니다!');
      setFormData({
        placeId: '',
        eventName: '',
        category: 'CONCERT',
        date: '',
        ticketingStartAt: '',
        seatForm: 'ASSIGNED',
      });
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.response?.data?.message || '이벤트 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">새 이벤트 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이벤트명</label>
          <input type="text" value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} className="input" placeholder="예: BTS 콘서트" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">장소 선택</label>
          {loadingPlaces ? (
            <div className="input bg-gray-100">로딩 중...</div>
          ) : (
            <select value={formData.placeId} onChange={(e) => setFormData({ ...formData, placeId: e.target.value })} className="input" required>
              <option value="">장소를 선택하세요</option>
              {places.map((place) => (
                <option key={place.placeId} value={place.placeId}>
                  {place.placeName}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input">
            <option value="CONCERT">콘서트</option>
            <option value="MUSICAL">뮤지컬</option>
            <option value="THEATER">연극</option>
            <option value="SPORTS">스포츠</option>
            <option value="EXHIBITION">전시회</option>
            <option value="ETC">기타</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">공연 날짜</label>
          <input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">예매 시작 시간</label>
          <input type="datetime-local" value={formData.ticketingStartAt} onChange={(e) => setFormData({ ...formData, ticketingStartAt: e.target.value })} className="input" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">좌석 형태</label>
          <select value={formData.seatForm} onChange={(e) => setFormData({ ...formData, seatForm: e.target.value })} className="input">
            <option value="ASSIGNED">지정좌석</option>
            <option value="FREE">자유좌석</option>
            <option value="STANDING">스탠딩</option>
          </select>
        </div>
        
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '생성 중...' : '이벤트 생성'}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ 간단한 폼입니다. 실제로는 좌석 구역별 가격 설정 등 더 상세한 정보가 필요합니다.
        </p>
      </div>
    </div>
  );
}