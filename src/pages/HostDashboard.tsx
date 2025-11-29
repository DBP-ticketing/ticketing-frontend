import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventApi, placeApi } from '../services/api'; 
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

// 백엔드 CreateEventRequestDto.java의 SectionSetting과 일치하는 인터페이스 정의
interface SectionSetting {
  sectionName: string;
  // 백엔드 SeatLevel.java에 맞춰 string을 포함하도록 수정
  seatLevel: 'VIP' | 'R' | 'S' | 'A' | 'B' | 'DEFAULT' | string; 
  price: number;
}

// 이벤트 생성 폼 데이터 인터페이스 업데이트
interface CreateEventFormData {
  placeId: string;
  eventName: string;
  category: string;
  date: string;
  ticketingStartAt: string;
  // 백엔드 Enum에 맞게 SeatForm 타입 업데이트 (추가적인 값 SEAT_WITH_SECTION이 없다고 가정하고 기존 타입 유지)
  seatForm: 'ASSIGNED' | 'FREE' | 'STANDING';
  seatSettings: SectionSetting[]; // 구역 설정 리스트
}

// SeatLevel Enum 값 (백엔드 SeatLevel.java 기준 추정)
const seatLevels: SectionSetting['seatLevel'][] = ['VIP', 'R', 'S', 'A', 'B', 'DEFAULT'];

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
// --------------------------------------------------------------------------------------------------

