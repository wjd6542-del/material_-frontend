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
import { AgGridVue } from "ag-grid-vue3";
import { createAgGridMixin } from "@/mixins/agGridList";

export default {
  name: "RoleTable",
  components: { AgGridVue },

  mixins: [
    createAgGridMixin({
      listEndpoint: "/api/role/list",
      saveEndpoint: "/api/role/batchSave",
      deleteEndpoint: "/api/role/batchDelete",
      newRowDefaults: () => ({ name: "", description: "" }),
    }),
  ],

  data() {
    return {
      columnDefs: [
        { headerName: "권한코드", field: "name", filter: "agTextColumnFilter", flex: 0.5 },
        { headerName: "권한명", field: "description", filter: "agTextColumnFilter", flex: 0.5 },
        { headerName: "정렬", field: "sort", filter: "agNumberColumnFilter", flex: 0.5 },
      ],
    };
  },
};
</script>
