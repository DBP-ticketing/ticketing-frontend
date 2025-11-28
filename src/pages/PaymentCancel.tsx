import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">결제 취소</h1>
          <p className="text-gray-600 mb-8">결제가 취소되었습니다</p>
          {bookingId && <p className="text-sm text-gray-500 mb-6">예매 번호: {bookingId}</p>}
          <div className="space-y-3">
            <button onClick={() => navigate('/bookings')} className="btn-primary w-full">예매 내역 확인</button>
            <button onClick={() => navigate('/events')} className="btn-secondary w-full">다른 이벤트 보기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
