// @ts-nocheck
import api from "@/api/api";

export interface AgGridMixinConfig {
  /** 목록 조회 API */
  listEndpoint: string;
  /** 일괄 저장 API */
  saveEndpoint: string;
  /** 일괄 삭제 API */
  deleteEndpoint: string;
  /** addRow 시 기본 필드값 (sort 는 mixin 이 자동 부여) */
  newRowDefaults?: () => Record<string, any>;
}

/**
 * AG Grid 기반 인라인 편집 리스트 페이지 공용 mixin 팩토리.
 *
 * 표준 AG Grid 셋업과 add/save/delete 흐름을 추출:
 *  - state: gridApi/columnApi/tempId/rowData/columnDefs/search
 *  - gridOptions / defaultColDef (멀티 행 선택 + 셀 편집 시 자동 선택)
 *  - onGridReady / onCellEditingStopped
 *  - addRow (default 객체 + sort 자동 증가)
 *  - saveRows / deleteRows (선택 행 batchSave / batchDelete)
 *  - mounted 자동 loadList
 *
 * 페이지에서 `columnDefs` 는 data 또는 computed 로 정의해야 함.
 */
export function createAgGridMixin(config: AgGridMixinConfig) {
  const {
    listEndpoint,
    saveEndpoint,
    deleteEndpoint,
    newRowDefaults = () => ({}),
  } = config;

  if (!listEndpoint || !saveEndpoint || !deleteEndpoint) {
    throw new Error(
      "[createAgGridMixin] listEndpoint/saveEndpoint/deleteEndpoint 가 필요합니다.",
    );
  }

  return {
    data() {
      return {
        gridApi: null as any,
        columnApi: null as any,
        tempId: -1,
        search: {} as Record<string, any>,
        rowData: [] as any[],
        columnDefs: [] as any[],

        gridOptions: {
          getRowId: (params: any) => String(params.data.id),
          rowSelection: {
            mode: "multiRow",
            checkboxes: true,
            headerCheckbox: true,
          },
          // 셀 값 변경 시 해당 행을 선택 상태로 자동 표시
          onCellValueChanged: (params: any) => {
            if (params.oldValue !== params.newValue) {
              params.node.setSelected(true);
            }
          },
          rowClassRules: {
            "row-inactive": (params: any) => params.data?.is_active === false,
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
      // 셀 편집 종료 시 해당 행을 선택 상태로 유지
      onCellEditingStopped(params: any) {
        params.api.setNodesSelected({
          nodes: [params.node],
          newValue: true,
          clearSelection: false,
        });
      },

      // AG Grid 준비 완료 시 api 참조 저장 + 컬럼 크기 조정
      onGridReady(this: any, params: any) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        setTimeout(() => params.api.sizeColumnsToFit(), 0);
      },

      // 신규 행 추가 (sort 자동 증가)
      addRow(this: any) {
        let maxSort = 0;
        this.gridApi.forEachNode((node: any) => {
          if (node.data.sort > maxSort) maxSort = node.data.sort;
        });
        const newRow = {
          id: this.tempId--,
          sort: maxSort + 1,
          ...newRowDefaults(),
        };
        const res = this.gridApi.applyTransaction({
          add: [newRow],
          addIndex: 0,
        });
        res.add[0].setSelected(true);
      },

      // 선택된 행을 서버에 일괄 저장
      async saveRows(this: any) {
        const rows = this.gridApi.getSelectedRows();
        if (rows.length === 0) {
          this.$toast?.error?.("선택된 정보가 없습니다");
          return;
        }
        try {
          await api.post(saveEndpoint, rows);
          this.$toast?.success?.("저장 완료");
          this.loadList();
        } catch (e) {
          this.$toast?.error?.("저장 실패");
        }
      },

      // 선택된 행을 사용자 확인 후 일괄 삭제
      async deleteRows(this: any) {
        const rows = this.gridApi.getSelectedRows();
        if (rows.length === 0) {
          this.$toast?.error?.("선택된 정보가 없습니다");
          return;
        }
        const ok = await this.$confirm?.(
          `선택된 ${rows.length}개 항목을 삭제하시겠습니까?`,
          "삭제 확인",
          "danger",
        );
        if (!ok) return;
        try {
          await api.post(deleteEndpoint, rows);
          this.$toast?.success?.("삭제 완료");
          this.loadList();
        } catch (e) {
          this.$toast?.error?.("삭제 중 오류가 발생했습니다");
        }
      },

      // 기본 loadList - 응답을 rowData 에 저장. columnDefs 는 페이지에서 설정.
      async loadList(this: any) {
        try {
          const res = await api.post(listEndpoint, this.search);
          this.rowData = Array.isArray(res.data) ? res.data : [];
        } catch (e) {
          this.rowData = [];
        }
      },
    },

    mounted(this: any) {
      this.loadList();
    },
  };
}