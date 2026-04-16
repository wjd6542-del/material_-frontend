<template>
  <div class="">
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">재고 변동 이력</h2>
      </div>

      <div class="p-4 pb-0 flex items-center gap-1">
        <DateRangePicker
          v-model="dateRange"
          :minuteStep="5"
          :showQuickButtons="true"
          @change="loadList"
        />

        <SearchSelect
          v-model="where.type"
          :options="typeArr"
          labelKey="text"
          valueKey="value"
          placeholder="구분 선택"
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
          key: "qrcode",
          label: "QR",
          type: "img",
          width: "80px",
          align: "center",
          sortable: true,
        },
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
          key: "type",
          label: "구분",
          sortable: true,
          width: "100px",
        },
        {
          key: "before_qty",
          label: "이전 수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "after_qty",
          label: "이후 수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "created_at",
          label: "생성일",
          type: "date",
          align: "center",
          width: "200px",
          sortable: true,
        },
      ],

      dateRange: { start: null, end: null },

      typeArr: [
        { text: "입고", value: "INBOUND" },
        { text: "출고", value: "OUTBOUND" },
        { text: "조정", value: "ADJUST" },
      ],

      // 검색 조건
      where: {
        material_id: "",
        warehouse_id: "",
        location_id: "",
        type: "",
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
    // 재고 변동 이력을 검색 조건으로 로드한다
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

      const res = await api.post("/api/stock/detailList", where);
      this.rows = res.data;

      console.log(res.data);
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

    // 위치 옵션을 로드한다
    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data;
    },
  },
  // 마운트 시 이력/자재/창고/위치를 로드한다
  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadWarehouse();
    this.loadLocation();
  },
};
</script>
