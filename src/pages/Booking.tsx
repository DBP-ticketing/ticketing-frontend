import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seatApi, bookingApi, eventApi, paymentApi } from '../services/api';
import type { Seat, EventDetail } from '../types/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

export default function Booking() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventRes, seatsRes] = await Promise.all([
        eventApi.getEventDetail(Number(eventId)),
        seatApi.getSeats(Number(eventId)),
      ]);
      setEvent(eventRes.data);
      setSeats(seatsRes.data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error(error.response?.data?.message || '데이터를 불러오는데 실패했습니다');
      navigate(`/events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') {
      toast.error('선택할 수 없는 좌석입니다');
      return;
    }
    setSelectedSeat(seat);
  };

  const handleBooking = async () => {
    if (!selectedSeat) {
      toast.error('좌석을 선택해주세요');
      return;
    }
    setProcessing(true);
    try {
      const bookingRes = await bookingApi.createBooking({ eventId: Number(eventId), seatId: selectedSeat.seatId });
      const booking = bookingRes.data;
      toast.success('예매가 생성되었습니다!');
      const paymentRes = await paymentApi.ready(booking.bookingId);
      const paymentData = paymentRes.data;
      window.location.href = paymentData.paymentUrl;
    } catch (error: any) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.message || '예매에 실패했습니다');
      setProcessing(false);
    }
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500 hover:bg-green-600 cursor-pointer';
      case 'RESERVED': return 'bg-yellow-500 cursor-not-allowed';
      case 'SOLD': return 'bg-gray-400 cursor-not-allowed';
      default: return 'bg-gray-300 cursor-not-allowed';
    }
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) acc[seat.section] = [];
    acc[seat.section].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  if (loading) return <Loading />;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.eventName}</h1>
          <p className="text-gray-600">좌석을 선택해주세요 (한 번에 1석만 구매 가능)</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-center">무대</h2>
              <div className="flex justify-center space-x-6 mb-6 text-sm">
                <div className="flex items-center"><div className="w-6 h-6 bg-green-500 rounded mr-2"></div><span>선택 가능</span></div>
                <div className="flex items-center"><div className="w-6 h-6 bg-yellow-500 rounded mr-2"></div><span>예약 중</span></div>
                <div className="flex items-center"><div className="w-6 h-6 bg-gray-400 rounded mr-2"></div><span>판매 완료</span></div>
              </div>
              <div className="space-y-8">
                {Object.entries(groupedSeats).map(([section, sectionSeats]) => {
                  const maxRow = Math.max(...sectionSeats.map(s => s.row));
                  const maxCol = Math.max(...sectionSeats.map(s => s.col));
                  const seatGrid: (Seat | null)[][] = Array(maxRow).fill(null).map(() => Array(maxCol).fill(null));
                  sectionSeats.forEach(seat => { seatGrid[seat.row - 1][seat.col - 1] = seat; });
                  return (
                    <div key={section} className="border rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-4 text-center">{section} 구역</h3>
                      <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                          {seatGrid.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center mb-2">
                              <span className="w-8 text-xs text-gray-500 flex items-center justify-center">{rowIndex + 1}</span>
                              {row.map((seat, colIndex) => (
                                seat ? (
                                  <button key={seat.seatId} onClick={() => handleSeatClick(seat)} disabled={seat.status !== 'AVAILABLE'}
                                    className={`w-8 h-8 m-1 rounded text-xs font-medium transition ${getSeatColor(seat.status)} ${selectedSeat?.seatId === seat.seatId ? 'ring-4 ring-primary' : ''}`}
                                    title={`${seat.row}행 ${seat.col}열 - ${seat.price.toLocaleString()}원`}>
                                    {seat.col}
                                  </button>
                                ) : <div key={colIndex} className="w-8 h-8 m-1"></div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-6">선택 정보</h2>
              {selectedSeat ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between"><span className="text-gray-600">구역</span><span className="font-medium">{selectedSeat.section}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">좌석</span><span className="font-medium">{selectedSeat.row}행 {selectedSeat.col}열</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">등급</span><span className="font-medium">{selectedSeat.seatLevel}</span></div>
                    <div className="flex justify-between text-lg"><span className="font-semibold">금액</span><span className="font-bold text-primary">{selectedSeat.price.toLocaleString()}원</span></div>
                  </div>
                  <button onClick={handleBooking} disabled={processing} className="btn-primary w-full">{processing ? '처리 중...' : '결제하기'}</button>
                  <p className="text-xs text-gray-500 text-center mt-4">예매 후 5분 내 결제하지 않으면 자동 취소됩니다</p>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  <p className="text-gray-500">좌석을 선택해주세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
