<template>
  <div class="p-2 sm:p-4 md:p-6">
    <div class="bg-white rounded-xl shadow border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">구매 목록</h2>
      </div>

      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3">
          <div class="sm:col-span-2 lg:flex-1 min-w-[280px]">
            <label class="form-label">조회 기간</label>
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              @change="loadList"
              class="w-full"
            />
          </div>

          <div class="lg:w-48">
            <label class="form-label">품목</label>
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="품목 선택"
              @change="loadList"
            />
          </div>

          <div class="lg:w-48">
            <label class="form-label">거래처</label>
            <SearchSelect
              v-model="where.supplier_id"
              :options="suppliers"
              labelKey="name"
              valueKey="id"
              placeholder="거래처 선택"
              @change="loadList"
            />
          </div>

          <div class="lg:w-60">
            <label class="form-label">창고</label>
            <SearchSelect
              v-model="where.warehouse_id"
              :options="warehouses"
              labelKey="name"
              valueKey="id"
              placeholder="창고 선택"
              @change="loadList"
            />
          </div>

          <div class="lg:w-60">
            <label class="form-label">선반 위치</label>
            <SearchSelect
              v-model="where.location_id"
              :options="locations"
              labelKey="name"
              valueKey="id"
              placeholder="위치 선택"
              @change="loadList"
            />
          </div>

          <div class="flex items-center lg:ml-auto">
            <button
              @click="resetFilters"
              class="btn btn-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <i class="fa-solid fa-rotate-right"></i>
              초기화
            </button>
          </div>
        </div>
      </div>

      <div class="p-0 sm:p-4 overflow-x-auto">
        <div class="min-w-[1200px]">
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
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";

const INITIAL_WHERE = {
  material_id: "",
  warehouse_id: "",
  supplier_id: "",
  location_id: "",
  key_word: "",
};

export default {
  name: "InboundDetailPage",

  components: { BaseTable, SearchSelect, DateRangePicker },

  mixins: [
    createListMixin({
      endpoint: "/api/inbound/detail/list",
      initialWhere: INITIAL_WHERE,
    }),
    createRefDataMixin(["materials", "suppliers", "warehouses", "locations"]),
  ],

  data() {
    return {
      columns: [
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "inbound_code", label: "구매번호", width: "200px", align: "center", sortable: true },
        { key: "material_code", label: "품목코드", sortable: true, width: "180px" },
        { key: "material_name", label: "품목명", sortable: true, width: "250px" },
        { key: "supplier_name", label: "거래처", sortable: true, width: "120px" },
        { key: "warehouse_name", label: "창고위치", sortable: true, width: "100px" },
        { key: "location_name", label: "선반위치", sortable: true, width: "150px" },
        { key: "quantity", label: "수량", type: "number", align: "right", width: "100px" },
        { key: "unit_price", label: "금액(개당)", type: "currency", align: "right", width: "150px" },
        { key: "amount", label: "금액(총)", type: "currency", align: "right", width: "150px" },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "180px", sortable: true },
      ],
      materials: [],
      suppliers: [],
      warehouses: [],
      locations: [],
    };
  },

  methods: {
    // 검색 조건/기간을 초기화하고 재조회
    resetFilters() {
      this.where = { ...INITIAL_WHERE };
      this.dateRange = { start: null, end: null };
      this.loadList();
    },
  },

  mounted() {
    this.loadRefData();
  },
};
</script>

<style scoped>
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}
::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
::-webkit-scrollbar-track {
  background: #f3f4f6;
}
</style>
