<template>
  <div class="p-6 flex gap-6 bg-gray-50 min-h-screen">
    <!-- 좌측 패널 (기존 창고 관리 UI와 동일) -->
    <div class="w-1/4 max-w-[320px] flex flex-col gap-5">
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3"
      >
        <h3
          class="font-bold text-gray-800 text-sm px-1 flex items-center gap-2"
        >
          <i class="fa-solid fa-sliders text-gray-900"></i>
          레이아웃 설정
        </h3>

        <div class="grid grid-cols-1 gap-2">
          <button
            @click="isEditMode = !isEditMode"
            :class="[
              'flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95 border',
              isEditMode
                ? 'bg-orange-500 border-orange-600 text-white hover:bg-orange-600'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
            ]"
          >
            <i
              :class="[
                'fa-solid',
                isEditMode ? 'fa-lock-open' : 'fa-pen-to-square',
              ]"
            ></i>
            {{ isEditMode ? "편집 종료 (잠금)" : "레이아웃 수정" }}
          </button>

          <button
            @click="save"
            class="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
          >
            <i class="fa-solid fa-floppy-disk text-xs"></i>
            설정 저장
          </button>

          <button
            @click="add"
            class="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-900 hover:text-gray-900 text-gray-700 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
            :disabled="!selectedWarehouse_id"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            선반 추가
          </button>
        </div>
      </div>

      <!-- 창고 선택 및 선반 리스트 (스크롤 제거 적용) -->
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        <div
          class="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50"
        >
          <h3 class="font-bold text-gray-800 flex items-center gap-2 text-sm">
            <i class="fa-solid fa-warehouse text-gray-900"></i>
            창고 선택
          </h3>
        </div>

        <!-- 창고 목록 (스크롤 제거를 위해 max-h 삭제) -->
        <div class="p-2">
          <div class="space-y-2">
            <div
              v-for="wh in warehouses"
              :key="wh.id"
              @click="selectWarehouse(wh)"
              :class="[
                'group relative p-3 rounded-xl border transition-all cursor-pointer',
                selectedWarehouse_id == wh.id
                  ? 'bg-gray-50 border-gray-900 ring-1 ring-gray-900'
                  : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md',
              ]"
            >
              <div
                v-if="selectedWarehouse_id == wh.id"
                class="absolute left-0 top-3 bottom-3 w-1 bg-gray-900 rounded-r-full"
              ></div>
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-8 h-8 flex items-center justify-center rounded-lg text-xs',
                    selectedWarehouse_id == wh.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500',
                  ]"
                >
                  <i class="fa-solid fa-boxes-stacked"></i>
                </div>
                <div class="text-sm font-bold text-gray-700">{{ wh.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 선반 리스트 (클릭 시 강조 기능 추가) -->
        <div
          v-if="selectedWarehouse_id"
          class="p-4 border-t border-gray-100 bg-gray-50/30"
        >
          <h4 class="text-[11px] font-bold text-gray-400 uppercase mb-3 px-1">
            선반 랙 리스트
          </h4>
          <div class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            <div
              v-for="rack in racks"
              :key="rack.id || rack.tempId"
              @click="focusRack(rack.id || rack.tempId)"
              :class="[
                'flex justify-between items-center px-3 py-2.5 bg-white border rounded-xl transition-all cursor-pointer',
                focusedRackId === (rack.id || rack.tempId)
                  ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50'
                  : 'border-gray-100 hover:shadow-sm',
              ]"
            >
              <div class="flex items-center gap-2">
                <button
                  @click.stop="deleteData(rack)"
                  class="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                >
                  <i class="fa-solid fa-trash-can text-[10px]"></i>
                </button>
                <span class="text-sm font-bold text-gray-700">
                  {{ rack.code }}
                  <span
                    v-if="!rack.id"
                    class="text-[10px] text-orange-500 ml-1 font-normal"
                    >(신규)</span
                  >
                </span>
              </div>
              <span
                class="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded border"
                >{{ rack.width }}x{{ rack.height }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 우측 레이아웃 영역 (기존 소스 UI 반영) -->
    <div class="flex-1">
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition-all"
        :class="{ 'ring-2 ring-orange-500/20': isEditMode }"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fa-solid fa-map text-gray-900"></i>
            선반 레이아웃 관리
            <span
              v-if="isEditMode"
              class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full animate-pulse ml-2"
              >수정 중</span
            >
          </h3>
          <div class="text-xs text-gray-400 font-light">
            {{
              isEditMode
                ? "선반을 드래그하거나 크기를 조절하세요."
                : "수정하려면 레이아웃 수정 버튼을 누르세요."
            }}
          </div>
        </div>

        <div
          class="border border-gray-200 bg-gray-100 rounded-xl overflow-hidden p-2"
        >
          <div
            ref="grid"
            class="relative w-full shadow-inner"
            @click="focusedRackId = null"
          >
            <!-- 격자 배경 (기존 소스 스타일) -->
            <div
              class="grid gap-[1px] w-full"
              :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
            >
              <div
                v-for="cell in rows * cols"
                :key="cell"
                :class="[
                  'border-[0.5px] aspect-square transition-colors',
                  isEditMode
                    ? 'border-gray-300 bg-white/80'
                    : 'border-gray-200 bg-white',
                ]"
              />
            </div>

            <!-- Racks (기존 소스 디자인 + 클릭 강조) -->
            <div
              v-for="rack in racks"
              :key="rack.id || rack.tempId"
              class="absolute text-white text-[11px] font-bold flex items-center justify-center rounded shadow-md select-none border transition-all"
              :class="[
                isEditMode
                  ? 'cursor-move z-10'
                  : 'cursor-default z-0 opacity-90',
                focusedRackId === (rack.id || rack.tempId)
                  ? 'ring-[4px] ring-yellow-400 ring-offset-1 z-50'
                  : '',
              ]"
              :style="[rackStyle(rack), getRackColor(rack)]"
              @mousedown="isEditMode && startDrag($event, rack)"
              @click.stop="focusRack(rack.id || rack.tempId)"
            >
              <div class="flex flex-col items-center">
                <span class="truncate px-1">{{ rack.code }}</span>
              </div>

              <!-- 리사이즈 핸들 (기존 소스 스타일 100% 동일) -->
              <div
                v-if="isEditMode"
                class="resize-handle absolute z-30"
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
import LocationModal from "@/components/warehouse/LocationModal.vue";

