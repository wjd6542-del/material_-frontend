<template>
  <div class="p-6 grid grid-cols-12 gap-6 h-full">
    <!-- 좌측 작업 패널 -->
    <div
      class="col-span-4 bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-6"
    >
      <!-- 타이틀 -->
      <h2 class="font-semibold text-gray-700 flex items-center gap-2 text-base">
        <i class="fa-solid fa-box-open text-blue-500"></i>
        판매 처리
      </h2>

      <!-- QR 스캔 카드 -->
      <div class="bg-gray-50 border rounded-xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <i class="fa-solid fa-qrcode text-blue-500"></i>
          QR / 바코드 스캔
        </div>

        <input
          v-model="scanCode"
          @change="scanMaterial"
          class="field w-full focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="QR 또는 바코드 입력"
        />
      </div>

      <!-- 자재 검색 카드 -->
      <div class="bg-gray-50 border rounded-xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <i class="fa-solid fa-magnifying-glass text-blue-500"></i>
          자재 검색
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <!-- 자재명 검색 -->
          <input
            v-model="searchText"
            @change="searchMaterial"
            class="field w-full focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="자재명 검색"
          />

          <!-- 자재 선택 -->
          <SearchSelect
            v-model="material_id"
            :options="materialsArr"
            labelKey="name"
            valueKey="id"
            placeholder="자재 선택"
            @change="search_material"
          />
        </div>
      </div>

      <!-- 자재 목록 카드 -->
      <div class="bg-gray-50 border rounded-xl p-4 space-y-3 flex flex-col">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
          재고 목록
        </div>

        <div
          v-if="materials.length"
          class="border rounded-lg max-h-80 overflow-y-auto bg-white"
        >
          <div
            v-for="m in materials"
            :key="m.id"
            @click="addItem(m)"
            class="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-b-0 transition"
          >
            <span class="font-medium text-gray-700">
              {{ m.location?.code }} - {{ m.material?.name }}
            </span>

            <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
              재고 {{ m.quantity }}
            </span>
          </div>
        </div>

        <div v-else class="text-sm text-gray-400 text-center py-6">
          검색된 자재가 없습니다
        </div>
      </div>
    </div>

    <!-- 우측 판매 목록 -->
    <div class="col-span-8 bg-white border rounded-xl shadow-sm flex flex-col">
      <!-- header -->
      <div class="p-4 border-b flex justify-between items-center">
        <!-- 타이틀 -->
        <h2 class="font-semibold text-gray-700 flex items-center gap-2 text-base">
          <i class="fa-solid fa-list text-gray-500"></i>
          판매 번호 : {{ outbound_no }}
        </h2>

        <div class="text-xs text-gray-500">총 {{ totalCount }} 개</div>
      </div>

      <!-- list -->
      <div class="flex-1 overflow-y-auto">
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
            :localeText="{
              noRowsToShow: '데이터가 없습니다',
            }"
          />
        </div>
      </div>

      <!-- footer -->
      <div
        class="border-t bg-gray-50 px-6 py-5 flex items-center justify-between"
      >
        <!-- summary badges -->
        <div class="flex items-center gap-6">
          <!-- 총 수량 -->
          <div
            class="flex items-center gap-3 bg-blue-100 text-blue-800 px-5 py-3 rounded-xl text-sm font-semibold"
          >
            <i class="fa-solid fa-box text-lg"></i>
            <span>총 수량</span>
            <span class="bg-blue-200 px-3 py-1 rounded-lg text-lg font-bold">
              {{ totalQty }}
            </span>
          </div>

          <!-- 총 금액 -->
          <div
            class="flex items-center gap-3 bg-purple-100 text-purple-800 px-5 py-3 rounded-xl text-sm font-semibold"
          >
            <i class="fa-solid fa-coins text-lg"></i>
            <span>총 금액</span>
            <span class="bg-purple-200 px-3 py-1 rounded-lg text-lg font-bold">
              {{ totalAmount }}
            </span>
          </div>

          <!-- 순익 -->
          <div
            class="flex items-center gap-3 bg-emerald-200 text-emerald-900 px-5 py-3 rounded-xl text-sm font-semibold"
          >
            <i class="fa-solid fa-chart-line text-lg"></i>
            <span>순익</span>
            <span class="bg-emerald-300 px-3 py-1 rounded-lg text-lg font-bold">
              {{ totalProfit }}
            </span>
          </div>
        </div>

        <!-- action buttons -->
        <div class="flex items-center gap-3">
          <!-- 전체 삭제 -->
          <button
            @click="clearItems"
            class="btn btn-danger flex items-center gap-2"
          >
            <i class="fa-solid fa-trash"></i>
            전체 삭제
          </button>

          <!-- 판매 확정 -->
          <button
            @click="saveOutbound"
            class="btn btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <i class="fa-solid fa-check"></i>
            판매 확정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import SearchSelect from "@/components/base/SearchSelect.vue";
