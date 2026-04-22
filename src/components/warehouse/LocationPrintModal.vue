<template>
  <div class="print-area bg-white text-gray-800 p-6">
    <!-- 헤더 -->
    <div class="flex justify-between items-end border-b pb-3 mb-4">
      <div>
        <div class="flex items-center gap-2 text-xl font-bold">
          <i class="fa-solid fa-map-location-dot text-indigo-600"></i>
          위치 도면
        </div>
        <div class="mt-1 text-sm text-gray-600">
          <span class="font-semibold">{{ warehouse?.name || "-" }}</span>
          <span v-if="warehouse?.code" class="text-gray-400 ml-1">
            ({{ warehouse.code }})
          </span>
        </div>
      </div>
      <div class="text-xs text-gray-500">
        <BaseDateText :value="now" show-time />
      </div>
    </div>

    <!-- 도면 SVG -->
    <div class="border border-gray-300 rounded-md overflow-hidden bg-white">
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        class="w-full h-auto block"
        style="max-height: 55vh"
      >
        <!-- 창고 외곽선 -->
        <polygon
          v-if="warehouse?.points?.length"
          :points="pointsToString(warehouse.points)"
          :transform="warehouseTransform"
          fill="#f8fafc"
          stroke="#94a3b8"
          stroke-width="3"
          stroke-dasharray="8 4"
        />

        <!-- 각 위치 -->
        <g v-for="(loc, idx) in locations" :key="loc.id">
          <polygon
            :points="pointsToString(loc.points)"
            :fill="loc.color || colorByIndex(idx)"
            fill-opacity="0.85"
            stroke="#1e293b"
            stroke-width="1.5"
            :transform="shapeTransform(loc)"
          />
          <text
            :x="getCenter(loc.points).x"
            :y="getCenter(loc.points).y - 8"
            text-anchor="middle"
            dominant-baseline="middle"
            class="font-bold"
            style="font-size: 14px; fill: #fff; paint-order: stroke; stroke: #1e293b; stroke-width: 3px; stroke-linejoin: round"
            :transform="shapeTransform(loc)"
          >
            {{ loc.name || loc.code }}
          </text>
          <text
            :x="getCenter(loc.points).x"
            :y="getCenter(loc.points).y + 10"
            text-anchor="middle"
            dominant-baseline="middle"
            style="font-size: 10px; fill: #fff; paint-order: stroke; stroke: #1e293b; stroke-width: 2.5px; stroke-linejoin: round"
            :transform="shapeTransform(loc)"
          >
            {{ loc.code }}
          </text>
        </g>
      </svg>
    </div>

    <!-- 위치 목록 -->
    <div class="mt-5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <i class="fa-solid fa-list text-indigo-500"></i>
          위치 목록
        </h3>
        <span class="text-xs text-gray-500">총 {{ locations.length }}개</span>
      </div>

      <table class="w-full text-xs border-t-2 border-gray-300">
        <thead>
          <tr class="border-b border-gray-300 text-gray-600">
            <th class="py-2 px-2 text-left w-10">#</th>
            <th class="py-2 px-2 text-left w-14">색상</th>
            <th class="py-2 px-2 text-left">위치 코드</th>
            <th class="py-2 px-2 text-left">위치 이름</th>
            <th class="py-2 px-2 text-right w-20">회전(°)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(loc, idx) in locations"
            :key="loc.id"
            class="border-b border-gray-100"
          >
            <td class="py-1.5 px-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
            <td class="py-1.5 px-2">
              <span
                class="inline-block w-5 h-5 rounded border border-gray-300 align-middle"
                :style="{
                  backgroundColor: loc.color || colorByIndex(idx),
                }"
              ></span>
            </td>
            <td class="py-1.5 px-2 font-mono text-gray-700">
              {{ loc.code || "-" }}
            </td>
            <td class="py-1.5 px-2 text-gray-800">{{ loc.name || "-" }}</td>
            <td class="py-1.5 px-2 text-right text-gray-600 font-mono">
              {{ Number(loc.rotation || 0).toFixed(0) }}
            </td>
          </tr>
          <tr v-if="!locations.length">
            <td colspan="5" class="py-6 text-center text-gray-400">
              등록된 위치가 없습니다
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex justify-end gap-2 mt-6 no-print">
      <button @click="print" class="btn btn-primary">
        <i class="fa-solid fa-print"></i>
        프린트
      </button>
      <button @click="modal.closeModal()" class="btn">
        <i class="fa-solid fa-xmark"></i>
        닫기
      </button>
    </div>
  </div>
</template>

<script>
import { useModalStore } from "@/stores/modal";
import BaseDateText from "@/components/base/BaseDateText.vue";

export default {
  name: "LocationPrintModal",

  components: { BaseDateText },

  props: {
    warehouse: { type: Object, default: () => ({}) },
    locations: { type: Array, default: () => [] },
  },

  data() {
    return {
      modal: useModalStore(),
      now: new Date(),
      palette: [
        "#6366f1",
        "#0ea5e9",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#f97316",
        "#64748b",
      ],
    };
  },

  computed: {
    // 창고 외곽선 회전 변환
    warehouseTransform() {
      if (!this.warehouse?.points?.length) return "";
      const rot = Number(this.warehouse.rotation) || 0;
      if (!rot) return "";
      const c = this.getCenter(this.warehouse.points);
      return `rotate(${rot} ${c.x} ${c.y})`;
    },
  },

  methods: {
    // 포인트 배열을 SVG 문자열로 변환한다
    pointsToString(p) {
      if (!Array.isArray(p)) return "";
      return p.map((v) => `${v.x},${v.y}`).join(" ");
    },
    // 다각형 중심 좌표를 계산한다
    getCenter(p) {
      if (!Array.isArray(p) || !p.length) return { x: 0, y: 0 };
      return {
        x: p.reduce((a, b) => a + b.x, 0) / p.length,
        y: p.reduce((a, b) => a + b.y, 0) / p.length,
      };
    },
    // 위치 shape의 회전 transform 문자열을 생성한다
    shapeTransform(shape) {
      const rot = Number(shape?.rotation) || 0;
      if (!rot) return "";
      const c = this.getCenter(shape.points);
      return `rotate(${rot} ${c.x} ${c.y})`;
    },
    // 색상 미지정 시 팔레트에서 순차 색상을 반환한다
    colorByIndex(i) {
      return this.palette[i % this.palette.length];
    },
    // 브라우저 프린트 다이얼로그를 호출한다
    print() {
      window.print();
    },
  },
};
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .print-area,
  .print-area * {
    visibility: visible;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none !important;
    border: none !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
