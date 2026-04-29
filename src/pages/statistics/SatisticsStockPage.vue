<template>
  <div class="p-4 lg:p-6 bg-[#f8fafc] min-h-screen space-y-4 lg:space-y-6">
    <!-- 1. KPI SUMMARY -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">총 재고 수량</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-blue-600">{{ formatNumber(summary?.total_qty) }}</span>
              <span class="text-slate-400 text-sm font-normal">개</span>
            </div>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <i class="fa-solid fa-box-open text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">재고 품목 건수</p>
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
      <div class="lg:col-span-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-blue-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-base">재고 통계 상세</span>
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
                <i class="fa-solid fa-bolt"></i> 생성
              </button>
            </div>
          </div>

          <div class="p-4 overflow-auto flex-1 max-h-[500px]">
            <BaseTable :columns="columns" :rows="rows" sortable />
          </div>
        </div>
      </div>

      <div class="lg:col-span-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-base">재고 변동 추이 (Spline)</span>
            </div>
          </div>

          <div class="p-6 flex-1 max-h-[500px]">
            <div class="w-full h-full bg-slate-50/30 rounded-xl p-4 relative">
              <Chart
                v-if="chartRows.length > 0"
                :rows="chartRows"
                :start="dateRange.start"
                :end="dateRange.end"
                name="재고수량"
                column="total_qty"
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
  name: "StockStatPage",
  components: { BaseTable, SearchSelect, DateRangePicker, Chart },

  mixins: [
    createStatisticsMixin({
      listEndpoint: "/api/stat/stockList",
      chartEndpoint: "/api/stat/stock/daily/totalQty",
      setEndpoint: "/api/stat/stock/daily",
      // 재고는 row.quantity 를 summary.total_qty 로 합산해야 해서 setSummary 를 override
      summaryFields: [],
      initialWhere: { material_id: "", warehouse_id: "" },
    }),
  ],

  data() {
    return {
      columns: [
        { key: "date", label: "날짜", type: "string", width: "120px", align: "center", sortable: true },
        { key: "material_name", label: "품목명", width: "auto", align: "left", sortable: true },
        { key: "warehouse_name", label: "보관 창고", width: "180px", align: "left", sortable: true },
        { key: "quantity", label: "수량", type: "number", width: "100px", align: "right", sortable: true },
      ],
    };
  },

  methods: {
    // row.quantity 를 summary.total_qty 로 매핑 (필드명 alias)
    setSummary(rows = []) {
      const total_qty = rows.reduce(
        (acc, row) => acc + Number(row.quantity || 0),
        0,
      );
      this.summary = { total_qty, count: rows.length };
    },
  },
};
</script>

<style scoped>
:deep(.base-table) {
  font-size: 0.875rem;
}
:deep(.base-table th) {
  @apply text-slate-500 font-semibold bg-slate-50/50;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
