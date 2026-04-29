# 프로젝트 가이드

자재/재고 관리 시스템의 Vue 3 프론트엔드. Pinia + Tailwind + AG Grid + ECharts.

페이지/컴포넌트 작성 시 **항상** 아래 인프라(mixin / utils / 공용 컴포넌트)를 먼저 활용하세요.

---

## 폴더 구조

```
src/
├── api/                # axios 래퍼 (api.ts)
├── assets/             # tailwind.css (디자인 토큰 포함)
├── components/
│   ├── base/           # BaseTable, SearchSelect, DateRangePicker, BaseModal, AlertModal, ...
│   ├── ui/             # Badge (디자인 시스템)
│   ├── voucher/        # RegisterHeader, SectionHeader, SupplierInfoCard
│   ├── layout/         # AppHeader, AppSidebar
│   ├── panel/          # Notification, Bookmark
│   └── (도메인)/        # material/, inbound/, outbound/, ...
├── composables/
│   └── useAppInit.ts   # 앱 부팅 init (auth/notification/chat 동기화)
├── data/
│   ├── permissions.ts  # 권한 트리 정의
│   └── notificationTypes.ts  # 알림 타입 메타 (단일 진실 소스)
├── layouts/            # RootLayout, MainLayout, AuthLayout
├── mixins/             # 9개 공용 mixin (아래 설명)
├── pages/              # 라우트별 페이지
├── plugins/            # alert.plugin (전역 $alert/$confirm)
├── router/             # vue-router + 권한 가드
├── stores/             # Pinia stores (auth, modal, notification, chat, bookmark)
└── utils/              # date, location, categoryTree
```

---

## Mixins (페이지 패턴 공유)

### 표준 리스트 페이지 — `createListMixin`
검색 필터 + 테이블 + 페이지네이션 + 일괄 삭제가 있는 모든 리스트 페이지에서 사용.

```ts
import { createListMixin } from "@/mixins/listPage";

mixins: [
  createListMixin({
    endpoint: "/api/inbound/list",
    deleteEndpoint: "/api/inbound/batchDelete",
    tableRef: "inboundTable",          // BaseTable 의 ref 키 (batchDelete 사용 시)
    initialWhere: { inbound_no: "" },
    initialDateRange: () => ({ start: null, end: null }),  // null 이면 dateRange 비활성
    transformWhere: (where, vm) => {...}, // 서버 전송 직전 가공 (페이지별 특수 변환)
    mapRow: (row, vm) => ({ ...row }),    // 응답 row 가공
    afterDelete: (vm) => vm.noti.loadCounts(), // 삭제 후 후속 처리
    autoLoad: true,                       // mounted 자동 호출
  }),
]
```

**제공:** `rows / where / dateRange / loading / loadList() / batchDelete()`

### 통계 페이지 — `createStatisticsMixin`
KPI 카드 + 테이블 + 차트 + 일별 갱신.

```ts
import { createStatisticsMixin } from "@/mixins/statistics";

mixins: [
  createStatisticsMixin({
    listEndpoint: "/api/stat/inboundList",
    chartEndpoint: "/api/stat/inbound/daily/totalAmount",
    setEndpoint: "/api/stat/inbound/daily",
    summaryFields: ["total_qty", "total_cost"],   // rows 필드를 자동 합산
  }),
]
```

**제공:** `rows / chartRows / summary / dateRange / where / set / loadList / loadChartData / searchData / setData / formatNumber / loadMaterial`. mount 시 자동으로 이번 달 dateRange 세팅 + searchData 호출.

### 전표 등록 페이지 — `voucherMixin`
구매/판매/발주/반품 register 페이지의 공통 라인 아이템 관리 + 합계 계산.

```ts
import { voucherMixin } from "@/mixins/voucher";

mixins: [voucherMixin],
data() {
  return {
    form: { items: [], vat_applied: true },  // 이 형태가 전제
  };
}
```

**제공:** `totalSupply / totalVat / totalAmount / isEdit` computed + `recalcItem / recalcVatOnly / onVatAppliedChange / removeItem / clearAllItems / buildItemFromMaterial / rowAmount` methods.

