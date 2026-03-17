<template>
  <div class="p-6 flex gap-6">
    <!-- 좌측 패널 -->
    <div class="w-1/6">
      <div class="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <h3 class="font-semibold text-gray-700">레이아웃 설정</h3>

        <div class="space-y-2">
          <button
            @click="save"
            class="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            저장
          </button>

          <button
            @click="add"
            class="w-full bg-green-500 text-white py-2 rounded-lg"
          >
            창고 추가
          </button>
        </div>
      </div>

      <div class="bg-white border rounded-xl shadow-sm p-4 space-y-4 mt-5">
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
                  ? 'bg-blue-50 border-blue-300 shadow-sm'
                  : 'bg-gray-50 border-transparent hover:bg-gray-100',
              ]"
            >
              <!-- left -->
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 text-gray-600"
                >
                  <i class="fa-solid fa-boxes-stacked text-sm"></i>
                </div>

                <div>
                  <div class="text-sm font-medium text-gray-700">
                    {{ rack.name }}
                    <button @click.stop="deleteData(rack)">
                      <i class="fa-solid fa-trash text-sm text-red-500"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- right -->
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

    <!-- 레이아웃 카드 -->
    <div class="w-1/2">
      <div class="bg-white border rounded-xl shadow-sm p-4">
        <h3 class="font-semibold text-gray-700 mb-4">창고 레이아웃 관리</h3>

        <!-- grid wrapper -->
        <div class="border bg-gray-50 p-2">
          <div ref="grid" class="relative w-full">
            <!-- GRID -->
            <div
              class="grid gap-[2px] w-full"
              :style="{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
              }"
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
              class="absolute bg-blue-500 text-white text-xs flex items-center justify-center rounded select-none cursor-pointer"
              :style="rackStyle(rack)"
              @mousedown="startDrag($event, rack)"
              @dblclick="vueData(rack)"
            >
              {{ rack.name }}

              <div
                class="absolute right-0 bottom-0 w-3 h-3 bg-white border cursor-se-resize"
                @mousedown.stop="startResize($event, rack)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import WarehouseModal from "@/components/warehouse/WarehouseModal.vue";

export default {
  name: "WarehousePage",
  data() {
    return {
      modal: useModalStore(),
      rows: 30,
      cols: 36,

      // 창고위치 정보
      racks: [],

      gridWidth: 0,
      gridHeight: 0,

      dragging: null,
      resizing: null,
      selectedWarehouse: null,

      offsetX: 0,
      offsetY: 0,
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

  beforeUnmount() {
    window.removeEventListener("resize", this.updateGridSize);
  },

  methods: {
    vueData(data) {
      console.log(data);
      data.select = true;
    },
    // 선택 창고 정보만 출력되게 수정
    selectWarehouse(rack) {
      this.$router.push({
        path: "/warehouse/rack",
        query: { id: rack.id },
      });
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

    startDrag(e, rack) {
      this.dragging = rack;

      this.offsetX = e.offsetX;
      this.offsetY = e.offsetY;

      document.addEventListener("mousemove", this.onMove);
      document.addEventListener("mouseup", this.stopAction);
    },

    onMove(e) {
      if (!this.dragging) return;

      const rect = this.$refs.grid.getBoundingClientRect();

      const px = e.clientX - rect.left - this.offsetX;
      const py = e.clientY - rect.top - this.offsetY;

      const x = Math.round(px / this.cellWidth);
      const y = Math.round(py / this.cellHeight);

      this.dragging.x = Math.max(
        0,
        Math.min(this.cols - this.dragging.width, x),
      );

      this.dragging.y = Math.max(
        0,
        Math.min(this.rows - this.dragging.height, y),
      );
    },

    startResize(e, rack) {
      this.resizing = rack;

      document.addEventListener("mousemove", this.onResize);
      document.addEventListener("mouseup", this.stopAction);
    },

    onResize(e) {
      if (!this.resizing) return;

      const rect = this.$refs.grid.getBoundingClientRect();

      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const newWidth = Math.round(px / this.cellWidth) - this.resizing.x;

      const newHeight = Math.round(py / this.cellHeight) - this.resizing.y;

      this.resizing.width = Math.max(
        1,
        Math.min(this.cols - this.resizing.x, newWidth),
      );

      this.resizing.height = Math.max(
        1,
        Math.min(this.rows - this.resizing.y, newHeight),
      );
    },

    stopAction() {
      this.dragging = null;
      this.resizing = null;

      document.removeEventListener("mousemove", this.onMove);
      document.removeEventListener("mousemove", this.onResize);
      document.removeEventListener("mouseup", this.stopAction);
    },

    // 랙 항목 추가
    async add() {
      // 모달 열기
      this.modal.openModal(WarehouseModal, { onSaved: this.addData }, "lg");
    },

    // 리턴 항목 추가
    async addData(items) {
      this.racks.push(...items);
    },

    // 설정 저장
    async save() {
      try {
        const rows = this.racks;
        await api.post("/api/warehouse/batchSave", rows);
        this.$toast.success("레이아웃 설정 완료");
        this.loadData();
      } catch (e) {
        console.error(e);
        this.$toast.error(e.message);
      }
    },

    // 선택 창고 삭제
    async deleteData(data) {
      try {
        const id = data.id;

        const ok = await this.$confirm(
          `[${data.name}] 삭제하시겠습니까?`,
          "삭제 확인",
        );

        if (!ok) return;

        await api.post("/api/warehouse/delete", { id: data.id });
        this.$toast.success(`[${data.name}] 창고정보가 삭제되었습니다`);
        this.loadData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 로드 데이터
    async loadData() {
      const res = await api.post("/api/warehouse/list");
      this.racks = res.data;
    },
  },

  // 마운트
  mounted() {
    this.$nextTick(() => {
      this.updateGridSize();
    });

    this.loadData();

    window.addEventListener("resize", this.updateGridSize);
  },
};
</script>
