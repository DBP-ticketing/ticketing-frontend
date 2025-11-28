import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { queueApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { QueueStatus } from '../types/api';

export default function Queue() {
  const { eventId } = useParams<{ eventId: string }>();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    startPolling();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startPolling = () => {
    checkQueue();
    intervalRef.current = setInterval(() => checkQueue(), 1000);
  };

  const checkQueue = async () => {
    try {
      const response = await queueApi.getRank(Number(eventId));
      const data = response.data;
      setQueueStatus(data);
      setLoading(false);
      
      if (data.active) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // userId를 localStorage와 store에서 가져오기
        const userId = user?.userId || localStorage.getItem('userId') || '1';
        
        // Queue-Token과 Event-Id 설정
        localStorage.setItem('Queue-Token', userId.toString());
        localStorage.setItem('Event-Id', eventId!);
        
        console.log('Queue activated! userId:', userId, 'eventId:', eventId);
        
        setTimeout(() => navigate(`/booking/${eventId}`), 2000);
      }
    } catch (error) {
      console.error('Failed to check queue:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">대기열 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!queueStatus) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          {!queueStatus.active ? (
            <>
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">대기 중입니다</h2>
              {queueStatus.rank && (
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 mb-6">
                  <p className="text-sm mb-2">현재 대기 순서</p>
                  <p className="text-6xl font-bold">{queueStatus.rank}</p>
                  <p className="text-sm mt-2">번째</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">입장 가능합니다!</h2>
              <p className="text-gray-600 mb-6">예매 페이지로 이동합니다...</p>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
