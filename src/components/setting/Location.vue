<template>
  <div>
    <!-- 검색 + 액션 영역 -->
    <div class="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="addRow"
          class="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1"
        >
          <i class="fa-solid fa-plus"></i>
          추가
        </button>
        <button
          @click="saveRows"
          class="px-3 py-1.5 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-1"
        >
          <i class="fa-solid fa-save"></i>
          저장
        </button>
        <button
          @click="deleteRows"
          class="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1"
        >
          <i class="fa-solid fa-trash"></i>
          삭제
        </button>
      </div>
    </div>

    <!-- AG Grid -->
    <div class="ag-theme-alpine w-full" style="width: 100%; height: 600px">
      <AgGridVue
        class="ag-theme-alpine"
        theme="legacy"
        domLayout="normal"
        style="width: 100%; height: 600px"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :gridOptions="gridOptions"
        @grid-ready="onGridReady"
        @cell-editing-stopped="onCellEditingStopped"
      />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import { AgGridVue } from "ag-grid-vue3";
import { createAgGridMixin } from "@/mixins/agGridList";

export default {
  name: "LocationTable",
  components: { AgGridVue },

  mixins: [
    createAgGridMixin({
      listEndpoint: "/api/location/list",
      saveEndpoint: "/api/location/batchSave",
      deleteEndpoint: "/api/location/batchDelete",
      newRowDefaults: () => ({
        warehouse_id: "",
        code: "",
        name: "",
        x: 15,
        y: 15,
        width: 3,
        height: 3,
      }),
    }),
  ],

  data() {
    return {
      warehouses: [],
      warehouseMap: {},
    };
  },

  computed: {
    // 창고 셀렉터를 포함한 컬럼 정의 (warehouseMap 의존)
    columnDefs() {
      return [
        {
          headerName: "창고",
          field: "warehouse_id",
          filter: "agTextColumnFilter",
          flex: 0.5,
          editable: true,
          cellEditor: "agSelectCellEditor",
          cellEditorParams: { values: this.warehouses.map((w) => w.id) },
          valueParser: (params) => Number(params.newValue),
          valueFormatter: (params) => this.warehouseMap[params.value] || "",
        },
        { headerName: "코드", field: "code", filter: "agTextColumnFilter", flex: 0.5 },
        { headerName: "위치명", field: "name", filter: "agTextColumnFilter", flex: 0.5 },
        { headerName: "정렬", field: "sort", filter: "agNumberColumnFilter", flex: 0.5 },
      ];
    },
  },

  methods: {
    // 창고 목록 로드 + id→name 맵 구성
    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data || [];
      this.warehouseMap = Object.fromEntries(
        this.warehouses.map((w) => [w.id, w.name]),
      );
    },
  },

  // mixin 의 mounted 가 loadList 를 호출하므로 창고를 먼저 로드 후 list 를 다시 트리거
  async mounted() {
    await this.loadWarehouse();
  },
};
</script>
