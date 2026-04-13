<template>
  <div
    class="flex h-screen bg-slate-50 font-sans text-slate-900 select-none overflow-hidden"
  >
    <div
      class="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10"
    >
      <div class="p-6 border-b border-slate-100">
        <h2 class="text-xl font-black tracking-tight text-indigo-600 uppercase">
          Warehouse Management
        </h2>
        <p
          class="text-[10px] text-slate-400 font-bold tracking-widest mt-1 text-center bg-slate-100 py-1 rounded"
        >
          RESPONSIVE VIEWBOX ENGINE
        </p>
      </div>

      <div class="p-4 space-y-2">
        <button
          @click="isEditMode = !isEditMode"
          :class="[
            'w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 text-sm',
            isEditMode
              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
          ]"
        >
          {{ isEditMode ? "정점 편집 활성화" : "구획 이동/회전 모드" }}
        </button>

        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-400 uppercase ml-1 block">Shape Type</label>
          <div class="grid grid-cols-3 gap-1">
            <button
              v-for="st in shapeTypes"
              :key="st.key"
              @click="selectedShapeType = st.key"
              :class="[
                'py-2 px-1 rounded-lg text-center transition-all border-2 text-xs font-bold',
                selectedShapeType === st.key
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300',
              ]"
            >
              <div class="text-base leading-none mb-0.5">{{ st.icon }}</div>
              <div class="text-[9px]">{{ st.label }}</div>
            </button>
          </div>
        </div>

        <button
          @click="addShape"
          class="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold shadow-md transition-transform active:scale-95 text-sm"
        >
          + 새 구획 추가
        </button>
      </div>

      <div class="p-4 border-t border-slate-100">
        <button
          @click="saveAll"
          :disabled="isSaving"
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
            <h3 class="font-black text-slate-700 text-xs uppercase italic">
              Section Properties
            </h3>
            <span
              class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono"
              >CODE: {{ selectedShape.code }}</span
            >
          </div>

          <div class="space-y-4 pt-2">
            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
                >Warehouse Name</label
              >
              <input
                v-model="selectedShape.name"
                type="text"
                class="edit-input"
                placeholder="창고 이름 입력"
              />
            </div>

            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
                >Zone Code</label
              >
              <input
                v-model="selectedShape.code"
                type="text"
                class="edit-input font-mono"
                placeholder="Z-001"
              />
            </div>

            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
                >Description / Memo</label
              >
              <textarea
                v-model="selectedShape.memo"
                rows="4"
                class="edit-input resize-none"
                placeholder="보관 품목 등 상세 정보"
              ></textarea>
            </div>

            <div class="group">
              <label
                class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block"
                >Color</label
              >
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
          class="h-full flex flex-col items-center justify-center text-center opacity-30"
        >
          <p
            class="text-xs font-bold text-slate-500 uppercase tracking-tighter"
          >
            Select a shape to edit data
          </p>
        </div>
      </div>
    </div>

    <div class="flex-1 relative bg-slate-200 p-4">
      <div
        class="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300"
      >
        <svg
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
              {{ shape.name }}
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
import api from "@/api/api";

