<template>
  <div class="p-6 flex gap-6 bg-gray-50 min-h-screen">
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
            class="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-900 hover:text-gray-900 text-gray-700 py-2.5 rounded-xl font-medium transition-all active:scale-95"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            새 창고 추가
          </button>
        </div>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        <div
          class="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50"
        >
          <h3 class="font-bold text-gray-800 flex items-center gap-2 text-sm">
            <i class="fa-solid fa-warehouse text-gray-900"></i>
            창고 확인
            <span class="ml-1 text-xs font-normal text-gray-400">{{
              racks.length
            }}</span>
          </h3>
        </div>

        <div
          class="p-2 overflow-y-auto max-h-[calc(100vh-350px)] custom-scrollbar"
        >
          <div
            v-if="racks.length === 0"
            class="py-12 text-center text-gray-400 text-xs"
          >
            등록된 창고가 없습니다.
          </div>

          <div class="space-y-2">
            <div
              v-for="rack in racks"
              :key="rack.id || rack.tempId"
              @click="selectWarehouse(rack)"
              :class="[
                'group relative p-3 rounded-xl border transition-all cursor-pointer',
                selectedWarehouse?.id === rack.id && rack.id
                  ? 'bg-gray-50 border-gray-900 ring-1 ring-gray-900'
                  : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md',
                !rack.id ? 'border-dashed border-gray-400 bg-gray-50/50' : '',
              ]"
            >
              <div
                v-if="selectedWarehouse?.id === rack.id"
                class="absolute left-0 top-3 bottom-3 w-1 bg-gray-900 rounded-r-full"
              ></div>

              <div class="flex flex-col gap-2">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2">
                    <div
                      :class="[
                        'w-8 h-8 flex items-center justify-center rounded-lg text-xs',
                        !rack.id
                          ? 'bg-gray-300 text-white'
                          : selectedWarehouse?.id === rack.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-500',
                      ]"
                    >
                      <i class="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <div>
                      <div
                        class="text-sm font-bold text-gray-700 truncate max-w-[120px]"
                      >
                        {{ rack.name }}
                        <span
                          v-if="!rack.id"
                          class="text-[10px] text-orange-500 ml-1 font-normal"
                          >(신규)</span
                        >
                      </div>
                    </div>
                  </div>
                  <button
                    @click.stop="deleteData(rack)"
                    class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all"
                  >
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1">
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition-all"
        :class="{ 'ring-2 ring-orange-500/20': isEditMode }"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fa-solid fa-map text-gray-900"></i>
            창고 레이아웃 관리
            <span
              v-if="isEditMode"
              class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full animate-pulse ml-2"
              >수정 중</span
            >
          </h3>
          <div class="text-xs text-gray-400 font-light">
            {{
              isEditMode
                ? "창고를 드래그하여 배치하세요."
                : "수정하려면 레이아웃 수정 버튼을 누르세요."
            }}
          </div>
        </div>

        <div
          class="border border-gray-200 bg-gray-100 rounded-xl overflow-hidden p-2"
        >
          <div ref="grid" class="relative w-full shadow-inner">
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

            <div
              v-for="rack in racks"
              :key="rack.id || rack.tempId"
              class="absolute text-white text-[11px] font-bold flex items-center justify-center rounded shadow-md select-none border transition-opacity"
              :class="[
                isEditMode
                  ? 'cursor-move z-10'
                  : 'cursor-default z-0 opacity-90',
              ]"
              :style="[rackStyle(rack), getRackColor(rack)]"
              @mousedown="isEditMode && startDrag($event, rack)"
              @dblclick="vueData(rack)"
            >
              <div class="flex flex-col items-center">
                <span class="truncate px-1">{{ rack.name }}</span>
              </div>

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
// (script 부분은 이전과 동일하며, isEditMode 상태가 필요합니다)
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
      racks: [],
      gridWidth: 0,
      gridHeight: 0,
      dragging: null,
      resizing: null,
      selectedWarehouse: null,
      offsetX: 0,
      offsetY: 0,

      isEditMode: false,
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
        return { backgroundColor: "#9ca3af", borderColor: "#6b7280" }; // 신규: 회색
      } else {
        return { backgroundColor: "#111827", borderColor: "#374151" }; // 기존: 블랙
      }
    },
    vueData(data) {
      console.log(data);
      data.select = true;
    },
    selectWarehouse(rack) {
      if (!rack.id || this.isEditMode) return;
      this.selectedWarehouse = rack;
      this.$router.push({ path: "/warehouse/rack", query: { id: rack.id } });
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
    async add() {
      this.modal.openModal(WarehouseModal, { onSaved: this.addData }, "xl");
    },
    async addData(items) {
      const newItems = items.map((item) => ({
        ...item,
        tempId: Date.now() + Math.random(),
      }));
      this.racks.push(...newItems);
      this.isEditMode = true; // 추가하면 자동으로 편집모드 활성화
    },
    async save() {
      try {
        await api.post("/api/warehouse/batchSave", this.racks);
        this.$toast.success("레이아웃 저장 완료");
        this.isEditMode = false; // 저장 후 편집모드 종료
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
      try {
        const ok = await this.$confirm(
          `[${data.name}] 삭제하시겠습니까?`,
          "삭제 확인",
        );
        if (!ok) return;
        await api.post("/api/warehouse/delete", { id: data.id });
        this.loadData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
    async loadData() {
      const res = await api.post("/api/warehouse/list");
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* [추가] 눈에 띄게 개선된 리사이즈 핸들 스타일 */
.resize-handle {
  right: -5px;
  bottom: -5px;
  width: 14px;
  height: 14px;
  background-color: white;
  border: 2.5px solid #111827; /* 검은색 테두리 */
  border-radius: 50%; /* 둥글게 */
  cursor: se-resize;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* 그림자 */
  transition: all 0.2s ease-in-out;
}

/* 호버 및 액티브 시 효과 */
.resize-handle:hover,
.resize-handle:active {
  background-color: #3b82f6; /* 파란색으로 변경 */
  border-color: #ffffff;
  box-shadow: 0 0 8px #3b82f6; /* 글로우 효과 */
  transform: scale(1.2); /* 약간 커짐 */
}
</style>
