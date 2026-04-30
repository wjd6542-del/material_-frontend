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

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import { formatDateTime } from "@/utils/date";
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
    // 셀 편집 종료 시 해당 행을 선택 상태로 유지한다
    onCellEditingStopped(params) {
      params.api.setNodesSelected({
        nodes: [params.node],
        newValue: true,
        clearSelection: false,
      });
    },

    // AG Grid 준비 완료 시 API 저장 및 컬럼 크기를 조정한다
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
    // 감사 로그 목록과 컬럼 정의를 서버에서 로드한다
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

      const actionBadgeMap = {
        CREATE: { variant: "info", icon: "fa-plus", label: "생성" },
        UPDATE: { variant: "warning", icon: "fa-pen", label: "수정" },
        DELETE: { variant: "error", icon: "fa-trash", label: "삭제" },
      };
      const statusBadgeMap = {
        SUCCESS: { variant: "success", icon: "fa-check", label: "성공" },
        FAIL: { variant: "error", icon: "fa-xmark", label: "실패" },
      };
      const renderBadge = (map) => (p) => {
        const meta = map[p.value];
        if (!meta) return p.value || "";
        return `<span class="badge badge-${meta.variant}"><i class="fa-solid ${meta.icon} badge-icon"></i>${meta.label}</span>`;
      };

      // 해더  및 기능 설정
      this.columnDefs = [
        {
          headerName: "처리구분",
          field: "action",
          flex: 0.5,
          filter: "agTextColumnFilter",
          cellClass: "text-center",
          cellRenderer: renderBadge(actionBadgeMap),
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
          cellRenderer: renderBadge(statusBadgeMap),
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
          cellRenderer: (p) => (p.value ? formatDateTime(p.value) : ""),
        },
        {
          headerName: "변경이력",
          colId: "diff",
          flex: 0.6,
          cellClass: "text-center",
          sortable: false,
          cellRenderer: (p) => {
            if (!p.data?.before_data && !p.data?.after_data) return "";
            return `<button class="btn btn-xs"><i class="fa-solid fa-code-compare"></i>비교</button>`;
          },
          onCellClicked: (p) => {
            if (!p.data?.before_data && !p.data?.after_data) return;
            this.openDiffModal(p.data);
          },
        },
      ];
    },

    // 변경 이력 통합 비교 모달을 연다
    openDiffModal(row) {
      this.modal.openModal(
        LogModal,
        { row, title: `${row.page || row.target_type || ""} 변경이력` },
        "lg",
      );
    },
  },

  // 마운트 시 로그 목록을 로드한다
  mounted() {
    this.loadList();
  },
};
</script>

<style></style>