function CreateEventTab() {
  const [formData, setFormData] = useState<CreateEventFormData>({
    placeId: '',
    eventName: '',
    category: 'CONCERT',
    date: '',
    ticketingStartAt: '',
    seatForm: 'ASSIGNED',
    seatSettings: [], // 초기에는 빈 배열
  });
  const [places, setPlaces] = useState<{ placeId: number; placeName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);

  // 장소 목록 불러오기
  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await placeApi.getAllPlaces();
      let placeData: any[] = [];
      if (response.data && Array.isArray(response.data)) {
        placeData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        placeData = response.data.data;
      } 
  
      setPlaces(placeData.map((place: any) => ({
        placeId: place.placeId,
        placeName: place.placeName
      })));
    } catch (error) {
      console.error('Failed to fetch places:', error);
      toast.error('장소 목록을 불러오는데 실패했습니다');
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // 장소 ID로 해당 장소의 구역 목록을 가져오는 함수 (실제 API 호출)
  const fetchPlaceSections = useCallback(async (placeId: number): Promise<string[]> => {
    setLoadingSections(true);
    try {
      // placeApi에 추가된 getPlaceSections 호출
      const response = await placeApi.getPlaceSections(placeId);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch place sections:', error);
      toast.error('장소 구역 정보를 불러오는데 실패했습니다. 장소에 좌석 템플릿이 설정되었는지 확인하세요.');
      return [];
    } finally {
      setLoadingSections(false);
    }
  }, []);


  // 좌석 구역 설정 변경 핸들러 (등급 및 가격만 변경 가능)
  const handleSeatSettingChange = (
    index: number, 
    field: 'seatLevel' | 'price', 
    value: string | number
  ) => {
    const newSettings = [...formData.seatSettings];
    newSettings[index] = { 
      ...newSettings[index], 
      [field]: field === 'price' ? Number(value) : String(value) 
    };
    setFormData({ ...formData, seatSettings: newSettings });
  };

  // 장소 선택 변경 핸들러
  const handlePlaceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlaceId = e.target.value;
    const currentSeatForm = formData.seatForm;
    
    // 장소 ID 업데이트 및 기존 설정 유지/초기화
    setFormData(prev => ({ 
      ...prev, 
      placeId: newPlaceId, 
      // ASSIGNED일 경우, 장소에 따라 구역이 바뀌므로 seatSettings를 비웁니다.
      seatSettings: currentSeatForm === 'ASSIGNED' ? [] : prev.seatSettings,
    }));

    if (newPlaceId && currentSeatForm === 'ASSIGNED') {
      const id = Number(newPlaceId);
      const sectionNames = await fetchPlaceSections(id);

      // 가져온 구역명으로 seatSettings 초기화
      const initialSettings: SectionSetting[] = sectionNames.map(sectionName => ({
        sectionName: sectionName,
        seatLevel: 'S', // 기본 등급 설정
        price: 50000,   // 기본 가격 설정
      }));

      setFormData(prev => ({
        ...prev,
        seatSettings: initialSettings,
      }));

      if (sectionNames.length === 0) {
        toast('선택한 장소에 구역 정보가 없습니다. 장소 설정을 확인해주세요.', { icon: '⚠️' });
      }
    }
    
    // 자유/스탠딩일 경우, 장소 변경과 상관없이 기존의 단일 가격 설정을 유지
    // (초기 설정은 handleSeatFormChange에서 담당)
  };

  // 좌석 형태 변경 핸들러 (새로 추가)
  const handleSeatFormChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeatForm = e.target.value as CreateEventFormData['seatForm'];
    const currentPlaceId = formData.placeId;
    
    let initialSettings: SectionSetting[] = [];

    if (newSeatForm === 'FREE' || newSeatForm === 'STANDING') {
        // FREE 또는 STANDING일 경우, 단일 가격 설정을 위한 기본 객체 생성
        initialSettings = [{ 
            sectionName: newSeatForm === 'FREE' ? "자유좌석 전체" : "스탠딩 전체",
            // FIX: 백엔드 SeatLevel Enum에 포함되지 않은 'DEFAULT' 대신 'A' 사용
            seatLevel: 'A', // <--- 수정된 부분
            price: 50000,   // 기본 가격 설정
        }];
    }
    
    setFormData(prev => ({ 
        ...prev, 
        seatForm: newSeatForm,
        // FREE/STANDING일 경우 위에서 만든 단일 설정을 사용하고, ASSIGNED일 경우 비웁니다.
        seatSettings: newSeatForm === 'ASSIGNED' ? [] : initialSettings,
    }));


    if (newSeatForm === 'ASSIGNED' && currentPlaceId) {
        const id = Number(currentPlaceId);
        const sectionNames = await fetchPlaceSections(id);

        const assignedSettings: SectionSetting[] = sectionNames.map(sectionName => ({
            sectionName: sectionName,
            seatLevel: 'S', 
            price: 50000,
        }));

        // 상태를 다시 업데이트할 때, seatForm도 다시 설정하여 race condition을 피합니다.
        setFormData(prev => ({
            ...prev,
            seatSettings: assignedSettings,
            seatForm: newSeatForm,
        }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.placeId || !formData.eventName || !formData.date || !formData.ticketingStartAt) {
      toast.error('이벤트 기본 정보를 모두 입력해주세요');
      return;
    }
    
    // 좌석 설정 관련 유효성 검사
    const isAssignedSeating = formData.seatForm === 'ASSIGNED';
    const isSimpleSeating = formData.seatForm === 'FREE' || formData.seatForm === 'STANDING';

    if (isAssignedSeating || isSimpleSeating) {
        if (formData.seatSettings.length === 0) {
            toast.error('장소 또는 좌석 형태를 선택하고 가격 설정을 완료해주세요.');
            return;
        }

        if (isSimpleSeating) {
             // 자유/스탠딩은 단일 설정만 허용
             if (formData.seatSettings.length !== 1) {
                toast.error('자유좌석/스탠딩 이벤트는 하나의 가격 설정만 허용됩니다. 폼 오류입니다.');
                return;
             }
             const setting = formData.seatSettings[0];
             if (setting.price === null || setting.price === undefined || setting.price < 0) {
                toast.error('좌석 가격은 0원 이상으로 필수입니다.');
                return;
             }
        }

        if (isAssignedSeating) {
            const invalidSetting = formData.seatSettings.some(setting => 
              !setting.sectionName.trim() || setting.price === null || setting.price === undefined || setting.price < 0
            );
      
            if (invalidSetting) {
              toast.error('좌석 구역의 등급과 0원 이상의 가격은 필수입니다.');
              return;
            }
        }
    }


    const eventData = {
      placeId: Number(formData.placeId),
      eventName: formData.eventName,
      category: formData.category,
      date: formData.date,
      ticketingStartAt: formData.ticketingStartAt,
      seatForm: formData.seatForm,

      // 백엔드 DTO가 List<SectionSetting>을 요구하므로 준비된 배열을 보냅니다.
      seatSettings: formData.seatSettings,
    };

    setLoading(true);
    try {
      await eventApi.createEvent(eventData);
      toast.success('이벤트가 생성되었습니다!');
      // 성공 후 폼 초기화
      setFormData({
        placeId: '',
        eventName: '',
        category: 'CONCERT',
        date: '',
        ticketingStartAt: '',
        seatForm: 'ASSIGNED',
        seatSettings: [],
      });
    } catch (error: any) {
      console.error('Failed to create event:', error);
      // 서버에서 500 에러가 아닌 4xx 에러로 처리했다면 메시지를 표시
      toast.error(error.response?.data?.message || '이벤트 생성에 실패했습니다'); 
    } finally {
      setLoading(false);
    }
  };

  const isAssignedSeating = formData.seatForm === 'ASSIGNED';
  const isSimpleSeating = formData.seatForm === 'FREE' || formData.seatForm === 'STANDING';
  // ASSIGNED (구역별 설정) 또는 FREE/STANDING (단일 설정) 모두 설정이 필요합니다.
  const isSeatSettingRequired = isAssignedSeating || isSimpleSeating;
  // isSeatSettingDisabled는 ASSIGNED일 때만 장소 선택 여부/로딩 상태에 영향을 받습니다.
  const isSeatSettingDisabled = isAssignedSeating && (!formData.placeId || loadingSections);
  
  // FREE/STANDING일 때는 장소 ID가 필수는 아니지만, 백엔드 로직상 이벤트 생성 시 placeId는 항상 필수입니다.

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">새 이벤트 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이벤트 기본 정보 */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-800">1. 이벤트 기본 정보</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이벤트명</label>
            <input type="text" value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} className="input" placeholder="예: BTS 콘서트" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">장소 선택</label>
            {loadingPlaces ? (
              <div className="input bg-gray-100">로딩 중...</div>
            ) : (
              <select value={formData.placeId} onChange={handlePlaceChange} className="input" required>
                <option value="">장소를 선택하세요</option>
                {places.map((place) => (
                  <option key={place.placeId} value={place.placeId}>
                    {place.placeName}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">장소를 선택하면 '지정좌석' 선택 시 구역 정보가 로드됩니다.</p>
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
            <select 
                value={formData.seatForm} 
                onChange={handleSeatFormChange} 
                className="input"
            >
              <option value="ASSIGNED">지정좌석 (구역별 등급/가격)</option>
              <option value="FREE">자유좌석 (전체 동일 가격)</option>
              <option value="STANDING">스탠딩 (전체 동일 가격)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">좌석 형태에 따라 아래의 가격 설정 섹션이 달라집니다.</p>
          </div>
        </div>

        {/* 2. 가격/등급 설정 (공통) */}
        {isSeatSettingRequired && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">2. {isAssignedSeating ? '구역별 가격/등급 설정' : '단일 가격 설정 (등급 없음)'}</h3>

            {/* ASSIGNED 좌석 (구역별 등급/가격) */}
            {isAssignedSeating && (
              <>
                <p className="text-sm text-gray-600">장소 템플릿의 구역에 대해 등급(seatLevel)과 가격(price)을 설정합니다.</p>
                
                {isSeatSettingDisabled && !loadingSections ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                    이벤트에 사용할 장소를 먼저 선택해주세요.
                  </div>
                ) : loadingSections ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <Loading /> 장소의 구역 정보를 불러오는 중...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.seatSettings.map((setting, index) => (
                      <div key={setting.sectionName || index} className="grid grid-cols-5 gap-3 items-center p-3 border rounded-lg bg-white shadow-sm">
                        <span className="font-bold text-lg text-primary">{index + 1}.</span>
                        
                        {/* 구역명: 읽기 전용으로 표시 */}
                        <div className="col-span-2 space-y-1">
                          <label className="block text-xs font-medium text-gray-500">구역명</label>
                          <input
                            type="text"
                            value={setting.sectionName}
                            className="input-sm w-full bg-gray-100 font-semibold"
                            readOnly
                          />
                        </div>
                        
                        {/* 좌석 등급 설정 */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-500">등급</label>
                          <select
                            value={setting.seatLevel}
                            onChange={(e) => handleSeatSettingChange(index, 'seatLevel', e.target.value)}
                            className="input-sm w-full"
                            required
                          >
                            {seatLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* 가격 설정 */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-500">가격</label>
                          <input
                            type="number"
                            min="0"
                            value={setting.price}
                            onChange={(e) => handleSeatSettingChange(index, 'price', e.target.value)}
                            className="input-sm w-full"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* FREE / STANDING 좌석 (단일 가격) */}
            {isSimpleSeating && formData.seatSettings.length === 1 && (
                <>
                    <p className="text-sm text-gray-600">이벤트 전체 좌석에 적용할 동일한 가격을 설정합니다. (등급 없음)</p>
                    <div className="grid grid-cols-5 gap-3 items-center p-6 border rounded-lg bg-white shadow-md">
                        <span className="font-bold text-lg text-primary col-span-2">전체 좌석</span>
                        
                        <div className="col-span-3 space-y-1">
                            <label className="block text-xs font-medium text-gray-500">가격 (원)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.seatSettings[0].price}
                                // 단일 설정이므로 index 0에만 가격을 설정합니다. (등급은 백엔드에서 null 처리됨)
                                onChange={(e) => handleSeatSettingChange(0, 'price', e.target.value)}
                                className="input-sm w-full input"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>
                    {formData.seatForm === 'FREE' && 
                        <p className="text-xs text-gray-500 mt-1">자유좌석의 경우, 사용자는 구역에 상관없이 이 가격으로 예매합니다.</p>
                    }
                    {formData.seatForm === 'STANDING' && 
                        <p className="text-xs text-gray-500 mt-1">스탠딩의 경우, 사용자는 구역에 상관없이 이 가격으로 예매합니다.</p>
                    }
                </>
            )}
            
            {/* 좌석 형태가 지정되었는데 설정 데이터가 비어있을 경우 (오류 메시지) */}
            {(isAssignedSeating && formData.seatSettings.length === 0 && !isSeatSettingDisabled) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                장소 선택 후 구역 정보를 로드하지 못했거나, 장소에 템플릿이 없습니다.
              </div>
            )}
          </div>
        )}
        
        <button type="submit" disabled={loading || (isAssignedSeating && isSeatSettingDisabled && !loadingSections)} className="btn-primary w-full">
          {loading ? '생성 중...' : '이벤트 생성'}
        </button>
      </form>
    </div>
  );
}