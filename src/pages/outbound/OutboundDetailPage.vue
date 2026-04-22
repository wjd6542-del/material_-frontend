<template>
  <div class="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="text-xs sm:text-sm text-gray-500 font-medium">
            판매 수량
          </div>
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600"
          >
            <i class="fa-solid fa-box text-sm"></i>
          </div>
        </div>
        <div class="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-gray-800">
          {{ formatNumber(summary?.quantity ?? 0) }}
        </div>
      </div>

      <div
        class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="text-xs sm:text-sm text-gray-500 font-medium">
            판매 금액
          </div>
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600"
          >
            <i class="fa-solid fa-sack-dollar text-sm"></i>
          </div>
        </div>
        <div class="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-purple-600">
          {{ formatNumber(summary?.sale_amount ?? 0) }}
        </div>
      </div>

      <div
        class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="text-xs sm:text-sm text-gray-500 font-medium">원가</div>
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600"
          >
            <i class="fa-solid fa-coins text-sm"></i>
          </div>
        </div>
        <div class="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-gray-700">
          {{ formatNumber(summary?.cost_amount ?? 0) }}
        </div>
      </div>

      <div
        class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="text-xs sm:text-sm text-gray-500 font-medium">손익</div>
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl"
            :class="
              summary?.profit >= 0
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-500'
            "
          >
            <i class="fa-solid fa-chart-line text-sm"></i>
          </div>
        </div>
        <div
          class="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold"
          :class="summary?.profit >= 0 ? 'text-green-600' : 'text-red-500'"
        >
          {{ formatNumber(summary?.profit ?? 0) }}
        </div>
      </div>
    </div>

    <div
      class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">출고 세부내역</h2>
      </div>

      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div class="flex flex-wrap items-center gap-2">
          <div class="w-full lg:w-auto flex-1 min-w-[280px]">
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              @change="loadList"
            />
          </div>

          <div class="w-[calc(50%-4px)] lg:w-40 flex-1 min-w-[140px]">
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="자재 선택"
              @change="loadList"
            />
          </div>

          <div class="w-[calc(50%-4px)] lg:w-40 flex-1 min-w-[140px]">
            <SearchSelect
              v-model="where.warehouse_id"
              :options="warehouses"
              labelKey="name"
              valueKey="id"
              placeholder="창고 선택"
              @change="loadList"
            />
          </div>

          <div class="w-full lg:w-48 flex-1 min-w-[140px]">
            <SearchSelect
              v-model="where.location_id"
              :options="locations"
              labelKey="name"
              valueKey="id"
              placeholder="위치 선택"
              @change="loadList"
            />
          </div>
        </div>
      </div>

      <div class="p-4 overflow-x-auto">
        <div class="min-w-[1200px]">
          <BaseTable
            ref="outboundDetailTable"
            :columns="columns"
            :rows="rows"
            sortable
            selectable
            pagination
            :pageSize="10"
            :pageSizeOptions="[10, 20, 50, 100]"
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
import api from "@/api/api";

export default {
  name: "OutboundDetailPage",
  components: { BaseTable, SearchSelect, DateRangePicker },
  data() {
    return {
      columns: [
        {
          key: "qrcode",
          label: "QR CODE",
          type: "img",
          width: "100px",
          align: "center",
          sortable: true,
        },
        {
          key: "outbound_code",
          label: "출고번호",
          width: "180px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_code",
          label: "자재코드",
          sortable: true,
          align: "center",
          width: "180px",
        },
        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "250px",
        },
        {
          key: "warehouse_name",
          label: "창고",
          sortable: true,
          align: "center",
          width: "100px",
        },
        {
          key: "location",
          label: "창고 위치",
          sortable: true,
          align: "center",
          width: "130px",
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          align: "right",
          width: "80px",
          sortable: true,
        },
        {
          key: "cost_amount",
          label: "원가",
          type: "currency",
          align: "right",
          width: "150px",
          sortable: true,
        },
        {
          key: "sale_amount",
          label: "판매금액",
          type: "currency",
          align: "right",
          width: "150px",
          sortable: true,
        },
        {
          key: "profit",
          label: "손익",
          type: "currency",
          align: "right",
          width: "150px",
          sortable: true,
        },
        {
          key: "created_at",
          label: "등록일",
          type: "date",
          align: "center",
          width: "180px",
          sortable: true,
        },
      ],
      dateRange: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      where: {
        material_id: "",
        warehouse_id: "",
        supplier_id: "",
        location_id: "",
        key_word: "",
        startDate: null,
        endDate: null,
      },
      rows: [],
      materials: [],
      warehouses: [],
      locations: [],
      total: 0,
      group: null,
      summary: null,
    };
  },
  methods: {
    // 숫자를 천단위 구분자 문자열로 포맷팅한다
    formatNumber(val) {
      return Number(val || 0).toLocaleString();
    },
    // 보드의 총계/그룹/요약 카운트를 로드한다
    async loadBoadCount() {
      const res = await api.post("/api/outbound/boardCount");
      this.total = res.data.totalCount;
      this.group = res.data.groupCount;
      this.summary = res.data.summary;
    },
    // 검색 조건으로 출고 세부 내역을 로드한다
    async loadList() {
      this.rows = [];
      const where = { ...this.where };
      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }
      const res = await api.post("/api/outbound/detail/list", where);
      this.rows = res.data;
    },
    // 자재 옵션을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },
    // 창고 옵션을 로드한다
    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },
    // 위치 옵션을 로드한다 (코드-이름 결합형 라벨)
    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data.map((row) => ({
        ...row,
        name: `${row.code} - ${row.name}`,
      }));
    },
  },
  // 마운트 시 세부 내역/참조 데이터/카운트를 병렬 로드한다
  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadWarehouse();
    this.loadBoadCount();
    this.loadLocation();
  },
};
</script>

<style scoped>
/* 모바일에서 테이블 스크롤 시 부드럽게 */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}
</style>
