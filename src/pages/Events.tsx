import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../services/api';
import type { Event } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const response = await eventApi.getEvents(filter);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">이벤트</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === '' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>전체</button>
            <button onClick={() => setFilter('OPEN')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'OPEN' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>예매 중</button>
            <button onClick={() => setFilter('SCHEDULED')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'SCHEDULED' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>예매 예정</button>
            <button onClick={() => setFilter('CLOSED')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'CLOSED' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>예매 마감</button>
            <button onClick={() => setFilter('CANCELLED')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'CANCELLED' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>취소됨</button>
            <button onClick={() => setFilter('COMPLETED')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'COMPLETED' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>종료</button>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500 text-lg">이벤트가 없습니다</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.eventId} to={`/events/${event.eventId}`} className="card hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{event.eventName}</h3>
                  {getStatusBadge(event.status)}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{event.hostName}</p>
                  <p className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{event.placeName}</p>
                  <p className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{formatDate(event.date)}</p>
                  <p className="flex items-center text-green-700 font-semibold">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    예매 시작: {formatDate(event.ticketingStartAt)}
                  </p>
                </div>
                {event.status === 'OPEN' && <div className="mt-4 pt-4 border-t"><p className="text-primary font-medium text-sm">지금 예매 가능 →</p></div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}