# 자재관리 시스템 (Material Management System)

입고·출고·반품·재고를 일괄 관리하는 Vue 3 기반 자재관리 프론트엔드. 창고/위치/선반 단위의 2D 레이아웃 편집, QR 라벨, 권한 기반 라우팅, 실시간 알림을 제공한다.

---

## 기술 스택

| 구분 | 내역 |
|---|---|
| Framework | Vue 3 (`<script>` Options API 중심, 일부 `<script setup>`), TypeScript, Vite 5 |
| 상태관리 | Pinia 3 + `pinia-plugin-persistedstate` |
| 라우팅 | Vue Router |
| 스타일 | Tailwind CSS 3, Font Awesome |
| 테이블 | AG Grid Community (`ag-grid-vue3`) + 자체 `BaseTable` |
| 차트 | ECharts 6 + `vue-echarts` |
| 달력 | V-Calendar |
| 기타 | Axios(JWT 인터셉터), html2pdf.js, jwt-decode, vue-toastification |

### 스크립트

```bash
npm run dev       # Vite 개발 서버
npm run build     # vue-tsc 타입체크 후 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

### 환경 변수

- `VITE_API_URL` — 백엔드 베이스 URL
- `VITE_API_KEY` — `x-api-key` 헤더 값
- `VITE_TELL` — 전표 출력용 대표 연락처

---

## 디렉토리 구조

```
src/
├── api/api.ts              # Axios 인스턴스 (JWT 인터셉터 + 401 자동 로그아웃)
├── router/index.ts         # 라우트 정의 + beforeEach 권한 가드
├── stores/                 # Pinia 스토어
│   ├── auth.ts             # 로그인/토큰/권한 체크 (persist)
│   ├── bookmark.ts         # 페이지 북마크
│   ├── modal.ts            # 공용 동적 모달
│   └── notification.ts     # 타입별 알림 카운트/목록, 자동 갱신
├── plugins/
│   ├── alert.plugin.js     # 전역 $alert / $confirm 등록
│   └── alert.store.js      # 공용 알림/확인 모달 상태
├── utils/categoryTree.js   # 카테고리 트리 탐색/이동/저장 페이로드
├── layouts/                # RootLayout, MainLayout(사이드바+헤더), AuthLayout
├── components/
│   ├── base/               # BaseTable, SearchSelect, MultiCheck, DateRangePicker,
│   │                         CategoryTreeSelect, BaseModal, AlertModal, Chart 등
│   ├── ui/                 # Badge, Card (스텁)
│   ├── layout/             # AppHeader, AppSidebar, AppFooter
│   ├── panel/              # Bookmark, Notification 사이드 패널
│   ├── setting/            # Category/Location/Permission/Role/Supplier/Tag/Warehouse/Setting
│   ├── inbound/            # InboundModal, InboundVoucherPrintModal
│   ├── outbound/           # OutboundModal, OutboundVoucherPrintModal
│   ├── returnorder/        # ReturnOrderModal, ReturnOrderVoucherPrintModal
│   ├── stock/              # StockPrintModal
│   ├── warehouse/          # WarehouseModal, LocationModal
│   ├── material/           # MaterialModal (이미지/태그 업로드 포함)
│   ├── user/               # UserInfoModal
│   └── log/                # LogModal (JSON 뷰어)
└── pages/
    ├── auth/               # Login, Signup, ForgotPassword
    ├── dashboard/          # DashboardPage (KPI + 라인차트)
    ├── material/           # 자재 목록/라벨 인쇄/카테고리(트리·가로) + MaterialCategoryPage 컴포넌트
    ├── inbound/            # 입고 목록/세부/스캔
    ├── outbound/           # 출고 목록/세부/스캔
    ├── returnorder/        # 반품 목록/세부/스캔
    ├── stock/              # 재고 현황/이동/변동이력/흐름/위치(창고·위치·선반)
    ├── warehouse/          # 창고·위치·선반 2D 레이아웃 편집
    ├── statistics/         # 입고/출고/반품/재고 통계 (차트 + 표)
    ├── permission/         # 계정권한, 메뉴권한 (할당/미할당 보드)
    ├── user/               # 사용자 관리, IP 허용, 마이페이지
    ├── notification/       # 알림 목록
    ├── log/                # 감사 로그
    └── setting/            # 환경설정 탭 (카테고리/창고/위치/태그/거래처/역할/권한/설정)
