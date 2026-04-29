<template>
  <div class="p-4 lg:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- 테이블 -->
      <div
        class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="text-base font-semibold text-gray-800">재고현황</h2>
        </div>

        <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
          <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[240px] sm:max-w-[400px]">
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              @change="loadList"
            />
          </div>
          <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[160px] sm:max-w-[260px]">
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="품목 선택"
              @change="loadList"
            />
          </div>
          <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[140px] sm:max-w-[220px]">
            <SearchSelect
              v-model="where.warehouse_id"
              :options="warehouses"
              labelKey="name"
              valueKey="id"
              placeholder="창고 선택"
              @change="loadList"
            />
          </div>
          <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[140px] sm:max-w-[220px]">
            <SearchSelect
              v-model="where.location_id"
              :options="locations"
              labelKey="name"
              valueKey="id"
              placeholder="선반 위치 선택"
              @change="loadList"
            />
          </div>
        </div>

        <div class="p-4 pb-0 flex items-center gap-1">
          <button @click="openModal" class="btn btn-primary">
            <i class="fa-solid fa-clipboard-list"></i>
            현재고 전표
          </button>
        </div>

        <div class="p-4">
          <BaseTable
            ref="stockTable"
            :columns="columns"
            :rows="rows"
            sortable
            pagination
            :pageSize="10"
            :pageSizeOptions="[10, 20, 50, 100]"
            @cell-click="onCellClick"
          />
        </div>
      </div>

      <!-- 카드 영역 -->
      <div class="lg:col-span-2 flex flex-col sm:flex-row lg:flex-col gap-4">
        <!-- 총 재고 -->
        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-100"
              >
                <i class="fa-solid fa-warehouse text-blue-600"></i>
              </div>
              <span class="text-gray-700 font-medium">총 재고 수량</span>
            </div>
          </div>

          <div class="p-5 flex items-center justify-between">
            <div>
              <div class="text-3xl font-bold text-gray-800">
                {{ formatNumber(total_stock || 0) }}
              </div>
              <div class="text-sm text-gray-400 mt-1">전체 창고 기준</div>
            </div>
            <i class="fa-solid fa-boxes-stacked text-4xl text-gray-200"></i>
          </div>
        </div>

        <!-- 이번달 신규 품목 -->
        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100"
              >
                <i class="fa-solid fa-box-open text-green-600"></i>
              </div>
              <span class="text-gray-700 font-medium">이번달 신규 품목</span>
            </div>

            <button
              class="text-xs text-blue-500 hover:underline"
              @click="goNewMaterialPage"
            >
              전체보기 →
            </button>
          </div>

          <div class="p-3 max-h-[400px] overflow-y-auto">
            <button
              type="button"
              v-for="row in newMaterialList"
              :key="row.id"
              @click="openMaterialDetail(row)"
              v-tip="'상세 정보 보기'"
              class="w-full flex justify-between items-center px-3 py-2 text-sm border-b last:border-0 hover:bg-blue-50 rounded transition text-left"
            >
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-plus text-green-500 text-xs"></i>
                <div class="flex flex-col">
                  <span class="font-medium text-gray-700">
                    {{ row.name }}
                  </span>
                  <span class="text-xs text-gray-400">
                    <BaseDateText :value="row.created_at" show-time />
                  </span>
                </div>
              </div>
              <div class="text-green-600 font-semibold text-xs">NEW</div>
            </button>

            <div
              v-if="!newMaterialList.length"
              class="text-center text-gray-400 py-4"
            >
              <i class="fa-regular fa-face-meh mb-1"></i><br />
              데이터 없음
            </div>
          </div>
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
import BaseDateText from "@/components/base/BaseDateText.vue";
import { useModalStore } from "@/stores/modal";
import StockPrintModal from "@/components/stock/StockPrintModal.vue";
import MaterialDetailModal from "@/components/material/MaterialDetailModal.vue";
import ShelfLocationViewerModal from "@/components/warehouse/ShelfLocationViewerModal.vue";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";
import api from "@/api/api";

export default {
  name: "StockPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
    BaseDateText,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/stock/list",
      tableRef: "stockTable",
      initialWhere: {
        material_id: "",
        warehouse_id: "",
        supplier_id: "",
        location_id: "",
        key_word: "",
      },
    }),
    createRefDataMixin(["materials", "warehouses", "locationsRaw"]),
  ],

  data() {
    return {
      modal: useModalStore(),
      columns: [
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "material_code", label: "품목코드", sortable: true, width: "200px" },
        { key: "material_name", label: "품목명", sortable: true, width: "200px" },
        { key: "warehouse_name", label: "창고위치", sortable: true, width: "100px" },
        { key: "location_code", label: "선반위치", type: "button", sortable: true, width: "120px", align: "center" },
        { key: "quantity", label: "수량", type: "number", align: "right", width: "100px" },
        { key: "updated_at", label: "변경일", type: "date", align: "center", width: "200px", sortable: true },
      ],
      materials: [],
      warehouses: [],
      locations: [],
      newMaterialList: [],
      lowStockList: [],
      total_stock: 0,
    };
  },

  methods: {
    // 저재고 상세 페이지로 이동
    goLowStockPage() {
      this.$router.push("/login");
    },

    // 품목 목록 페이지로 이동
    goNewMaterialPage() {
      this.$router.push("/materials");
    },

    // 천단위 구분자
    formatNumber(v) {
      return new Intl.NumberFormat().format(v || 0);
    },

    // 현재고 전표 모달
    openModal() {
      this.modal.openModal(StockPrintModal, {}, "xl");
    },

    // 신규 품목 → 상세 모달
    openMaterialDetail(row) {
      if (!row?.id) return;
      this.modal.openModal(
        MaterialDetailModal,
        { material_id: row.id },
        "lg",
      );
    },

    // 셀 클릭: 선반위치 → 위치 시각화 모달
    onCellClick(data) {
      if (!data) return;
      if (data.key === "location_code") {
        const shelfId = data.row?.shelf_id;
        if (!shelfId) {
          this.$toast?.error?.("연결된 선반 정보가 없습니다.");
          return;
        }
        this.modal.openModal(
          ShelfLocationViewerModal,
          { shelf_id: shelfId },
          "xl",
        );
      }
    },

    // 카드 영역 데이터 병렬 로드 (참조 옵션은 mixin 의 loadRefData)
    async loadCardData() {
      const [nm, ls, ts] = await Promise.allSettled([
        api.post("/api/material/newMonthMaterial"),
        api.post("/api/stock/lowStockMaterials"),
        api.post("/api/stock/stockSummary"),
      ]);
      if (nm.status === "fulfilled") this.newMaterialList = nm.value.data || [];
      if (ls.status === "fulfilled") this.lowStockList = ls.value.data || [];
      if (ts.status === "fulfilled") {
        this.total_stock = ts.value.data?.total_qty || 0;
      }
    },
  },

  mounted() {
    this.loadRefData();
    this.loadCardData();
  },
};
</script>
