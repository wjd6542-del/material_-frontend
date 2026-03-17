<template>
  <div class="p-6 space-y-6">
    <!-- KPI -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 오늘 입고 -->
      <div class="kpi-card flex items-center justify-between">
        <div>
          <div class="kpi-title">오늘 입고</div>
          <div class="kpi-value text-blue-600">
            {{ formatNumber(summary.today_inbound) }}
          </div>
        </div>

        <div class="kpi-icon bg-blue-100 text-blue-600">
          <i class="fa-solid fa-truck-ramp-box"></i>
        </div>
      </div>

      <!-- 오늘 출고 -->
      <div class="kpi-card flex items-center justify-between">
        <div>
          <div class="kpi-title">오늘 출고</div>
          <div class="kpi-value text-green-600">
            {{ formatNumber(summary.today_outbound) }}
          </div>
        </div>

        <div class="kpi-icon bg-green-100 text-green-600">
          <i class="fa-solid fa-dolly"></i>
        </div>
      </div>

      <!-- 총 재고 -->
      <div class="kpi-card flex items-center justify-between">
        <div>
          <div class="kpi-title">총 재고</div>
          <div class="kpi-value text-purple-600">
            {{ formatNumber(summary.total_stock) }}
          </div>
        </div>

        <div class="kpi-icon bg-purple-100 text-purple-600">
          <i class="fa-solid fa-boxes-stacked"></i>
        </div>
      </div>

      <!-- 오늘 매출 -->
      <div class="kpi-card flex items-center justify-between">
        <div>
          <div class="kpi-title">오늘 매출</div>
          <div class="kpi-value text-orange-600">
            {{ formatNumber(summary.today_sales) }}
          </div>
        </div>

        <div class="kpi-icon bg-orange-100 text-orange-600">
          <i class="fa-solid fa-coins"></i>
        </div>
      </div>
    </div>

    <!-- 입출고 차트 -->
    <div class="bg-white border rounded-xl shadow-sm p-5">
      <div class="flex items-center gap-2 mb-4">
        <i class="fa-solid fa-chart-line text-blue-500"></i>
        <span class="font-semibold">입출고 추이 (최근 30일)</span>
      </div>

      <v-chart :option="inboundOutboundChart" autoresize class="h-80" />
    </div>

    <!-- 하단 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 재고 TOP -->
      <div class="bg-white border rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-2 mb-4">
          <i class="fa-solid fa-box text-blue-500"></i>
          <span class="font-semibold">재고 TOP 10</span>
        </div>

        <v-chart :option="topStockChart" autoresize class="h-64" />
      </div>

      <!-- 부족 재고 -->
      <div class="bg-white border rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-2 mb-4">
          <i class="fa-solid fa-triangle-exclamation text-red-500"></i>
          <span class="font-semibold">부족 재고</span>
        </div>

        <table class="w-full text-sm">
          <thead class="text-gray-500 border-b">
            <tr>
              <th class="text-left py-2">자재</th>
              <th class="text-right">재고</th>
              <th class="text-right">안전재고</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in lowStocks"
              :key="item.material_id"
              class="border-b"
            >
              <td class="py-2">
                {{ item.material_name }}
              </td>

              <td class="text-right text-red-600 font-semibold">
                {{ item.stock }}
              </td>

              <td class="text-right">
                {{ item.safety_stock }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 최근 로그 -->
    <div class="bg-white border rounded-xl shadow-sm p-5">
      <div class="flex items-center gap-2 mb-4">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span class="font-semibold">최근 작업</span>
      </div>

      <table class="w-full text-sm">
        <thead class="border-b text-gray-500">
          <tr>
            <th class="text-left py-2">사용자</th>
            <th class="text-left">행동</th>
            <th class="text-left">대상</th>
            <th class="text-right">시간</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b">
            <td class="py-2">
              {{ log.user?.name }}
            </td>

            <td>
              {{ log.action }}
            </td>

            <td>
              {{ log.target_type }}
            </td>

            <td class="text-right text-gray-500">
              {{ formatDate(log.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

import VueECharts from "vue-echarts";
import * as echarts from "echarts/core";

import { LineChart, BarChart } from "echarts/charts";

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";

import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export default {
  components: {
    "v-chart": VueECharts,
  },

  data() {
    return {
      summary: {},

      inboundChart: [],
      outboundChart: [],

      topStocks: [],
      lowStocks: [],

      logs: [],
    };
  },

  computed: {
    inboundOutboundChart() {
      return {
        tooltip: {
          trigger: "axis",
        },

        legend: {
          data: ["입고", "출고"],
        },

        xAxis: {
          type: "category",
          data: this.inboundChart.map((v) => v.date),
        },

        yAxis: {
          type: "value",
        },

        series: [
          {
            name: "입고",
            type: "line",
            data: this.inboundChart.map((v) => v.qty),
          },
          {
            name: "출고",
            type: "line",
            data: this.outboundChart.map((v) => v.qty),
          },
        ],
      };
    },

    topStockChart() {
      return {
        tooltip: {},

        xAxis: {
          type: "category",
          data: this.topStocks.map((v) => v.name),
        },

        yAxis: {
          type: "value",
        },

        series: [
          {
            type: "bar",
            data: this.topStocks.map((v) => v.qty),
          },
        ],
      };
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      const res = await api.post("/api/dashboard/dashboard");
      const data = res.data;
      this.summary = data.summary;
      this.inboundChart = data.inbound_chart;
      this.outboundChart = data.outbound_chart;
      this.topStocks = data.top_stock;
      this.lowStocks = data.low_stock;
      this.logs = data.logs;
    },

    formatNumber(v) {
      return new Intl.NumberFormat().format(v || 0);
    },

    formatDate(v) {
      const d = new Date(v);

      return d.toLocaleString();
    },
  },
};
</script>

<style scoped>
.kpi-card {
  @apply bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition;
}

.kpi-title {
  @apply text-xs text-gray-500 mb-1;
}

.kpi-value {
  @apply text-2xl font-bold;
}

.kpi-icon {
  @apply w-12 h-12 flex items-center justify-center rounded-xl text-lg;
}
</style>
