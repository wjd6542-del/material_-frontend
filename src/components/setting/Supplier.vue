<template>
  <div>
    <DaumPostcodeModal v-model="postcodeOpen" @select="applyAddress" />

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
import DaumPostcodeModal from "@/components/base/DaumPostcodeModal.vue";
const statusMap = {
  true: "활성",
  false: "비활성",
};

export default {
  name: "supplierTable",
  components: { AgGridVue, DaumPostcodeModal },

  data() {
    return {
      gridApi: null,
      columnApi: null,
      tempId: -1,
      KEYS: [],
      search: {
        keys: [],
      },
      postcodeOpen: false,
      targetRowId: null,

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
    // 셀 편집 종료 시 해당 행을 선택 상태로 유지한다
    onCellEditingStopped(params) {
      params.api.setNodesSelected({
        nodes: [params.node],
        newValue: true,
        clearSelection: false,
      });
    },

    // AG Grid 준비 완료 시 API 참조 저장 및 컬럼 크기를 조정한다
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
    // 거래처 목록과 컬럼 정의를 서버에서 로드한다
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
          headerName: "우편번호",
          field: "zipcode",
          filter: "agTextColumnFilter",
          editable: false,
          flex: 0.4,
          cellStyle: { cursor: "pointer" },
          onCellClicked: (params) => this.openPostcode(params.data.id),
        },
        {
          headerName: "기본주소",
          field: "address",
          filter: "agTextColumnFilter",
          editable: false,
          flex: 1,
          cellStyle: { cursor: "pointer" },
          onCellClicked: (params) => this.openPostcode(params.data.id),
        },
        {
          headerName: "상세주소",
          field: "address_detail",
          filter: "agTextColumnFilter",
          flex: 0.7,
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

    // 대상 행 ID를 저장하고 우편번호 모달을 연다
    openPostcode(rowId) {
      this.targetRowId = rowId;
      this.postcodeOpen = true;
    },

    // 모달에서 선택한 주소 값을 대상 행에 반영한다
    applyAddress({ zipcode, address, detailAddress }) {
      if (this.targetRowId == null) return;
      const node = this.gridApi.getRowNode(String(this.targetRowId));
      if (!node) return;
      node.setDataValue("zipcode", zipcode || "");
      node.setDataValue("address", address || "");
      node.setDataValue("address_detail", detailAddress || "");
      node.setSelected(true);
      this.targetRowId = null;
    },

    /* =========================
     * 행 추가
     * ========================= */
    // 최대 sort 값을 계산해 신규 거래처 행을 그리드 상단에 추가한다
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
        zipcode: "",
        address: "",
        address_detail: "",
        memo: "",
        sort: maxSort + 1,
      };

      const res = this.gridApi.applyTransaction({ add: [newRow], addIndex: 0 });
      res.add[0].setSelected(true);
    },

    /* =========================
     * 저장
     * ========================= */
    // 선택된 거래처 행들을 서버에 일괄 저장한다
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
    // 선택된 거래처를 사용자 확인 후 서버에서 일괄 삭제한다
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

  // 마운트 시 거래처 목록을 로드한다
  mounted() {
    this.loadList();
  },
};
</script>
