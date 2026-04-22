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
        class="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300"
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

        <svg
          v-else
          ref="svgCanvas"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
          class="w-full h-full cursor-crosshair touch-none"
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
          <rect width="1000" height="1000" fill="url(#vGridLarge)" />

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

<script>
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import LocationPrintModal from "@/components/warehouse/LocationPrintModal.vue";

export default {
  components: {
    SearchSelect,
  },

  data() {
    return {
      modal: useModalStore(),
      warehouses: [],
      selectedWarehouseId: "",
      // 로컬 shape 객체: { _localId, id, warehouse_id, name, code, sort, points, rotation, color }
      shapes: [],
      selected: [],
      isEditMode: false,
      isSaving: false,
      gridSize: 20,
      dragState: {
        active: false,
        type: null,
        startX: 0,
        startY: 0,
        target: null,
        subIdx: null,
        originPoints: [],
      },
      selectionBox: null,
      selectionStart: { x: 0, y: 0 },
      selectedWarehouse: {},
    };
  },

  // 마운트 시 창고 목록을 서버에서 로드한다
  async mounted() {
    await this.loadWarehouses();
  },

  computed: {
    // 다중 선택 중 가장 최근에 선택된 shape를 반환한다
    selectedShape() {
      return this.selected[this.selected.length - 1] || null;
    },
  },

  methods: {
    /* 🛠 좌표 변환 핵심: 화면 픽셀 -> SVG viewBox(1000) 좌표 */
    // 화면 픽셀 좌표를 SVG viewBox 좌표로 변환한다
    getSVGPoint(e) {
      const svg = this.$refs.svgCanvas;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: svgP.x, y: svgP.y };
    },

    // 좌표값을 그리드 단위로 스냅한다
    snap(v) {
      return Math.round(v / this.gridSize) * this.gridSize;
    },
    // 포인트 배열을 SVG polygon용 문자열로 변환한다
    pointsToString(p) {
      return p.map((v) => `${v.x},${v.y}`).join(" ");
    },

    // 다각형 포인트들의 중심 좌표를 계산한다
    getCenter(p) {
      return {
        x: p.reduce((a, b) => a + b.x, 0) / p.length,
        y: p.reduce((a, b) => a + b.y, 0) / p.length,
      };
    },

    // 각 변의 중점 좌표 배열을 반환한다 (정점 추가용)
    getMidPoints(p) {
      return p.map((v, i) => {
        const next = p[(i + 1) % p.length];
        return { x: (v.x + next.x) / 2, y: (v.y + next.y) / 2 };
      });
    },

    // 회전 핸들의 위치(중심 오른쪽)를 반환한다
    getRotateHandle(s) {
      const c = this.getCenter(s.points);
      return { x: c.x + 80, y: c.y };
    },

    // 특정 shape가 현재 선택되어 있는지 확인한다
    isSelected(s) {
      return this.selected.includes(s);
    },

    /* 🖱 이벤트 핸들러 */
    // 빈 캔버스 클릭 시 선택 해제 및 드래그 선택 박스를 시작한다
    handleCanvasMouseDown(e) {
      if (e.target !== this.$refs.svgCanvas) return;
      const pt = this.getSVGPoint(e);
      this.selected = [];
      this.dragState = { active: true, type: "select" };
      this.selectionStart = pt;
      this.selectionBox = { ...pt, w: 0, h: 0 };
    },

    // shape 클릭 시 선택 처리 및 이동 드래그를 시작한다 (Ctrl로 다중 선택)
    handleShapeMouseDown(e, shape) {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl) {
        if (this.isSelected(shape))
          this.selected = this.selected.filter((s) => s !== shape);
        else this.selected.push(shape);
      } else {
        if (!this.isSelected(shape)) this.selected = [shape];
      }

      if (this.selected.length > 0) {
        const pt = this.getSVGPoint(e);
        this.dragState = {
          active: true,
          type: "move",
          startX: pt.x,
          startY: pt.y,
          originPoints: this.selected.map((s) =>
            s.points.map((p) => ({ ...p })),
          ),
        };
      }
    },

    // 정점 클릭 시 정점 이동 드래그를 시작한다
    handleVertexMouseDown(shape, idx) {
      this.dragState = {
        active: true,
        type: "vertex",
        target: shape,
        subIdx: idx,
      };
    },

    // 회전 핸들 클릭 시 회전 드래그를 시작한다
    handleRotateMouseDown(shape, e) {
      const pt = this.getSVGPoint(e);
      this.dragState = {
        active: true,
        type: "rotate",
        target: shape,
        startX: pt.x,
        startY: pt.y,
      };
    },

    // 드래그 중 마우스 이동에 따라 이동/정점 편집/회전/선택 박스를 갱신한다
    handleMouseMove(e) {
      if (!this.dragState.active) return;
      const pt = this.getSVGPoint(e);

      if (this.dragState.type === "move") {
        const dx = this.snap(pt.x - this.dragState.startX);
        const dy = this.snap(pt.y - this.dragState.startY);

        this.selected.forEach((shape, i) => {
          shape.points = this.dragState.originPoints[i].map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
        });
      } else if (this.dragState.type === "vertex") {
        this.dragState.target.points[this.dragState.subIdx] = {
          x: this.snap(pt.x),
          y: this.snap(pt.y),
        };
      } else if (this.dragState.type === "rotate") {
        const shape = this.dragState.target;
        const c = this.getCenter(shape.points);
        const angle =
          Math.atan2(pt.y - c.y, pt.x - c.x) -
          Math.atan2(this.dragState.startY - c.y, this.dragState.startX - c.x);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        shape.points = shape.points.map((p) => ({
          x: cos * (p.x - c.x) - sin * (p.y - c.y) + c.x,
          y: sin * (p.x - c.x) + cos * (p.y - c.y) + c.y,
        }));
        this.dragState.startX = pt.x;
        this.dragState.startY = pt.y;
      } else if (this.dragState.type === "select") {
        this.selectionBox = {
          x: Math.min(this.selectionStart.x, pt.x),
          y: Math.min(this.selectionStart.y, pt.y),
          w: Math.abs(pt.x - this.selectionStart.x),
          h: Math.abs(pt.y - this.selectionStart.y),
        };
      }
    },

    // 드래그 종료 시 선택 박스 내 shape 선택 및 스냅 보정을 수행한다
    handleMouseUp() {
      if (this.dragState.type === "select" && this.selectionBox) {
        const b = this.selectionBox;
        this.selected = this.shapes.filter((s) => {
          const c = this.getCenter(s.points);
          return c.x > b.x && c.x < b.x + b.w && c.y > b.y && c.y < b.y + b.h;
        });
      }
      if (["move", "rotate", "vertex"].includes(this.dragState.type)) {
        if (this.selectedShape) {
          this.selected.forEach(
            (s) =>
              (s.points = s.points.map((p) => ({
                x: this.snap(p.x),
                y: this.snap(p.y),
              }))),
          );
        }
      }
      this.dragState.active = false;
      this.selectionBox = null;
    },

    /* 💾 데이터 관리 */

    // 창고 목록을 서버에서 로드한다
    async loadWarehouses() {
      try {
        const res = await api.post("/api/warehouse/list");
        this.warehouses = res.data || [];
      } catch (err) {
        console.error("창고 목록 로드 실패", err);
      }
    },

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

        console.log(this.selectedWarehouse);
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
        this.$toast.success("저장 실패: " + (err?.message || "서버 오류"));
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
      if (!confirm("정말 삭제하시겠습니까?")) return;
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

    // 지정 위치에 새 정점을 삽입한다 (스냅 적용)
    insertPoint(shape, index, pos) {
      shape.points.splice(index, 0, {
        x: this.snap(pos.x),
        y: this.snap(pos.y),
      });
    },
    // 정점을 제거한다 (최소 3개 유지)
    removePoint(shape, i) {
      if (shape.points.length > 3) shape.points.splice(i, 1);
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