export default {
  name: "WarehouseRackPage",
  data() {
    return {
      modal: useModalStore(),
      rows: 30,
      cols: 36,
      isEditMode: false,
      focusedRackId: null,
      racks: [],
      warehouses: [],
      gridWidth: 0,
      gridHeight: 0,
      dragging: null,
      resizing: null,
      selectedWarehouse_id: null,
      offsetX: 0,
      offsetY: 0,
      where: { warehouse_id: "" },
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
    getRackColor(rack) {
      if (!rack.id) {
        return { backgroundColor: "#9ca3af", borderColor: "#6b7280" }; // 신규: 회색 (기존 소스 동일)
      } else {
        return { backgroundColor: "#111827", borderColor: "#374151" }; // 기존: 블랙 (기존 소스 동일)
      }
    },
    focusRack(id) {
      this.focusedRackId = id;
    },
    selectWarehouse(wh) {
      this.selectedWarehouse_id = wh.id;
      this.where.warehouse_id = wh.id;
      this.focusedRackId = null;
      this.loadData();
    },
    updateGridSize() {
      if (this.$refs.grid) {
        const rect = this.$refs.grid.getBoundingClientRect();
        this.gridWidth = rect.width;
        this.gridHeight = rect.height;
      }
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
      this.focusRack(rack.id || rack.tempId);
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
      this.dragging.x = Math.max(
        0,
        Math.min(
          this.cols - this.dragging.width,
          Math.round(px / this.cellWidth),
        ),
      );
      this.dragging.y = Math.max(
        0,
        Math.min(
          this.rows - this.dragging.height,
          Math.round(py / this.cellHeight),
        ),
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
      this.resizing.width = Math.max(
        1,
        Math.min(
          this.cols - this.resizing.x,
          Math.round(px / this.cellWidth) - this.resizing.x,
        ),
      );
      this.resizing.height = Math.max(
        1,
        Math.min(
          this.rows - this.resizing.y,
          Math.round(py / this.cellHeight) - this.resizing.y,
        ),
      );
    },
    stopAction() {
      this.dragging = null;
      this.resizing = null;
      document.removeEventListener("mousemove", this.onMove);
      document.removeEventListener("mousemove", this.onResize);
      document.removeEventListener("mouseup", this.stopAction);
    },
    async add() {
      if (!this.selectedWarehouse_id) return;
      this.modal.openModal(
        LocationModal,
        { warehouse_id: this.where.warehouse_id, onSaved: this.addData },
        "xl",
      );
    },
    addData(items) {
      const newItems = items.map((item) => ({
        ...item,
        tempId: Date.now() + Math.random(),
      }));
      this.racks.push(...newItems);
      this.isEditMode = true;
    },
    async save() {
      try {
        await api.post("/api/location/batchSave", this.racks);
        this.$toast.success("레이아웃 저장 완료");
        this.isEditMode = false;
        this.loadData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
    async deleteData(data) {
      if (!data.id) {
        this.racks = this.racks.filter((r) => r !== data);
        return;
      }
      const ok = await this.$confirm(
        `[${data.code}] 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;
      try {
        await api.post("/api/location/delete", { id: data.id });
        this.loadData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
    async loadData() {
      const res = await api.post("/api/location/list", this.where);
      this.racks = res.data;
    },
    async loadWarehouses() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updateGridSize();
    });
    const id = this.$route.query.id;
    if (id) {
      this.selectedWarehouse_id = id;
      this.where.warehouse_id = id;
      this.loadData();
    }
    this.loadWarehouses();
    window.addEventListener("resize", this.updateGridSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateGridSize);
  },
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* 리사이즈 핸들 스타일 (기존 소스 100% 동일) */
.resize-handle {
  right: -5px;
  bottom: -5px;
  width: 14px;
  height: 14px;
  background-color: white;
  border: 2.5px solid #111827;
  border-radius: 50%;
  cursor: se-resize;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease-in-out;
}
.resize-handle:hover,
.resize-handle:active {
  background-color: #3b82f6;
  border-color: #ffffff;
  box-shadow: 0 0 8px #3b82f6;
  transform: scale(1.2);
}

/* 강조 애니메이션 */
.ring-yellow-400 {
  animation: focus-ring-anim 1.5s ease-in-out infinite;
}
@keyframes focus-ring-anim {
  0% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.8);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(250, 204, 21, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
  }
}
</style>