### 참조 데이터 로드 — `createRefDataMixin`
materials/suppliers/warehouses/locations/tags/categories/roles 등을 병렬 로드.

```ts
import { createRefDataMixin } from "@/mixins/refData";

mixins: [createRefDataMixin(["materials", "warehouses", "locations"])],
data() {
  return { materials: [], warehouses: [], locations: [] };
}
mounted() {
  this.loadRefData(); // 자동 호출 안하므로 명시
}
```

**제공:** `loadRefData()` — `Promise.allSettled` 로 병렬 로드 후 각 state 키에 반영.

지원 source 키:
- `materials` → state `materials`
- `suppliers` → state `suppliers`
- `warehouses` → state `warehouses`
- `locations` → state `locations` (코드+이름 결합 라벨)
- `locationsRaw` → state `locations` (가공 없이)
- `roles` → state `roles`
- `tags` → state `tags`
- `categories` → state `categorys`

### AG Grid 인라인 편집 — `createAgGridMixin`
설정(Tag/Category/Warehouse/Location/Setting/Permission/Role) 페이지의 인라인 편집 그리드.

```ts
import { createAgGridMixin } from "@/mixins/agGridList";

mixins: [
  createAgGridMixin({
    listEndpoint: "/api/tag/list",
    saveEndpoint: "/api/tag/batchSave",
    deleteEndpoint: "/api/tag/batchDelete",
    newRowDefaults: () => ({ name: "", code: "" }),
  }),
],
data() {
  return {
    columnDefs: [
      { headerName: "태그명", field: "name", filter: "agTextColumnFilter", flex: 1 },
      ...
    ],
  };
}
```

**제공:** state(`gridApi/columnApi/tempId/rowData/columnDefs/search/gridOptions/defaultColDef`) + `onGridReady / onCellEditingStopped / addRow / saveRows / deleteRows / loadList`.

### SVG 줌/팬 — `createSvgZoomPanMixin`
viewBox 기반 SVG 도면의 마우스/버튼 줌 + 드래그 팬.

```ts
import { createSvgZoomPanMixin } from "@/mixins/svgZoomPan";

mixins: [createSvgZoomPanMixin({ size: 1000, minZoom: 200, maxZoom: 3000 })],
```

**제공:** state(`viewBox/minZoom/maxZoom/isPanning/panStart`) + `svgPoint / handleWheel / zoomIn / zoomOut / zoomBy / resetZoom / handlePanStart / handlePanMove / handlePanEnd`.

### Stock 도면 rack 색상 — `rackVisualsMixin`
재고 도면(StockLocationPage / StockWarehousePage) 의 rack 셀 상태별 시각.

```ts
import { rackVisualsMixin } from "@/mixins/rackVisuals";
mixins: [rackVisualsMixin],
methods: {
  // 페이지에서 rackState 를 정의해야 함
  rackState(rack) {
    if (this.selected?.id === rack.id) return "selected";
    if (this.searchMaterial && !this.matchedRackIds.includes(rack.id)) return "dimmed";
    return rack.stocks?.length ? "hasStock" : "empty";
  },
}
```

**제공:** `pointsToString / getCenter / totalQty / rackFill / rackStroke / rackOpacity / rackTextColor`.

### 다각형 도형 편집기 — `createShapeEditorMixin`
창고/위치 설정 페이지의 polygon 그리기·이동·회전·정점 편집.

```ts
import { createShapeEditorMixin } from "@/mixins/shapeEditor";
mixins: [createShapeEditorMixin({ svgRef: "svgCanvas", gridSize: 20 })],
```

**제공:** state(`shapes/selected/dragState/selectionBox/isEditMode/isSaving/gridSize`) + 마우스 핸들러 전체 + 좌표 유틸.

### 양도 리스트 — `createTransferListMixin`
권한 보드의 `assigned ↔ unassigned` 양도 리스트.

```ts
import { createTransferListMixin } from "@/mixins/transferList";
mixins: [createTransferListMixin({ idKey: "id" })],
```

