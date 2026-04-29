<template>
  <div class="flex flex-col gap-3" style="min-height: 65vh">
    <!-- 헤더 -->
    <div class="pb-2 border-b border-slate-100">
      <h2
        class="text-base font-semibold text-slate-800 flex items-center gap-2"
      >
        <i class="fa-solid fa-location-crosshairs text-blue-500"></i>
        선반 위치 확인
      </h2>
      <p
        v-if="!loading && shelf"
        class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap"
      >
        <span
          v-if="warehouse"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold"
        >
          <i class="fa-solid fa-warehouse text-[9px]"></i>
          {{ warehouse.name }}
        </span>
        <i class="fa-solid fa-angle-right text-slate-300 text-[9px]"></i>
        <span
          v-if="location"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold"
        >
          <i class="fa-solid fa-location-dot text-[9px]"></i>
          {{ location.name || location.code }}
        </span>
        <i class="fa-solid fa-angle-right text-slate-300 text-[9px]"></i>
        <span
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold"
        >
          <i class="fa-solid fa-box text-[9px]"></i>
          {{ shelf.name || shelf.code }}
        </span>
      </p>
    </div>

    <!-- 로딩 / 빈 상태 -->
    <div
      v-if="loading"
      class="flex-1 flex items-center justify-center text-slate-400 text-xs py-10"
    >
      <i class="fa-solid fa-spinner fa-spin mr-1.5"></i>도면을 불러오는 중...
    </div>
    <div
      v-else-if="!shelf"
      class="flex-1 flex flex-col items-center justify-center text-slate-400 py-10"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2"
      >
        <i class="fa-regular fa-file-lines text-xl text-slate-300"></i>
      </div>
      <p class="text-xs font-semibold text-slate-500">선반 정보를 찾을 수 없습니다</p>
    </div>

    <!-- 본체: 메타 + 도면 -->
    <div v-else class="flex-1 flex flex-col gap-3 min-h-0">
      <!-- 메타 정보 (상단) - 클릭 시 도면 스코프 전환 -->
      <div class="grid grid-cols-3 gap-2 shrink-0">
        <button
          type="button"
          @click="setView('warehouse')"
          :disabled="!warehouse"
          class="text-left rounded-xl border px-3 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            viewMode === 'warehouse'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-sm'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
          "
        >
          <div class="flex items-center justify-between mb-0.5">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <i class="fa-solid fa-warehouse text-blue-500 mr-1"></i>
              창고
            </div>
            <i
              v-if="viewMode === 'warehouse'"
              class="fa-solid fa-circle-check text-blue-500 text-[11px]"
            ></i>
          </div>
          <div class="text-sm font-bold text-slate-800 truncate">
            {{ warehouse?.name || "-" }}
          </div>
          <div class="text-[10px] text-slate-400 font-mono truncate">
            {{ warehouse?.code || "" }}
          </div>
        </button>

        <button
          type="button"
          @click="setView('location')"
          :disabled="!location"
          class="text-left rounded-xl border px-3 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            viewMode === 'location'
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow-sm'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
          "
        >
          <div class="flex items-center justify-between mb-0.5">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <i class="fa-solid fa-location-dot text-indigo-500 mr-1"></i>
              위치
            </div>
            <i
              v-if="viewMode === 'location'"
              class="fa-solid fa-circle-check text-indigo-500 text-[11px]"
            ></i>
          </div>
          <div class="text-sm font-bold text-slate-800 truncate">
            {{ location?.name || "-" }}
          </div>
          <div class="text-[10px] text-slate-500 font-mono truncate">
            {{ location?.code || "" }}
          </div>
        </button>

        <button
          type="button"
          @click="setView('shelf')"
          :disabled="!shelf"
          class="text-left rounded-xl border px-3 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            viewMode === 'shelf'
              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 shadow-sm'
              : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50'
          "
        >
          <div class="flex items-center justify-between mb-0.5">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <i class="fa-solid fa-box text-amber-500 mr-1"></i>
              선반 (대상)
            </div>
            <i
              v-if="viewMode === 'shelf'"
              class="fa-solid fa-circle-check text-amber-500 text-[11px]"
            ></i>
          </div>
          <div class="text-sm font-black text-slate-900 truncate">
            {{ shelf?.name || "-" }}
          </div>
          <div class="text-[10px] text-slate-600 font-mono truncate">
            {{ shelf?.code || "" }}
          </div>
        </button>
      </div>

      <!-- 도면 -->
      <div
        class="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden flex-1 min-h-[420px]"
      >
        <!-- 줌 컨트롤 -->
        <div
          class="absolute top-2 right-2 z-30 flex flex-col gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm p-1"
        >
          <button
            type="button"
            @click="zoomIn"
            v-tip="'확대 (Wheel ↑)'"
            class="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
          </button>
          <button
            type="button"
            @click="zoomOut"
            v-tip="'축소 (Wheel ↓)'"
            class="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <i class="fa-solid fa-magnifying-glass-minus text-xs"></i>
          </button>
          <div class="w-7 h-px bg-slate-200 my-0.5"></div>
          <button
            type="button"
            @click="resetView"
            v-tip="'전체 보기 (대상 선반 중심으로 맞춤)'"
            class="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition"
          >
            <i class="fa-solid fa-expand text-xs"></i>
          </button>
        </div>

        <!-- 줌 레벨 표시 -->
        <div
          class="absolute top-2 left-2 z-30 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] font-mono font-bold text-slate-500 shadow-sm"
        >
          {{ Math.round(zoom * 100) }}%
        </div>

        <svg
          v-show="viewMode !== 'shelf'"
          ref="svgEl"
          :viewBox="effectiveViewBox"
          preserveAspectRatio="xMidYMid meet"
          class="w-full h-full block select-none"
          :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
          @wheel.prevent="onWheel"
          @mousedown="onPanStart"
        >
          <!-- ── 창고 모드: 창고관리(WarehousePage) 1000x1000 캔버스 + 모든 창고 + 대상 강조 ── -->
          <template v-if="viewMode === 'warehouse'">
            <defs>
              <pattern
                id="vGridSmall"
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
                id="vGridBig"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <rect width="100%" height="100%" fill="url(#vGridSmall)" />
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="#e2e8f0"
                  stroke-width="1"
                />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#vGridBig)" />

            <g v-for="wh in allWarehouses" :key="`wh-${wh.id}`">
              <polygon
                :points="pointsToString(wh.points)"
                :transform="shapeTransform(wh)"
                :fill="wh.color || '#334155'"
                :fill-opacity="wh.id === warehouse?.id ? 0.9 : 0.55"
                :stroke="wh.id === warehouse?.id ? '#dc2626' : '#1e293b'"
                :stroke-width="wh.id === warehouse?.id ? 5 : 1.5"
                :class="wh.id === warehouse?.id ? 'target-shelf' : ''"
              />
              <polygon
                v-if="wh.id === warehouse?.id"
                :points="pointsToString(wh.points)"
                :transform="shapeTransform(wh)"
                fill="none"
                stroke="#fff"
                stroke-width="2"
              />
              <polygon
                v-if="wh.id === warehouse?.id"
                :points="pointsToString(wh.points)"
                :transform="shapeTransform(wh)"
                fill="none"
                stroke="#dc2626"
                stroke-width="6"
                class="target-pulse"
              />
              <text
                v-if="wh.points?.length"
                :x="getCenter(wh.points).x"
                :y="getCenter(wh.points).y - 6"
                text-anchor="middle"
                dominant-baseline="middle"
                :transform="shapeTransform(wh)"
                :style="`font-size: ${wh.id === warehouse?.id ? 18 : 14}px; font-weight: ${wh.id === warehouse?.id ? 900 : 800}; fill: #fff; paint-order: stroke; stroke: #1e293b; stroke-width: 3px; stroke-linejoin: round`"
              >
                {{ wh.name || wh.code }}
              </text>
              <text
                v-if="wh.points?.length"
                :x="getCenter(wh.points).x"
                :y="getCenter(wh.points).y + 12"
                text-anchor="middle"
                dominant-baseline="middle"
                :transform="shapeTransform(wh)"
                style="font-size: 10px; font-weight: 600; fill: #fff; paint-order: stroke; stroke: #1e293b; stroke-width: 2px; stroke-linejoin: round"
              >
                {{ wh.code }}
              </text>
            </g>
          </template>

          <!-- ── 위치 모드: 창고 외곽선 + 모든 위치 + 선택 위치 강조 ── -->
          <template v-else-if="viewMode === 'location'">
            <polygon
              v-if="warehouse?.points?.length"
              :points="pointsToString(warehouse.points)"
              :transform="shapeTransform(warehouse)"
              fill="#f8fafc"
              stroke="#cbd5e1"
              stroke-width="3"
              stroke-dasharray="8 4"
            />
            <g v-for="loc in allWarehouseLocations" :key="`l-loc-${loc.id}`">
              <polygon
                :points="pointsToString(loc.points)"
                :transform="shapeTransform(loc)"
                :fill="loc.color || '#6366f1'"
                :fill-opacity="loc.id === location?.id ? 0.95 : 0.4"
                :stroke="loc.id === location?.id ? '#dc2626' : '#94a3b8'"
                :stroke-width="loc.id === location?.id ? 5 : 1"
                :class="loc.id === location?.id ? 'target-shelf' : ''"
              />
              <polygon
                v-if="loc.id === location?.id"
                :points="pointsToString(loc.points)"
                :transform="shapeTransform(loc)"
                fill="none"
                stroke="#fff"
                stroke-width="2"
              />
              <polygon
                v-if="loc.id === location?.id"
                :points="pointsToString(loc.points)"
                :transform="shapeTransform(loc)"
                fill="none"
                stroke="#dc2626"
                stroke-width="6"
                class="target-pulse"
              />
              <text
                :x="getCenter(loc.points).x"
                :y="getCenter(loc.points).y - 6"
                text-anchor="middle"
                dominant-baseline="middle"
                :transform="shapeTransform(loc)"
                :style="`font-size: ${loc.id === location?.id ? 16 : 12}px; font-weight: ${loc.id === location?.id ? 900 : 700}; fill: #fff; paint-order: stroke; stroke: #1e293b; stroke-width: 3px; stroke-linejoin: round`"
              >
                {{ loc.name || loc.code }}
              </text>
              <text
                :x="getCenter(loc.points).x"
                :y="getCenter(loc.points).y + 10"
                text-anchor="middle"
                dominant-baseline="middle"
                :transform="shapeTransform(loc)"
                style="font-size: 10px; font-weight: 600; fill: #fff; paint-order: stroke; stroke: #1e293b; stroke-width: 2px; stroke-linejoin: round"
              >
                {{ loc.code }}
              </text>
            </g>
          </template>

        </svg>

        <!-- ── 선반 모드: 선반관리(ShelfPage)의 30×36 그리드 레이아웃 ── -->
        <div
          v-if="viewMode === 'shelf'"
          class="absolute inset-0 p-4 flex flex-col gap-2 bg-white"
        >
          <div
            class="text-[11px] font-bold text-slate-600 px-1 flex items-center gap-2"
          >
            <i class="fa-solid fa-layer-group text-indigo-500"></i>
            선반 레이아웃
            <span class="text-slate-400 font-mono">
              ({{ location?.name || "-" }} / 총 {{ allLocationShelves.length }}개)
            </span>
          </div>
          <div
            ref="shelfContainerEl"
            class="relative flex-1 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden select-none"
            :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
            @wheel.prevent="onWheel"
            @mousedown="onPanStart"
          >
            <!-- 줌/팬 변환 래퍼 (CSS transform, 픽셀 단위) -->
            <div
              class="absolute inset-0 origin-top-left"
              :style="{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              }"
            >
              <!-- 격자 배경 -->
              <div
                class="absolute inset-0 grid"
                :style="{
                  gridTemplateColumns: `repeat(${SHELF_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${SHELF_ROWS}, 1fr)`,
                }"
              >
                <div
                  v-for="cell in SHELF_COLS * SHELF_ROWS"
                  :key="cell"
                  class="border-[0.5px] border-slate-200/60"
                />
              </div>

              <!-- 선반 블록 -->
              <div
                v-for="rack in allLocationShelves"
                :key="`grid-shelf-${rack.id}`"
                class="absolute flex items-center justify-center rounded-md shadow-sm border text-white font-bold transition-all"
                :class="
                  rack.id === shelf?.id
                    ? 'ring-4 ring-red-500 ring-offset-1 z-20 target-shelf-grid'
                    : 'opacity-80 z-10'
                "
                :style="rackStyle(rack)"
              >
                <div class="flex flex-col items-center gap-1 px-0.5 leading-[1] w-full text-center break-all whitespace-normal">
                  <span class="text-[5px]">
                    {{ rack.name || rack.code }}
                  </span>
                  <span
                    v-if="rack.code"
                    class="text-[4px] font-mono opacity-90"
                  >
                    {{ rack.code }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 빈 상태 (변환 영향 받지 않음) -->
            <div
              v-if="!allLocationShelves.length"
              class="absolute inset-0 flex items-center justify-center text-slate-400 text-xs"
            >
              <i class="fa-regular fa-folder-open mr-1.5"></i>
              위치에 등록된 선반이 없습니다
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
  name: "ShelfLocationViewerModal",

  props: {
    shelf_id: { type: Number, required: true },
  },

  data() {
    return {
      // 선반 그리드 캔버스 크기 (ShelfPage 와 동일)
      SHELF_ROWS: 30,
      SHELF_COLS: 36,

      loading: false,
      shelf: null,
      location: null,
      warehouse: null,
      siblingLocations: [],
      siblingShelves: [],
      // 창고관리 페이지 기준 - 전체 창고 목록
      allWarehouses: [],

      // 줌/팬 상태 (SVG 모드 = viewBox 단위, 선반 모드 = 픽셀 단위 transform)
      zoom: 1, // 1=fit, 2=2x 확대
      panX: 0,
      panY: 0,
      dragging: false,
      dragStart: null, // { x, y, panX, panY }

      // 뷰 모드: "warehouse" | "location" | "shelf"
      // 카드 클릭으로 도면 스코프 전환
      viewMode: "warehouse",
    };
  },

  computed: {
    // 창고 모드용 - 창고에 속한 모든 위치 (대상 포함)
    allWarehouseLocations() {
      const list = [...this.siblingLocations];
      if (this.location) list.push(this.location);
      return list;
    },

    // 위치 모드용 - 위치에 속한 모든 선반 (대상 포함)
    allLocationShelves() {
      const list = [...this.siblingShelves];
      if (this.shelf) list.push(this.shelf);
      return list;
    },

    // 도형 회전을 적용한 점 배열 반환
    rotatedPoints() {
      return (shape) => {
        if (!shape || !Array.isArray(shape.points)) return [];
        const c = this.getCenter(shape.points);
        const rad = ((Number(shape.rotation) || 0) * Math.PI) / 180;
        if (!rad) return shape.points.map((p) => ({ x: p.x, y: p.y }));
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return shape.points.map((p) => {
          const dx = p.x - c.x;
          const dy = p.y - c.y;
          return {
            x: c.x + dx * cos - dy * sin,
            y: c.y + dx * sin + dy * cos,
          };
        });
      };
    },

    // 뷰 모드에 따라 fit 대상 도형 집합을 결정 → bounding box → viewBox 문자열
    viewBox() {
      // 창고 모드는 WarehousePage 와 동일한 1000x1000 고정 캔버스
      if (this.viewMode === "warehouse") {
        return "0 0 1000 1000";
      }
      let shapes = [];
      if (this.viewMode === "location") {
        // 창고 외곽선 + 모든 위치 (선택 위치 강조)
        shapes = [this.warehouse, ...this.allWarehouseLocations];
      } else {
        // shelf 모드: 위치 외곽선 + 위치 안 모든 선반 (선택 선반 강조)
        shapes = [this.location, ...this.allLocationShelves];
      }
      const all = [];
      shapes.forEach((s) => all.push(...this.rotatedPoints(s)));

      if (!all.length) return "0 0 1000 1000";

      const xs = all.map((p) => p.x);
      const ys = all.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      const w = Math.max(1, maxX - minX);
      const h = Math.max(1, maxY - minY);

      // 정사각 비율 + 패딩(모드별 차등) 으로 보기 좋게 보정
      const size = Math.max(w, h);
      const padRatio =
        this.viewMode === "shelf"
          ? 0.45
          : this.viewMode === "location"
            ? 0.25
            : 0.15;
      const pad = size * padRatio;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const half = size / 2 + pad;

      const vbX = cx - half;
      const vbY = cy - half;
      const vbS = half * 2;
      return `${vbX} ${vbY} ${vbS} ${vbS}`;
    },

    // 줌/팬 적용된 실제 viewBox
    effectiveViewBox() {
      const parts = this.viewBox.split(/\s+/).map(Number);
      const baseX = parts[0] || 0;
      const baseY = parts[1] || 0;
      const baseW = parts[2] || 1000;
      const baseH = parts[3] || 1000;

      const w = baseW / this.zoom;
      const h = baseH / this.zoom;
      const cx = baseX + baseW / 2 + this.panX;
      const cy = baseY + baseH / 2 + this.panY;
      return `${cx - w / 2} ${cy - h / 2} ${w} ${h}`;
    },
  },

  methods: {
    // 마우스 휠 → 확대/축소 (포인터 위치를 중심으로 줌)
    onWheel(e) {
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newZoom = Math.max(0.2, Math.min(this.zoom * factor, 8));

      // 선반 모드: 픽셀 좌표계, transform-origin (0,0) 기준 보정
      if (this.viewMode === "shelf") {
        const container = this.$refs.shelfContainerEl;
        if (container) {
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const contentX = (mouseX - this.panX) / this.zoom;
          const contentY = (mouseY - this.panY) / this.zoom;
          this.panX = mouseX - contentX * newZoom;
          this.panY = mouseY - contentY * newZoom;
        }
        this.zoom = newZoom;
        return;
      }

      // 마우스 포인터 위치를 viewBox 좌표로 변환 (zoom anchor)
      const svg = this.$refs.svgEl;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const parts = this.viewBox.split(/\s+/).map(Number);
        const baseW = parts[2] || 1000;
        const baseH = parts[3] || 1000;
        const baseX = parts[0] || 0;
        const baseY = parts[1] || 0;
        const w = baseW / this.zoom;
        const h = baseH / this.zoom;
        const cx = baseX + baseW / 2 + this.panX;
        const cy = baseY + baseH / 2 + this.panY;
        const px = cx - w / 2 + ((e.clientX - rect.left) / rect.width) * w;
        const py = cy - h / 2 + ((e.clientY - rect.top) / rect.height) * h;

        // 줌 변경 후 동일한 viewBox 좌표 (px, py) 가 동일한 화면 위치에 오도록 panX/Y 보정
        const newW = baseW / newZoom;
        const newH = baseH / newZoom;
        const screenRatioX = (e.clientX - rect.left) / rect.width;
        const screenRatioY = (e.clientY - rect.top) / rect.height;
        const newCx = px + (0.5 - screenRatioX) * newW;
        const newCy = py + (0.5 - screenRatioY) * newH;
        this.panX = newCx - (baseX + baseW / 2);
        this.panY = newCy - (baseY + baseH / 2);
      }
      this.zoom = newZoom;
    },

    // 드래그 시작
    onPanStart(e) {
      this.dragging = true;
      this.dragStart = {
        x: e.clientX,
        y: e.clientY,
        panX: this.panX,
        panY: this.panY,
      };
      window.addEventListener("mousemove", this.onPanMove);
      window.addEventListener("mouseup", this.onPanEnd);
    },
    // 드래그 중 - 화면 픽셀 이동량을 viewBox 단위로 환산
    onPanMove(e) {
      if (!this.dragging || !this.dragStart) return;

      // 선반 모드: 픽셀 그대로 panX/Y 에 반영
      if (this.viewMode === "shelf") {
        this.panX = this.dragStart.panX + (e.clientX - this.dragStart.x);
        this.panY = this.dragStart.panY + (e.clientY - this.dragStart.y);
        return;
      }

      const svg = this.$refs.svgEl;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const parts = this.viewBox.split(/\s+/).map(Number);
      const baseW = parts[2] || 1000;
      const baseH = parts[3] || 1000;
      const w = baseW / this.zoom;
      const h = baseH / this.zoom;
      const dx = (e.clientX - this.dragStart.x) * (w / rect.width);
      const dy = (e.clientY - this.dragStart.y) * (h / rect.height);
      this.panX = this.dragStart.panX - dx;
      this.panY = this.dragStart.panY - dy;
    },
    onPanEnd() {
      this.dragging = false;
      this.dragStart = null;
      window.removeEventListener("mousemove", this.onPanMove);
      window.removeEventListener("mouseup", this.onPanEnd);
    },

    // 버튼: 확대 (중앙 기준)
    zoomIn() {
      this.zoom = Math.min(this.zoom * 1.25, 8);
    },
    // 버튼: 축소 (중앙 기준)
    zoomOut() {
      this.zoom = Math.max(this.zoom / 1.25, 0.2);
    },
    // 버튼: 초기화 (전체 보기)
    resetView() {
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
    },

    // 카드 클릭 → 뷰 모드 전환 + 줌/팬 초기화
    setView(mode) {
      if (this.viewMode === mode) return;
      this.viewMode = mode;
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
    },

    // 선반 모드의 그리드 셀 좌표 → CSS 위치 (% 단위로 반응형)
    rackStyle(rack) {
      const x = Number(rack?.x) || 0;
      const y = Number(rack?.y) || 0;
      const w = Number(rack?.width) || 1;
      const h = Number(rack?.height) || 1;
      const color = rack?.color || "#475569";
      return {
        left: `${(x / this.SHELF_COLS) * 100}%`,
        top: `${(y / this.SHELF_ROWS) * 100}%`,
        width: `${(w / this.SHELF_COLS) * 100}%`,
        height: `${(h / this.SHELF_ROWS) * 100}%`,
        backgroundColor: color,
        borderColor: color,
      };
    },

    pointsToString(p) {
      if (!Array.isArray(p)) return "";
      return p.map((v) => `${v.x},${v.y}`).join(" ");
    },
    getCenter(p) {
      if (!Array.isArray(p) || !p.length) return { x: 0, y: 0 };
      return {
        x: p.reduce((a, b) => a + b.x, 0) / p.length,
        y: p.reduce((a, b) => a + b.y, 0) / p.length,
      };
    },
    shapeTransform(shape) {
      const rot = Number(shape?.rotation) || 0;
      if (!rot) return "";
      const c = this.getCenter(shape.points);
      return `rotate(${rot} ${c.x} ${c.y})`;
    },

    // 선반/위치/창고를 병렬 로드 후 대상 매칭
    async loadAll() {
      if (!this.shelf_id) return;
      this.loading = true;
      try {
        const [sRes, lRes, wRes] = await Promise.all([
          api.post("/api/shelf/list", {}),
          api.post("/api/location/list", {}),
          api.post("/api/warehouse/list", {}),
        ]);
        const shelves = Array.isArray(sRes.data) ? sRes.data : [];
        const locations = Array.isArray(lRes.data) ? lRes.data : [];
        const warehouses = Array.isArray(wRes.data) ? wRes.data : [];

        // 창고관리 페이지 기준 - 전체 창고 목록 보관
        this.allWarehouses = warehouses;

        const target = shelves.find((s) => s.id === this.shelf_id);
        if (!target) {
          this.shelf = null;
          return;
        }
        this.shelf = target;

        const loc =
          locations.find((l) => l.id === target.location_id) || null;
        this.location = loc;

        const wh =
          loc && warehouses.find((w) => w.id === loc.warehouse_id);
        this.warehouse = wh || null;

        // 같은 창고 내 다른 위치들 (대상 위치 제외)
        if (wh) {
          this.siblingLocations = locations.filter(
            (l) => l.warehouse_id === wh.id && l.id !== loc?.id,
          );
        } else {
          this.siblingLocations = [];
        }

        // 같은 위치 내 다른 선반들 (대상 선반 제외)
        if (loc) {
          this.siblingShelves = shelves.filter(
            (s) => s.location_id === loc.id && s.id !== target.id,
          );
        } else {
          this.siblingShelves = [];
        }
      } catch (e) {
        this.shelf = null;
        this.location = null;
        this.warehouse = null;
        this.$toast?.error?.("선반 정보를 불러오지 못했습니다.");
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.loadAll();
  },
  beforeUnmount() {
    // 드래그 도중 모달이 닫혀도 리스너 누수 없게 정리
    window.removeEventListener("mousemove", this.onPanMove);
    window.removeEventListener("mouseup", this.onPanEnd);
  },
};
</script>

<style scoped>
.target-shelf {
  filter: drop-shadow(0 0 16px rgba(220, 38, 38, 0.6));
}
.target-pulse {
  animation: shelf-pulse 1.4s ease-in-out infinite;
  transform-origin: center;
}
@keyframes shelf-pulse {
  0%, 100% {
    opacity: 0.7;
    stroke-width: 6;
  }
  50% {
    opacity: 0.15;
    stroke-width: 20;
  }
}

/* 선반 그리드 모드의 대상 선반 강조 펄스 */
.target-shelf-grid {
  animation: shelf-grid-pulse 1.4s ease-in-out infinite;
  filter: drop-shadow(0 0 14px rgba(220, 38, 38, 0.55));
}
@keyframes shelf-grid-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(220, 38, 38, 0.18);
  }
}
</style>
