<template>
  <div class="p-4 lg:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- 테이블 -->
      <div
        class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">재고현황</h2>
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
            placeholder="선반 위치 선택"
            @change="loadList"
          />
        </div>

        <div class="p-4">
          <BaseTable
            ref="inboundDetailTable"
            :columns="columns"
            :rows="rows"
            sortable
            pagination
            :pageSize="10"
            :pageSizeOptions="[10, 20, 50, 100]"
          />
        </div>
      </div>

      <!-- 카드 -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- 이번달 입고 -->
        <div class="bg-white rounded-xl border border-gray-200 shadow">
          <!-- header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-2 text-gray-700 font-medium">
              <i class="fa-solid fa-boxes-stacked text-blue-500"></i>

              <span>재고 총 수량</span>
            </div>
          </div>

          <!-- body -->
          <div class="p-4">
            <div class="text-3xl font-semibold text-gray-800">1,245</div>

            <div class="text-sm text-gray-400 mt-1">이번 달 입고 기준</div>
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

import api from "@/api/api";

// stock

export default {
  name: "StockPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

  data() {
    return {
      columns: [
        {
          key: "material_code",
          label: "자재코드",
          sortable: true,
          width: "200px",
        },

        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "200px",
        },
        {
          key: "warehouse_name",
          label: "창고위치",
          sortable: true,
          width: "100px",
        },
        {
          key: "location_code",
          label: "선반위치",
          sortable: true,
          width: "100px",
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "updated_at",
          label: "변경일",
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
    };
  },

  methods: {
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

      const res = await api.post("/api/stock/list", where);
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
      this.locations = res.data;
    },
  },
  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadWarehouse();
    this.loadLocation();
  },
};
</script>
