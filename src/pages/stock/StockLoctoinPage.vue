<template>
  <div class="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-64px)] bg-[#f8fafc]">
    <!-- 🟢 1. 좌측: 창고 + 위치 사이드바 -->
    <div class="w-full lg:w-1/6 flex flex-col gap-4">
      <!-- 창고 리스트 (축소) -->
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-[40%] shrink-0"
      >
        <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <div
              class="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm"
            >
              <i class="fa-solid fa-warehouse text-[10px]"></i>
            </div>
            창고 리스트
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll">
          <div
            v-for="wh in warehouses"
            :key="wh.id"
            @click="selectWarehouse(wh)"
            :class="[
              'group px-3 py-2 rounded-lg border transition-all cursor-pointer',
              selectedWarehouse?.id === wh.id
                ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-100'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50',
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                :class="[
                  'font-bold text-[13px] truncate',
                  selectedWarehouse?.id === wh.id
                    ? 'text-white'
                    : 'text-slate-700',
                ]"
              >
                {{ wh.name }}
              </span>
              <span
                :class="[
                  'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono shrink-0',
                  selectedWarehouse?.id === wh.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ wh.code }}
              </span>
            </div>
            <div class="flex gap-1.5 mt-1.5">
              <span
                :class="[
                  'px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold',
                  selectedWarehouse?.id === wh.id
                    ? 'bg-white/10 text-blue-100'
                    : 'bg-blue-50 text-blue-600',
                ]"
              >
                <i class="fa-solid fa-cubes-stacked opacity-70"></i>
                {{ getWarehouseTypes(wh.id).toLocaleString() }}
              </span>
              <span
                :class="[
                  'px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold',
                  selectedWarehouse?.id === wh.id
                    ? 'bg-white/10 text-white'
                    : 'bg-emerald-50 text-emerald-600',
                ]"
              >
                <i class="fa-solid fa-box-open opacity-70"></i>
                {{ getWarehouseQty(wh.id).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 위치 리스트 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden flex-1"
      >
        <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <div
              class="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-sm"
            >
              <i class="fa-solid fa-layer-group text-[10px]"></i>
            </div>
            위치 리스트
          </h3>
          <span class="text-[10px] font-bold text-slate-400">
            {{ racks.length.toLocaleString() }}
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll">
          <div
            v-if="!selectedWarehouse"
            class="py-10 text-center text-slate-400 text-xs"
          >
            창고를 선택하세요
          </div>
          <div
            v-else-if="!racks.length"
            class="py-10 text-center text-slate-400 text-xs"
          >
            등록된 위치가 없습니다
          </div>
          <div
            v-for="rack in racks"
            :key="rack.id"
            @click="selectRack(rack)"
            :class="[
              'group px-3 py-2 rounded-lg border transition-all cursor-pointer',
              selectedRack?.id === rack.id
                ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-100'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50',
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                :class="[
                  'font-bold text-[13px] truncate',
                  selectedRack?.id === rack.id
                    ? 'text-white'
                    : 'text-slate-700',
                ]"
              >
                {{ rack.name || rack.code }}
              </span>
              <span
                :class="[
                  'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono shrink-0',
                  selectedRack?.id === rack.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ rack.code }}
              </span>
            </div>
            <div class="flex gap-1.5 mt-1.5">
              <span
                :class="[
                  'px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold',
                  selectedRack?.id === rack.id
                    ? 'bg-white/10 text-blue-100'
                    : 'bg-blue-50 text-blue-600',
                ]"
              >
                <i class="fa-solid fa-cubes-stacked opacity-70"></i>
                {{ rack.stocks.length.toLocaleString() }}
              </span>
              <span
                :class="[
                  'px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold',
                  selectedRack?.id === rack.id
                    ? 'bg-white/10 text-white'
                    : 'bg-emerald-50 text-emerald-600',
                ]"
              >
                <i class="fa-solid fa-box-open opacity-70"></i>
                {{ totalQty(rack).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔵 2. 중앙: 선반 레이아웃 맵 -->
    <div class="flex-1 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-full overflow-hidden"
      >
        <!-- 헤더 및 검색 -->
        <div class="flex flex-col gap-4 mb-6">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-lg">위치 레이아웃</h3>
            <div class="w-72 relative group">
              <i
                class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              ></i>
              <input
                v-model="searchText"
                placeholder="품목 검색 (선반 자동 찾기)..."
                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <!-- 🔥 상태 색상 가이드 (범례) -->
          <div class="flex items-center gap-4 px-1">
            <div class="flex items-center gap-1.5">
              <span
                class="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm shadow-emerald-200"
              ></span>
              <span class="text-[11px] font-bold text-slate-600"
                >품목 존재(검색시)</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <span
                class="w-3 h-3 rounded-sm bg-slate-800 shadow-sm shadow-slate-300"
              ></span>
              <span class="text-[11px] font-bold text-slate-600"
                >재고 있음</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <span
                class="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"
              ></span>
              <span class="text-[11px] font-bold text-slate-400"
                >재고 없음</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <span
                class="w-3 h-3 rounded-sm bg-blue-600 ring-1 ring-blue-400 shadow-sm shadow-blue-200"
              ></span>
              <span class="text-[11px] font-bold text-blue-600">선택됨</span>
            </div>
          </div>
        </div>

        <!-- 맵 영역 -->
        <div
          class="flex-1 border border-slate-100 rounded-xl bg-[#fdfdfd] relative overflow-hidden shadow-inner flex items-center justify-center p-2 min-h-[500px]"
        >
          <template v-if="selectedWarehouse">
            <!-- 줌 컨트롤 -->
            <div
              class="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-md p-1"
            >
              <button
                @click="zoomIn"
                class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center transition-colors"
                title="확대"
              >
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
              <button
                @click="zoomOut"
                class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center transition-colors"
                title="축소"
              >
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <button
                @click="resetZoom"
                class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center transition-colors"
                title="원래크기"
              >
                <i class="fa-solid fa-expand text-xs"></i>
              </button>
            </div>
            <div
              class="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-500 font-mono shadow-sm"
            >
              {{ Math.round((1000 / viewBox.w) * 100) }}%
            </div>

            <svg
              ref="svg"
              :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
              preserveAspectRatio="xMidYMid meet"
              class="w-auto h-auto max-w-full max-h-full aspect-square block"
              :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
              @wheel.prevent="handleWheel"
              @mousedown="handlePanStart"
              @mousemove="handlePanMove"
              @mouseup="handlePanEnd"
              @mouseleave="handlePanEnd"
            >
              <defs>
                <pattern
                  id="locGrid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#f1f5f9"
                    stroke-width="0.5"
                  />
                </pattern>
                <pattern
                  id="locGridLarge"
                  width="100"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="100%" height="100%" fill="url(#locGrid)" />
                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="#e2e8f0"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect
                :x="viewBox.x"
                :y="viewBox.y"
                :width="viewBox.w"
                :height="viewBox.h"
                fill="url(#locGridLarge)"
              />

              <g
                v-for="rack in racks"
                :key="rack.id"
                class="cursor-pointer"
                @click="selectRack(rack)"
              >
                <polygon
                  :points="pointsToString(rack.points)"
                  :fill="rackFill(rack)"
                  :stroke="rackStroke(rack)"
                  :stroke-width="selectedRack?.id === rack.id ? 3 : 1.5"
                  :opacity="rackOpacity(rack)"
                  class="transition-all duration-200"
                />
                <text
                  :x="getCenter(rack.points).x"
                  :y="getCenter(rack.points).y - 10"
                  class="font-black text-[13px] pointer-events-none uppercase tracking-tighter"
                  :fill="rackTextColor(rack)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ rack.name || rack.code }}
                </text>
                <text
                  :x="getCenter(rack.points).x"
                  :y="getCenter(rack.points).y + 8"
                  class="font-black text-[14px] pointer-events-none"
                  :fill="rackTextColor(rack)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ totalQty(rack).toLocaleString() }}
                </text>
                <text
                  :x="getCenter(rack.points).x"
                  :y="getCenter(rack.points).y + 24"
                  class="text-[10px] pointer-events-none"
                  :fill="rackTextColor(rack)"
                  fill-opacity="0.8"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ rack.stocks.length.toLocaleString() }}종류
                </text>
              </g>
            </svg>
          </template>

          <!-- 창고 미선택 안내 -->
          <div v-else class="flex flex-col items-center opacity-40">
            <div
              class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-bounce-horizontal"
            >
              <i class="fa-solid fa-arrow-left text-slate-400 text-xl"></i>
            </div>
            <p class="text-slate-500 font-bold">
              좌측 리스트에서 창고를 먼저 선택하세요
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 🟡 3. 우측: 선반 상세 정보 -->
    <div class="w-1/4 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col h-full overflow-hidden"
      >
        <div v-if="selectedRack" class="flex flex-col h-full">
          <div class="flex items-center justify-between mb-5">
            <h3
              class="font-bold text-slate-800 text-lg flex items-center gap-2"
            >
              <i class="fa-solid fa-layer-group text-blue-500 text-sm"></i>
              위치 상세
            </h3>
            <span
              class="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase"
              >{{ selectedRack.code }}</span
            >
          </div>

          <!-- 요약 카드 -->
          <div
            class="mb-5 p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200"
          >
            <div class="text-[13px] font-medium text-slate-400 mb-1">
              선택된 위치
            </div>
            <div class="text-xl font-bold mb-4">{{ selectedRack.name }}</div>

            <div class="grid grid-cols-2 gap-2">
              <div
                class="bg-white/10 rounded-xl p-2.5 border border-white/5 text-center"
              >
                <div
                  class="text-[10px] text-white/50 mb-0.5 uppercase tracking-wider"
                >
                  보관 종류
                </div>
                <div class="text-lg font-bold">
                  {{ selectedRack.stocks.length.toLocaleString() }}
                </div>
              </div>
              <div
                class="bg-white/10 rounded-xl p-2.5 border border-white/5 text-center"
              >
                <div
                  class="text-[10px] text-white/50 mb-0.5 uppercase tracking-wider"
                >
                  총 재고량
                </div>
                <div class="text-lg font-bold">
                  {{ totalQty(selectedRack).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- 내부 검색 -->
          <div class="relative mb-4">
            <i
              class="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            ></i>
            <input
              v-model="detailSearchText"
              placeholder="위치 내 품목 검색..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <!-- 품목 리스트 -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
            <div
              v-for="item in filteredStocks"
              :key="item.id"
              class="group flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div class="flex items-center gap-3 shrink-0">
                <!-- 🔥 이미지 or 아이콘 -->
                <div
                  class="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center"
                >
                  <img
                    v-if="item.image_url"
                    :src="url + item.image_url"
                    class="w-full h-full object-cover"
                  />

                  <i
                    v-else
                    class="fa-solid fa-box text-xs text-slate-400 group-hover:text-blue-500 transition-colors"
                  ></i>
                </div>

                <!-- 텍스트 -->
                <div class="flex flex-col">
                  <span
                    class="text-[13px] font-bold text-slate-700 truncate max-w-[300px]"
                  >
                    {{ item.material_name }}
                  </span>

                  <span class="text-[10px] text-slate-400"
                    >CODE: {{ item.material_code }}</span
                  >
                </div>
              </div>

              <!-- 수량 -->
              <div
                class="text-[14px] font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
              >
                {{ item.qty.toLocaleString() }}
              </div>
            </div>
            <div
              v-if="filteredStocks.length === 0"
              class="text-center py-20 text-slate-400 text-sm"
            >
              <i class="fa-solid fa-magnifying-glass mb-2"></i><br />결과 없음
            </div>
          </div>
        </div>

        <!-- 선택 없음 -->
        <div
          v-else
          class="flex-1 flex flex-col items-center justify-center text-center px-10"
        >
          <div
            class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 animate-bounce"
          >
            <i class="fa-solid fa-hand-pointer text-blue-200 text-3xl"></i>
          </div>
          <h4 class="text-slate-800 font-bold mb-2 text-lg">
            위치를 선택하세요
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  data() {
    return {
      racks: [],
      warehouses: [],
      materials: [],
      selectedWarehouse: null,
      selectedRack: null,
      searchText: "",
      detailSearchText: "",
      where: { warehouse_id: "" },
      viewBox: { x: 0, y: 0, w: 1000, h: 1000 },
      minZoom: 200,
      maxZoom: 3000,
      isPanning: false,
      panStart: { x: 0, y: 0, vx: 0, vy: 0 },
      url: import.meta.env.VITE_API_URL,
    };
  },
  computed: {
    // 선택된 rack의 재고를 상세 검색어로 필터링해 반환한다
    filteredStocks() {
      if (!this.selectedRack) return [];
      if (!this.detailSearchText) return this.selectedRack.stocks;
      return this.selectedRack.stocks.filter((item) =>
        item.material_name
          .toLowerCase()
          .includes(this.detailSearchText.toLowerCase()),
      );
    },
    // 검색어에 품목이 포함된 rack id 배열을 반환한다
    matchedRackIds() {
      if (!this.searchText) return [];
      return this.racks
        .filter((rack) =>
          rack.stocks.some((s) =>
            s.material_name
              .toLowerCase()
              .includes(this.searchText.toLowerCase()),
          ),
        )
        .map((r) => r.id);
    },
  },
  watch: {
    // 검색어 변경 시 첫 매칭 rack을 선택하고 스크롤한다
    searchText(val) {
      if (!val) return;
      const found = this.racks.find((rack) =>
        rack.stocks.some((s) =>
          s.material_name.toLowerCase().includes(val.toLowerCase()),
        ),
      );
      if (found) {
        this.selectedRack = found;
        this.scrollToRack(found);
      }
    },
  },
  methods: {
    // 창고별 고유 품목 종류 수를 계산한다
    getWarehouseTypes(id) {
      const wh = this.warehouses.find((w) => w.id === id);
      if (!wh || !wh.stocks) return 0;

      // material_id 기준 중복 제거
      const unique = new Set(wh.stocks.map((s) => s.material_id));
      return unique.size;
    },

    // 창고의 총 수량 합계를 계산한다
    getWarehouseQty(id) {
      const wh = this.warehouses.find((w) => w.id === id);
      if (!wh || !wh.stocks) return 0;

      return wh.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    },
    // 포인트 배열을 SVG polygon용 문자열로 변환한다
    pointsToString(p) {
      if (!p || !p.length) return "";
      return p.map((v) => `${v.x},${v.y}`).join(" ");
    },
    // 다각형 포인트들의 중심 좌표를 계산한다
    getCenter(p) {
      if (!p || !p.length) return { x: 0, y: 0 };
      return {
        x: p.reduce((a, b) => a + b.x, 0) / p.length,
        y: p.reduce((a, b) => a + b.y, 0) / p.length,
      };
    },
    // 선택/검색/재고 여부에 따른 rack 상태 문자열을 반환한다
    rackState(rack) {
      if (this.selectedRack?.id === rack.id) return "selected";
      if (this.searchText) {
        return this.matchedRackIds.includes(rack.id) ? "matched" : "dimmed";
      }
      return rack.stocks?.length ? "hasStock" : "empty";
    },
    // 상태별 rack 채움 색상을 반환한다
    rackFill(rack) {
      const state = this.rackState(rack);
      if (state === "selected") return "#2563eb";
      if (state === "matched") return "#10b981";
      if (state === "dimmed") return "#f8fafc";
      if (state === "hasStock") return rack.color || "#1e293b";
      return "#f1f5f9";
    },
    // 상태별 rack 테두리 색상을 반환한다
    rackStroke(rack) {
      const state = this.rackState(rack);
      if (state === "selected") return "#ffffff";
      if (state === "matched") return "#a7f3d0";
      if (state === "dimmed") return "#e2e8f0";
      if (state === "hasStock") return "#0f172a";
      return "#e2e8f0";
    },
    // dimmed 상태일 때 투명도를 낮춰 반환한다
    rackOpacity(rack) {
      return this.rackState(rack) === "dimmed" ? 0.25 : 1;
    },
    // 상태별 rack 라벨 색상을 반환한다
    rackTextColor(rack) {
      const state = this.rackState(rack);
      if (state === "empty" || state === "dimmed") return "#94a3b8";
      return "#ffffff";
    },
    // 특정 rack의 총 재고 수량을 계산한다
    totalQty(rack) {
      return (rack.stocks || []).reduce((sum, v) => sum + v.qty, 0);
    },
    // 창고 선택 시 뷰를 리셋하고 해당 창고 데이터를 로드한다
    async selectWarehouse(wh) {
      this.selectedWarehouse = wh;
      this.where.warehouse_id = wh.id;
      this.selectedRack = null;
      this.resetZoom();
      await this.loadData();
    },
    // rack 선택 시 상세 검색 영역을 초기화한다
    selectRack(rack) {
      this.selectedRack = rack;
      this.detailSearchText = "";
    },
    // 특정 rack으로 스크롤한다 (미구현)
    scrollToRack() {},
    // 화면 좌표를 SVG viewBox 좌표로 변환한다
    svgPoint(e) {
      const svg = this.$refs.svg;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const p = pt.matrixTransform(ctm.inverse());
      return { x: p.x, y: p.y };
    },
    // 휠 이벤트로 마우스 포인터 기준의 확대/축소를 수행한다
    handleWheel(e) {
      const scale = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      const newW = Math.min(
        Math.max(this.viewBox.w * scale, this.minZoom),
        this.maxZoom,
      );
      const p = this.svgPoint(e);
      const ratio = newW / this.viewBox.w;
      this.viewBox = {
        x: p.x - (p.x - this.viewBox.x) * ratio,
        y: p.y - (p.y - this.viewBox.y) * ratio,
        w: newW,
        h: newW,
      };
    },
    // 버튼으로 확대한다
    zoomIn() {
      this.zoomBy(1 / 1.25);
    },
    // 버튼으로 축소한다
    zoomOut() {
      this.zoomBy(1.25);
    },
    // 현재 중심을 기준으로 주어진 배율만큼 확대/축소한다
    zoomBy(scale) {
      const newW = Math.min(
        Math.max(this.viewBox.w * scale, this.minZoom),
        this.maxZoom,
      );
      const cx = this.viewBox.x + this.viewBox.w / 2;
      const cy = this.viewBox.y + this.viewBox.h / 2;
      this.viewBox = {
        x: cx - newW / 2,
        y: cy - newW / 2,
        w: newW,
        h: newW,
      };
    },
    // 뷰박스를 초기 상태로 리셋한다
    resetZoom() {
      this.viewBox = { x: 0, y: 0, w: 1000, h: 1000 };
    },
    // 배경 드래그 시작 시 팬 초기 상태를 저장한다
    handlePanStart(e) {
      if (e.target.closest("g")) return;
      this.isPanning = true;
      this.panStart = {
        x: e.clientX,
        y: e.clientY,
        vx: this.viewBox.x,
        vy: this.viewBox.y,
      };
    },
    // 팬 중 마우스 이동에 맞춰 뷰박스 좌표를 이동시킨다
    handlePanMove(e) {
      if (!this.isPanning) return;
      const svg = this.$refs.svg;
      const rect = svg.getBoundingClientRect();
      const scale = this.viewBox.w / rect.width;
      this.viewBox = {
        ...this.viewBox,
        x: this.panStart.vx - (e.clientX - this.panStart.x) * scale,
        y: this.panStart.vy - (e.clientY - this.panStart.y) * scale,
      };
    },
    // 팬 종료 처리
    handlePanEnd() {
      this.isPanning = false;
    },
    // 선택된 창고의 위치별 재고 맵 데이터를 로드한다
    async loadData() {
      try {
        const res = await api.post("/api/stock/locationStock", this.where);
        this.racks = res.data;

        console.log(this.racks);
      } catch (e) {
        console.error(e);
      }
    },
    // 창고 목록을 로드한다
    async loadWarehouses() {
      try {
        const res = await api.post("/api/warehouse/list");
        this.warehouses = res.data;
        console.log("정보 확인!!", res.data);
      } catch (e) {
        console.error(e);
      }
    },
  },
  // 마운트 시 창고 목록을 로드한다
  mounted() {
    this.loadWarehouses();
  },
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

@keyframes bounce-horizontal {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-10px);
  }
}
.animate-bounce-horizontal {
  animation: bounce-horizontal 1.5s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
.animate-bounce {
  animation: bounce 2s infinite ease-in-out;
}
</style>
