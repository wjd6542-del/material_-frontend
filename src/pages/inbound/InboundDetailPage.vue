<template>
  <div class="">
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">입고 목록</h2>
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
          v-model="where.supplier_id"
          :options="suppliers"
          labelKey="name"
          valueKey="id"
          placeholder="거래처 선택"
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
          ref="inboundDetailTable"
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
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";

import api from "@/api/api";

export default {
  name: "InboundDetailPage",

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
          key: "inbound_code",
          label: "입고번호",
          width: "200px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_code",
          label: "자재코드",
          sortable: true,
          width: "230px",
        },
        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "280px",
        },
        {
          key: "supplier_name",
          label: "거래처",
          sortable: true,
          width: "100px",
        },
        {
          key: "warehouse_name",
          label: "창고위치",
          sortable: true,
          width: "80px",
        },
        {
          key: "location_name",
          label: "선반위치",
          sortable: true,
          width: "130px",
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "unit_price",
          label: "금액(개당)",
          type: "currency",
          align: "right",
          width: "250px",
        },
        {
          key: "amount",
          label: "금액(총)",
          type: "currency",
          align: "right",
          width: "250px",
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
      suppliers: [],
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

      const res = await api.post("/api/inbound/detail/list", where);
      this.rows = res.data;
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    async loadSupplier() {
      const res = await api.post("/api/supplier/list");
      this.suppliers = res.data;
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
    this.loadSupplier();
    this.loadWarehouse();
    this.loadLocation();
  },
};
</script>
