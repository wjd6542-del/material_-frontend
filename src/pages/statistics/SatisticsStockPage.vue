<template>
  <div class="space-y-6">
    <!-- KPI SUMMARY -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 총 재고 수량 -->
      <div
        class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div class="text-xs text-gray-500 mb-1">총 재고 수량</div>
          <div class="text-2xl font-bold text-blue-600">
            {{ formatNumber(summary?.total_qty || 0) }}
          </div>
        </div>

        <div
          class="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600"
        >
          <i class="fa-solid fa-box text-xl"></i>
        </div>
      </div>

      <!-- 재고 건수 -->
      <div
        class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div class="text-xs text-gray-500 mb-1">재고 건수</div>
          <div class="text-2xl font-bold text-gray-700">
            {{ formatNumber(summary?.count || 0) }}
          </div>
        </div>

        <div
          class="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700"
        >
          <i class="fa-solid fa-clipboard-list text-xl"></i>
        </div>
      </div>
    </div>
    <!-- MAIN -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- LEFT : 검색 + 테이블 -->
      <div class="lg:col-span-5">
        <div class="bg-white rounded-xl border border-gray-200 shadow">
          <!-- header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b bg-gray-50"
          >
            <div class="flex items-center gap-2 text-gray-700 font-medium">
              <i class="fa-solid fa-truck-ramp-box text-blue-500"></i>
              <span>재고 통계</span>
            </div>

            <span class="text-xs text-gray-400"> 자재별 재고 내역 </span>
          </div>

          <!-- SEARCH -->
          <div class="p-4 flex items-center gap-3 border-b flex-nowrap">
            <!-- 날짜 -->
            <div class="w-[350px]">
              <DateRangePicker
                v-model="dateRange"
                mode="date"
                :showQuickButtons="true"
                :showTime="false"
                @change="searchData"
              />
            </div>

            <!-- 자재 선택 -->
            <div class="w-[220px]">
              <SearchSelect
                v-model="where.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
                placeholder="자재 선택"
                @change="searchData"
              />
            </div>

            <!-- 날짜 입력 + 설정 버튼 -->
            <div class="flex items-center w-[220px]">
              <input
                class="px-3 border h-[39px] rounded-s"
                v-model="set.date"
                placeholder="날짜 입력"
              />

              <button
                @click="setData"
                class="px-3 h-[39px] flex items-center justify-center bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition"
              >
                <i class="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>

          <!-- TABLE -->
          <div class="p-4">
            <BaseTable :columns="columns" :rows="rows" sortable />
          </div>
        </div>
      </div>

      <!-- RIGHT : CHART -->
      <div class="lg:col-span-5">
        <div
          class="bg-white rounded-xl border border-gray-200 shadow flex flex-col h-full"
        >
          <!-- header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b bg-gray-50"
          >
            <div class="flex items-center gap-2 text-gray-700 font-medium">
              <i class="fa-solid fa-chart-column text-green-500"></i>
              <span>재고 추이</span>
            </div>
          </div>

          <Chart
            :rows="chartRows"
            :start="dateRange.start"
            :end="dateRange.end"
            name="재고수량"
            column="total_qty"
          />
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
          width: "150px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_name",
          label: "자재",
          width: "250px",
          align: "left",
          sortable: true,
        },

        {
          key: "warehouse_name",
          label: "창고",
          width: "250px",
          align: "left",
          sortable: true,
        },
        {
          key: "quantity",
          label: "재고 수량",
          type: "number",
          align: "right",
          sortable: true,
        },
      ],
      set: { date: "" },

      chartRows: [],

      rows: [],
      summary: {
        total_cost: 0,
        total_qty: 0,
        count: 0,
      },

      dateRange: { start: null, end: null },

      where: {
        material_id: "",
        warehouse_id: "",
        startDate: null,
        endDate: null,
      },

      materials: [],
      warehouses: [],

      chart: null,
    };
  },

  methods: {
    formatNumber(val) {
      return Number(val || 0).toLocaleString();
    },

    // 데이터 셋팅
    async setData() {
      let date = this.set.date;

      if (!date) {
        this.$toast.error("통계 저장할 날짜를 입력하세요");
        return;
      }

      try {
        const res = await api.post("/api/stat/stock/daily", { date: date });
        this.$toast.success(`[${date}] 재고 통계정보 생성 되었습니다`);
        this.searchData();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    setSummary(data_list = []) {
      let total_qty = 0;
      let total_cost = 0;

      data_list.forEach((row) => {
        total_qty += Number(row.quantity || 0);
      });

      this.summary = {
        total_qty,
        total_cost,
        count: data_list.length,
      };
    },

    // 차트용 데이터 출력
    async loadChartData() {
      const where = { ...this.where };

      if (this.dateRange?.start)
        where.startDate = this.dateRange.start.toISOString();

      if (this.dateRange?.end) where.endDate = this.dateRange.end.toISOString();

      const res = await api.post("/api/stat/stock/daily/totalQty", where);
      this.chartRows = res.data;
    },

    async searchData() {
      this.loadList();
      this.loadChartData();
    },

    async loadList() {
      const where = { ...this.where };

      if (this.dateRange?.start)
        where.startDate = this.dateRange.start.toISOString();

      if (this.dateRange?.end) where.endDate = this.dateRange.end.toISOString();

      const res = await api.post("/api/stat/stockList", where);

      this.rows = res.data;

      this.setSummary(res.data);
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },
  },

  mounted() {
    const now = new Date();

    // 이번달 1일
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    // 이번달 마지막날
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.dateRange = {
      start,
      end,
    };

    this.loadMaterial();
    this.loadList();
    this.loadChartData();
  },
};
</script>
