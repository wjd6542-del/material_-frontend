<template>
  <div class="p-4 lg:p-6 space-y-4 lg:space-y-6 bg-gray-50/50 min-h-screen font-sans text-gray-900">
    <!-- 1. 상단 물류 KPI 섹션 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      <div
        v-for="(v, k) in kpiConfig"
        :key="k"
        class="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border-l-4"
        :class="v.border"
      >
        <div class="flex justify-between items-start">
          <div>
            <p
              class="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight"
            >
              {{ v.label }}
            </p>
            <h3 class="text-2xl font-black tabular-nums" :class="v.text">
              {{ formatNumber(summary[v.key]) }}
            </h3>
          </div>
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl text-lg shadow-inner"
            :class="[v.bg, v.iconColor]"
          >
            <i :class="v.icon"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 재무 현황 카드 (수익, 지출, 순수익) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 총 수익 -->
      <div
        class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg shadow-blue-200 text-white relative overflow-hidden"
      >
        <div class="relative z-10">
          <p
            class="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest"
          >
            Monthly Revenue
          </p>
          <p class="text-sm opacity-80 mb-2">이번달 총 수익</p>
          <h2 class="text-3xl font-black tabular-nums font-mono">
            ₩ {{ formatNumber(summary.month_sales) }}
          </h2>
        </div>
        <i
          class="fa-solid fa-coins absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12"
        ></i>
      </div>

      <!-- 총 지출 -->
      <div
        class="bg-white border-2 border-red-50 rounded-2xl p-6 shadow-sm relative overflow-hidden"
      >
        <div class="relative z-10">
          <p
            class="text-red-400 text-xs font-bold mb-1 uppercase tracking-widest"
          >
            Monthly Expense
          </p>
          <p class="text-gray-500 text-sm mb-2">이번달 총 지출</p>
          <h2 class="text-3xl font-black text-gray-900 tabular-nums font-mono">
            ₩ {{ formatNumber(summary.month_expense) }}
          </h2>
        </div>
        <div
          class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500"
        >
          <i class="fa-solid fa-receipt text-xl"></i>
        </div>
      </div>

      <!-- 순수익 (계산 로직 포함) -->
      <div
        class="bg-white border-2 rounded-2xl p-6 shadow-sm relative overflow-hidden"
        :class="
          summary.month_sales - summary.month_expense >= 0
            ? 'border-green-100'
            : 'border-orange-100'
        "
      >
        <div class="relative z-10">
          <p
            class="text-xs font-bold mb-1 uppercase tracking-widest"
            :class="
              summary.month_sales - summary.month_expense >= 0
                ? 'text-green-500'
                : 'text-orange-500'
            "
          >
            Net Profit
          </p>
          <p class="text-gray-500 text-sm mb-2">이번달 예상 순수익</p>
          <h2
            class="text-3xl font-black tabular-nums font-mono"
            :class="
              summary.month_sales - summary.month_expense >= 0
                ? 'text-green-600'
                : 'text-orange-600'
            "
          >
            ₩
            {{ formatNumber(summary.month_sales - summary.month_expense) }}
          </h2>
        </div>
        <div
          class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
          :class="
            summary.month_sales - summary.month_expense >= 0
              ? 'bg-green-50 text-green-500'
              : 'bg-orange-50 text-orange-500'
          "
        >
          <i class="fa-solid fa-sack-dollar text-xl"></i>
        </div>
      </div>
    </div>

    <!-- 3. 물류 추이 분석 차트 (여백 최소화) -->
    <div class="bg-white rounded-2xl shadow-sm border p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          <span class="font-black text-gray-800"
            >물류 추이 분석 (이번 달 1일 ~ 오늘)</span
          >
        </div>
        <div class="flex gap-4 px-2 text-[11px] font-bold text-gray-500">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> 구매
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-green-500 rounded-full"></span> 판매
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span> 반품
          </div>
        </div>
      </div>
      <div class="relative w-full h-80">
        <v-chart :option="lineChart" autoresize />
      </div>
    </div>

    <!-- 4. 하단 상세 데이터 섹션 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 부족 재고 리스트 -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-red-100 p-5 flex flex-col"
      >
        <div
          class="flex items-center justify-between mb-4 font-black text-red-600 border-b border-red-50 pb-3 text-sm"
        >
          <span
            ><i class="fa-solid fa-triangle-exclamation mr-1"></i> 부족 재고
            경보</span
          >
          <span class="text-xs bg-red-100 px-2 py-0.5 rounded-full"
            >{{ lowStocks.length }}건</span
          >
        </div>
        <div class="flex-1 space-y-2 overflow-y-auto max-h-64 pr-1">
          <div
            v-for="item in lowStocks"
            :key="item.material_id"
            class="flex justify-between items-center p-3 bg-red-50/30 rounded-xl border border-red-50"
          >
            <span class="text-sm font-bold text-gray-700">{{
              item.material_name
            }}</span>
            <div class="text-right">
              <span
                class="text-lg font-black text-red-600 tabular-nums font-mono"
                >{{ formatNumber(item.stock) }}</span
              >
              <span class="ml-1 text-[10px] text-gray-400"
                >/ {{ item.safety_stock }}</span
              >
            </div>
          </div>
          <div
            v-if="lowStocks.length === 0"
            class="flex flex-col items-center justify-center py-12 px-4 text-center group"
          >
            <div class="mb-4 relative">
              <div
                class="absolute inset-0 bg-green-100 rounded-full scale-110 blur-sm opacity-50 group-hover:scale-125 transition-transform duration-500"
              ></div>
              <div
                class="relative bg-white border-2 border-green-400 w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
              >
                <i
                  class="fa-solid fa-check-double text-green-500 text-2xl animate-bounce"
                ></i>
              </div>
            </div>

            <h4 class="text-sm font-black text-gray-800 mb-1">
              모든 재고가 충분합니다
            </h4>
            <p class="text-[11px] text-gray-400 font-medium leading-relaxed">
              현재 안전 재고 이하로 떨어진 품목이 없습니다.<br />
              현황이 완벽하게 유지되고 있네요!
            </p>

            <div class="mt-4 flex gap-1">
              <span class="w-1 h-1 rounded-full bg-green-200"></span>
              <span class="w-3 h-1 rounded-full bg-green-400"></span>
              <span class="w-1 h-1 rounded-full bg-green-200"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 최근 시스템 로그 -->
      <div
        v-if="auth.hasPermission('log.view')"
        class="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5 flex flex-col"
      >
        <div
          class="font-black text-gray-800 mb-4 border-b pb-3 flex items-center gap-2 text-sm"
        >
          <div class="w-1.5 h-5 bg-gray-800 rounded-full"></div>
          최근 시스템 로그
        </div>
        <div class="flex-1 space-y-1 overflow-y-auto max-h-64">
          <div
            v-for="log in logs"
            :key="log.id"
            class="grid grid-cols-12 gap-2 items-center p-2.5 hover:bg-gray-50 rounded-lg text-xs border-b border-gray-50 last:border-0 transition-colors"
          >
            <div class="col-span-2 font-bold text-gray-600 truncate">
              {{ log.user?.name || "시스템" }}
            </div>
            <div class="col-span-2 text-center">
              <span
                :class="getActionClass(log.action)"
                class="px-2 py-0.5 rounded-md font-black text-[9px]"
                >{{ log.action }}</span
              >
            </div>
            <div class="col-span-5 text-gray-500 truncate">
              {{ log.target_type }} 관련 작업 수행
            </div>
            <div
              class="col-span-3 text-right text-gray-400 font-mono tracking-tighter"
            >
              <BaseDateText :value="log.created_at" show-time />
            </div>
          </div>
          <div
            v-if="logs.length === 0"
            class="py-10 text-center text-gray-300 text-xs font-bold uppercase tracking-widest"
          >
            No Recent Logs
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
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