**제공:** `addPermission / removePermission / addAll / removeAll`.

---

## 공용 컴포넌트

### `<Badge variant="..." icon="...">`
상태/카테고리 표시. variant: `success | error | warning | info | indigo | neutral | muted`. tailwind.css 의 `.badge-*` 토큰을 사용.

```vue
<Badge variant="error" icon="fa-solid fa-circle-exclamation">미지급</Badge>
```

또는 직접 클래스로:
```html
<span class="badge badge-success">완납</span>
```

### `<RegisterHeader accent="..." icon="..." subtitle="..." :title="..." description="...">`
전표 등록 페이지의 그라디언트 헤더. accent: `blue | teal | red | rose | orange | amber | indigo | emerald`.

```vue
<RegisterHeader
  accent="blue"
  icon="fa-solid fa-truck-ramp-box"
  subtitle="Inbound Voucher"
  :title="isEdit ? '구매 수정' : '구매 등록'"
  description="...">
  <template #actions>
    <button>...</button>
  </template>
</RegisterHeader>
```

### `<SectionHeader number="01" icon="..." title="..." description="..." accent="...">`
번호 매겨진 섹션 제목 (전표 페이지에서 단계별 섹션 구분).

### `<SupplierInfoCard :supplier="..." type="inbound|outbound">`
선택된 거래처 정보 카드. inbound 면 미지급금(인디고), outbound 면 미수금(앰버).

---

## Utils

### `utils/date.ts`
- `formatDateOnly(value)` — `"YYYY-MM-DD"`
- `formatDateTime(value)` — `"YYYY-MM-DD HH:mm:ss"`
- `formatDateMinute(value)` — `"YYYY-MM-DD HH:mm"`
- `formatTimestamp(value?)` — `"YYYYMMDD_HHmmss"` (파일명용)
- `startOfDay(date)` / `endOfDay(date)` — 시각 보정
- `todayRange() / yesterdayRange() / lastWeekRange() / currentMonthRange()` — 빠른 선택용 범위

### `utils/location.ts`
- `buildLocationLabel(source)` — 평탄 또는 중첩 객체에서 `"창고 > 위치 > 선반"` 라벨 조립

### `utils/categoryTree.js`
카테고리 트리 처리 (기존)

---

## 디자인 토큰 (`assets/tailwind.css`)

### 폼/버튼
- `.field` — 표준 입력 (h-30px, text-xs, blue focus ring)
- `.field-auto` — textarea 등 가변 높이
- `.field-xs` — 컴팩트 변형
- `.cell-input` — 테이블 셀 내부 입력
- `.btn` — 기본 버튼 (베이스)
- `.btn-primary / .btn-danger / .btn-ghost` — 변형
- `.btn-xs` — 컴팩트 변형
- `.form-label` — 폼 라벨

### 뱃지
- `.badge` (베이스) + `.badge-{success,error,warning,info,indigo,neutral,muted}`
- `.badge-icon` — 뱃지 내부 아이콘 크기

### 테이블
- `.th / .td` — 컴팩트 테이블 셀 (border-collapse)

---

## Stores (Pinia)

- `auth` — 로그인/세션/권한 (`hasPermission(code)`)
- `modal` — 스택 기반 공용 모달 (`openModal(comp, props, size) / closeModal()`)
- `notification` — 알림 카운트/목록/패널 (`startAutoRefresh()` 1분 주기)
- `chat` — 채팅 소켓/방/미읽음
- `bookmark` — 북마크 패널

전역 사용 패턴:
```ts
const modal = useModalStore();
modal.openModal(MyModal, { onSaved: this.loadList }, "lg");
```

---

## 알림 (Alert) / 토스트

### 전역 다이얼로그
플러그인이 `app.config.globalProperties.$alert / $confirm` 등록.
```ts
await this.$alert("저장되었습니다", "완료", "info");
const ok = await this.$confirm("삭제하시겠습니까?", "삭제 확인", "danger");
```

