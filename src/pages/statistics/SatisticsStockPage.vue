<template>
  <div class="p-4 lg:p-6 bg-[#f8fafc] min-h-screen space-y-4 lg:space-y-6">
    <!-- 1. KPI SUMMARY (상단 요약 카드) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 최근 기준 총 재고 수량 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">총 재고 수량</p>
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
            <i class="fa-solid fa-box-open text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 재고 건수 -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">
              재고 품목 건수
            </p>
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
      <!-- LEFT : 데이터 테이블 영역 (6/12) -->
      <div class="lg:col-span-6">
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <!-- Table Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white"
          >
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-blue-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-lg"
                >재고 통계 상세</span
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
                class="shadow-sm"
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

            <div
              class="flex items-center gap-0.5 shadow-sm rounded-lg overflow-hidden border border-slate-200"
            >
              <input
                v-model="set.date"
                type="date"
                class="px-3 h-[38px] text-sm bg-white focus:outline-none border-none w-[140px]"
              />
              <button
                @click="setData"
                class="px-4 h-[38px] bg-slate-800 text-white hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <i class="fa-solid fa-bolt"></i> 생성
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
              <div class="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
              <span class="font-bold text-slate-800 text-lg"
                >재고 변동 추이 (Spline)</span
              >
            </div>
          </div>

          <div class="p-6 flex-1 max-h-[500px]">
            <div class="w-full h-full bg-slate-50/30 rounded-xl p-4 relative">
              <!-- 데이터 존재 시 차트 렌더링 -->
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
              <!-- 데이터 없을 시 가이드 -->
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
  name: "stockStatPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
    BaseInput,
    Chart,
  },

  data() {
    return {
      columns: [
        {
          key: "date",
          label: "날짜",
          type: "string",
          width: "120px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_name",
          label: "자재명",
          width: "auto",
          align: "left",
          sortable: true,
        },
        {
          key: "warehouse_name",
          label: "보관 창고",
          width: "180px",
          align: "left",
          sortable: true,
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          width: "100px",
          align: "right",
          sortable: true,
        },
      ],
      set: { date: new Date().toISOString().substr(0, 10) },
      chartRows: [],
      rows: [],
      summary: { total_qty: 0, count: 0 },
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
      if (!val) return 0;
      return Number(val).toLocaleString();
    },

    // 지정 날짜의 재고 일별 통계 생성을 서버에 요청한다
    async setData() {
      if (!this.set.date) {
        this.$toast.error("통계 저장할 날짜를 선택하세요");
        return;
      }
      try {
        await api.post("/api/stat/stock/daily", { date: this.set.date });
        this.$toast.success(`[${this.set.date}] 통계가 생성되었습니다`);
        this.searchData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 목록 데이터로 총 재고 수량 요약을 계산해 반영한다
    setSummary(data_list = []) {
      let total_qty = data_list.reduce(
        (acc, row) => acc + Number(row.quantity || 0),
        0,
      );
      this.summary = {
        total_qty,
        count: data_list.length,
      };
    },

    // 재고 통계 차트 데이터를 로드한다
    async loadChartData() {
      const where = this.buildParams();
      try {
        const res = await api.post("/api/stat/stock/daily/totalQty", where);
        this.chartRows = res.data;
      } catch (e) {
        console.error("Chart loading error:", e);
      }
    },

    // 재고 통계 목록을 로드하고 요약을 갱신한다
    async loadList() {
      const where = this.buildParams();
      try {
        const res = await api.post("/api/stat/stockList", where);
        this.rows = res.data;
        this.setSummary(res.data);
      } catch (e) {
        this.$toast.error("데이터 로드 실패");
      }
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
/* 테이블 내부 폰트 조정 및 스타일 커스텀 */
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