```

---

## 주요 기능

### 인증 & 권한
- JWT 기반 로그인/회원가입/비밀번호 찾기(이메일 코드)
- `stores/auth.ts`에 `is_super` + `permissions[]` 보관, `hasPermission(code)` 게터 제공
- 라우트 `meta.permission` 기반 `router.beforeEach` 가드, 401 응답 시 자동 로그아웃 + 로그인 리다이렉트
- 사용자별 허용 IP 관리 (`/user/ip`)

### 자재
- 자재 CRUD + 이미지 업로드 + 태그 다중 선택(`MultiCheck`, 즉시 생성 지원)
- 카테고리 트리: 드래그 앤 드롭 이동(`CategoryItem`의 before/after/inside 드롭), 검색, 전체 펼침/접힘
- 카테고리 "가로 컬럼 뷰" 별도 페이지 (depth별 컬럼)
- QR 라벨 인쇄: A4 9/12/15/20/24/40칸 규격, 세로/가로 레이아웃, PDF/CSV 다운로드, 사본 수/시작 위치 설정

### 입고 / 출고 / 반품
- 전표 기반 등록/수정/삭제, 전표 프린트 모달(html 프린트 + 총액 계산)
- 상단 일괄 입력으로 품목 일괄 채우기(입고)
- 스캔 페이지: QR/코드 스캔 1건이면 AG Grid에 자동 추가·수량 증가, 재고/반품 수량 초과 방지
- 세부 내역 페이지에서 기간·자재·창고·위치·거래처 복합 필터링

### 재고
- 현재 재고 현황, 재고 이동(위치→위치)
- 변동 이력 + 기간별 재고 흐름 라인 차트
- 2D 시각화 3단계:
  - **창고 뷰** — 전체 창고 레이아웃에서 rack별 재고 상태/검색 매칭 강조
  - **위치 뷰** — 창고 내 위치별 재고, SVG viewBox 기반 팬/줌
  - **선반 뷰** — 위치 내 선반 그리드 재고 표시
- 인쇄용 현재고 전표 (`StockPrintModal`)

### 창고 레이아웃 편집기 (`pages/warehouse`)
- SVG viewBox 1000×1000 좌표계, 화면 좌표↔SVG 좌표 변환
- shape 타입: 삼각/사각/원(48각 근사)/육각/ㄱ자/ㄴ자
- 이동 / 정점 편집 / 회전 / 다중 선택(드래그 박스·Ctrl) / 그리드 스냅
- 정점 추가(중점 클릭) / 정점 제거(더블클릭·우클릭)
- 창고 → 위치 → 선반 3단계 레이어 편집 페이지 제공

### 통계 & 대시보드
- 일별 통계 수동 갱신 API 호출 + 기간별 조회
- 입고/출고/반품/재고 각각 차트 + 요약(수량/원가/매출/이익/건수)
- 대시보드: 이번 달 1일~오늘까지 날짜 메우기 + 입/출/반품 3개 라인 오버레이

### 공통 UI
- `BaseTable` — 정렬/페이지네이션/선택/셀 타입별 렌더링(img, button, number, currency, date, slot)
- `SearchSelect` / `MultiCheck` / `CategoryTreeSelect` — 검색형 선택, 하이라이트, 드롭다운 아웃사이드 클릭 처리
- `DateRangePicker` — 빠른 버튼(오늘/어제/일주일/이번달) + 시간 선택
- 동적 모달(`useModalStore.openModal(Component, props, size)`)로 전표/자재/사용자 폼을 전역 관리
- `$confirm` / `$alert` 전역 메서드 (Promise 기반 confirm)
- 사이드바 북마크, 타입별 알림 패널, 토스트 피드백

---

## 아키텍처 메모

- **권한 로직은 프론트에서 "UI 가드"용**으로만 동작한다. 실제 접근 제어는 백엔드에서 한 번 더 검사해야 한다.
- **모든 API는 POST**로 통일되어 있다 (`/api/*/list`, `/api/*/save`, `/api/*/batchSave`, `/api/*/batchDelete`).
- **AG Grid는 v33+ 모듈 방식**을 사용 (`main.ts`에서 `AllCommunityModule`, `RowSelectionModule` 등록).
- **2D 에디터는 외부 라이브러리 없이 직접 구현**되어 있어 좌표 변환·스냅·회전·정점 편집 로직이 `LocationPage.vue` / `WarehousePage.vue`에 집중돼 있다.
- **카테고리 트리 조작은 `utils/categoryTree.js`에 유틸화**되어 있어 페이지 컴포넌트는 얇게 유지된다.
- **알림 카운트는 로그인 중 1분 간격 폴링** (`stores/notification.ts → startAutoRefresh`).
