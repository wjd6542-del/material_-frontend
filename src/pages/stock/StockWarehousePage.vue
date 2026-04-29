<template>
  <div class="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-64px)] bg-[#f8fafc]">
    <!-- 🟢 좌측: 창고 사이드바 -->
    <div class="w-full lg:w-1/6 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full transition-all"
      >
        <div class="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <div
              class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200"
            >
              <i class="fa-solid fa-warehouse text-xs"></i>
            </div>
            창고 리스트
          </h3>
        </div>

        <div class="p-4">
          <div class="relative group">
            <i
              class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            ></i>
            <input
              v-model="searchText"
              placeholder="창고 이름 검색..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scroll">
          <div
            v-for="rack in filteredRacks"
            :key="rack.id"
            @click="selectWarehouse(rack)"
            :class="[
              'group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
              selectedWarehouse?.id === rack.id
                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 translate-x-1'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50',
            ]"
          >
            <div class="flex justify-between items-start relative z-10">
              <span
                :class="[
                  'font-bold text-[15px]',
                  selectedWarehouse?.id === rack.id
                    ? 'text-white'
                    : 'text-slate-700',
                ]"
              >
                {{ rack.name }}
              </span>
              <span
                :class="[
                  'text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider font-mono',
                  selectedWarehouse?.id === rack.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ rack.code }}
              </span>
            </div>

            <div class="flex gap-2 mt-3 relative z-10">
              <div
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-colors',
                  selectedWarehouse?.id === rack.id
                    ? 'bg-white/10 text-blue-100'
                    : 'bg-blue-50 text-blue-600',
                ]"
              >
                <i class="fa-solid fa-cubes-stacked opacity-70"></i>
                {{
                  (warehouseKpiMap[rack.id]?.totalTypes || 0).toLocaleString()
                }}
                종류
              </div>
              <div
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-colors',
                  selectedWarehouse?.id === rack.id
                    ? 'bg-white/10 text-white'
                    : 'bg-emerald-50 text-emerald-600',
                ]"
              >
                <i class="fa-solid fa-box-open opacity-70"></i>
                {{ (warehouseKpiMap[rack.id]?.totalQty || 0).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔵 중앙: 맵 레이아웃 -->
    <div class="flex-1 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-full overflow-hidden"
      >
        <!-- 헤더 영역: 문구 제거 및 상태 범례 추가 -->
        <div class="flex flex-col gap-4 mb-6">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-lg">창고 레이아웃 매핑</h3>
            <div class="w-64 relative group">
              <i
                class="fa-solid fa-box absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              ></i>
              <input
                v-model="searchMaterial"
                placeholder="특정 품목 위치 검색..."
                class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
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

        <div
          class="flex-1 border border-slate-100 rounded-xl bg-[#fdfdfd] relative overflow-hidden shadow-inner flex items-center justify-center p-2"
        >
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
                id="stockGrid"
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
                id="stockGridLarge"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <rect width="100%" height="100%" fill="url(#stockGrid)" />
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
              fill="url(#stockGridLarge)"
            />

            <g
              v-for="rack in racks"
              :key="rack.id"
              class="cursor-pointer"
              @click="selectWarehouse(rack)"
            >
              <polygon
                :points="pointsToString(rack.points)"
                :fill="rackFill(rack)"
                :stroke="rackStroke(rack)"
                :stroke-width="selectedWarehouse?.id === rack.id ? 3 : 1.5"
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
                {{ rack.name }}
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
        </div>
      </div>
    </div>

    <!-- 🟡 우측: 상세 정보 -->
    <div class="w-1/4 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col h-full overflow-hidden"
      >
        <div v-if="selectedWarehouse" class="flex flex-col h-full">
          <div class="flex items-center justify-between mb-5">
            <h3
              class="font-bold text-slate-800 text-lg flex items-center gap-2"
            >
              <i class="fa-solid fa-circle-info text-blue-500 text-sm"></i>
              상세 정보
            </h3>
            <span
              class="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase"
              >{{ selectedWarehouse.code }}</span
            >
          </div>

          <!-- 요약 카드 -->
          <div
            class="mb-5 p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200"
          >
            <div class="text-[13px] font-medium text-slate-400 mb-1">
              선택된 창고
            </div>
            <div class="text-xl font-bold mb-4">
              {{ selectedWarehouse.name }}
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="bg-white/10 rounded-xl p-2.5 border border-white/5">
                <div
                  class="text-[10px] text-white/50 mb-0.5 uppercase tracking-wider"
                >
                  보관 종류
                </div>
                <div class="text-lg font-bold">
                  {{ selectedWarehouse.stocks.length.toLocaleString() }}
                </div>
              </div>
              <div class="bg-white/10 rounded-xl p-2.5 border border-white/5">
                <div
                  class="text-[10px] text-white/50 mb-0.5 uppercase tracking-wider"
                >
                  총 재고량
                </div>
                <div class="text-lg font-bold">
                  {{ totalQty(selectedWarehouse).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <div class="relative mb-4">
            <i
              class="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            ></i>
            <input
              v-model="detailSearchText"
              placeholder="결과 내 검색..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
            <div
              v-for="item in filteredWarehouseStocks"
              :key="item.id"
              class="group flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div class="flex items-center gap-3">
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

                <div class="flex flex-col">
                  <span
                    class="text-[13px] font-bold text-slate-700 truncate max-w-[300px]"
                    >{{ item.material_name }}</span
                  >
                  <span class="text-[10px] text-slate-400"
                    >CODE: {{ item.material_code }}</span
                  >
                </div>
              </div>
              <div
                class="text-[14px] font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
              >
                {{ item.qty.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- 선택 없음 상태 -->
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
            창고를 선택하세요
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import { createSvgZoomPanMixin } from "@/mixins/svgZoomPan";
import { rackVisualsMixin } from "@/mixins/rackVisuals";

export default {
  name: "StockWarehousePage",
  mixins: [
    createSvgZoomPanMixin({ size: 1000, minZoom: 200, maxZoom: 3000 }),
    rackVisualsMixin,
  ],

  data() {
    return {
      racks: [],
      selectedWarehouse: null,
      searchText: "",
      searchMaterial: "",
      detailSearchText: "",
      url: import.meta.env.VITE_API_URL,
    };
  },
  computed: {
    // 창고별 총 수량/품목 수 KPI 맵을 반환한다
    warehouseKpiMap() {
      const map = {};
      this.racks.forEach((r) => {
        map[r.id] = {
          totalQty: r.stocks.reduce((s, v) => s + v.qty, 0),
          totalTypes: r.stocks.length,
        };
      });
      return map;
    },
    // 창고명 검색어로 필터링된 창고(rack) 목록을 반환한다
    filteredRacks() {
      if (!this.searchText) return this.racks;
      return this.racks.filter((r) =>
        r.name.toLowerCase().includes(this.searchText.toLowerCase()),
      );
    },
    // 품목 검색어에 매칭되는 rack id 배열을 반환한다
    matchedRackIds() {
      if (!this.searchMaterial) return [];
      return this.racks
        .filter((r) =>
          r.stocks.some((s) =>
            s.material_name
              .toLowerCase()
              .includes(this.searchMaterial.toLowerCase()),
          ),
        )
        .map((r) => r.id);
    },
    // 선택된 창고의 재고를 상세 검색어로 필터링해 반환한다
    filteredWarehouseStocks() {
      if (!this.selectedWarehouse) return [];
      const list = this.selectedWarehouse.stocks;
      if (!this.detailSearchText) return list;
      return list.filter((item) =>
        item.material_name
          .toLowerCase()
          .includes(this.detailSearchText.toLowerCase()),
      );
    },
  },
  methods: {
    // 선택/검색/재고 여부에 따른 rack 상태 문자열 (rackVisuals 가 사용)
    rackState(r) {
      if (this.selectedWarehouse?.id === r.id) return "selected";
      if (this.searchMaterial) {
        return this.matchedRackIds.includes(r.id) ? "matched" : "dimmed";
      }
      return r.stocks?.length ? "hasStock" : "empty";
    },
    // 창고 선택 시 상세 영역을 초기화한다
    selectWarehouse(r) {
      this.selectedWarehouse = r;
      this.detailSearchText = "";
    },
    // 창고별 재고 맵 데이터를 서버에서 로드한다
    async loadData() {
      try {
        const res = await api.post("/api/stock/warehousStock");
        this.racks = res.data;
      } catch (e) {
        this.$toast?.error?.("재고 데이터 로드 실패");
      }
    },
  },
  // 마운트 시 창고 재고 데이터를 로드한다
  mounted() {
    this.loadData();
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
