<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div class="lg:col-span-3">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <!-- header -->
          <div class="flex items-center gap-2 px-5 py-4 border-b bg-gray-50">
            <i class="fa-solid fa-sack-dollar text-blue-500"></i>
            <span class="font-semibold text-gray-700">매출 요약</span>
          </div>

          <!-- body -->
          <div class="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="(label, key) in groupMap"
              :key="key"
              class="bg-gray-50 rounded-xl px-4 py-4 text-center"
            >
              <!-- label -->
              <div class="text-xs text-gray-500 mb-1">
                {{ label }}
              </div>

              <!-- value -->
              <div
                class="text-2xl font-bold tracking-tight"
                :class="valueColor(key)"
              >
                {{ formatNumber(summary?.[key] ?? 0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-3">
        <div class="bg-white rounded-xl border border-gray-200 shadow">
          <!-- header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-2 text-gray-700 font-medium">
              <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
              <span>출고 목록</span>
            </div>

            <span class="text-xs text-gray-400">자재별 출고 횟수</span>
          </div>

          <!-- body -->
          <div class="p-4 space-y-2">
            <div
              v-for="(val, key) in group"
              :key="key"
              class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <!-- material -->
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <i class="fa-solid fa-cube text-gray-400"></i>
                <span>{{ key }}</span>
              </div>

              <!-- count -->
              <span
                class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700"
              >
                {{ val }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 mt-5">
      <!-- 테이블 -->
      <div
        class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">출고 세부내역</h2>
        </div>

        <div class="p-4 pb-0 flex items-center gap-1">
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />

          <SearchSelect
            v-model="where.material_id"
            :options="materials"
            labelKey="name"
            valueKey="id"
            placeholder="자재 선택"
            @change="loadList"
          />

          <SearchSelect
            v-model="where.warehouse_id"
            :options="warehouses"
            labelKey="name"
            valueKey="id"
            placeholder="창고 선택"
            @change="loadList"
          />

          <SearchSelect
            v-model="where.location_id"
            :options="locations"
            labelKey="name"
            valueKey="id"
            placeholder="창고 위치 선택"
            @change="loadList"
          />
        </div>

        <div class="p-4">
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

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

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
          width: "200px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_code",
          label: "자재코드",
          sortable: true,
          align: "center",
          width: "230px",
        },

        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "280px",
        },
        {
          key: "warehouse_name",
          label: "창고",
          sortable: true,
          align: "center",
          width: "80px",
        },
        {
          key: "location",
          label: "창고 위치",
          sortable: true,
          align: "center",
          width: "130px",
          sortable: true,
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
          width: "250px",
          sortable: true,
        },
        {
          key: "sale_amount",
          label: "판매금액",
          type: "currency",
          align: "right",
          width: "250px",
          sortable: true,
        },
        {
          key: "profit",
          label: "손익",
          type: "currency",
          align: "right",
          width: "250px",
          sortable: true,
        },

        {
          key: "created_at",
          label: "등록일",
          type: "date",
          align: "center",
          width: "200px",
          sortable: true,
        },
      ],

      dateRange: { start: null, end: null },

      // 검색 조건
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

      groupMap: {
        quantity: "판매 수량",
        sale_amount: "판매 금액",
        cost_amount: "원가",
        profit: "손익",
      },
    };
  },

  methods: {
    valueColor(key) {
      if (key === "profit") {
        return this.summary?.[key] >= 0 ? "text-green-600" : "text-red-500";
      }
      return "text-gray-800";
    },
    formatNumber(val) {
      return Number(val || 0).toLocaleString();
    },
    async loadBoadCount() {
      const res = await api.post("/api/outbound/boardCount");
      this.total = res.data.totalCount;
      this.group = res.data.groupCount;
      this.summary = res.data.summary;
    },

    // 데이터 로드 처리
    async loadList() {
      this.rows = [];

      const where = {
        ...this.where,
      };

      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }

      const res = await api.post("/api/outbound/detail/list", where);
      console.log(res.data);
      this.rows = res.data;
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },

    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data.map((row) => ({
        ...row,
        name: `${row.code} - ${row.name}`,
      }));
    },
  },
  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadWarehouse();
    this.loadBoadCount();
    this.loadLocation();
  },
};
</script>
