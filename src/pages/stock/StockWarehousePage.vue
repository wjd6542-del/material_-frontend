<template>
  <div class="p-6 flex gap-6">
    <!-- 좌측 창고 -->
    <div class="w-1/5">
      <div class="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <h3 class="font-semibold flex items-center gap-2">
          <i class="fa-solid fa-warehouse text-blue-500"></i>
          창고 목록
        </h3>

        <BaseInput v-model="searchText" placeholder="창고 검색" />

        <div class="border-t pt-3 space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="rack in filteredRacks"
            :key="rack.id"
            @click="selectWarehouse(rack)"
            :class="[
              'p-3 rounded-lg border cursor-pointer',
              selectedWarehouse?.id === rack.id
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100',
            ]"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium text-sm">{{ rack.name }}</span>
              <span class="text-xs bg-gray-200 px-2 rounded">
                {{ rack.width }} × {{ rack.height }}
              </span>
            </div>

            <!-- KPI -->
            <div class="flex gap-2 mt-2 text-xs">
              <div
                class="bg-blue-50 text-blue-600 px-2 py-1 rounded flex gap-1"
              >
                <i class="fa-solid fa-cubes"></i>
                {{ warehouseKpiMap[rack.id]?.totalTypes || 0 }}
              </div>

              <div
                class="bg-green-50 text-green-600 px-2 py-1 rounded flex gap-1"
              >
                <i class="fa-solid fa-box"></i>
                {{ warehouseKpiMap[rack.id]?.totalQty || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 중앙 맵 -->
    <div class="w-2/3">
      <div class="bg-white border rounded-xl shadow-sm p-4">
        <h3 class="font-semibold mb-4">창고 레이아웃</h3>

        <BaseInput
          v-model="searchMaterial"
          placeholder="자재 검색"
          class="mb-3"
        />

        <div class="border bg-gray-50 p-2">
          <div ref="grid" class="relative w-full">
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

            <!-- 창고 -->
            <div
              v-for="rack in racks"
              :key="rack.id"
              :class="[
                'absolute rounded shadow text-xs flex flex-col cursor-pointer',
                rackClass(rack),
              ]"
              :style="rackStyle(rack)"
              @click="selectWarehouse(rack)"
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
                <span v-else class="text-gray-300">재고 없음</span>
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
          <i class="fa-solid fa-warehouse text-blue-500"></i>
          창고 상세
        </h3>

        <div
          v-if="selectedWarehouse"
          class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600"
        >
          {{ selectedWarehouse.code }}
        </div>
      </div>

      <div v-if="selectedWarehouse" class="flex flex-col h-full">
        <!-- 🔥 검색 -->
        <div class="mb-3">
          <BaseInput v-model="detailSearchText" placeholder="자재 검색" />
        </div>

        <!-- 창고 정보 -->
        <div class="mb-3 p-3 rounded-lg bg-gray-50 border">
          <div class="font-semibold flex items-center gap-2">
            <i class="fa-solid fa-boxes-stacked text-gray-500"></i>
            {{ selectedWarehouse.name }}
          </div>

          <!-- KPI -->
          <div class="flex gap-3 mt-2 text-xs">
            <div
              class="bg-blue-50 text-blue-600 px-2 py-1 rounded flex gap-1 items-center"
            >
              <i class="fa-solid fa-cubes"></i>
              {{ selectedWarehouse.stocks.length }}종
            </div>

            <div
              class="bg-green-50 text-green-600 px-2 py-1 rounded flex gap-1 items-center"
            >
              <i class="fa-solid fa-box"></i>
              {{ totalQty(selectedWarehouse) }}
            </div>
          </div>
        </div>

        <!-- 리스트 -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-1">
          <div
            v-for="item in filteredWarehouseStocks"
            :key="item.id"
            class="flex items-center justify-between border rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <!-- 좌측 -->
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

            <!-- 우측 -->
            <span class="font-semibold">
              {{ item.qty }}
            </span>
          </div>

          <!-- 검색 결과 없음 -->
          <div
            v-if="filteredWarehouseStocks.length === 0"
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
        창고를 선택하세요
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import BaseInput from "@/components/base/BaseInput.vue";

export default {
  components: { BaseInput },

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

    filteredStocks() {
      if (!this.selectedWarehouse) return [];

      if (!this.detailSearchText) return this.selectedWarehouse.stocks;

      return this.selectedWarehouse.stocks.filter((s) =>
        s.material_name
          .toLowerCase()
          .includes(this.detailSearchText.toLowerCase()),
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

      if (!this.detailSearchText) return this.selectedWarehouse.stocks;

      return this.selectedWarehouse.stocks.filter((item) =>
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
      if (this.selectedWarehouse?.id === r.id)
        return "bg-blue-600 text-white ring-2 ring-green-400";

      if (this.searchMaterial) {
        if (this.matchedRackIds.includes(r.id))
          return "bg-blue-500 text-white ring-2 ring-yellow-400";
        else return "bg-gray-200 opacity-40";
      }

      if (!r.stocks?.length) return "bg-gray-200 text-gray-400";

      return "bg-blue-500 text-white";
    },

    totalQty(r) {
      return r.stocks.reduce((s, v) => s + v.qty, 0);
    },

    selectWarehouse(r) {
      this.selectedWarehouse = r;
      this.detailSearchText = "";
    },

    updateGridSize() {
      const rect = this.$refs.grid.getBoundingClientRect();
      this.gridWidth = rect.width;
      this.gridHeight = rect.height;
    },

    async loadData() {
      const res = await api.post("/api/stock/warehousStock");
      this.racks = res.data;
    },
  },

  mounted() {
    this.$nextTick(this.updateGridSize);
    this.loadData();
    window.addEventListener("resize", this.updateGridSize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateGridSize);
  },
};
</script>
