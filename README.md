# MOL ticket 티켓팅 프론트엔드

MOL 티켓팅 서비스의 React + TypeScript 프론트엔드입니다.

## 🚀 주요 기능

- **실시간 대기열 시스템**: 1초마다 순번을 확인하는 폴링 방식
- **좌석 선택**: 직관적인 좌석 배치도 UI
- **카카오페이 결제**: 간편한 결제 시스템
- **역할 기반 대시보드**: User, Host, Admin 각각 다른 화면
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 3. 프로덕션 빌드
```bash
npm run build
```

## 🛠️ 기술 스택

- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빠른 개발 환경
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트
- **Zustand**: 상태 관리
- **Tailwind CSS**: 스타일링
- **React Hot Toast**: 알림

## 📁 프로젝트 구조

```
src/
├── components/      # 재사용 가능한 컴포넌트
│   ├── Header.tsx
│   └── Loading.tsx
├── pages/          # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── SignUp.tsx
│   ├── Events.tsx
│   ├── EventDetail.tsx
│   ├── Queue.tsx
│   ├── Booking.tsx
│   ├── Bookings.tsx
│   ├── AdminDashboard.tsx
│   ├── HostDashboard.tsx
│   ├── PaymentSuccess.tsx
│   ├── PaymentCancel.tsx
│   └── PaymentFail.tsx
├── services/       # API 서비스
│   └── api.ts
├── store/          # 전역 상태 관리
│   └── authStore.ts
├── types/          # TypeScript 타입 정의
│   └── api.ts
└── utils/          # 유틸리티 함수
```

## 🔑 주요 수정 사항

### 1. 로그인하지 않은 상태
- 홈 화면에 로그인/회원가입 버튼 표시
- 헤더에 로그인/회원가입 링크 표시

### 2. 로그인한 상태 (역할별)
- **USER**: 이벤트 목록, 예매 내역 접근
- **HOST**: 호스트 대시보드 (이벤트 생성/관리)
- **ADMIN**: 관리자 대시보드 (호스트 승인/거부/정지)

### 3. 헤더
- MOL 로고 이미지 + "ticket" 텍스트 표시
- 역할에 따라 다른 메뉴 표시

### 4. 파비콘
- MOL 로고 이미지 사용

## 📱 주요 페이지

### 인증
- `/login` - 로그인
- `/signup` - 회원가입

### 이벤트
- `/events` - 이벤트 목록
- `/events/:eventId` - 이벤트 상세

### 예매 (USER only)
- `/queue/:eventId` - 대기열 (실시간 폴링)
- `/booking/:eventId` - 좌석 선택 및 예매
- `/bookings` - 예매 내역

### 관리 (ADMIN only)
- `/admin` - 호스트 승인/거부/정지 관리

### 호스트 (HOST only)
- `/host` - 이벤트 생성 및 관리

### 결제
- `/payment/success` - 결제 성공
- `/payment/cancel` - 결제 취소
- `/payment/fail` - 결제 실패

## 🎯 대기열 시스템

대기열 페이지(`/queue/:eventId`)에서 다음과 같이 동작합니다:

1. **1초마다 순번 확인**: `GET /api/queue/rank/:eventId`
2. **입장 가능 시 (`active: true`)**:
   - Queue-Token과 Event-Id를 localStorage에 저장
   - 2초 후 자동으로 예매 페이지로 이동
3. **인터셉터**: 모든 예매 관련 요청에 자동으로 헤더 추가

## 🔐 인증 시스템

- JWT 토큰을 localStorage에 저장
- Axios 인터셉터로 자동으로 Authorization 헤더 추가
- PrivateRoute로 보호된 페이지 접근 제어
- 역할 기반 라우팅 (ROLE_USER, ROLE_HOST, ROLE_ADMIN)

## 💳 카카오페이 결제 플로우

1. 좌석 선택 후 "결제하기" 클릭
2. 예매 생성: `POST /api/bookings`
3. 결제 준비: `POST /api/payment/ready/:bookingId`
4. 카카오페이 결제 페이지로 리다이렉트
5. 결제 완료 후 콜백:
   - 성공: `/payment/success?booking_id=xxx`
   - 취소: `/payment/cancel?booking_id=xxx`
   - 실패: `/payment/fail?booking_id=xxx`

## 🎨 디자인 시스템

- **Primary Color**: `#4169E1` (Royal Blue) - MOL 로고 색상
- **Tailwind Utilities**: 커스텀 버튼, 카드, 인풋 스타일
- **반응형 Grid**: Mobile-first 접근

## 🐛 트러블슈팅

### 백엔드 연결 실패
- 백엔드 서버가 `http://localhost:8080`에서 실행 중인지 확인
- CORS 설정이 올바른지 확인

### 로그인 후 userId 관련 오류
- 백엔드 LoginResponse에 userId가 포함되도록 수정 필요
- 현재는 임시로 localStorage에서 userId를 가져옴

### 대기열 입장 실패
- Queue-Token과 Event-Id 헤더가 올바르게 전송되는지 확인
- 브라우저 개발자 도구 > Network 탭에서 요청 확인

## 📝 TODO

- [ ] 백엔드에서 LoginResponse에 userId 추가
- [ ] Host 대시보드 - 이벤트 목록 실제 API 연동
- [ ] 좌석 설정 UI 개선 (구역별 가격 설정)
- [ ] Place 생성 UI 추가

## 📝 라이선스

MIT License