export default {
  data() {
    return {
      // 로컬 shape 객체: { _localId, id, name, code, memo, sort, points, rotation, color, shapeType }
      shapes: [],
      selected: [],
      isEditMode: false,
      selectedShapeType: "rect",
      shapeTypes: [
        { key: "triangle", icon: "△", label: "삼각형" },
        { key: "rect", icon: "□", label: "사각형" },
        { key: "circle", icon: "○", label: "원형" },
        { key: "hexagon", icon: "⬡", label: "육각형" },
        { key: "nieun", icon: "ㄴ", label: "ㄴ형" },
        { key: "giyeok", icon: "ㄱ", label: "ㄱ형" },
      ],
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
    };
  },

  async mounted() {
    await this.loadData();
  },
  computed: {
    selectedShape() {
      return this.selected[this.selected.length - 1] || null;
    },
  },
  methods: {
    /* 🛠 좌표 변환 핵심: 화면 픽셀 -> SVG viewBox(1000) 좌표 */
    getSVGPoint(e) {
      const svg = this.$refs.svgCanvas;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      // 화면 좌표를 SVG의 CTM(좌표 변환 행렬)을 이용해 역계산
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: svgP.x, y: svgP.y };
    },

    snap(v) {
      return Math.round(v / this.gridSize) * this.gridSize;
    },
    pointsToString(p) {
      return p.map((v) => `${v.x},${v.y}`).join(" ");
    },

    getCenter(p) {
      return {
        x: p.reduce((a, b) => a + b.x, 0) / p.length,
        y: p.reduce((a, b) => a + b.y, 0) / p.length,
      };
    },

    getMidPoints(p) {
      return p.map((v, i) => {
        const next = p[(i + 1) % p.length];
        return { x: (v.x + next.x) / 2, y: (v.y + next.y) / 2 };
      });
    },

    getRotateHandle(s) {
      const c = this.getCenter(s.points);
      return { x: c.x + 80, y: c.y };
    },

    isSelected(s) {
      return this.selected.includes(s);
    },

    /* 🖱 이벤트 핸들러 */
    handleCanvasMouseDown(e) {
      if (e.target !== this.$refs.svgCanvas) return;
      const pt = this.getSVGPoint(e);
      this.selected = [];
      this.dragState = { active: true, type: "select" };
      this.selectionStart = pt;
      this.selectionBox = { ...pt, w: 0, h: 0 };
    },

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

    handleVertexMouseDown(shape, idx) {
      this.dragState = {
        active: true,
        type: "vertex",
        target: shape,
        subIdx: idx,
      };
    },

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

    handleMouseUp() {
      if (this.dragState.type === "select" && this.selectionBox) {
        const b = this.selectionBox;
        this.selected = this.shapes.filter((s) => {
          const c = this.getCenter(s.points);
          return c.x > b.x && c.x < b.x + b.w && c.y > b.y && c.y < b.y + b.h;
        });
      }
      // 최종 스냅 보정 (원형은 스냅하면 찌그러지므로 제외)
      if (["move", "rotate", "vertex"].includes(this.dragState.type)) {
        if (this.selectedShape) {
          this.selected.forEach((s) => {
            if (s.shapeType === "circle") {
              s.points = s.points.map((p) => ({
                x: Math.round(p.x),
                y: Math.round(p.y),
              }));
            } else {
              s.points = s.points.map((p) => ({
                x: this.snap(p.x),
                y: this.snap(p.y),
              }));
            }
          });
        }
      }
      this.dragState.active = false;
      this.selectionBox = null;
    },

    /* 💾 데이터 관리 */

    // API에서 창고 목록 로드
    // 응답 예시: [{ id, code, name, memo, sort, points, rotation, color }]
    async loadData() {
      try {
        const res = await api.post("/api/warehouse/list");

        const shapes = res.data;

        if (!shapes) {
          return;
        }

        this.shapes = shapes.map((w) => ({
          _localId: String(w.id),
          id: w.id,
          name: w.name,
          code: w.code,
          memo: w.memo || "",
          points: w.points ?? [],
          rotation: w.rotation ?? 0,
          color: w.color || "#334155",
          shapeType: w.shapeType || "rect",
        }));
      } catch (err) {
        console.error("창고 데이터 로드 실패", err);
      }
    },

    async saveAll() {
      this.isSaving = true;
      try {
        for (let i = 0; i < this.shapes.length; i++) {
          const s = this.shapes[i];

          console.log("check > >> ", s);

          const payload = {
            name: s.name,
            code: s.code,
            memo: s.memo,
            sort: i,
            points: s.points,
            rotation: s.rotation ?? 0,
            color: s.color || null,
            shapeType: s.shapeType || "rect",
          };

          if (s.id) {
            payload.id = s.id;
            await api.post(`/api/warehouse/save`, payload);
          } else {
            const res = await api.post("/api/warehouse/save", payload);
            s.id = res.data.id;
            s._localId = String(s.id);
          }
        }
        alert("저장되었습니다.");
      } catch (err) {
        alert("저장 실패: " + (err?.message || "서버 오류"));
      } finally {
        this.isSaving = false;
      }
    },

    generateShapePoints(type, cx, cy, size) {
      const s = size || 100;
      switch (type) {
        case "triangle":
          return [
            { x: cx, y: cy - s },
            { x: cx + s, y: cy + s * 0.7 },
            { x: cx - s, y: cy + s * 0.7 },
          ];
        case "rect":
          return [
            { x: cx - s, y: cy - s * 0.6 },
            { x: cx + s, y: cy - s * 0.6 },
            { x: cx + s, y: cy + s * 0.6 },
            { x: cx - s, y: cy + s * 0.6 },
          ];
        case "circle": {
          // 48각형으로 원 근사 (스냅 왜곡 최소화)
          const pts = [];
          const sides = 48;
          for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
            pts.push({
              x: Math.round(cx + s * Math.cos(angle)),
              y: Math.round(cy + s * Math.sin(angle)),
            });
          }
          return pts;
        }
        case "hexagon": {
          const pts = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            pts.push({
              x: cx + s * Math.cos(angle),
              y: cy + s * Math.sin(angle),
            });
          }
          return pts;
        }
        case "nieun":
          // ㄴ 형태
          return [
            { x: cx - s, y: cy - s },
            { x: cx - s * 0.4, y: cy - s },
            { x: cx - s * 0.4, y: cy + s * 0.4 },
            { x: cx + s, y: cy + s * 0.4 },
            { x: cx + s, y: cy + s },
            { x: cx - s, y: cy + s },
          ];
        case "giyeok":
          // ㄱ 형태
          return [
            { x: cx - s, y: cy - s },
            { x: cx + s, y: cy - s },
            { x: cx + s, y: cy + s },
            { x: cx + s * 0.4, y: cy + s },
            { x: cx + s * 0.4, y: cy - s * 0.4 },
            { x: cx - s, y: cy - s * 0.4 },
          ];
        default:
          return [
            { x: cx - s, y: cy - s },
            { x: cx + s, y: cy - s },
            { x: cx + s, y: cy + s },
            { x: cx - s, y: cy + s },
          ];
      }
    },

    addShape() {
      const raw = this.generateShapePoints(this.selectedShapeType, 500, 500, 100);
      // 원형은 스냅하면 찌그러지므로 1px 단위 반올림만 적용
      const points =
        this.selectedShapeType === "circle"
          ? raw
          : raw.map((p) => ({ x: this.snap(p.x), y: this.snap(p.y) }));

      const newShape = {
        _localId: `new-${Date.now()}`,
        id: null,
        name: `창고-${this.shapes.length + 1}`,
        code: `W-${Date.now().toString().slice(-4)}`,
        memo: "",
        points,
        rotation: 0,
        color: "#334155",
        shapeType: this.selectedShapeType,
      };
      this.shapes.push(newShape);
      this.selected = [newShape];
    },

    async deleteShape() {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      const target = this.selectedShape;
      if (target.id) {
        try {
          await api.post(`/api/warehouse/delete/${target.id}`);
        } catch (err) {
          alert("삭제 실패: " + (err?.message || "서버 오류"));
          return;
        }
      }
      this.shapes = this.shapes.filter((s) => s._localId !== target._localId);
      this.selected = [];
    },

    insertPoint(shape, index, pos) {
      shape.points.splice(index, 0, {
        x: this.snap(pos.x),
        y: this.snap(pos.y),
      });
    },
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
