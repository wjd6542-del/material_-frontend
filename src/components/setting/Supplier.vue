<template>
  <div>
    <!-- 🔎 검색 영역 -->
    <div class="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <div
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="addRow"
            class="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1"
          >
            <i class="fa-solid fa-plus"></i>
            {{ "추가" }}
          </button>

          <button
            @click="saveRows"
            class="px-3 py-1.5 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-1"
          >
            <i class="fa-solid fa-save"></i>
            {{ "저장" }}
          </button>

          <button
            @click="deleteRows"
            class="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1"
          >
            <i class="fa-solid fa-trash"></i>
            {{ "삭제" }}
          </button>
        </div>
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

<script>
import api from "@/api/api";
import { AgGridVue } from "ag-grid-vue3";
const statusMap = {
  true: "활성",
  false: "비활성",
};

export default {
  name: "supplierTable",
  components: { AgGridVue },

  data() {
    return {
      gridApi: null,
      columnApi: null,
      tempId: -1,
      KEYS: [],
      search: {
        keys: [],
      },

      rowData: [],
      columnDefs: [],

      gridOptions: {
        getRowId: (params) => String(params.data.id), // ⭐ 필수
        rowSelection: {
          mode: "multiRow",
          checkboxes: true, // 🔥 반드시 필요
          headerCheckbox: true,
        },
        onCellValueChanged: (params) => {
          if (params.oldValue !== params.newValue) {
            params.node.setSelected(true);
          }
        },
        rowClassRules: {
          "row-inactive": (params) => params.data?.is_active === false,
        },
      },

      defaultColDef: {
        sortable: true,
        filter: true,
        editable: true,
        resizable: true,
      },
    };
  },

  methods: {
    onCellEditingStopped(params) {
      params.api.setNodesSelected({
        nodes: [params.node],
        newValue: true,
        clearSelection: false,
      });
    },

    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 0);
    },

    /* =========================
     * 데이터 로드
     * ========================= */
    async loadList() {
      this.rowData = [];
      const res = await api.post("/api/supplier/list", this.search);

      this.rowData = res.data;

      // 해더  및 기능 설정
      this.columnDefs = [
        {
          headerName: "거래처명",
          field: "name",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },
        {
          headerName: "핸드폰",
          field: "phone",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },
        {
          headerName: "이메일",
          field: "email",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },

        {
          headerName: "메모",
          field: "memo",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },
        {
          headerName: "정렬",
          field: "sort",
          filter: "agNumberColumnFilter",
          flex: 0.5,
        },
      ];
    },

    /* =========================
     * 행 추가
     * ========================= */
    addRow() {
      let maxSort = 0;

      this.gridApi.forEachNode((node) => {
        if (node.data.sort > maxSort) {
          maxSort = node.data.sort;
        }
      });
      const newRow = {
        id: this.tempId--,
        name: "",
        phone: "",
        email: "",
        memo: "",
        sort: maxSort + 1,
      };

      const res = this.gridApi.applyTransaction({ add: [newRow], addIndex: 0 });
      res.add[0].setSelected(true);
    },

    /* =========================
     * 저장
     * ========================= */
    async saveRows() {
      const rows = this.gridApi.getSelectedRows();
      try {
        if (rows.length === 0) {
          this.$toast.error("선택된 정보가 없습니다");
          return;
        }

        await api.post("/api/supplier/batchSave", rows);
        this.$toast.success("저장 완료");
        this.loadList();
      } catch (e) {
        console.error(e);
        this.$toast.error("저장 실패");
      }
    },

    // 일괄 삭제 처리
    async deleteRows() {
      const rows = this.gridApi.getSelectedRows();

      if (rows.length === 0) {
        this.$toast.error("선택된 정보가 없습니다");
        return;
      }

      const ok = await this.$confirm(
        `선택된 ${rows.length}개 항목을 삭제하시겠습니까?`,
        "삭제 확인",
      );

      if (!ok) return;

      try {
        await api.post("/api/supplier/batchDelete", rows);
        this.$toast.success("삭제 완료");
        this.loadList();
      } catch (e) {
        this.$toast.error("삭제 중 오류가 발생했습니다");
      }
    },
  },

  mounted() {
    this.loadList();
  },
};
</script>
