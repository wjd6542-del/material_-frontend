<template>
  <div class="p-6 flex gap-6 min-h-[calc(100vh-64px)] bg-[#f8fafc]">
    <!-- 🟢 좌측: 창고 사이드바 -->
    <div class="w-1/4 flex flex-col gap-4">
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
                  'text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider',
                  selectedWarehouse?.id === rack.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ rack.width }} × {{ rack.height }}
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
                개수
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔵 중앙: 맵 레이아웃 -->
    <div class="w-1/2 flex flex-col gap-4">
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
                placeholder="특정 자재 위치 검색..."
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
                >자재 존재(검색시)</span
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
          class="flex-1 border border-slate-100 rounded-xl bg-[#fdfdfd] relative overflow-hidden shadow-inner flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 opacity-[0.03]"
            :style="dotPattern"
          ></div>

          <div ref="grid" class="relative w-full h-full max-h-[600px]">
            <div
              class="grid gap-[1px] opacity-20 h-full"
              :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
            >
              <div
                v-for="n in rows * cols"
                :key="n"
                class="border border-slate-200 aspect-square"
              />
            </div>

            <div
              v-for="rack in racks"
              :key="rack.id"
              :class="['rack-box', rackClass(rack)]"
              :style="rackStyle(rack)"
              @click="selectWarehouse(rack)"
            >
              <div class="rack-header">{{ rack.name }}</div>
              <div
                class="flex-1 flex flex-col items-center justify-center gap-0.5 px-1"
              >
                <span class="text-[10px] font-black leading-none">{{
                  totalQty(rack).toLocaleString()
                }}</span>
                <span class="text-[8px] opacity-80 font-medium tracking-tighter"
                  >{{ rack.stocks.length.toLocaleString() }}종류</span
                >
              </div>
            </div>
          </div>
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
                <div
                  class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"
                >
                  <i class="fa-solid fa-box text-xs"></i>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-[13px] font-bold text-slate-700 truncate max-w-[120px]"
                    >{{ item.material_name }}</span
                  >
                  <span class="text-[10px] text-slate-400"
                    >ID: {{ item.id }}</span
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

<script>
import api from "@/api/api";

export default {
  data() {
    return {
      rows: 30,
      cols: 36,
      racks: [],
      selectedWarehouse: null,
      searchText: "",
      searchMaterial: "",
      detailSearchText: "",
      gridWidth: 0,
      gridHeight: 0,
    };
  },
  computed: {
    cellWidth() {
      return this.gridWidth / this.cols;
    },
    cellHeight() {
      return this.gridHeight / this.rows;
    },
    dotPattern() {
      return {
        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 0)`,
        backgroundSize: `20px 20px`,
      };
    },
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
    filteredRacks() {
      if (!this.searchText) return this.racks;
      return this.racks.filter((r) =>
        r.name.toLowerCase().includes(this.searchText.toLowerCase()),
      );
    },
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
    rackStyle(r) {
      return {
        left: r.x * this.cellWidth + "px",
        top: r.y * this.cellHeight + "px",
        width: r.width * this.cellWidth + "px",
        height: r.height * this.cellHeight + "px",
      };
    },
    rackClass(r) {
      if (this.selectedWarehouse?.id === r.id) return "rack-selected";
      if (this.searchMaterial) {
        return this.matchedRackIds.includes(r.id)
          ? "rack-matched"
          : "rack-dimmed";
      }
      return r.stocks?.length ? "rack-has-stock" : "rack-empty";
    },
    totalQty(r) {
      return r.stocks.reduce((s, v) => s + v.qty, 0);
    },
    selectWarehouse(r) {
      this.selectedWarehouse = r;
      this.detailSearchText = "";
    },
    updateGridSize() {
      if (!this.$refs.grid) return;
      const rect = this.$refs.grid.getBoundingClientRect();
      this.gridWidth = rect.width;
      this.gridHeight = rect.height;
    },
    async loadData() {
      try {
        const res = await api.post("/api/stock/warehousStock");
        this.racks = res.data;
      } catch (e) {
        console.error("데이터 로드 실패", e);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updateGridSize();
    });
    this.loadData();
    window.addEventListener("resize", this.updateGridSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateGridSize);
  },
};
</script>

<style scoped>
.rack-box {
  @apply absolute rounded-lg shadow-sm flex flex-col cursor-pointer transition-all duration-300 border overflow-hidden;
}
.rack-header {
  @apply text-center text-[9px] font-black border-b py-[1px] bg-white/20 uppercase tracking-tighter truncate px-1 shrink-0;
}
.rack-selected {
  @apply bg-blue-600 text-white border-blue-400 z-20 scale-105 shadow-xl shadow-blue-300/50 ring-2 ring-white;
}
/* ⬛ 재고 있음: 검정색 계열 */
.rack-has-stock {
  @apply bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:scale-105;
}
/* ⬜ 재고 없음: 밝은 회색 */
.rack-empty {
  @apply bg-slate-50 text-slate-300 border-slate-100;
}
/* 🟩 검색 매칭: 초록색 */
.rack-matched {
  @apply bg-emerald-500 text-white border-emerald-300 z-10 scale-105 shadow-lg shadow-emerald-200 ring-2 ring-emerald-100;
}
/* 검색 비매칭: 흐리게 */
.rack-dimmed {
  @apply bg-slate-50 opacity-20 border-slate-100 scale-95;
}
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
