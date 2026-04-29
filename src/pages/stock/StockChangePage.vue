<template>
  <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full p-4 lg:p-6 bg-gray-50/50 text-slate-800">
    <aside
      class="w-full lg:w-1/5 bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex flex-col gap-6"
    >
      <div>
        <h3
          class="flex items-center gap-2 text-base font-bold text-gray-800 mb-6"
        >
          <i class="fa-solid fa-magnifying-glass text-blue-500"></i>
          재고 필터링
        </h3>

        <div class="space-y-5">
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider"
              >조회 기간</label
            >
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              class="w-full"
              @change="loadData"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider"
              >품목 그룹</label
            >
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="전체 품목 보기"
              @change="loadData"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider"
              >직접 검색</label
            >
            <input
              v-model="where.searchText"
              placeholder="품목명 또는 코드를 입력..."
              class="field"
              @keyup.enter="loadData"
            />
          </div>
        </div>
      </div>

      <div class="mt-auto">
        <button
          @click="loadData"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-rotate text-sm"></i>
          데이터 새로고침
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col gap-6">
      <header
        class="bg-white border border-gray-200 shadow-sm rounded-2xl px-6 py-4 flex justify-between items-center"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-50 rounded-xl">
            <i class="fa-solid fa-chart-line text-blue-600 text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-800 leading-tight">
              재고 변동 추이
            </h2>
            <p class="text-sm text-gray-400 mt-0.5">
              선택한 기간 동안의 품목별 흐름을 한눈에 확인하세요.
            </p>
          </div>
        </div>
      </header>

      <section
        class="flex-1 bg-white border border-gray-200 shadow-sm rounded-2xl p-6 relative min-h-0 overflow-hidden"
      >
        <v-chart
          v-if="series.length > 0"
          :option="chartOption"
          autoresize
          class="w-full h-full"
        />

        <div
          v-else
          class="w-full h-full flex flex-col items-center justify-center text-center"
        >
          <div
            class="w-64 h-64 mb-6 bg-gray-50 rounded-full flex items-center justify-center"
          >
            <i class="fa-solid fa-box-open text-gray-200 text-8xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-700 mb-2">
            조회된 데이터가 없습니다
          </h3>
          <p class="text-gray-400 max-w-sm">
            설정하신 필터 조건에 맞는 재고 변동 내역이 없습니다.<br />
            기간을 변경하거나 다른 품목을 선택해 보세요.
          </p>
          <button
            @click="resetFilters"
            class="mt-6 text-blue-600 font-semibold hover:underline"
          >
            필터 초기화하기
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import { todayRange } from "@/utils/date";
import api from "@/api/api";

export default {
  name: "StockChangePage",
  components: { DateRangePicker, SearchSelect },

  data() {
    return {
      dateRange: todayRange(),
      where: { material_id: "", searchText: "" },
      materials: [],
      labels: [],
      series: [],
      chartData: null,
    };
  },

  computed: {
    // 재고 흐름 라인 차트의 ECharts 옵션을 반환한다
    chartOption() {
      const colorPalette = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
      ];
      return {
        color: colorPalette,
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 12,
          padding: 12,
          borderWidth: 0,
          extraCssText: "box-shadow: 0 4px 20px rgba(0,0,0,0.08);",
        },
        legend: { type: "scroll", bottom: 0, icon: "circle" },
        grid: {
          top: "8%",
          left: "3%",
          right: "3%",
          bottom: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.labels,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#E5E7EB" } },
          axisLabel: { color: "#9CA3AF" },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#F3F4F6" } },
          axisLabel: { color: "#9CA3AF" },
        },
        series: this.series.map((s) => ({
          ...s,
          type: "line",
          smooth: 0.35,
          symbolSize: 6,
          showSymbol: false,
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.04 },
          emphasis: { focus: "series" },
          connectNulls: true,
        })),
      };
    },
  },

  methods: {
    // 품목 선택 옵션을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    // 기간 조건으로 재고 변동 이력을 로드하고 차트를 빌드한다
    async loadData() {
      const where = { ...this.where };
      if (this.dateRange?.start)
        where.startDate = this.dateRange.start.toISOString();
      if (this.dateRange?.end) where.endDate = this.dateRange.end.toISOString();

      const res = await api.post("/api/stock/detailList", where);
      this.chartData = res.data;
      this.buildChart();
    },

    // 로드된 데이터를 기간 라벨과 품목별 series로 가공한다
    buildChart() {
      if (!this.chartData?.length) {
        this.labels = [];
        this.series = [];
        return;
      }

      const start = new Date(this.dateRange.start);
      const end = new Date(this.dateRange.end);
      const labels = [];
      const current = new Date(start);

      while (current <= end) {
        labels.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }

      const map = {};
      this.chartData.forEach((row) => {
        const date = row.created_at.slice(0, 10);
        const name = row.material_name;
        if (!map[name]) map[name] = {};
        map[name][date] = row.after_qty;
      });

      this.labels = labels;
      this.series = Object.keys(map).map((name) => ({
        name,
        data: labels.map((d) => map[name][d] ?? 0),
      }));
    },

    // 기간을 이번달로 초기화하고 품목 필터를 비운다
    resetFilters() {
      const now = new Date();
      this.dateRange = {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
      this.where.material_id = "";
      this.where.searchText = "";
      this.loadData();
    },
  },

  // 마운트 시 필터 초기화와 품목 로드를 수행한다
  mounted() {
    this.resetFilters();
    this.loadMaterial();
  },
};
</script>

<style scoped>
/* 커스텀 스크롤바 (필요 시) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
