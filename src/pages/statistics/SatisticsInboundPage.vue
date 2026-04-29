<template>
  <div class="p-4 lg:p-6 bg-[#f8fafc] min-h-screen space-y-4 lg:space-y-6">
    <!-- 1. KPI SUMMARY -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 총 구매 수량 -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">총 구매 수량</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-blue-600">{{ formatNumber(summary?.total_qty) }}</span>
              <span class="text-slate-400 text-sm font-normal">개</span>
            </div>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <i class="fa-solid fa-box text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 총 구매 금액 -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">총 구매 금액</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-emerald-600">{{ formatNumber(summary?.total_cost) }}</span>
              <span class="text-slate-400 text-sm font-normal">원</span>
            </div>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <i class="fa-solid fa-coins text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 구매 건수 -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">구매 건수</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-slate-700">{{ formatNumber(summary?.count) }}</span>
              <span class="text-slate-400 text-sm font-normal">건</span>
            </div>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors">
            <i class="fa-solid fa-clipboard-list text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MAIN LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT : 검색 + 테이블 -->
      <div class="lg:col-span-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-blue-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-base">구매 통계 상세</span>
            </div>
            <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">Update Real-time</span>
          </div>

          <div class="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-end gap-3">
            <div class="flex-1 min-w-[280px]">
              <label class="text-[11px] font-bold text-slate-400 mb-1.5 px-1 flex items-center gap-1">
                <i class="fa-solid fa-calendar-days text-[10px]"></i> 기간 선택
              </label>
              <DateRangePicker
                v-model="dateRange"
                mode="date"
                :showQuickButtons="true"
                @change="searchData"
              />
            </div>

            <div class="w-[180px]">
              <label class="text-[11px] font-bold text-slate-400 mb-1.5 px-1 flex items-center gap-1">
                <i class="fa-solid fa-tag text-[10px]"></i> 품목 필터
              </label>
              <SearchSelect
                v-model="where.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
                placeholder="전체 품목"
                @change="searchData"
              />
            </div>

            <div class="flex items-center gap-1">
              <input v-model="set.date" type="date" class="field w-[140px]" />
              <button @click="setData" class="btn btn-primary">
                <i class="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>

          <div class="p-4 overflow-auto flex-1 max-h-[500px]">
            <BaseTable :columns="columns" :rows="rows" sortable />
          </div>
        </div>
      </div>

      <!-- RIGHT : CHART -->
      <div class="lg:col-span-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-base">구매 금액 추이 (Spline)</span>
            </div>
          </div>

          <div class="p-6 flex-1 min-h-[500px]">
            <div class="w-full h-full bg-slate-50/30 rounded-xl p-4 relative">
              <Chart
                v-if="chartRows.length > 0"
                :rows="chartRows"
                :start="dateRange.start"
                :end="dateRange.end"
                name="구매금액"
                column="total_cost"
                type="line"
                :smooth="true"
                class="w-full h-full"
              />
              <div
                v-else
                class="absolute inset-0 flex flex-col items-center justify-center text-slate-300"
              >
                <i class="fa-solid fa-chart-line text-5xl mb-4 opacity-20"></i>
                <p class="text-sm font-medium">조회된 차트 데이터가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import Chart from "@/components/base/chart/Chart.vue";
import { createStatisticsMixin } from "@/mixins/statistics";

export default {
  name: "InboundStatPage",
  components: { BaseTable, SearchSelect, DateRangePicker, Chart },

  mixins: [
    createStatisticsMixin({
      listEndpoint: "/api/stat/inboundList",
      chartEndpoint: "/api/stat/inbound/daily/totalAmount",
      setEndpoint: "/api/stat/inbound/daily",
      summaryFields: ["total_qty", "total_cost"],
    }),
  ],

  data() {
    return {
      columns: [
        { key: "date", label: "날짜", type: "string", width: "130px", align: "center", sortable: true },
        { key: "material_name", label: "품목", width: "auto", align: "left", sortable: true },
        { key: "total_qty", label: "구매 수량", type: "number", width: "120px", align: "right", sortable: true },
        { key: "total_cost", label: "구매 금액", type: "currency", width: "150px", align: "right", sortable: true },
      ],
    };
  },
};
</script>

<style scoped>
:deep(.base-table) {
  font-size: 0.875rem;
}
:deep(.base-table th) {
  @apply text-slate-500 font-semibold bg-slate-50/50 py-4;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
