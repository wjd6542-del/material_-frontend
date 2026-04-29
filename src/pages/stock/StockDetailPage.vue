<template>
  <div>
    <div class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">재고 변동 이력</h2>
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
          placeholder="품목 선택"
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
          ref="stockDetailTable"
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

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";

export default {
  name: "StockDetailPage",

  components: { BaseTable, SearchSelect, DateRangePicker },

  mixins: [
    createListMixin({
      endpoint: "/api/stock/detailList",
      initialWhere: {
        material_id: "",
        warehouse_id: "",
        location_id: "",
        type: "",
      },
      initialDateRange: () => ({ start: null, end: null }),
    }),
    createRefDataMixin(["materials", "warehouses", "locationsRaw"]),
  ],

  data() {
    return {
      columns: [
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "material_code", label: "품목코드", sortable: true, width: "200px" },
        { key: "material_name", label: "품목명", sortable: true, width: "200px" },
        { key: "warehouse_name", label: "창고위치", sortable: true, width: "100px" },
        { key: "location_code", label: "선반위치", sortable: true, width: "100px" },
        { key: "type", label: "구분", sortable: true, width: "100px" },
        { key: "before_qty", label: "이전 수량", type: "number", align: "right", width: "100px" },
        { key: "after_qty", label: "이후 수량", type: "number", align: "right", width: "100px" },
        { key: "created_at", label: "생성일", type: "date", align: "center", width: "200px", sortable: true },
      ],
      typeArr: [
        { text: "구매", value: "INBOUND" },
        { text: "판매", value: "OUTBOUND" },
        { text: "조정", value: "ADJUST" },
      ],
      materials: [],
      warehouses: [],
      locations: [],
    };
  },

  mounted() {
    this.loadRefData();
  },
};
</script>
