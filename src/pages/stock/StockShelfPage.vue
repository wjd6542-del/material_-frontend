<template>
  <div class="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-64px)] bg-[#f8fafc]">
    <!-- 🟢 좌측: 창고 + 위치 + 선반 사이드바 -->
    <div class="w-full lg:w-1/6 flex flex-col gap-4">
      <!-- 창고 리스트 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-[28%] shrink-0"
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
              'group px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2',
              selectedWarehouse?.id === wh.id
                ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-100'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50',
            ]"
          >
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
        </div>
      </div>

      <!-- 위치 리스트 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-[36%] shrink-0"
      >
        <div
          class="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
        >
          <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <div
              class="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-sm"
            >
              <i class="fa-solid fa-location-dot text-[10px]"></i>
            </div>
            위치 리스트
          </h3>
          <span class="text-[10px] font-bold text-slate-400">
            {{ filteredLocations.length.toLocaleString() }}/{{ locations.length.toLocaleString() }}
          </span>
        </div>
        <div v-if="selectedWarehouse" class="px-2 pt-2">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"
            ></i>
            <input
              v-model="locationSearchText"
              placeholder="위치 검색..."
              class="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll">
          <div
            v-if="!selectedWarehouse"
            class="py-6 text-center text-slate-400 text-xs"
          >
            창고를 선택하세요
          </div>
          <div
            v-else-if="!locations.length"
            class="py-6 text-center text-slate-400 text-xs"
          >
            등록된 위치가 없습니다
          </div>
          <div
            v-else-if="!filteredLocations.length"
            class="py-6 text-center text-slate-400 text-xs"
          >
            검색 결과 없음
          </div>
          <div
            v-for="loc in filteredLocations"
            :key="loc.id"
            @click="selectLocation(loc)"
            :class="[
              'group px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2',
              selectedLocation?.id === loc.id
                ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100'
                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50',
            ]"
          >
            <span
              :class="[
                'font-bold text-[13px] truncate',
                selectedLocation?.id === loc.id
                  ? 'text-white'
                  : 'text-slate-700',
              ]"
            >
              {{ loc.name || loc.code }}
            </span>
            <span
              :class="[
                'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono shrink-0',
                selectedLocation?.id === loc.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500',
              ]"
            >
              {{ loc.code }}
            </span>
          </div>
        </div>
      </div>

      <!-- 선반 리스트 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden flex-1"
      >
        <div
          class="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
        >
          <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <div
              class="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-sm"
            >
              <i class="fa-solid fa-layer-group text-[10px]"></i>
            </div>
            선반 리스트
          </h3>
          <span class="text-[10px] font-bold text-slate-400">
            {{ filteredRacks.length.toLocaleString() }}/{{ racks.length.toLocaleString() }}
          </span>
        </div>
        <div v-if="selectedLocation" class="px-2 pt-2">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"
            ></i>
            <input
              v-model="rackSearchText"
              placeholder="선반 검색..."
              class="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll">
          <div
            v-if="!selectedLocation"
            class="py-10 text-center text-slate-400 text-xs"
          >
            위치를 선택하세요
          </div>
          <div
            v-else-if="!racks.length"
            class="py-10 text-center text-slate-400 text-xs"
          >
            등록된 선반이 없습니다
          </div>
          <div
            v-else-if="!filteredRacks.length"
            class="py-10 text-center text-slate-400 text-xs"
          >
            검색 결과 없음
          </div>
          <div
            v-for="rack in filteredRacks"
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
                {{ (rack.stocks || []).length.toLocaleString() }}
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

    <!-- 🔵 중앙: 선반 레이아웃 맵 -->
    <div class="flex-1 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-full overflow-hidden"
      >
        <div class="flex flex-col gap-4 mb-6">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-lg">선반 레이아웃</h3>
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
          class="flex-1 border border-slate-100 rounded-xl bg-[#fdfdfd] relative overflow-hidden shadow-inner flex items-center justify-center p-4 min-h-[500px]"
        >
          <div
            v-if="!selectedLocation"
            class="flex flex-col items-center opacity-40"
          >
            <div
              class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-bounce-horizontal"
            >
              <i class="fa-solid fa-arrow-left text-slate-400 text-xl"></i>
            </div>
            <p class="text-slate-500 font-bold">
              좌측에서 창고와 위치를 선택하세요
            </p>
          </div>

          <div v-else ref="grid" class="relative w-full h-full">
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
              :data-rack-id="rack.id"
              :class="['rack-box', rackClass(rack)]"
              :style="rackStyle(rack)"
              @click="selectRack(rack)"
            >
              <div class="rack-header">{{ rack.name || rack.code }}</div>
              <div
                class="flex-1 flex flex-col items-center justify-center gap-0.5 px-1"
              >
                <span class="text-[10px] font-black leading-none">{{
                  totalQty(rack).toLocaleString()
                }}</span>
                <span class="text-[8px] opacity-80 font-medium tracking-tighter"
                  >{{ (rack.stocks || []).length.toLocaleString() }}종류</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🟡 우측: 선반 상세 -->
    <div class="w-1/4 flex flex-col gap-4">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col h-full overflow-hidden"
      >
        <div v-if="selectedRack" class="flex flex-col h-full">
          <div class="flex items-center justify-between mb-5">
            <h3
              class="font-bold text-slate-800 text-lg flex items-center gap-2"
            >
              <i class="fa-solid fa-border-all text-blue-500 text-sm"></i>
              선반 상세
            </h3>
            <span
              class="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase"
              >{{ selectedRack.code }}</span
            >
          </div>

          <div
            class="mb-5 p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200"
          >
            <div class="text-[13px] font-medium text-slate-400 mb-1">
              선택된 선반
            </div>
            <div class="text-xl font-bold mb-4">
              {{ selectedRack.name || selectedRack.code }}
            </div>
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
                  {{ (selectedRack.stocks || []).length.toLocaleString() }}
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

          <div class="relative mb-4">
            <i
              class="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            ></i>
            <input
              v-model="detailSearchText"
              placeholder="선반 내 품목 검색..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
            <div
              v-for="item in filteredStocks"
              :key="item.id"
              class="group flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div class="flex items-center gap-3 shrink-0">
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
                  >
                    {{ item.material_name }}
                  </span>
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
            <div
              v-if="filteredStocks.length === 0"
              class="text-center py-20 text-slate-400 text-sm"
            >
              <i class="fa-solid fa-magnifying-glass mb-2"></i><br />결과 없음
            </div>
          </div>
        </div>

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
      warehouses: [],
      locations: [],
      racks: [],
      selectedWarehouse: null,
      selectedLocation: null,
      selectedRack: null,
      searchText: "",
      detailSearchText: "",
      locationSearchText: "",
      rackSearchText: "",
      gridWidth: 0,
      gridHeight: 0,
      url: import.meta.env.VITE_API_URL,
    };
  },
  computed: {
    // 한 셀의 픽셀 너비를 계산한다
    cellWidth() {
      return this.gridWidth / this.cols || 0;
    },
    // 한 셀의 픽셀 높이를 계산한다
    cellHeight() {
      return this.gridHeight / this.rows || 0;
    },
    // 검색어로 필터링된 위치 목록을 반환한다
    filteredLocations() {
      const q = this.locationSearchText.trim().toLowerCase();
      if (!q) return this.locations;
      return this.locations.filter(
        (l) =>
          (l.name || "").toLowerCase().includes(q) ||
          (l.code || "").toLowerCase().includes(q),
      );
    },
    // 검색어로 필터링된 선반 목록을 반환한다
    filteredRacks() {
      const q = this.rackSearchText.trim().toLowerCase();
      if (!q) return this.racks;
      return this.racks.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.code || "").toLowerCase().includes(q),
      );
    },
    // 선택된 선반의 재고를 상세 검색어로 필터링해 반환한다
    filteredStocks() {
      if (!this.selectedRack) return [];
      const list = this.selectedRack.stocks || [];
      if (!this.detailSearchText) return list;
      return list.filter((item) =>
        item.material_name
          .toLowerCase()
          .includes(this.detailSearchText.toLowerCase()),
      );
    },
    // 검색어에 품목이 포함된 선반 id 배열을 반환한다
    matchedRackIds() {
      if (!this.searchText) return [];
      return this.racks
        .filter((rack) =>
          (rack.stocks || []).some((s) =>
            s.material_name
              .toLowerCase()
              .includes(this.searchText.toLowerCase()),
          ),
        )
        .map((r) => r.id);
    },
  },
  watch: {
    // 검색어 변경 시 첫 매칭 선반을 선택한다
    searchText(val) {
      if (!val) return;
      const found = this.racks.find((rack) =>
        (rack.stocks || []).some((s) =>
          s.material_name.toLowerCase().includes(val.toLowerCase()),
        ),
      );
      if (found) this.selectedRack = found;
    },
  },
  methods: {
    // 특정 선반의 총 재고 수량을 계산한다
    totalQty(rack) {
      return (rack.stocks || []).reduce((sum, v) => sum + v.qty, 0);
    },
    // 선반 블록의 absolute 포지션 스타일을 반환한다
    rackStyle(rack) {
      return {
        left: rack.x * this.cellWidth + "px",
        top: rack.y * this.cellHeight + "px",
        width: rack.width * this.cellWidth + "px",
        height: rack.height * this.cellHeight + "px",
      };
    },
    // 선반 상태별 CSS 클래스명을 반환한다
    rackClass(rack) {
      if (this.selectedRack?.id === rack.id) return "rack-selected";
      if (this.searchText) {
        return this.matchedRackIds.includes(rack.id)
          ? "rack-matched"
          : "rack-dimmed";
      }
      return rack.stocks?.length ? "rack-has-stock" : "rack-empty";
    },
    // 창고 선택 시 하위 상태를 초기화하고 위치 목록을 로드한다
    async selectWarehouse(wh) {
      this.selectedWarehouse = wh;
      this.selectedLocation = null;
      this.selectedRack = null;
      this.locations = [];
      this.racks = [];
      this.locationSearchText = "";
      this.rackSearchText = "";
      await this.loadLocations();
    },
    // 위치 선택 시 선반 재고 로드 및 그리드 크기를 갱신한다
    async selectLocation(loc) {
      this.selectedLocation = loc;
      this.selectedRack = null;
      this.rackSearchText = "";
      await this.loadRacks();
      this.$nextTick(() => this.updateGridSize());
    },
    // 선반 선택 시 상세 검색 영역을 초기화한다
    selectRack(rack) {
      this.selectedRack = rack;
      this.detailSearchText = "";
    },
    // 그리드 컨테이너의 실제 픽셀 크기를 갱신한다
    updateGridSize() {
      if (!this.$refs.grid) return;
      const rect = this.$refs.grid.getBoundingClientRect();
      this.gridWidth = rect.width;
      this.gridHeight = rect.height;
    },
    // 창고 목록을 로드한다
    async loadWarehouses() {
      try {
        const res = await api.post("/api/warehouse/list");
        this.warehouses = res.data || [];
      } catch (e) {
        console.error(e);
      }
    },
    // 선택된 창고의 위치 목록을 로드한다
    async loadLocations() {
      if (!this.selectedWarehouse) return;
      try {
        const res = await api.post("/api/location/list", {
          warehouse_id: this.selectedWarehouse.id,
        });
        this.locations = res.data || [];
      } catch (e) {
        console.error(e);
      }
    },
    // 선택된 위치의 선반 재고 데이터를 로드한다
    async loadRacks() {
      if (!this.selectedLocation) return;
      try {
        const res = await api.post("/api/stock/shelfStock", {
          location_id: this.selectedLocation.id,
        });

        console.log("결과 정보 ?? ", res.data);

        this.racks = res.data || [];
      } catch (e) {
        console.error(e);
      }
    },
  },
  // 마운트 시 창고 로드 및 리사이즈 리스너 등록
  mounted() {
    this.loadWarehouses();
    window.addEventListener("resize", this.updateGridSize);
  },
  // 언마운트 직전 리사이즈 리스너를 제거한다
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
