<template>
  <div class="p-6 flex gap-6 min-h-[calc(100vh-64px)] bg-[#f8fafc]">
    <!-- 🟢 1. 좌측: 창고 선택 사이드바 -->
    <div class="w-1/6 flex flex-col gap-4">
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

        <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
          <div
            v-for="wh in warehouses"
            :key="wh.id"
            @click="selectWarehouse(wh)"
            :class="[
              'group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
              selectedWarehouse?.id === wh.id
                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 translate-x-1'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50',
            ]"
          >
            <div class="flex justify-between items-start relative z-10">
              <span
                :class="[
                  'font-bold text-[15px]',
                  selectedWarehouse?.id === wh.id
                    ? 'text-white'
                    : 'text-slate-700',
                ]"
              >
                {{ wh.name }}
              </span>
              <span
                :class="[
                  'text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider',
                  selectedWarehouse?.id === wh.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ wh.width }} × {{ wh.height }}
              </span>
            </div>

            <div class="flex gap-2 mt-3 relative z-10">
              <div
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-colors',
                  selectedWarehouse?.id === wh.id
                    ? 'bg-white/10 text-blue-100'
                    : 'bg-blue-50 text-blue-600',
                ]"
              >
                <i class="fa-solid fa-cubes-stacked opacity-70"></i>
                {{ getWarehouseTypes(wh.id).toLocaleString() }} 종류
              </div>
              <div
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-colors',
                  selectedWarehouse?.id === wh.id
                    ? 'bg-white/10 text-white'
                    : 'bg-emerald-50 text-emerald-600',
                ]"
              >
                <i class="fa-solid fa-box-open opacity-70"></i>
                {{ getWarehouseQty(wh.id).toLocaleString() }}
              </div>
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
            <h3 class="font-bold text-slate-800 text-lg">선반 레이아웃</h3>
            <div class="w-72 relative group">
              <i
                class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              ></i>
              <input
                v-model="searchText"
                placeholder="자재 검색 (선반 자동 찾기)..."
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

        <!-- 맵 영역 -->
        <div
          class="flex-1 border border-slate-100 rounded-xl bg-[#fdfdfd] relative overflow-hidden shadow-inner flex items-center justify-center p-4 min-h-[500px]"
        >
          <div
            class="absolute inset-0 opacity-[0.03]"
            :style="dotPattern"
          ></div>

          <div
            v-if="selectedWarehouse"
            ref="grid"
            class="relative w-full h-full"
          >
            <!-- 배경 격자 -->
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

            <!-- 선반(Rack) 렌더링 -->
            <div
              v-for="rack in racks"
              :key="rack.id"
              :data-rack-id="rack.id"
              :class="['rack-box', rackClass(rack)]"
              :style="rackStyle(rack)"
              @click="selectRack(rack)"
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
              선반 상세
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
              선택된 선반
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
              placeholder="선반 내 자재 검색..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <!-- 자재 리스트 -->
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
            선반을 선택하세요
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
      warehouses: [],
      materials: [],
      selectedWarehouse: null,
      selectedRack: null,
      searchText: "",
      detailSearchText: "",
      gridWidth: 0,
      gridHeight: 0,
      where: { warehouse_id: "" },

      url: import.meta.env.VITE_API_URL,
    };
  },
  computed: {
    cellWidth() {
      return this.gridWidth / this.cols || 0;
    },
    cellHeight() {
      return this.gridHeight / this.rows || 0;
    },
    dotPattern() {
      return {
        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 0)`,
        backgroundSize: `20px 20px`,
      };
    },
    filteredStocks() {
      if (!this.selectedRack) return [];
      if (!this.detailSearchText) return this.selectedRack.stocks;
      return this.selectedRack.stocks.filter((item) =>
        item.material_name
          .toLowerCase()
          .includes(this.detailSearchText.toLowerCase()),
      );
    },
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
    getWarehouseTypes(id) {
      const wh = this.warehouses.find((w) => w.id === id);
      if (!wh || !wh.stocks) return 0;

      // material_id 기준 중복 제거
      const unique = new Set(wh.stocks.map((s) => s.material_id));
      return unique.size;
    },

    getWarehouseQty(id) {
      const wh = this.warehouses.find((w) => w.id === id);
      if (!wh || !wh.stocks) return 0;

      return wh.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    },
    rackStyle(rack) {
      return {
        left: rack.x * this.cellWidth + "px",
        top: rack.y * this.cellHeight + "px",
        width: rack.width * this.cellWidth + "px",
        height: rack.height * this.cellHeight + "px",
      };
    },
    rackClass(rack) {
      if (this.selectedRack?.id === rack.id) return "rack-selected";
      if (this.searchText) {
        return this.matchedRackIds.includes(rack.id)
          ? "rack-matched"
          : "rack-dimmed";
      }
      return rack.stocks?.length ? "rack-has-stock" : "rack-empty";
    },
    totalQty(rack) {
      return rack.stocks.reduce((sum, v) => sum + v.qty, 0);
    },
    async selectWarehouse(wh) {
      this.selectedWarehouse = wh;
      this.where.warehouse_id = wh.id;
      this.selectedRack = null;
      await this.loadData();

      this.$nextTick(() => {
        this.updateGridSize();
      });
    },
    selectRack(rack) {
      this.selectedRack = rack;
      this.detailSearchText = "";
    },
    scrollToRack(rack) {
      this.$nextTick(() => {
        const el = document.querySelector(`[data-rack-id="${rack.id}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    updateGridSize() {
      if (!this.$refs.grid) return;
      const rect = this.$refs.grid.getBoundingClientRect();
      this.gridWidth = rect.width;
      this.gridHeight = rect.height;
    },
    async loadData() {
      try {
        const res = await api.post("/api/stock/locationStock", this.where);
        this.racks = res.data;

        console.log(this.racks);
      } catch (e) {
        console.error(e);
      }
    },
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
  mounted() {
    this.loadWarehouses();
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
.rack-has-stock {
  @apply bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:scale-105;
}
.rack-empty {
  @apply bg-slate-50 text-slate-300 border-slate-100;
}
.rack-matched {
  @apply bg-emerald-500 text-white border-emerald-300 z-10 scale-105 shadow-lg shadow-emerald-200 ring-2 ring-emerald-100;
}
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
