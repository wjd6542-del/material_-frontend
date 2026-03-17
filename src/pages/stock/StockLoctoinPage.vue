<template>
  <div class="p-6 flex gap-6">
    <!-- 좌측 창고 -->
    <div class="w-1/6">
      <div class="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <h3 class="font-semibold text-gray-700 flex items-center gap-2">
          <i class="fa-solid fa-warehouse text-blue-500"></i>
          창고 확인
        </h3>

        <div class="border-t pt-3">
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="wh in warehouses"
              :key="wh.id"
              @click="selectWarehouse(wh)"
              :class="[
                'flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer border',
                selectedWarehouse?.id === wh.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 flex items-center justify-center rounded bg-gray-200"
                >
                  <i class="fa-solid fa-boxes-stacked text-sm"></i>
                </div>
                <div class="text-sm font-medium">
                  {{ wh.name }}
                </div>
              </div>

              <div class="text-xs bg-gray-200 px-2 py-1 rounded">
                {{ wh.width }} × {{ wh.height }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 중앙 + 우측 -->
    <div class="flex-1 flex gap-4">
      <!-- 맵 -->
      <div class="w-2/3">
        <div class="bg-white border rounded-xl shadow-sm p-4">
          <h3 class="font-semibold mb-4">선반 레이아웃</h3>

          <!-- 🔥 상단 검색 -->
          <div class="mb-3">
            <BaseInput
              v-model="searchText"
              placeholder="자재 검색 (선반 자동 찾기)"
            />
          </div>

          <div class="border bg-gray-50 p-2">
            <div ref="grid" class="relative w-full">
              <!-- GRID -->
              <div
                class="grid gap-[2px]"
                :style="{ gridTemplateColumns: `repeat(${cols},1fr)` }"
              >
                <div
                  v-for="n in rows * cols"
                  :key="n"
                  class="border bg-white aspect-square"
                />
              </div>

              <!-- 선반 -->
              <div
                v-for="rack in racks"
                :key="rack.id"
                :data-rack-id="rack.id"
                :class="[
                  'group absolute rounded shadow text-xs flex flex-col cursor-pointer transition-all',
                  rackClass(rack),
                ]"
                :style="rackStyle(rack)"
                @click="selectRack(rack)"
              >
                <div class="text-center font-semibold border-b py-[2px]">
                  {{ rack.name }}
                </div>

                <div class="text-center text-[10px]">
                  {{ rack.stocks.length }}종
                </div>

                <div class="text-center text-[10px] font-semibold">
                  <span v-if="totalQty(rack) > 0">
                    {{ totalQty(rack) }}
                  </span>
                  <span v-else class="text-gray-300"> 재고 없음 </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 상세 -->
      <div class="w-1/3 bg-white border rounded-xl shadow-sm p-4 flex flex-col">
        <!-- header -->
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-700 flex items-center gap-2">
            <i class="fa-solid fa-layer-group text-blue-500"></i>
            선반 상세
          </h3>

          <div
            v-if="selectedRack"
            class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600"
          >
            {{ selectedRack.code }}
          </div>
        </div>

        <div v-if="selectedRack" class="flex flex-col h-full">
          <!-- 검색 -->
          <div class="mb-3">
            <BaseInput v-model="detailSearchText" placeholder="자재 검색" />
          </div>

          <!-- 선반 정보 -->
          <div class="mb-3 p-3 rounded-lg bg-gray-50 border">
            <div class="font-semibold flex items-center gap-2">
              <i class="fa-solid fa-boxes-stacked text-gray-500"></i>
              {{ selectedRack.name }}
            </div>

            <div class="flex gap-3 mt-2 text-xs">
              <div
                class="bg-blue-50 text-blue-600 px-2 py-1 rounded flex gap-1 items-center"
              >
                <i class="fa-solid fa-cubes"></i>
                {{ selectedRack.stocks.length }}종
              </div>

              <div
                class="bg-green-50 text-green-600 px-2 py-1 rounded flex gap-1 items-center"
              >
                <i class="fa-solid fa-box"></i>
                {{ totalQty(selectedRack) }}
              </div>
            </div>
          </div>

          <!-- 리스트 -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="item in filteredStocks"
              :key="item.id"
              class="flex items-center justify-between border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-7 h-7 flex items-center justify-center rounded bg-blue-100 text-blue-600"
                >
                  <i class="fa-solid fa-box"></i>
                </div>

                <span class="truncate max-w-[140px]">
                  {{ item.material_name }}
                </span>
              </div>

              <span class="font-semibold">
                {{ item.qty }}
              </span>
            </div>

            <!-- 검색 결과 없음 -->
            <div
              v-if="filteredStocks.length === 0"
              class="text-center text-gray-400 py-10 flex flex-col items-center gap-2"
            >
              <i class="fa-solid fa-magnifying-glass"></i>
              검색 결과 없음
            </div>
          </div>
        </div>

        <!-- 선택 없음 -->
        <div
          v-else
          class="flex flex-col items-center justify-center flex-1 text-gray-400 gap-2"
        >
          <i class="fa-regular fa-hand-pointer text-2xl"></i>
          선반을 선택하세요
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import BaseInput from "@/components/base/BaseInput.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
export default {
  components: { BaseInput, SearchSelect },

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

      where: {
        warehouse_id: "",
      },
    };
  },

  computed: {
    cellWidth() {
      return this.gridWidth / this.cols;
    },
    cellHeight() {
      return this.gridHeight / this.rows;
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
    rackStyle(rack) {
      return {
        left: rack.x * this.cellWidth + "px",
        top: rack.y * this.cellHeight + "px",
        width: rack.width * this.cellWidth + "px",
        height: rack.height * this.cellHeight + "px",
      };
    },

    rackClass(rack) {
      if (this.selectedRack?.id === rack.id)
        return "bg-blue-600 text-white ring-2 ring-green-400";

      if (this.searchText) {
        if (this.matchedRackIds.includes(rack.id)) {
          return "bg-blue-500 text-white ring-2 ring-yellow-400";
        } else {
          return "bg-gray-200 text-gray-300 opacity-40";
        }
      }

      if (!rack.stocks?.length) return "bg-gray-200 text-gray-400";

      return "bg-blue-500 text-white";
    },

    totalQty(rack) {
      return rack.stocks.reduce((sum, v) => sum + v.qty, 0);
    },

    selectWarehouse(wh) {
      this.selectedWarehouse = wh;
      this.where.warehouse_id = wh.id;
      this.loadData();
    },

    selectRack(rack) {
      this.selectedRack = rack;
      this.detailSearchText = "";
    },

    scrollToRack(rack) {
      this.$nextTick(() => {
        const el = document.querySelector(`[data-rack-id="${rack.id}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    },

    updateGridSize() {
      const rect = this.$refs.grid.getBoundingClientRect();
      this.gridWidth = rect.width;
      this.gridHeight = rect.height;
    },

    async loadData() {
      const res = await api.post("/api/stock/locationStock", this.where);
      this.racks = res.data;
    },

    async loadWarehouses() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },
  },

  mounted() {
    this.$nextTick(this.updateGridSize);
    this.loadWarehouses();
    this.loadMaterial();
    window.addEventListener("resize", this.updateGridSize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateGridSize);
  },
};
</script>
