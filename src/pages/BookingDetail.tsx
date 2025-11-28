import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import type { Booking } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

// 취소 확인 모달
function CancelConfirmModal({ isOpen, onClose, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h3 className="text-xl font-bold mb-4 text-red-600">예매 취소 확인</h3>
        <p className="text-gray-700 mb-6">정말로 예매를 취소하시겠습니까?</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            닫기
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            취소하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      // 전체 예매 목록을 가져와서 해당 bookingId를 찾습니다
      const response = await bookingApi.getMyBookings();
      const foundBooking = response.data.find(b => b.bookingId === Number(bookingId));
      
      if (!foundBooking) {
        toast.error('예매 내역을 찾을 수 없습니다');
        navigate('/bookings');
        return;
      }
      
      setBooking(foundBooking);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('예매 내역을 불러오는데 실패했습니다');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!booking) return;
    
    setIsModalOpen(false);
    setCancelling(true);
    
    try {
      await bookingApi.cancelBooking(booking.bookingId);
      toast.success('예매가 취소되었습니다');
      
      // 취소 후 예매 상태 업데이트
      setBooking({ ...booking, status: 'CANCELLED' });
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.response?.data?.message || '취소에 실패했습니다');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '결제 대기' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', label: '예매 완료' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: '취소됨' },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) return <Loading />;
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/bookings')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          예매 내역으로 돌아가기
        </button>

        <div className="card">
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">예매 상세</h1>
              <p className="text-gray-600">예매 번호: {booking.bookingId}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">이벤트 정보</h2>
              <p className="text-2xl font-bold text-gray-900">{booking.eventName}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">좌석 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.section}
                    {booking.seatRow && booking.seatCol && (
                      <span className="ml-2 text-gray-600">
                        {booking.seatRow}행 {booking.seatCol}열
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">결제 금액</h3>
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">
                    {booking.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {booking.status === 'PENDING' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ 결제 대기 중입니다. 5분 이내에 결제하지 않으면 자동으로 취소됩니다.
                </p>
              </div>
            )}

            {booking.status === 'CONFIRMED' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ 예매가 완료되었습니다.
                </p>
              </div>
            )}

            {booking.status === 'CANCELLED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  이 예매는 취소되었습니다.
                </p>
              </div>
            )}
          </div>

          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={cancelling}
                className="w-full px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? '취소 처리 중...' : '예매 취소'}
              </button>
            </div>
          )}
        </div>
      </div>

      <CancelConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}