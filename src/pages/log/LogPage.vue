<template>
  <div>
    <!-- 🔎 검색 영역 -->
    <div class="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <div class="pb-0 flex items-center gap-1">
        <DateRangePicker
          v-model="dateRange"
          :minuteStep="5"
          :showQuickButtons="true"
          @change="loadList"
        />
        <SearchSelect
          v-model="search.action"
          :options="actionArr"
          labelKey="text"
          valueKey="value"
          placeholder="처리 구분 선택"
          @change="loadList"
        />
        <SearchSelect
          v-model="search.status"
          :options="statusArr"
          labelKey="text"
          valueKey="value"
          placeholder="상태 선택"
          @change="loadList"
        />
        <SearchSelect
          v-model="search.search_field"
          :options="searchArr"
          labelKey="text"
          valueKey="value"
          placeholder="검색 항목 선택"
          @change="loadList"
        />
        <BaseInput
          v-model="search.search_text"
          placeholder="검색 내용 입력"
          @change="loadList"
        />
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
import { addYears } from "date-fns";
import { useModalStore } from "@/stores/modal";
import LogModal from "@/components/log/LogModal.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";

export default {
  name: "logsTable",
  components: { AgGridVue, SearchSelect, DateRangePicker, BaseInput },

  data() {
    return {
      modal: useModalStore(),
      gridApi: null,
      columnApi: null,

      dateRange: { start: null, end: null },

      statusArr: [
        { text: "성공", value: "SUCCESS" },
        { text: "실패", value: "FAIL" },
      ],

      // 처리 구분
      actionArr: [
        { text: "생성", value: "CREATE" },
        { text: "수정", value: "UPDATE" },
        { text: "삭제", value: "DELETE" },
      ],

      searchArr: [
        { text: "테이블", value: "target_type" },
        { text: "아이피", value: "ip" },
      ],

      search: {
        status: "",
        search_field: "",
        search_text: "",
        action: "",
        startDate: null,
        endDate: null,
      },

      rowData: [],
      columnDefs: [],

      gridOptions: {
        getRowId: (params) => String(params.data.id), // ⭐ 필수
        rowSelection: {
          mode: "multiRow",
          checkboxes: false, // 🔥 반드시 필요
          headerCheckbox: false,
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
        filter: false,
        editable: false,
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

    formatDate(value) {
      const d = new Date(value);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    },

    /* =========================
     * 데이터 로드
     * ========================= */
    async loadList() {
      this.rowData = [];

      const where = {
        ...this.search,
      };

      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }

      const res = await api.post("/api/auditLog/list", where);
      this.rowData = res.data;

      // 해더  및 기능 설정
      this.columnDefs = [
        {
          headerName: "처리구분",
          field: "action",
          flex: 0.5,
          filter: "agTextColumnFilter",
          cellClass: "text-center",
        },
        {
          headerName: "페이지",
          field: "page",
          flex: 1,
          filter: "agTextColumnFilter",
        },
        {
          headerName: "테이블",
          field: "target_type",
          flex: 0.5,
          filter: "agTextColumnFilter",
          cellClass: "text-center",
        },
        {
          headerName: "상태",
          field: "status",
          flex: 0.5,
          filter: "agTextColumnFilter",
          cellClass: "text-center",
        },
        {
          headerName: "아이피",
          field: "ip",
          flex: 0.5,
          filter: "agTextColumnFilter",
          cellClass: "text-center",
        },
        {
          headerName: "생성일",
          field: "created_at",
          flex: 0.5,
          cellClass: "text-center",
          cellRenderer: (p) => {
            if (!p.value) return "";
            return this.formatDate(p.value);
          },
        },
        {
          headerName: "이전",
          field: "before_data",
          flex: 0.5,
          cellRenderer: (p) => {
            if (!p.value) return "";
            return `<button class="log-btn">보기</button>`;
          },
          onCellClicked: (p) => {
            if (!p.value) return;
            this.openModal("이전 데이터", p.value);
          },
        },
        {
          headerName: "이후",
          field: "after_data",
          flex: 0.5,
          cellRenderer: (p) => {
            if (!p.value) return "";
            return `<button class="log-btn">보기</button>`;
          },
          onCellClicked: (p) => {
            if (!p.value) return;
            this.openModal("이후 데이터", p.value);
          },
        },
      ];
    },

    // 모달 열기
    openModal(title, data) {
      // 모달 열기
      this.modal.openModal(LogModal, { title: title, data: data }, "lg");
    },
  },

  mounted() {
    this.loadList();
  },
};
</script>

<style></style>
