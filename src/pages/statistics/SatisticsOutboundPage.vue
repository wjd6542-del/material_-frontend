<template>
  <div class="p-6 bg-[#f8fafc] min-h-screen space-y-6">
    <!-- 1. KPI SUMMARY (금액 지표 중심 최적화) -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <!-- 총 출고 수량 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <p
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
        >
          총 출고 수량
        </p>
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-blue-600">
            {{ formatNumber(summary?.total_qty) }}
          </h3>
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500"
          >
            <i class="fa-solid fa-boxes-stacked text-lg"></i>
          </div>
        </div>
      </div>

      <!-- 총 원가 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <p
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
        >
          총 원가 금액
        </p>
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-slate-700">
            {{ formatNumber(summary?.total_cost) }}
          </h3>
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500"
          >
            <i class="fa-solid fa-coins text-lg"></i>
          </div>
        </div>
      </div>

      <!-- 총 판매가 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <p
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
        >
          총 판매가
        </p>
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-emerald-600">
            {{ formatNumber(summary?.total_sales) }}
          </h3>
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-500"
          >
            <i class="fa-solid fa-sack-dollar text-lg"></i>
          </div>
        </div>
      </div>

      <!-- 총 순익 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <p
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
        >
          총 순익
        </p>
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-purple-600">
            {{ formatNumber(summary?.total_profit) }}
          </h3>
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-50 text-purple-500"
          >
            <i class="fa-solid fa-chart-line text-lg"></i>
          </div>
        </div>
      </div>

      <!-- 출고 건수 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <p
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
        >
          출고 건수
        </p>
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-slate-800">
            {{ formatNumber(summary?.count) }}
          </h3>
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-white"
          >
            <i class="fa-solid fa-file-invoice text-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MAIN LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT : 검색 + 테이블 -->
      <div class="lg:col-span-6">
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white"
          >
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-blue-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-lg"
                >출고 통계 상세</span
              >
            </div>
          </div>

          <!-- Filter Bar -->
          <div
            class="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-end gap-3"
          >
            <div class="flex-1 min-w-[280px]">
              <label
                class="text-[11px] font-bold text-slate-400 mb-1.5 block px-1"
                >기간 조회</label
              >
              <DateRangePicker
                v-model="dateRange"
                mode="date"
                :showQuickButtons="true"
                @change="searchData"
                class="shadow-sm"
              />
            </div>

            <div class="w-[160px]">
              <label
                class="text-[11px] font-bold text-slate-400 mb-1.5 block px-1"
                >자재 선택</label
              >
              <SearchSelect
                v-model="where.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
                placeholder="전체 자재"
                @change="searchData"
              />
            </div>

            <div
              class="flex items-center gap-0.5 shadow-sm rounded-lg overflow-hidden border border-slate-200 bg-white"
            >
              <input
                v-model="set.date"
                type="date"
                class="px-3 h-[38px] text-sm focus:outline-none border-none w-[135px]"
              />
              <button
                @click="setData"
                class="px-4 h-[38px] bg-slate-800 text-white hover:bg-black transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <i class="fa-solid fa-rotate"></i> 생성
              </button>
            </div>
          </div>

          <!-- Table Content -->
          <div class="p-4 flex-1 max-h-[600px] overflow-auto">
            <BaseTable :columns="columns" :rows="rows" sortable />
          </div>
        </div>
      </div>

      <!-- RIGHT : CHART (금액 추이 시각화) -->
      <div class="lg:col-span-6">
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white"
          >
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-purple-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-lg"
                >출고 금액 변동 추이 (Spline)</span
              >
            </div>
          </div>

          <div class="p-6 flex-1 min-h-[500px]">
            <div class="w-full h-full bg-slate-50/30 rounded-xl p-4 relative">
              <Chart
                v-if="chartRows.length > 0"
                :rows="chartRows"
                :start="dateRange.start"
                :end="dateRange.end"
                name="출고원가"
                column="total_sales"
                type="line"
                :smooth="true"
                class="w-full h-full"
              />
              <div
                v-else
                class="absolute inset-0 flex flex-col items-center justify-center text-slate-300"
              >
                <i class="fa-solid fa-chart-line text-5xl mb-4 opacity-20"></i>
                <p class="text-sm font-medium">조회 데이터가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import Chart from "@/components/base/chart/Chart.vue";
