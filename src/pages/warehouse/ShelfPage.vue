<template>
  <div
    class="flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)] bg-slate-50 font-sans text-slate-900 select-none"
  >
    <!-- 좌측 사이드바 -->
    <div
      class="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 lg:overflow-y-auto"
    >
      <!-- 헤더 -->
      <div class="p-6 border-b border-slate-100">
        <h2
          class="text-xl font-black tracking-tight text-slate-800 flex items-center gap-2"
        >
          <i class="fa-solid fa-layer-group text-indigo-600"></i>
          선반 관리
        </h2>
      </div>

      <!-- 창고 선택 -->
      <div class="p-4 border-b border-slate-100">
        <label
          class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
        >
          <i class="fa-solid fa-warehouse me-1"></i>
          창고 선택
        </label>
        <div class="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
          <div
            v-for="wh in warehouses"
            :key="wh.id"
            @click="selectWarehouse(wh)"
            :class="[
              'group relative px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2',
              selectedWarehouse_id == wh.id
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
            ]"
          >
            <i class="fa-solid fa-warehouse text-xs"></i>
            <span class="text-sm font-bold">{{ wh.name }}</span>
          </div>
        </div>
      </div>

      <!-- 위치 선택 -->
      <div v-if="selectedWarehouse_id" class="p-4 border-b border-slate-100">
        <label
          class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
        >
          <i class="fa-solid fa-location-dot me-1"></i>
          위치 선택
        </label>
        <div
          v-if="locations.length === 0"
          class="text-xs text-slate-400 text-center py-3"
        >
          등록된 위치가 없습니다.
        </div>
        <div class="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
          <div
            v-for="loc in locations"
            :key="loc.id"
            @click="selectLocation(loc)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer',
              selectedLocation_id == loc.id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
            ]"
          >
            <i class="fa-solid fa-location-dot text-xs"></i>
            <span class="text-sm font-bold">{{ loc.name || loc.code }}</span>
            <span
              :class="[
                'ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border',
                selectedLocation_id == loc.id
                  ? 'bg-indigo-500 border-indigo-400 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-400',
              ]"
              >{{ loc.code }}</span
            >
          </div>
        </div>
      </div>

      <!-- 버튼 영역 -->
      <div class="p-4 space-y-2">
        <button
          @click="isEditMode = !isEditMode"
          :disabled="!selectedLocation_id"
          :class="[
            'w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 text-sm',
            isEditMode
              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
            !selectedLocation_id ? 'opacity-40 cursor-not-allowed' : '',
          ]"
        >
          <i
            :class="[
              'fa-solid text-xs',
              isEditMode ? 'fa-lock-open' : 'fa-pen-to-square',
            ]"
          ></i>
          {{ isEditMode ? "편집 종료 (잠금)" : "레이아웃 수정" }}
        </button>
        <button
          @click="addRack"
          :disabled="!selectedLocation_id"
          :class="[
            'w-full py-3 px-4 rounded-xl font-bold shadow-md transition-transform active:scale-95 text-sm text-white',
            selectedLocation_id
              ? 'bg-slate-900 hover:bg-slate-800'
              : 'bg-slate-400 cursor-not-allowed',
          ]"
        >
          + 선반 추가
        </button>
      </div>

      <!-- 저장 버튼 -->
      <div class="p-4 border-t border-slate-100">
        <button
          @click="save"
          :disabled="isSaving || !selectedLocation_id"
          class="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {{ isSaving ? "저장 중..." : "💾 저장" }}
        </button>
      </div>

      <!-- 선택된 선반 속성 편집 / 선반 리스트 -->
      <div
        class="flex-1 overflow-y-auto p-5 bg-slate-50/50 border-t border-slate-100"
      >
        <!-- 선반 선택 시: 속성 편집 패널 -->
        <div v-if="focusedRack" class="space-y-4">
          <div
            class="flex items-center justify-between border-b border-slate-200 pb-3"
          >
            <h3
              class="font-black text-slate-700 text-xs flex items-center gap-1.5"
            >
              <i class="fa-solid fa-sliders text-indigo-500"></i>
              선반 속성
            </h3>
            <span
              class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono"
              >{{ focusedRack.id ? `ID: ${focusedRack.id}` : "신규" }}</span
            >
          </div>

          <div class="space-y-4 pt-2">
            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
              >
                <i class="fa-solid fa-hashtag me-1"></i>
                선반 코드
              </label>
              <input
                v-model="focusedRack.code"
                type="text"
                class="edit-input font-mono"
                placeholder="SHELF-01"
              />
            </div>

            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
              >
                <i class="fa-solid fa-tag me-1"></i>
                선반 이름
              </label>
              <input
                v-model="focusedRack.name"
                type="text"
                class="edit-input"
                placeholder="선반 이름 (선택)"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label
                  class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
                >
                  <i class="fa-solid fa-arrows-left-right me-1"></i>
                  너비
                </label>
                <input
                  v-model.number="focusedRack.width"
                  type="number"
                  min="1"
                  class="edit-input text-center"
                />
              </div>
              <div>
                <label
                  class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
                >
                  <i class="fa-solid fa-arrows-up-down me-1"></i>
                  높이
                </label>
                <input
                  v-model.number="focusedRack.height"
                  type="number"
                  min="1"
                  class="edit-input text-center"
                />
              </div>
            </div>
          </div>

          <button
            @click="deleteData(focusedRack)"
            class="w-full py-3 mt-4 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            삭제 처리
          </button>
        </div>

        <!-- 선반 미선택 시: 선반 리스트 -->
        <div v-else>
          <div
            v-if="!selectedLocation_id"
            class="h-full flex flex-col items-center justify-center text-center opacity-30 pt-10"
          >
            <p
              class="text-xs font-bold text-slate-500 uppercase tracking-tighter"
            >
              창고와 위치를 먼저 선택하세요
            </p>
          </div>

          <div
            v-else-if="racks.length === 0"
            class="text-center opacity-30 pt-10"
          >
            <p
              class="text-xs font-bold text-slate-500 uppercase tracking-tighter"
            >
              선반 추가 버튼으로 시작하세요
            </p>
          </div>

          <div v-else class="space-y-2">
            <h3 class="font-black text-slate-500 text-[10px] uppercase mb-3">
              선반 리스트 ({{ racks.length }})
            </h3>
            <div
              v-for="rack in racks"
              :key="rack.id || rack.tempId"
              @click="focusRack(rack.id || rack.tempId)"
              :class="[
                'flex justify-between items-center px-3 py-2.5 bg-white border rounded-xl transition-all cursor-pointer',
                focusedRackId === (rack.id || rack.tempId)
                  ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50'
                  : 'border-slate-100 hover:shadow-sm',
              ]"
            >
              <div class="flex items-center gap-2">
                <i
                  class="fa-solid fa-border-all text-[10px] text-slate-400"
                ></i>
                <span class="text-sm font-bold text-slate-700">
                  {{ rack.name || "(코드 없음)" }}
                  <span
                    v-if="!rack.id"
                    class="text-[10px] text-orange-500 ml-1 font-normal"
                    >(신규)</span
                  >
                </span>
              </div>
              <span
                class="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border"
                >{{ rack.width }}×{{ rack.height }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 우측 레이아웃 영역 -->
    <div class="flex-1 relative bg-slate-200 p-4">
      <div
        class="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col"
      >
        <!-- 헤더 바 -->
        <div
          class="flex items-center justify-between px-6 py-3 border-b border-slate-100"
        >
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-map text-slate-500"></i>
            <span class="font-bold text-slate-700 text-sm">
              선반 레이아웃
            </span>
            <span
              v-if="selectedLocationName"
              class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
              >{{ selectedLocationName }}</span
            >
            <span
              v-if="isEditMode"
              class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full animate-pulse"
              >수정 중</span
            >
          </div>
          <div class="text-xs text-slate-400">
            {{
              !selectedLocation_id
                ? "좌측에서 창고와 위치를 선택하세요."
                : isEditMode
                  ? "선반을 드래그하거나 크기를 조절하세요."
                  : "수정하려면 레이아웃 수정 버튼을 누르세요."
            }}
          </div>
        </div>

        <!-- 위치 미선택 안내 -->
        <div
          v-if="!selectedLocation_id"
          class="flex-1 flex items-center justify-center"
        >
          <p class="text-slate-400 font-bold text-sm">
            위치를 선택하면 선반 레이아웃을 편집할 수 있습니다.
          </p>
        </div>

        <!-- 그리드 -->
        <div v-else class="flex-1 overflow-hidden p-3">
          <div
            class="border border-slate-200 bg-slate-100 rounded-xl overflow-hidden p-1.5 h-full"
          >
            <div
              ref="grid"
              class="relative w-full h-full shadow-inner"
              @click="focusedRackId = null"
            >
              <!-- 격자 배경 -->
              <div
                class="grid gap-[1px] w-full h-full"
                :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
              >
                <div
                  v-for="cell in rows * cols"
                  :key="cell"
                  :class="[
                    'border-[0.5px] transition-colors',
                    isEditMode
                      ? 'border-slate-300 bg-white/80'
                      : 'border-slate-200 bg-white',
                  ]"
                />
              </div>

              <!-- 선반 블록 -->
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
                  <span class="truncate px-1">{{ rack.name }}</span>
                </div>

                <!-- 리사이즈 핸들 -->
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
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  name: "ShelfPage",
  data() {
    return {
      rows: 30,
      cols: 36,
      isEditMode: false,
      isSaving: false,
      focusedRackId: null,
      racks: [],
      warehouses: [],
      locations: [],
      gridWidth: 0,
      gridHeight: 0,
      dragging: null,
      resizing: null,
      selectedWarehouse_id: null,
      selectedLocation_id: null,
      selectedLocationName: "",
      selectedLocation: {},
      offsetX: 0,
      offsetY: 0,
    };
  },
  computed: {
    // 한 셀의 픽셀 너비를 계산한다
    cellWidth() {
      return this.gridWidth / this.cols;
    },
    // 한 셀의 픽셀 높이를 계산한다
    cellHeight() {
      return this.gridHeight / this.rows;
    },
    // 현재 포커스된 선반 객체를 반환한다
    focusedRack() {
      if (!this.focusedRackId) return null;
      return (
        this.racks.find((r) => (r.id || r.tempId) === this.focusedRackId) ||
        null
      );
    },
  },
  methods: {
    // 선반 저장 여부에 따른 배경/테두리 색상을 반환한다
    getRackColor(rack) {
      if (!rack.id) {
        return { backgroundColor: "#9ca3af", borderColor: "#6b7280" };
      }
      return { backgroundColor: "#111827", borderColor: "#374151" };
    },
    // 지정 선반에 포커스를 설정한다
    focusRack(id) {
      this.focusedRackId = id;
    },
    // 창고 선택 시 관련 상태 초기화 및 위치 목록을 로드한다
    selectWarehouse(wh) {
      this.selectedWarehouse_id = wh.id;
      this.selectedLocation_id = null;
      this.selectedLocationName = "";
      this.racks = [];
      this.focusedRackId = null;
      this.loadLocations();
    },
    // 위치 선택 시 선반 데이터를 로드하고 그리드 크기를 갱신한다
    selectLocation(loc) {
      this.selectedLocation_id = loc.id;
      this.selectedLocationName = loc.name || loc.code;
      this.selectedLocation = loc;
      this.focusedRackId = null;
      this.loadData();
      this.$nextTick(() => this.updateGridSize());
    },
    // 그리드 컨테이너의 실제 픽셀 크기를 갱신한다
    updateGridSize() {
      if (this.$refs.grid) {
        const rect = this.$refs.grid.getBoundingClientRect();
        this.gridWidth = rect.width;
        this.gridHeight = rect.height;
      }
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
    // 신규 선반을 리스트에 추가하고 편집 모드를 켠다
    addRack() {
      if (!this.selectedLocation_id) return;
      const newRack = {
        tempId: Date.now() + Math.random(),
        id: null,
        location_id: this.selectedLocation_id,
        code: `${this.selectedLocation.code}-S-${this.racks.length + 1}`,
        name: `${this.selectedLocation.name}-${this.racks.length + 1}-선반`,
        x: 15,
        y: 12,
        width: 4,
        height: 3,
        sort: this.racks.length,
      };
      this.racks.push(newRack);
      this.focusedRackId = newRack.tempId;
      this.isEditMode = true;
    },
    // 선반 드래그 시작 (이동 준비)
    startDrag(e, rack) {
      this.focusRack(rack.id || rack.tempId);
      this.dragging = rack;
      this.offsetX = e.offsetX;
      this.offsetY = e.offsetY;
      document.addEventListener("mousemove", this.onMove);
      document.addEventListener("mouseup", this.stopAction);
    },
    // 드래그 중 마우스 이동에 맞춰 선반 위치를 갱신한다
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
    // 선반 리사이즈 시작
    startResize(e, rack) {
      this.resizing = rack;
      document.addEventListener("mousemove", this.onResize);
      document.addEventListener("mouseup", this.stopAction);
    },
    // 리사이즈 중 마우스 이동에 맞춰 선반 크기를 갱신한다
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
    // 드래그/리사이즈 종료 및 이벤트 리스너를 제거한다
    stopAction() {
      this.dragging = null;
      this.resizing = null;
      document.removeEventListener("mousemove", this.onMove);
      document.removeEventListener("mousemove", this.onResize);
      document.removeEventListener("mouseup", this.stopAction);
    },
    // 현재 선반 배치 전체를 서버에 일괄 저장한다
    async save() {
      if (!this.selectedLocation_id) return;
      this.isSaving = true;
      try {
        await api.post("/api/shelf/batchSave", this.racks);
        this.$toast.success("레이아웃 저장 완료");
        this.isEditMode = false;
        this.loadData();
      } catch (e) {
        this.$toast.error(e.message);
      } finally {
        this.isSaving = false;
      }
    },
    // 지정 선반을 삭제한다 (신규면 로컬만, 기존이면 서버 호출)
    async deleteData(rack) {
      if (!rack.id) {
        this.racks = this.racks.filter((r) => r !== rack);
        this.focusedRackId = null;
        return;
      }
      const ok = await this.$confirm(
        `[${rack.code}] 삭제하시겠습니까?`,
        "삭제 확인", "danger",
      );
      if (!ok) return;
      try {
        await api.post("/api/shelf/delete", { id: rack.id });
        this.focusedRackId = null;
        this.loadData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
    // 선택된 위치의 선반 목록을 로드한다
    async loadData() {
      const res = await api.post("/api/shelf/list", {
        location_id: this.selectedLocation_id,
      });
      this.racks = res.data || [];
    },
    // 선택된 창고의 위치 목록을 로드한다
    async loadLocations() {
      const res = await api.post("/api/location/list", {
        warehouse_id: this.selectedWarehouse_id,
      });
      this.locations = res.data || [];
    },
    // 창고 목록을 로드한다
    async loadWarehouses() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data || [];
    },
  },
  // 마운트 시 그리드 크기 갱신과 창고 로드 및 리사이즈 리스너 등록
  mounted() {
    this.$nextTick(() => this.updateGridSize());
    this.loadWarehouses();
    window.addEventListener("resize", this.updateGridSize);
  },
  // 언마운트 직전 윈도우 리사이즈 리스너를 제거한다
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

.edit-input {
  width: 100%;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.15s;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.edit-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

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
