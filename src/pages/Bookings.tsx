import { useState, useEffect } from 'react';
import { bookingApi } from '../services/api';
import type { Booking } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// [추가] 커스텀 확인 모달 컴포넌트 (window.confirm 대체)
function ConfirmationModal({ isOpen, onClose, onConfirm, bookingId }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                <h3 className="text-xl font-bold mb-4 text-red-600">예매 취소 확인</h3>
                <p className="text-gray-700 mb-6">정말로 예매를 취소하시겠습니까?</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        닫기
                    </button>
                    <button onClick={() => onConfirm(bookingId)} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                        취소하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  
  // [추가] 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const response = await bookingApi.getMyBookings(filter);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('예매 내역을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // [수정] 모달 열기 핸들러 (취소 버튼 클릭 시 호출)
  const handleOpenCancelModal = (bookingId: number) => {
    setBookingToCancelId(bookingId);
    setIsModalOpen(true);
  };
  
  // [수정] 취소 실행 함수 (모달 확인 버튼에서 호출)
  const handleCancel = async (bookingId: number | null) => {
    if (!bookingId) return;
    
    setIsModalOpen(false); // 모달 닫기
    setBookingToCancelId(null); // ID 초기화
    
    try {
      // 기존 취소 로직 실행 (confirm 제거)
      await bookingApi.cancelBooking(bookingId);
      toast.success('예매가 취소되었습니다');
      fetchBookings(); // 목록 새로고침
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.response?.data?.message || '취소에 실패했습니다');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '결제 대기' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', label: '예매 완료' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: '취소됨' },
    };
    const badge = badges[status] || badges.PENDING;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">예매 내역</h1>
          <div className="flex space-x-2">
            <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === '' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>전체</button>
            <button onClick={() => setFilter('CONFIRMED')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'CONFIRMED' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>예매 완료</button>
            <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'PENDING' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>결제 대기</button>
          </div>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            <p className="text-gray-500 text-lg">예매 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              // [수정] Link로 래핑하여 예매 항목 클릭 시 이벤트 상세 페이지로 이동
              <Link to={booking.eventId ? `/events/${booking.eventId}` : '#'} 
                    key={booking.bookingId} 
                    className={`card block transition ${booking.eventId ? 'hover:shadow-lg' : 'cursor-default'}`}
                    onClick={(e) => { 
                        if (!booking.eventId) e.preventDefault(); // eventId 없으면 이동 방지
                    }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{booking.eventName}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <p>{booking.section}{booking.seatRow && booking.seatCol && ` | ${booking.seatRow}행 ${booking.seatCol}열`}</p>
                      <p>{booking.price.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      // [수정] 모달 호출 및 Link 이동 방지
                      <button 
                        onClick={(e) => {
                            e.preventDefault(); // Link 이동을 막고 모달만 띄웁니다.
                            handleOpenCancelModal(booking.bookingId);
                        }} 
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
                        취소
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* [추가] 모달 렌더링 */}
      <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleCancel}
          bookingId={bookingToCancelId}
      />
    </div>
  );
}