import { AgGridVue } from "ag-grid-vue3";

export default {
  components: { SearchSelect, AgGridVue },
  data() {
    return {
      tempId: -1,
      totalAmount: 0,
      totalProfit: 0,
      totalQty: 0,
      totalCount: 0,

      gridApi: null,
      columnApi: null,

      scanCode: "",
      searchText: "",
      material_id: "",
      // 재고 목록
      materials: [],
      selectedMaterial: null,
      quantity: 1,

      materialsArr: [],

      // 테이블
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
          this.updateFooter();
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

      outbound_no: "",
      warehouses: [],
      locations: [],

      materialMap: {},
      warehouseMap: {},
      locationMap: {},
    };
  },

  computed: {},

  methods: {
    // 현재 시각 기반의 판매번호를 생성해 설정한다
    mk_out_no() {
      this.outbound_no = "OUT-" + Date.now();
    },
    // 셀 편집 종료 시 해당 행을 선택 상태로 유지한다
    onCellEditingStopped(params) {
      params.api.setNodesSelected({
        nodes: [params.node],
        newValue: true,
        clearSelection: false,
      });
    },

    // AG Grid 준비 완료 시 API 저장 및 행 변경 리스너를 등록한다
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      params.api.addEventListener("rowDataUpdated", () => {
        this.totalCount = this.gridApi.getDisplayedRowCount();
      });

      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 0);
    },

    // QR 조회 API
    // QR 스캔 코드로 재고를 조회한다
    async scanMaterial() {
      this.search({ scan_code: this.scanCode });
    },

    // 자재 검색 API
    // 키워드로 재고를 검색한다
    async searchMaterial() {
      this.search({ scan_code: this.searchText });
    },

    // 검색 진행
    // 재고 보유분만 조회하며 스캔 결과가 1건이면 자동 추가한다
    async search(where) {
      this.materials = [];

      // 재고 없는건 조회 안되게
      where.in_stock = true;
      try {
        const res = await api.post("/api/stock/list", where);

        // 목록 추가
        this.materials = res.data;

        // 🔥 QR / 바코드 스캔시 결과 1개면 자동 추가
        if (where.scan_code && this.materials.length === 1) {
          this.addItem(this.materials[0]);

          // 👉 입력값 초기화 (연속 스캔용)
          this.scanCode = "";
        }
      } catch (e) {
        this.$toast.error(e.message);
        this.materials = [];
      }
    },

    // 특정 행을 rowData에서 제거한다
    deleteRow(row) {
      this.rowData = this.rowData.filter((r) => r !== row);
    },

    // 선택된 자재 id로 검색을 실행한다
    search_material() {
      this.search({ material_id: this.material_id });
    },

    // 항목추가
    // 동일 행은 수량 증가, 신규면 추가 (재고 초과 방지)
    addItem(item) {
      // 1. 재고 체크
      if (item.quantity <= 0) {
        this.$toast.error(`${item.material.name} 재고가 부족합니다`);
        return;
      }

      let foundNode = null;

      this.gridApi.forEachNode((node) => {
        const row = node.data;

        if (
          row.material_id === item.material_id &&
          row.warehouse_id === item.warehouse_id &&
          row.location_id === item.location_id
        ) {
          foundNode = node;
        }
      });

      // 🔥 있으면 수량 증가
      if (foundNode) {
        const newQty = (Number(foundNode.data.quantity) || 0) + 1;

        // 👉 재고 초과 방지
        if (newQty > item.quantity) {
          this.$toast.warning("재고 수량을 초과할 수 없습니다");
          return;
        }

        foundNode.setData({
          ...foundNode.data,
          quantity: newQty,
        });

        foundNode.setSelected(true);
        this.gridApi.ensureNodeVisible(foundNode);
      } else {
        // 🔥 없으면 신규 추가
        const newRow = {
          id: this.tempId--,
          material_id: item.material_id,
          warehouse_id: item.warehouse_id,
          location_id: item.location_id,
          quantity: 1,
          sale_price: 0,
          cost_price: 0,
        };

        const res = this.gridApi.applyTransaction({
          add: [newRow],
          addIndex: 0,
        });

        if (res.add && res.add.length) {
          res.add[0].setSelected(true);
        }
      }

      this.updateFooter();
    },

    // 화면 삭제처리
    // 그리드의 모든 행을 제거한다
    clearItems() {
      const rows = [];

      this.gridApi.forEachNode((node) => {
        rows.push(node.data);
      });

      this.gridApi.applyTransaction({
        remove: rows,
      });

      this.totalCount = 0;

      this.updateFooter();
    },

    // 저장 처리
    // 선택된 행들을 판매 전표로 저장하고 번호를 새로 발급한다
    async saveOutbound() {
      try {
        const rows = this.gridApi.getSelectedRows();

        const ok = await this.$confirm(
          `판매항목 총${rows.length}개  처리하시겠습니까?`,
          "판매 확인",
        );
        if (!ok) return;

        await api.post("/api/outbound/save", {
          id: 0,
          outbound_no: this.outbound_no,
          memo: "pos 자동등록처리",
          items: rows,
        });

        this.$toast.success("판매 처리가 완료되었습니다");

        this.mk_out_no();
        this.updateFooter();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 자재 목록 및 id→name 맵을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      const materialsArr = res.data;
      this.materialsArr = materialsArr;

      this.materialMap = Object.fromEntries(
        materialsArr.map((w) => [w.id, w.name]),
      );
    },

    // 창고 목록 및 id→name 맵을 로드한다
    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      const warehouses = res.data;
      this.warehouses = warehouses;

      this.warehouseMap = Object.fromEntries(
        warehouses.map((w) => [w.id, w.name]),
      );
    },
    // 위치 목록 및 id→name 맵을 로드한다
    async loadLocation() {
      const res = await api.post("/api/location/list");
      const locations = res.data;
      this.locations = locations;
      this.locationMap = Object.fromEntries(
        locations.map((w) => [w.id, w.name]),
      );
    },

    // 하단 데이터 업데이트
    // 선택된 행 기준으로 총 수량/금액/이익을 계산한다
    updateFooter() {
      let totalQty = 0;
      let totalAmount = 0;
      let totalProfit = 0;

      const rows = this.gridApi.getSelectedRows();

      rows.forEach((row) => {
        const qty = Number(row.quantity) || 0;
        const sale = Number(row.sale_price) || 0;
        const cost = Number(row.cost_price) || 0;

        totalQty += qty;
        totalAmount += qty * sale;
        totalProfit += qty * (sale - cost);
      });

      this.totalQty = totalQty;
      this.totalAmount = totalAmount;
      this.totalProfit = totalProfit;
    },

    // 테이블 로드
    // 참조 데이터를 사용해 AG Grid 컬럼 정의를 구성한다
    loadTable() {
      const warehouses = this.warehouses;
      const warehouseMap = this.warehouseMap;

      const materialArr = this.materialArr;
      const materialMap = this.materialMap;

      const locations = this.locations;
      const locationMap = this.locationMap;

      this.columnDefs = [
        {
          headerName: "제품",
          field: "material_id",
          flex: 1,
          editable: false, // 수정 불가
          valueFormatter: (params) => materialMap[params.value] || "",
        },
        {
          headerName: "창고위치",
          field: "warehouse_id",
          flex: 0.3,
          editable: false, // 수정 불가
          valueFormatter: (params) => warehouseMap[params.value] || "",
        },
        {
          headerName: "선반위치",
          field: "location_id",
          flex: 0.5,
          editable: false, // 수정 불가
          valueFormatter: (params) => locationMap[params.value] || "",
        },
        {
          headerName: "수량",
          field: "quantity",
          filter: "agTextColumnFilter",
          flex: 0.3,
        },
        {
          headerName: "원가",
          field: "cost_price",
          filter: "agNumberColumnFilter",
          flex: 0.5,
        },
        {
          headerName: "판매가",
          field: "sale_price",
          filter: "agNumberColumnFilter",
          flex: 0.5,
        },
        {
          headerName: "처리",
          field: "action",
          flex: 0.2,
          sortable: false,
          filter: false,
          editable: false,
          cellRenderer: (params) => {
            const btn = document.createElement("button");
            btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            btn.className = "text-red-500 hover:text-red-700 px-2 py-1 rounded";

            btn.addEventListener("click", () => {
              params.api.applyTransaction({
                remove: [params.data],
              });
            });

            return btn;
          },
        },
      ];
    },
  },

  // 마운트 시 참조 데이터와 테이블 구성 및 초기 검색을 수행한다
  async mounted() {
    await this.loadMaterial();
    await this.loadWarehouse();
    await this.loadLocation();
    await this.loadTable();

    this.mk_out_no();

    this.search({ in_stock: true });
  },
};
</script>