import { useAuthStore } from "@/stores/auth";
import BaseDateText from "@/components/base/BaseDateText.vue";

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
  components: { "v-chart": VueECharts, BaseDateText },
  data() {
    return {
      auth: useAuthStore(),
      summary: {
        today_inbound: 0,
        today_outbound: 0,
        today_returns: 0,
        today_transfers: 0,
        total_stock: 0,
        month_sales: 0,
        month_expense: 0,
      },
      inboundChart: [],
      outboundChart: [],
      returnChart: [],
      lowStocks: [],
      logs: [],
      kpiConfig: {
        in: {
          label: "오늘 구매",
          key: "today_inbound",
          border: "border-l-blue-500",
          text: "text-blue-600",
          bg: "bg-blue-50",
          iconColor: "text-blue-500",
          icon: "fa-solid fa-arrow-down",
        },
        out: {
          label: "오늘 판매",
          key: "today_outbound",
          border: "border-l-green-500",
          text: "text-green-600",
          bg: "bg-green-50",
          iconColor: "text-green-500",
          icon: "fa-solid fa-arrow-up",
        },
        ret: {
          label: "오늘 반품",
          key: "today_returns",
          border: "border-l-red-500",
          text: "text-red-600",
          bg: "bg-red-50",
          iconColor: "text-red-500",
          icon: "fa-solid fa-rotate-left",
        },
        tra: {
          label: "오늘 재고 이동",
          key: "today_transfers",
          border: "border-l-orange-500",
          text: "text-orange-600",
          bg: "bg-orange-50",
          iconColor: "text-orange-500",
          icon: "fa-solid fa-truck-fast",
        },
        tot: {
          label: "현재 총 재고",
          key: "total_stock",
          border: "border-l-purple-500",
          text: "text-purple-600",
          bg: "bg-purple-50",
          iconColor: "text-purple-500",
          icon: "fa-solid fa-boxes-stacked",
        },
      },
    };
  },
  computed: {
    // 이번 달 1일~오늘까지의 날짜별 입/출/반품 수량 배열 (없는 날짜는 0)
    filledChartData() {
      const now = new Date();
      const monthStr = String(now.getMonth() + 1).padStart(2, "0");
      const todayDate = now.getDate();

      const inboundMap = Object.fromEntries(
        (this.inboundChart || []).map((v) => [v.date, v.qty]),
      );
      const outboundMap = Object.fromEntries(
        (this.outboundChart || []).map((v) => [v.date, v.qty]),
      );
      const returnMap = Object.fromEntries(
        (this.returnChart || []).map((v) => [v.date, v.qty]),
      );

      const labels = [];
      const inValues = [];
      const outValues = [];
      const returnValues = [];

      for (let i = 1; i <= todayDate; i++) {
        const dayStr = String(i).padStart(2, "0");
        const dateKey = `${monthStr}-${dayStr}`;
        labels.push(`${dayStr}일`);
        inValues.push(inboundMap[dateKey] || 0);
        outValues.push(outboundMap[dateKey] || 0);
        returnValues.push(returnMap[dateKey] || 0);
      }
      return { labels, inValues, outValues, returnValues };
    },

    // 입/출/반품 라인 차트의 ECharts 옵션을 반환한다
    lineChart() {
      const { labels, inValues, outValues, returnValues } =
        this.filledChartData;

      return {
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          textStyle: { color: "#333", fontSize: 12 },
          borderWidth: 1,
          borderColor: "#eee",

          // 🔥 핵심: 색상 맞춤
          formatter: (params) => {
            let html = `<div style="font-weight:600;margin-bottom:6px;">${params[0].axisValue}</div>`;

            params.forEach((p) => {
              html += `
            <div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="
                display:inline-block;
                width:8px;
                height:8px;
                border-radius:50%;
                background:${p.color};
              "></span>
              <span>${p.seriesName}</span>
              <span style="margin-left:auto;font-weight:600;">
                ${p.value ?? 0}
              </span>
            </div>
          `;
            });

            return html;
          },
        },

        legend: { show: false },

        grid: {
          top: "5%",
          left: "1%",
          right: "2%",
          bottom: "2%",
          containLabel: true,
        },

        xAxis: {
          type: "category",
          boundaryGap: false,
          data: labels,
          axisLine: { lineStyle: { color: "#f0f0f0" } },
          axisLabel: { color: "#999", fontSize: 11, margin: 12 },
        },

        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f5f5f5" } },
          axisLabel: { color: "#ccc", fontSize: 10 },
        },

        series: [
          {
            name: "구매",
            type: "line",
            smooth: 0.4,
            showSymbol: false,
            itemStyle: { color: "#3b82f6" }, // 🔥 추가 (툴팁/포인트 색 통일)
            lineStyle: { width: 3, color: "#3b82f6" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(59, 130, 246, 0.2)" },
                { offset: 1, color: "rgba(59, 130, 246, 0)" },
              ]),
            },
            data: inValues,
          },

          {
            name: "판매",
            type: "line",
            smooth: 0.4,
            showSymbol: false,
            itemStyle: { color: "#22c55e" },
            lineStyle: { width: 3, color: "#22c55e" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(34, 197, 94, 0.2)" },
                { offset: 1, color: "rgba(34, 197, 94, 0)" },
              ]),
            },
            data: outValues,
          },

          {
            name: "반품",
            type: "line",
            smooth: 0.4,
            showSymbol: false,
            itemStyle: { color: "#ef4444" },
            lineStyle: { width: 3, color: "#ef4444" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(239, 68, 68, 0.2)" },
                { offset: 1, color: "rgba(239, 68, 68, 0)" },
              ]),
            },
            data: returnValues,
          },
        ],
      };
    },
  },
  methods: {
    // 대시보드 종합 데이터를 로드한다
    async loadData() {
      try {
        const { data } = await api.post("/api/dashboard/dashboard");
        if (!data) return;
        this.summary = { ...this.summary, ...(data.summary || {}) };
        this.inboundChart = data.inbound_chart || [];
        this.outboundChart = data.outbound_chart || [];
        this.returnChart = data.return_chart || [];
        this.lowStocks = data.low_stock || [];
        this.logs = data.logs || [];
      } catch (e) {
        this.$toast?.error?.("대시보드 데이터를 불러오지 못했습니다.");
      }
    },
    // 숫자를 천단위 구분자 문자열로 포맷팅한다
    formatNumber(v) {
      return new Intl.NumberFormat().format(v || 0);
    },
// 처리 구분별 배지 색상 클래스를 반환한다
    getActionClass(a) {
      const m = {
        구매: "bg-blue-100 text-blue-700",
        판매: "bg-green-100 text-green-700",
        반품: "bg-red-100 text-red-700",
        이동: "bg-orange-100 text-orange-700",
      };
      return m[a] || "bg-gray-100 text-gray-500";
    },
  },
  // 마운트 시 대시보드 데이터를 로드한다
  mounted() {
    this.loadData();
  },
};
</script>

<style scoped>
/* 스크롤바 커스텀: 전체적인 UI 톤앤매너에 맞춤 */
::-webkit-scrollbar {
  width: 5px;
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

/* KPI 카드 애니메이션 효과 */
.kpi-card:hover {
  transform: translateY(-2px);
}
</style>