### 토스트
`vue-toastification` 글로벌 설치. `this.$toast.success(...) / .error(...)`.

**규칙:** 네이티브 `alert()` / `confirm()` 사용 금지 → 모두 `$alert / $confirm` 으로.

---

## 라우터 + 권한

`router/index.ts` 에서 `meta.title / meta.auth / meta.permission` 으로 가드.

```ts
{
  path: "inbound",
  component: InboundPage,
  meta: { title: "구매관리", auth: true, permission: "inbound.view" },
}
```

권한 코드는 `data/permissions.ts` 에서 트리 형태로 관리 (`getMenuTree()` 가 사이드바 메뉴를 자동 생성).

---

## 페이지 작성 체크리스트

새 리스트 페이지를 만들 때:

1. [ ] `createListMixin` 사용 — `loadList / batchDelete` 직접 작성 ❌
2. [ ] 필터 옵션이 필요하면 `createRefDataMixin(["materials", ...])` 추가
3. [ ] 날짜 표시는 `<BaseDateText>` 또는 `utils/date` 함수
4. [ ] 상태 뱃지는 `<Badge>` 또는 `.badge-*` 클래스
5. [ ] 모달은 `useModalStore().openModal()`
6. [ ] 권한 체크는 `auth.hasPermission("xxx.view")`
7. [ ] `console.log` 디버그 코드 금지, 에러는 `$toast.error` 또는 `$alert`

새 전표 등록 페이지를 만들 때:

1. [ ] `voucherMixin` 사용 → `totalSupply / recalcItem / clearAllItems` 등 자동 제공
2. [ ] 헤더는 `<RegisterHeader>` (accent 색상으로 도메인 구분)
3. [ ] 섹션 제목은 `<SectionHeader>`
4. [ ] 거래처 정보는 `<SupplierInfoCard>`
5. [ ] `createRefDataMixin(["suppliers"])` 로 거래처 옵션 로드

---

## TypeScript 사용 규칙

- 새 mixin / utils / composable 은 `.ts` 로 작성
- 페이지/컴포넌트 `<script>` 는 `lang="ts"` 권장 (Options API 도 가능)
- `interface` 와 `type` 은 자유롭게, `enum` / `namespace` 은 사용 금지 (`erasableSyntaxOnly: true`)
- mixin 메서드의 `this` 는 `this: any` 컨텍스트 타입으로 명시
- 외부에서 가공 없는 `any` 사용은 지양, 모르면 `unknown` 후 좁히기

---

## 자주 하는 실수

1. **새 리스트 페이지에서 `loadList / batchDelete` 직접 구현** — 무조건 `createListMixin` 사용
2. **createRefDataMixin 의 state 이름 충돌** — mixin 이 `materials / suppliers / ...` 로 채우므로 같은 이름의 data 필드 충돌 주의
3. **inline `setHours(0,0,0,0) / new Date().setHours(...)`** — `utils/date` 의 `startOfDay / todayRange` 등 사용
4. **`yyyy-mm-dd` 수동 조립 (padStart × 3)** — `formatDateOnly(date)` 사용
5. **`async loadSuppliers / loadMaterial` 메서드 직접 구현** — `createRefDataMixin(["..."])` 사용
6. **인라인 그라디언트 헤더 60줄 복붙** — `<RegisterHeader>` 사용
7. **인라인 거래처 정보 카드 70줄 복붙** — `<SupplierInfoCard>` 사용
8. **인라인 뱃지 클래스 체인** (`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 ...`) — `<Badge>` 또는 `.badge-error`

---

## 미완 / 향후 개선 후보

- StockShelfPage 는 의도적 패턴이라 현재 구조 유지
- MaterialModal 의 카테고리/태그 로딩 통합 (state 명 컨벤션 차이로 미적용)
- Scan 페이지 3개의 AG Grid 셋업 통합 (specialized 한 addItem/scan 워크플로우)
- Supplier (인라인 편집 master 컴포넌트) 의 selectedIds Set 패턴
- ChatPanel / Bookmark 패널의 슬라이드 전환 공통화
