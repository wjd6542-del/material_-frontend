<template>
  <div
    class="flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)] bg-slate-50 font-sans text-slate-900 select-none"
  >
    <div
      class="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 lg:overflow-y-auto"
    >
      <div class="p-6 border-b border-slate-100">
        <h2
          class="text-xl font-black tracking-tight text-indigo-600 flex items-center gap-2"
        >
          <i class="fa-solid fa-location-dot"></i>
          위치 관리
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

        <SearchSelect
          v-model="selectedWarehouseId"
          :options="warehouses"
          labelKey="name"
          valueKey="id"
          placeholder="창고 검색"
          @change="onWarehouseChange"
        />
      </div>

      <div class="p-4 space-y-2">
        <button
          @click="isEditMode = !isEditMode"
          :disabled="!selectedWarehouseId"
          :class="[
            'w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 text-sm',
            isEditMode
              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
            !selectedWarehouseId ? 'opacity-40 cursor-not-allowed' : '',
          ]"
        >
          {{ isEditMode ? "정점 편집 활성화" : "구획 이동/회전 모드" }}
        </button>
        <button
          @click="addShape"
          :disabled="!selectedWarehouseId"
          :class="[
            'w-full py-3 px-4 rounded-xl font-bold shadow-md transition-transform active:scale-95 text-sm text-white',
            selectedWarehouseId
              ? 'bg-slate-900 hover:bg-slate-800'
              : 'bg-slate-400 cursor-not-allowed',
          ]"
        >
          + 새 구획 추가
        </button>
      </div>

      <div class="p-4 border-t border-slate-100 space-y-2">
        <button
          @click="openPrintModal"
          :disabled="!selectedWarehouseId || !shapes.length"
          class="w-full py-3 px-4 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-print"></i>
          도면 프린트
        </button>
        <button
          @click="saveAll"
          :disabled="isSaving || !selectedWarehouseId"
          class="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {{ isSaving ? "저장 중..." : "💾 저장" }}
        </button>
      </div>

      <div
        class="flex-1 overflow-y-auto p-5 bg-slate-50/50 border-t border-slate-100"
      >
        <div v-if="selectedShape" class="space-y-4">
          <div
            class="flex items-center justify-between border-b border-slate-200 pb-3"
          >
            <h3
              class="font-black text-slate-700 text-xs flex items-center gap-1.5"
            >
              <i class="fa-solid fa-sliders text-indigo-500"></i>
              구획 속성
            </h3>
            <span
              class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono"
              >코드: {{ selectedShape.code }}</span
            >
          </div>

          <div class="space-y-4 pt-2">
            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
              >
                <i class="fa-solid fa-location-dot me-1"></i>
                위치 이름
              </label>
              <input
                v-model="selectedShape.name"
                type="text"
                class="edit-input"
                placeholder="위치 이름 입력 (선택)"
              />
            </div>

            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
              >
                <i class="fa-solid fa-hashtag me-1"></i>
                위치 코드
              </label>
              <input
                v-model="selectedShape.code"
                type="text"
                class="edit-input font-mono"
                placeholder="L-001"
              />
            </div>

            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
              >
                <i class="fa-solid fa-palette me-1"></i>
                색상
              </label>
              <input
                v-model="selectedShape.color"
                type="color"
                class="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
              />
            </div>
          </div>

          <button
            @click="deleteShape"
            class="w-full py-3 mt-4 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            삭제 처리
          </button>
        </div>

        <div
          v-else
          class="h-full flex flex-col items-center justify-center text-center opacity-40"
        >
          <i
            :class="[
              'text-2xl text-slate-400 mb-2 fa-solid',
              selectedWarehouseId ? 'fa-hand-pointer' : 'fa-warehouse',
            ]"
          ></i>
          <p class="text-xs font-bold text-slate-500 tracking-tight">
            {{
              selectedWarehouseId
                ? "편집할 구획을 선택하세요"
                : "창고를 먼저 선택하세요"
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex-1 relative bg-slate-200 p-4">
      <div
        class="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 relative"
      >
        <!-- 창고 미선택 안내 -->
        <div
          v-if="!selectedWarehouseId"
          class="w-full h-full flex items-center justify-center"
        >
          <p class="text-slate-400 font-bold text-sm">
            창고를 선택하면 위치 구획을 편집할 수 있습니다.
          </p>
        </div>

        <template v-else>
          <div
            class="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-md p-1"
          >
            <button
              @click="zoomIn"
              class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center transition-colors"
              title="확대"
            >
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
            <button
              @click="zoomOut"
              class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center transition-colors"
              title="축소"
            >
              <i class="fa-solid fa-minus text-xs"></i>
            </button>
            <button
              @click="resetZoom"
              class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center transition-colors"
              title="원래크기"
            >
              <i class="fa-solid fa-expand text-xs"></i>
            </button>
          </div>
          <div
            class="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-500 font-mono shadow-sm pointer-events-none"
          >
            {{ Math.round((1000 / viewBox.w) * 100) }}%
          </div>
        </template>

        <svg
          v-if="selectedWarehouseId"
          ref="svgCanvas"
          :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
          preserveAspectRatio="xMidYMid meet"
          class="w-full h-full cursor-crosshair touch-none"
          @wheel.prevent="handleWheel"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @contextmenu.prevent
        >
          <defs>
            <pattern
              id="vGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#f1f5f9"
                stroke-width="0.5"
              />
            </pattern>
            <pattern
              id="vGridLarge"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100%" height="100%" fill="url(#vGrid)" />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="#e2e8f0"
                stroke-width="1"
              />
            </pattern>
          </defs>
          <rect
            :x="viewBox.x"
            :y="viewBox.y"
            :width="viewBox.w"
            :height="viewBox.h"
            fill="url(#vGridLarge)"
          />

          <rect
            v-if="selectionBox"
            :x="selectionBox.x"
            :y="selectionBox.y"
            :width="selectionBox.w"
            :height="selectionBox.h"
            fill="rgba(99, 102, 241, 0.05)"
            stroke="#6366f1"
            stroke-dasharray="4"
          />

          <g v-for="shape in shapes" :key="shape._localId">
            <polygon
              :points="pointsToString(shape.points)"
              :fill="
                isSelected(shape)
                  ? 'rgba(99,102,241,0.2)'
                  : shape.color || '#334155'
              "
              :stroke="isSelected(shape) ? '#f97316' : '#1e293b'"
              class="transition-all duration-75 cursor-move"
              stroke-width="2"
              @mousedown.stop="handleShapeMouseDown($event, shape)"
            />

            <text
              :x="getCenter(shape.points).x"
              :y="getCenter(shape.points).y"
              class="fill-white font-black text-[12px] pointer-events-none uppercase tracking-tighter"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ shape.name || shape.code }}
            </text>

            <template v-if="isEditMode && isSelected(shape)">
              <circle
                v-for="(mid, idx) in getMidPoints(shape.points)"
                :key="'mid-' + idx"
                :cx="mid.x"
                :cy="mid.y"
                r="5"
                class="fill-white stroke-orange-400 hover:fill-orange-500 cursor-pointer transition-transform hover:scale-125"
                @mousedown.stop="insertPoint(shape, idx + 1, mid)"
              />
              <circle
                v-for="(p, i) in shape.points"
                :key="'v-' + i"
                :cx="p.x"
                :cy="p.y"
                r="8"
                class="fill-white stroke-slate-900 cursor-grab active:cursor-grabbing shadow-lg"
                stroke-width="2.5"
                @mousedown.stop="handleVertexMouseDown(shape, i)"
                @dblclick.stop="removePoint(shape, i)"
                @contextmenu.prevent="removePoint(shape, i)"
              />
            </template>

            <circle
              v-if="isSelected(shape) && !isEditMode"
              :cx="getRotateHandle(shape).x"
              :cy="getRotateHandle(shape).y"
              r="10"
              class="fill-amber-400 stroke-white cursor-alias shadow-xl hover:fill-amber-500"
              stroke-width="3"
              @mousedown.stop="handleRotateMouseDown(shape, $event)"
            />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import LocationPrintModal from "@/components/warehouse/LocationPrintModal.vue";
import { createShapeEditorMixin } from "@/mixins/shapeEditor";
import { createSvgZoomPanMixin } from "@/mixins/svgZoomPan";
import { createRefDataMixin } from "@/mixins/refData";

export default {
  name: "LocationPage",
  components: { SearchSelect },
  mixins: [
    createShapeEditorMixin(),
    createSvgZoomPanMixin({
      size: 1000,
      minZoom: 200,
      maxZoom: 3000,
      svgRef: "svgCanvas",
    }),
    createRefDataMixin(["warehouses"]),
  ],

  data() {
    return {
      modal: useModalStore(),
      warehouses: [],
      selectedWarehouseId: "",
      selectedWarehouse: {},
    };
  },

  // 마운트 시 창고 목록을 서버에서 로드한다
  async mounted() {
    await this.loadRefData();
  },

  methods: {

    // 창고 선택 변경 시 해당 창고의 위치 데이터를 다시 로드한다
    async onWarehouseChange() {
      this.shapes = [];
      this.selected = [];
      this.isEditMode = false;
      if (this.selectedWarehouseId) {
        await this.loadData();
        // 선택항목 저장
        this.selectedWarehouse = this.warehouses.find(
          (row) => row.id == this.selectedWarehouseId,
        );
      }
    },

    // 선택된 창고의 위치(Location) 목록을 서버에서 로드한다
    async loadData() {
      try {
        const res = await api.post("/api/location/list", {
          warehouse_id: this.selectedWarehouseId,
        });

        const locations = res.data;

        if (!locations) return;

        this.shapes = locations.map((l) => ({
          _localId: String(l.id),
          id: l.id,
          warehouse_id: l.warehouse_id,
          name: l.name || "",
          code: l.code,
          sort: l.sort ?? 0,
          points: l.points ?? [],
          rotation: l.rotation ?? 0,
          color: l.color || "#334155",
        }));
      } catch (err) {
        console.error("위치 데이터 로드 실패", err);
      }
    },

    // 도면 프린트 모달을 연다
    openPrintModal() {
      if (!this.selectedWarehouseId || !this.shapes.length) return;
      const warehouse =
        this.warehouses.find((w) => w.id === this.selectedWarehouseId) || {};
      this.modal.openModal(
        LocationPrintModal,
        {
          warehouse,
          locations: this.shapes,
        },
        "full",
      );
    },

    // 현재 위치 shape 목록 전체를 순차 저장하고 신규 항목에 서버 id를 반영한다
    async saveAll() {
      if (!this.selectedWarehouseId) return;
      this.isSaving = true;
      try {
        for (let i = 0; i < this.shapes.length; i++) {
          const s = this.shapes[i];

          const payload = {
            warehouse_id: this.selectedWarehouseId,
            name: s.name || null,
            code: s.code,
            sort: i,
            points: s.points,
            rotation: s.rotation ?? 0,
            color: s.color || null,
          };

          if (s.id) {
            payload.id = s.id;
            await api.post(`/api/location/save`, payload);
          } else {
            const res = await api.post("/api/location/save", payload);
            s.id = res.data.id;
            s._localId = String(s.id);
          }
        }
        this.$toast.success("저장되었습니다.");
      } catch (err) {
        this.$toast.error("저장 실패: " + (err?.message || "서버 오류"));
      } finally {
        this.isSaving = false;
      }
    },

    // 기본 사각형 위치 shape를 캔버스 중앙에 추가한다
    addShape() {
      if (!this.selectedWarehouseId) return;
      const newShape = {
        _localId: `new-${Date.now()}`,
        id: null,
        warehouse_id: this.selectedWarehouseId,
        name: `${this.selectedWarehouse.name}-${this.shapes.length + 1}구역`,
        code: `${this.selectedWarehouse.code}-L-${this.shapes.length + 1}`,
        sort: this.shapes.length,
        points: [
          { x: 400, y: 400 },
          { x: 600, y: 400 },
          { x: 600, y: 500 },
          { x: 400, y: 500 },
        ],
        rotation: 0,
        color: "#334155",
      };
      this.shapes.push(newShape);
      this.selected = [newShape];
    },

    // 현재 선택된 위치 shape를 서버와 로컬에서 삭제한다
    async deleteShape() {
      const ok = await this.$confirm?.(
        "정말 삭제하시겠습니까?",
        "삭제 확인",
        "danger",
      );
      if (ok === false) return;
      const target = this.selectedShape;
      if (target.id) {
        try {
          await api.post(`/api/location/delete/${target.id}`);
          this.$toast.success("삭제 처리 되었습니다");
        } catch (err) {
          this.$toast.error("삭제 실패: " + (err?.message || "서버 오류"));
          return;
        }
      }
      this.shapes = this.shapes.filter((s) => s._localId !== target._localId);
      this.selected = [];
    },
  },
};
</script>

<style scoped>
.edit-input {
  @apply w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium shadow-sm;
}
text {
  user-select: none;
}
</style>
