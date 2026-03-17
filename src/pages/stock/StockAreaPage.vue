<template>
  <div class="p-6 flex gap-6">
    <!-- 좌측 -->
    <div class="w-1/6">
      <div class="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <h3 class="font-semibold text-gray-700 flex items-center gap-2">
          <i class="fa-solid fa-warehouse text-blue-500"></i>
          창고 확인
        </h3>

        <div class="border-t pt-3">
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="rack in racks"
              :key="rack.id"
              @click="selectWarehouse(rack)"
              :class="[
                'flex items-center justify-between px-3 py-3 rounded-lg transition cursor-pointer border',
                selectedWarehouse?.id === rack.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 text-gray-600"
                >
                  <i class="fa-solid fa-boxes-stacked text-sm"></i>
                </div>

                <div class="text-sm font-medium text-gray-700">
                  {{ rack.name }}
                </div>
              </div>

              <div
                class="text-xs px-2 py-1 rounded-md bg-gray-200 text-gray-600 font-medium"
              >
                {{ rack.width }} × {{ rack.height }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 레이아웃 -->
    <div class="w-1/2">
      <div class="bg-white border rounded-xl shadow-sm p-4">
        <h3 class="font-semibold text-gray-700 mb-4">창고 레이아웃</h3>

        <div class="border-t pt-3">
          <!-- 검색 -->
          <div class="flex items-center gap-2 mb-4">
            <BaseInput
              v-model="searchText"
              placeholder="자재명으로 검색하세요."
            />
          </div>

          <div class="border bg-gray-50 p-2">
            <div ref="grid" class="relative w-full">
              <!-- GRID -->
              <div
                class="grid gap-[2px] w-full"
                :style="{ gridTemplateColumns: `repeat(${cols},1fr)` }"
              >
                <div
                  v-for="cell in rows * cols"
                  :key="cell"
                  class="border bg-white aspect-square"
                />
              </div>

              <!-- RACK -->
              <div
                v-for="rack in racks"
                :key="rack.id"
                :class="rackClass(rack)"
                :style="rackStyle(rack)"
              >
                <!-- header -->
                <div
                  class="text-center font-semibold border-b border-white/20 py-[2px]"
                >
                  {{ rack.name }}
                </div>

                <!-- stock -->
                <div
                  class="flex-1 overflow-y-auto p-1 space-y-[3px] text-[10px]"
                >
                  <div
                    v-for="stock in rack.stocks"
                    :key="stock.id"
                    class="flex justify-between items-center rounded px-1 bg-white/20"
                  >
                    <span
                      :class="[
                        'truncate px-1 rounded',
                        highlightStock(stock)
                          ? 'bg-yellow-300 text-black font-semibold'
                          : '',
                      ]"
                    >
                      {{ stock.material_name }}
                    </span>

                    <span class="font-semibold">
                      {{ stock.qty }}
                    </span>
                  </div>

                  <div
                    v-if="!rack.stocks || rack.stocks.length === 0"
                    class="text-center text-[10px] opacity-60"
                  >
                    재고 없음
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import BaseInput from "@/components/base/BaseInput.vue";
export default {
  name: "StockAreaPage",
  components: { BaseInput },
  data() {
    return {
      rows: 30,
      cols: 36,

      racks: [],
      selectedWarehouse: null,

      gridWidth: 0,
      gridHeight: 0,

      searchText: "",
    };
  },

  computed: {
    cellWidth() {
      return this.gridWidth / this.cols;
    },

    cellHeight() {
      return this.gridHeight / this.rows;
    },
  },

  methods: {
    rackClass(rack) {
      if (this.selectedWarehouse?.id === rack.id)
        return "absolute rounded text-xs flex flex-col shadow bg-blue-500 text-white ring-2 ring-green-400";

      if (this.rackHasSearchResult(rack))
        return "absolute rounded text-xs flex flex-col shadow bg-blue-500 text-white ring-2 ring-yellow-400";

      return rack.stocks?.length
        ? "absolute rounded text-xs flex flex-col shadow bg-blue-500 text-white"
        : "absolute rounded text-xs flex flex-col shadow bg-gray-300 text-gray-700";
    },

    highlightStock(stock) {
      if (!this.searchText) return false;

      return stock.material_name
        .toLowerCase()
        .includes(this.searchText.toLowerCase());
    },

    rackHasSearchResult(rack) {
      if (!this.searchText) return false;

      return rack.stocks.some((stock) =>
        stock.material_name
          .toLowerCase()
          .includes(this.searchText.toLowerCase()),
      );
    },

    selectWarehouse(rack) {
      this.selectedWarehouse = rack;
    },

    updateGridSize() {
      const rect = this.$refs.grid.getBoundingClientRect();

      this.gridWidth = rect.width;
      this.gridHeight = rect.height;
    },

    rackStyle(rack) {
      return {
        left: rack.x * this.cellWidth + "px",
        top: rack.y * this.cellHeight + "px",

        width: rack.width * this.cellWidth + "px",
        height: rack.height * this.cellHeight + "px",
      };
    },

    async loadData() {
      const res = await api.post("/api/warehouse/materialList");

      this.racks = res.data;
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
