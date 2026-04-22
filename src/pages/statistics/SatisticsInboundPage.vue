<template>
  <div class="p-4 lg:p-6 bg-[#f8fafc] min-h-screen space-y-4 lg:space-y-6">
    <!-- 1. KPI SUMMARY (입고 현황 요약) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 총 입고 수량 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">총 입고 수량</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-blue-600">{{
                formatNumber(summary?.total_qty)
              }}</span>
              <span class="text-slate-400 text-sm font-normal">개</span>
            </div>
          </div>
          <div
            class="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors"
          >
            <i class="fa-solid fa-box text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 총 입고 금액 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">총 입고 금액</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-emerald-600">{{
                formatNumber(summary?.total_cost)
              }}</span>
              <span class="text-slate-400 text-sm font-normal">원</span>
            </div>
          </div>
          <div
            class="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
          >
            <i class="fa-solid fa-coins text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 입고 건수 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">입고 건수</p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-slate-700">{{
                formatNumber(summary?.count)
              }}</span>
              <span class="text-slate-400 text-sm font-normal">건</span>
            </div>
          </div>
          <div
            class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors"
          >
            <i class="fa-solid fa-clipboard-list text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MAIN LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT : 검색 + 테이블 (6/12) -->
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
              <span class="font-bold text-slate-800 text-base"
                >입고 통계 상세</span
              >
            </div>
            <span
              class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded"
              >Update Real-time</span
            >
          </div>

          <!-- Search & Action Bar -->
          <div
            class="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-end gap-3"
          >
            <div class="flex-1 min-w-[280px]">
              <label
                class="text-[11px] font-bold text-slate-400 mb-1.5 block px-1 flex items-center gap-1"
              >
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
              <label
                class="text-[11px] font-bold text-slate-400 mb-1.5 block px-1 flex items-center gap-1"
              >
                <i class="fa-solid fa-tag text-[10px]"></i> 자재 필터
              </label>
              <SearchSelect
                v-model="where.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
                placeholder="전체 자재"
                @change="searchData"
              />
            </div>

            <div class="flex items-center gap-1">
              <input
                v-model="set.date"
                type="date"
                class="field w-[140px]"
              />
              <button
                @click="setData"
                class="btn btn-primary"
              >
                <i class="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>

          <!-- Table Content -->
          <div class="p-4 overflow-auto flex-1 max-h-[500px]">
            <BaseTable :columns="columns" :rows="rows" sortable />
          </div>
        </div>
      </div>

      <!-- RIGHT : CHART 영역 (6/12) -->
      <div class="lg:col-span-6">
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white"
          >
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-base"
                >입고 금액 추이 (Spline)</span
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
                name="입고금액"
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
                <p class="text-sm font-medium">
                  조회된 차트 데이터가 없습니다.
                </p>
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
  name: "InboundStatPage",
  components: { BaseTable, SearchSelect, DateRangePicker, BaseInput, Chart },

  data() {
    return {
      columns: [
        {
          key: "date",
          label: "날짜",
          type: "string",
          width: "130px",
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
          label: "입고 수량",
          type: "number",
          width: "120px",
          align: "right",
          sortable: true,
        },
        {
          key: "total_cost",
          label: "입고 금액",
          type: "currency",
          width: "150px",
          align: "right",
          sortable: true,
        },
      ],
      set: { date: new Date().toISOString().substr(0, 10) },
      chartRows: [],
      rows: [],
      summary: { total_cost: 0, total_qty: 0, count: 0 },
      dateRange: { start: null, end: null },
      where: {
        material_id: "",
        warehouse_id: "",
        startDate: null,
        endDate: null,
      },
      materials: [],
    };
  },

  methods: {
    // 숫자를 천단위 구분자 문자열로 포맷팅한다
    formatNumber(val) {
      return Number(val || 0).toLocaleString();
    },

    // 지정 날짜의 입고 일별 통계를 서버에 갱신 요청한다
    async setData() {
      if (!this.set.date) {
        this.$toast.error("통계 저장할 날짜를 입력하세요");
        return;
      }
      try {
        const res = await api.post("/api/stat/inbound/daily", {
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

    // 목록 데이터로 총수량/총금액/건수 요약을 계산해 반영한다
    setSummary(data_list = []) {
      const summary = data_list.reduce(
        (acc, row) => {
          acc.total_qty += Number(row.total_qty || 0);
          acc.total_cost += Number(row.total_cost || 0);
          return acc;
        },
        { total_qty: 0, total_cost: 0 },
      );

      this.summary = { ...summary, count: data_list.length };
    },

    // 입고 통계 차트 데이터를 로드한다
    async loadChartData() {
      const where = this.buildParams();
      const res = await api.post("/api/stat/inbound/daily/totalAmount", where);
      this.chartRows = res.data;
    },

    // 입고 통계 목록을 로드하고 요약을 갱신한다
    async loadList() {
      const where = this.buildParams();
      const res = await api.post("/api/stat/inboundList", where);
      this.rows = res.data;
      this.setSummary(res.data);
    },

    // 검색/기간을 결합해 API 파라미터 객체를 생성한다
    buildParams() {
      const where = { ...this.where };
      if (this.dateRange?.start)
        where.startDate = this.dateRange.start.toISOString();
      if (this.dateRange?.end) where.endDate = this.dateRange.end.toISOString();
      return where;
    },

    // 목록과 차트를 병렬로 조회한다
    async searchData() {
      await Promise.all([this.loadList(), this.loadChartData()]);
    },

    // 자재 옵션 목록을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },
  },

  // 마운트 시 기본 기간(이번 달)을 세팅하고 통계를 조회한다
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
