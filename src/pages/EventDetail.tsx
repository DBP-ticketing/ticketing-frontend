import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, queueApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { EventDetail } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await eventApi.getEventDetail(Number(eventId));
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('이벤트 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }
    try {
      await queueApi.joinQueue(Number(eventId));
      toast.success('대기열에 등록되었습니다');
      navigate(`/queue/${eventId}`);
    } catch (error: any) {
      console.error('Failed to join queue:', error);
      toast.error(error.response?.data?.message || '대기열 등록에 실패했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    const isoString = dateString.replace(' ', 'T');
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      console.error(`Invalid Date string received: ${dateString}`);
      return `날짜 형식 오류: ${dateString}`;
    }

    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getSeatFormLabel = (seatForm: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: '지정좌석',
      FREE: '자유좌석',
      STANDING: '스탠딩'
    };
    return labels[seatForm] || seatForm;
  };

  if (loading) return <Loading />;
  if (!event) return <div>이벤트를 찾을 수 없습니다</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="border-b pb-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.eventName}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${event.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {event.status === 'OPEN' ? '예매 중' : '예매 전'}
              </span>
              <span className="text-gray-600">{event.category}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {getSeatFormLabel(event.seatForm)}
              </span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-gray-400 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <div><p className="text-sm text-gray-500">주최</p><p className="text-lg font-medium text-gray-900">{event.hostName}</p></div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 text-gray-400 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div><p className="text-sm text-gray-500">장소</p><p className="text-lg font-medium text-gray-900">{event.placeName}</p><p className="text-gray-600">{event.address}</p></div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 text-gray-400 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <div><p className="text-sm text-gray-500">공연 일시</p><p className="text-lg font-medium text-gray-900">{formatDate(event.date)}</p></div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 text-gray-400 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div><p className="text-sm text-gray-500">예매 시작</p><p className="text-lg font-medium text-gray-900">{formatDate(event.ticketingStartAt)}</p></div>
            </div>
          </div>
          {event.status === 'OPEN' && (
            <div className="mt-8 pt-6 border-t">
              <button onClick={handleJoinQueue} className="btn-primary w-full text-lg py-4">예매하기</button>
              <p className="text-center text-sm text-gray-500 mt-4">대기열에 등록한 후 순서대로 입장합니다</p>
            </div>
          )}
          {event.status === 'SCHEDULED' && (
            <div className="mt-8 pt-6 border-t">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-700 font-medium">예매 시작 전입니다</p>
                <p className="text-sm text-gray-600 mt-2">{formatDate(event.ticketingStartAt)}부터 예매 가능</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}