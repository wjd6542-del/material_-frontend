<template>
  <div class="flex flex-col gap-4" style="height: 70vh">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <i class="fa-solid fa-warehouse text-blue-500"></i>
        선반 위치 선택
      </h2>
      </div>

    <!-- 단계별 드릴다운 -->
    <div class="flex-1 flex gap-3 overflow-hidden border rounded-xl bg-white">
      <!-- 창고 -->
      <section class="flex-1 flex flex-col overflow-hidden border-r">
        <header
          class="px-3 py-2.5 border-b bg-slate-50/80 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center"
              >1</span
            >
            <span class="text-sm font-semibold text-slate-700">창고</span>
          </div>
          <span class="text-xs text-slate-400">{{ warehouses.length }}</span>
        </header>
        <div class="p-2 border-b">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"
            ></i>
            <input
              v-model="warehouseKeyword"
              type="text"
              placeholder="창고 검색..."
              class="w-full pl-7 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex-1 overflow-auto p-1.5">
          <div
            v-if="loadingWarehouses"
            class="text-center text-slate-400 text-xs py-6"
          >
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>불러오는 중...
          </div>
          <div
            v-else-if="!filteredWarehouses.length"
            class="h-full flex flex-col items-center justify-center px-4 py-6 text-center"
          >
            <div
              class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2"
            >
              <i class="fa-regular fa-folder-open text-xl text-slate-300"></i>
            </div>
            <p class="text-[12px] font-semibold text-slate-500">
              등록된 창고가 없습니다
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              창고를 먼저 등록해 주세요
            </p>
          </div>
          <ul v-else class="list-none p-0 m-0">
            <li
              v-for="w in filteredWarehouses"
              :key="w.id"
              @click="onWarehouseSelect(w)"
              class="px-2.5 py-2 rounded-lg cursor-pointer text-[13px] mb-0.5 transition-colors flex items-center gap-2"
              :class="
                selectedWarehouse?.id === w.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-blue-50'
              "
            >
              <i class="fa-solid fa-warehouse text-blue-400 text-xs"></i>
              <span class="truncate flex-1">{{ w.name || w.code }}</span>
              <span
                class="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold tabular-nums"
              >
                {{ locationCountByWarehouse[w.id] || 0 }}
              </span>
              <i
                class="fa-solid fa-chevron-right text-[10px] text-slate-300"
              ></i>
            </li>
          </ul>
        </div>
      </section>

      <!-- 위치 -->
      <section class="flex-1 flex flex-col overflow-hidden border-r">
        <header
          class="px-3 py-2.5 border-b bg-slate-50/80 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              :class="selectedWarehouse ? 'bg-blue-600' : 'bg-slate-300'"
              >2</span
            >
            <span class="text-sm font-semibold text-slate-700">위치</span>
          </div>
          <span class="text-xs text-slate-400">{{ locations.length }}</span>
        </header>
        <div class="p-2 border-b">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"
            ></i>
            <input
              v-model="locationKeyword"
              type="text"
              placeholder="위치 검색..."
              class="w-full pl-7 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              :disabled="!selectedWarehouse"
            />
          </div>
        </div>
        <div class="flex-1 overflow-auto p-1.5">
          <div
            v-if="!selectedWarehouse"
            class="h-full flex flex-col items-center justify-center px-4 py-6 text-center"
          >
            <div class="relative mb-3">
              <div
                class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center shadow-sm"
              >
                <i class="fa-solid fa-location-dot text-2xl text-amber-400"></i>
              </div>
              <span
                class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-amber-200 flex items-center justify-center shadow-sm"
              >
                <i class="fa-solid fa-arrow-left text-[9px] text-amber-500"></i>
              </span>
            </div>
            <p class="text-[13px] font-bold text-slate-700 mb-0.5">
              창고를 먼저 선택하세요
            </p>
            <p class="text-[11px] text-slate-400">
              좌측에서 창고를 고르면 위치 목록이 표시됩니다
            </p>
          </div>
          <div
            v-else-if="loadingLocations"
            class="text-center text-slate-400 text-xs py-6"
          >
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>불러오는 중...
          </div>
          <div
            v-else-if="!filteredLocations.length"
            class="h-full flex flex-col items-center justify-center px-4 py-6 text-center"
          >
            <div
              class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2"
            >
              <i class="fa-regular fa-folder-open text-xl text-slate-300"></i>
            </div>
            <p class="text-[12px] font-semibold text-slate-500">
              등록된 위치가 없습니다
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              <span class="font-semibold text-slate-500">{{
                selectedWarehouse.name || selectedWarehouse.code
              }}</span>
              창고에 위치를 먼저 등록하세요
            </p>
          </div>
          <ul v-else class="list-none p-0 m-0">
            <li
              v-for="l in filteredLocations"
              :key="l.id"
              @click="onLocationSelect(l)"
              class="px-2.5 py-2 rounded-lg cursor-pointer text-[13px] mb-0.5 transition-colors flex items-center gap-2"
              :class="
                selectedLocation?.id === l.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-blue-50'
              "
            >
              <i class="fa-solid fa-location-dot text-amber-400 text-xs"></i>
              <span class="truncate flex-1">{{ l.name || l.code }}</span>
              <span
                class="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold tabular-nums"
              >
                {{ shelfCountByLocation[l.id] || 0 }}
              </span>
              <i
                class="fa-solid fa-chevron-right text-[10px] text-slate-300"
              ></i>
            </li>
          </ul>
        </div>
      </section>

      <!-- 선반 -->
      <section class="flex-1 flex flex-col overflow-hidden">
        <header
          class="px-3 py-2.5 border-b bg-slate-50/80 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              :class="selectedLocation ? 'bg-blue-600' : 'bg-slate-300'"
              >3</span
            >
            <span class="text-sm font-semibold text-slate-700">선반</span>
          </div>
          <span class="text-xs text-slate-400">{{ shelves.length }}</span>
        </header>
        <div class="p-2 border-b">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"
            ></i>
            <input
              v-model="shelfKeyword"
              type="text"
              placeholder="선반 검색..."
              class="w-full pl-7 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              :disabled="!selectedLocation"
            />
          </div>
        </div>
        <div class="flex-1 overflow-auto p-1.5">
          <div
            v-if="!selectedLocation"
            class="h-full flex flex-col items-center justify-center px-4 py-6 text-center"
          >
            <div class="relative mb-3">
              <div
                class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center shadow-sm"
              >
                <i class="fa-solid fa-box text-2xl text-emerald-400"></i>
              </div>
              <span
                class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-emerald-200 flex items-center justify-center shadow-sm"
              >
                <i class="fa-solid fa-arrow-left text-[9px] text-emerald-500"></i>
              </span>
            </div>
            <p class="text-[13px] font-bold text-slate-700 mb-0.5">
              위치를 먼저 선택하세요
            </p>
            <p class="text-[11px] text-slate-400">
              위치를 고르면 선반 목록이 표시됩니다
            </p>
          </div>
          <div
            v-else-if="loadingShelves"
            class="text-center text-slate-400 text-xs py-6"
          >
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>불러오는 중...
          </div>
          <div
            v-else-if="!filteredShelves.length"
            class="h-full flex flex-col items-center justify-center px-4 py-6 text-center"
          >
            <div
              class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2"
            >
              <i class="fa-regular fa-folder-open text-xl text-slate-300"></i>
            </div>
            <p class="text-[12px] font-semibold text-slate-500">
              등록된 선반이 없습니다
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              <span class="font-semibold text-slate-500">{{
                selectedLocation.name || selectedLocation.code
              }}</span>
              위치에 선반을 먼저 등록하세요
            </p>
          </div>
          <ul v-else class="list-none p-0 m-0">
            <li
              v-for="s in filteredShelves"
              :key="s.id"
              @click="onShelfSelect(s)"
              class="px-2.5 py-2 rounded-lg cursor-pointer text-[13px] mb-0.5 transition-colors flex items-center gap-2"
              :class="
                selectedShelf?.id === s.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-blue-50'
              "
            >
              <i class="fa-solid fa-box text-emerald-400 text-xs"></i>
              <span class="truncate flex-1">{{ s.name || s.code }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- 선택 경로 및 액션 -->
    <div class="flex items-center justify-between pt-2 border-t">
      <div class="flex items-center gap-1.5 text-xs text-slate-500 flex-1 min-w-0">
        <span class="text-slate-400">선택 경로:</span>
        <template v-if="selectedWarehouse">
          <span class="font-semibold text-slate-700 truncate">
            {{ selectedWarehouse.name || selectedWarehouse.code }}
          </span>
        </template>
        <template v-else>
          <span class="text-slate-300">창고 미선택</span>
        </template>
        <i
          v-if="selectedLocation"
          class="fa-solid fa-chevron-right text-[10px] text-slate-300"
        ></i>
        <span v-if="selectedLocation" class="font-semibold text-slate-700 truncate">
          {{ selectedLocation.name || selectedLocation.code }}
        </span>
        <i
          v-if="selectedShelf"
          class="fa-solid fa-chevron-right text-[10px] text-slate-300"
        ></i>
        <span v-if="selectedShelf" class="font-bold text-blue-600 truncate">
          {{ selectedShelf.name || selectedShelf.code }}
        </span>
      </div>
      <div class="flex items-center gap-2 shrink-0 ml-3">
        <button
          type="button"
          @click="modal.closeModal()"
          class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          취소
        </button>
        <button
          type="button"
          @click="confirm"
          :disabled="!selectedShelf"
          class="px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <i class="fa-solid fa-check text-xs"></i>
          적용
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";

export default {
  name: "ShelfSelectModal",

  props: {
    onConfirm: { type: Function, default: null },
  },

  data() {
    return {
      modal: useModalStore(),

      warehouses: [] as any[],
      allLocations: [] as any[],
      allShelves: [] as any[],

      selectedWarehouse: null as any,
      selectedLocation: null as any,
      selectedShelf: null as any,

      warehouseKeyword: "",
      locationKeyword: "",
      shelfKeyword: "",

      loading: false,
    };
  },

  computed: {
    // 창고 ID → 해당 창고의 위치 개수
    locationCountByWarehouse() {
      const map: Record<number, number> = {};
      for (const l of this.allLocations) {
        map[l.warehouse_id] = (map[l.warehouse_id] || 0) + 1;
      }
      return map;
    },

    // 위치 ID → 해당 위치의 선반 개수
    shelfCountByLocation() {
      const map: Record<number, number> = {};
      for (const s of this.allShelves) {
        map[s.location_id] = (map[s.location_id] || 0) + 1;
      }
      return map;
    },

    // 선택된 창고의 위치만
    locations() {
      if (!this.selectedWarehouse) return [];
      return this.allLocations.filter(
        (l) => l.warehouse_id === this.selectedWarehouse.id,
      );
    },

    // 선택된 위치의 선반만
    shelves() {
      if (!this.selectedLocation) return [];
      return this.allShelves.filter(
        (s) => s.location_id === this.selectedLocation.id,
      );
    },

    filteredWarehouses() {
      const kw = this.warehouseKeyword.trim().toLowerCase();
      if (!kw) return this.warehouses;
      return this.warehouses.filter(
        (w) =>
          (w.name || "").toLowerCase().includes(kw) ||
          (w.code || "").toLowerCase().includes(kw),
      );
    },
    filteredLocations() {
      const kw = this.locationKeyword.trim().toLowerCase();
      if (!kw) return this.locations;
      return this.locations.filter(
        (l) =>
          (l.name || "").toLowerCase().includes(kw) ||
          (l.code || "").toLowerCase().includes(kw),
      );
    },
    filteredShelves() {
      const kw = this.shelfKeyword.trim().toLowerCase();
      if (!kw) return this.shelves;
      return this.shelves.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(kw) ||
          (s.code || "").toLowerCase().includes(kw),
      );
    },

    loadingWarehouses() {
      return this.loading;
    },
    loadingLocations() {
      return this.loading;
    },
    loadingShelves() {
      return this.loading;
    },
  },

  methods: {
    // 창고/위치/선반 전체 데이터를 병렬로 로드한다
    async loadAll() {
      this.loading = true;
      try {
        const [wRes, lRes, sRes] = await Promise.all([
          api.post("/api/warehouse/list", {}),
          api.post("/api/location/list", {}),
          api.post("/api/shelf/list", {}),
        ]);
        this.warehouses = Array.isArray(wRes.data) ? wRes.data : [];
        this.allLocations = Array.isArray(lRes.data) ? lRes.data : [];
        this.allShelves = Array.isArray(sRes.data) ? sRes.data : [];
      } catch {
        this.warehouses = [];
        this.allLocations = [];
        this.allShelves = [];
      } finally {
        this.loading = false;
      }
    },

    onWarehouseSelect(w: any) {
      if (this.selectedWarehouse?.id === w.id) return;
      this.selectedWarehouse = w;
      this.selectedLocation = null;
      this.selectedShelf = null;
      this.locationKeyword = "";
      this.shelfKeyword = "";
    },

    onLocationSelect(l: any) {
      if (this.selectedLocation?.id === l.id) return;
      this.selectedLocation = l;
      this.selectedShelf = null;
      this.shelfKeyword = "";
    },

    onShelfSelect(s: any) {
      this.selectedShelf = s;
    },

    confirm() {
      if (!this.selectedShelf) return;
      if (typeof this.onConfirm === "function") {
        this.onConfirm({
          shelf_id: this.selectedShelf.id,
          shelf: this.selectedShelf,
          location: this.selectedLocation,
          warehouse: this.selectedWarehouse,
        });
      }
      this.modal.closeModal();
    },
  },

  mounted() {
    this.loadAll();
  },
};
</script>