import api from "@/api/api";

export default {
  name: "outboundStatPage",
  components: { BaseTable, SearchSelect, DateRangePicker, BaseInput, Chart },

  data() {
    return {
      columns: [
        {
          key: "date",
          label: "날짜",
          type: "string",
          width: "110px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_name",
          label: "자재",
          width: "auto",
          align: "left",
          sortable: true,
        },
        {
          key: "total_qty",
          label: "수량",
          type: "number",
          width: "90px",
          align: "right",
          sortable: true,
        },
        {
          key: "total_cost",
          label: "원가",
          type: "currency",
          width: "110px",
          align: "right",
          sortable: true,
        },
        {
          key: "total_sales",
          label: "판매가",
          type: "currency",
          width: "110px",
          align: "right",
          sortable: true,
        },
        {
          key: "total_profit",
          label: "순익",
          type: "currency",
          width: "110px",
          align: "right",
          sortable: true,
        },
      ],
      set: { date: new Date().toISOString().substr(0, 10) },
      chartRows: [],
      rows: [],
      summary: {
        total_cost: 0,
        total_qty: 0,
        total_sales: 0,
        total_profit: 0,
        count: 0,
      },
      dateRange: { start: null, end: null },
      where: { material_id: "", startDate: null, endDate: null },
      materials: [],
    };
  },

  methods: {
    formatNumber(val) {
      return Number(val || 0).toLocaleString();
    },

    async setData() {
      if (!this.set.date) {
        this.$toast.error("날짜를 입력하세요");
        return;
      }
      try {
        const res = await api.post("/api/stat/outbound/daily", {
          date: this.set.date,
        });
        if (res.data.count) {
          this.$toast.success(
            `[${this.set.date}] 통계 데이터가 갱신되었습니다.`,
          );
          this.searchData();
        } else {
          this.$toast.error(
            `[${this.set.date}] 동계 데이터가 존재하지 않습니다`,
          );
        }
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    setSummary(data_list = []) {
      this.summary = data_list.reduce(
        (acc, row) => {
          acc.total_qty += Number(row.total_qty || 0);
          acc.total_cost += Number(row.total_cost || 0);
          acc.total_sales += Number(row.total_sales || 0);
          acc.total_profit += Number(row.total_profit || 0);
          return acc;
        },
        {
          total_qty: 0,
          total_cost: 0,
          total_sales: 0,
          total_profit: 0,
          count: data_list.length,
        },
      );
    },

    async loadChartData() {
      const params = this.getParams();
      const res = await api.post(
        "/api/stat/outbound/daily/totalAmount",
        params,
      );
      this.chartRows = res.data;
    },

    async loadList() {
      const params = this.getParams();
      const res = await api.post("/api/stat/outboundList", params);
      this.rows = res.data;
      this.setSummary(res.data);
    },

    getParams() {
      const where = { ...this.where };
      if (this.dateRange?.start)
        where.startDate = this.dateRange.start.toISOString();
      if (this.dateRange?.end) where.endDate = this.dateRange.end.toISOString();
      return where;
    },

    async searchData() {
      await Promise.all([this.loadList(), this.loadChartData()]);
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },
  },

  mounted() {
    const now = new Date();
    this.dateRange = {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
    this.loadMaterial();
    this.searchData();
  },
};
</script>

<style scoped>
:deep(.base-table) {
  font-size: 0.85rem;
}
:deep(.base-table th) {
  @apply text-slate-500 font-semibold bg-slate-50/80 py-3;
}
:deep(.base-table td) {
  @apply py-3;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}
</style>
