<template>
  <div class="p-4 lg:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- 테이블 -->
      <div
        class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">재고현황</h2>
        </div>

        <div class="p-4 pb-0 flex items-center gap-1">
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />

          <SearchSelect
            v-model="where.material_id"
            :options="materials"
            labelKey="name"
            valueKey="id"
            placeholder="자재 선택"
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

        <div class="p-4 pb-0 flex items-center gap-1">
          <button
            @click="openModal"
            class="h-[40px] px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
          >
            <i class="fa-solid fa-clipboard-list"></i>
            현재고 전표
          </button>
        </div>

        <div class="p-4">
          <BaseTable
            ref="inboundDetailTable"
            :columns="columns"
            :rows="rows"
            sortable
            pagination
            :pageSize="10"
            :pageSizeOptions="[10, 20, 50, 100]"
          />
        </div>
      </div>

      <!-- 카드 영역 -->
      <div class="lg:col-span-2 flex flex-col gap-4">
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

            <!-- 우측 강조 아이콘 -->
            <i class="fa-solid fa-boxes-stacked text-4xl text-gray-200"></i>
          </div>
        </div>

        <!-- 안전재고 미만 -->
        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 flex items-center justify-center rounded-lg bg-red-100"
              >
                <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
              </div>
              <span class="text-gray-700 font-medium">안전재고 미만</span>
            </div>

            <button class="text-xs text-blue-500 hover:underline">
              최대 10개
            </button>
          </div>

          <div class="p-3 max-h-[200px] overflow-y-auto">
            <div
              v-for="row in lowStockList"
              :key="row.id"
              class="flex justify-between items-center px-3 py-2 text-sm border-b last:border-0 hover:bg-gray-50 rounded"
            >
              <div class="flex items-center gap-2">
                <i
                  class="fa-solid fa-circle-exclamation text-red-400 text-xs"
                ></i>

                <div class="flex flex-col">
                  <span class="font-medium text-gray-700">
                    {{ row.name }}
                  </span>
                  <span class="text-xs text-gray-400">
                    최소 {{ row.safe_qty }}
                  </span>
                </div>
              </div>

              <div class="text-red-600 font-semibold">
                {{ formatNumber(row.qty) }}
              </div>
            </div>

            <div
              v-if="!lowStockList.length"
              class="text-center text-gray-400 py-4"
            >
              <i class="fa-regular fa-face-meh mb-1"></i><br />
              데이터 없음
            </div>
          </div>
        </div>

        <!-- 이번달 신규 자재 -->
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
              <span class="text-gray-700 font-medium">이번달 신규 자재</span>
            </div>

            <button
              class="text-xs text-blue-500 hover:underline"
              @click="goNewMaterialPage"
            >
              전체보기 →
            </button>
          </div>

          <div class="p-3 max-h-[400px] overflow-y-auto">
            <div
              v-for="row in newMaterialList"
              :key="row.id"
              class="flex justify-between items-center px-3 py-2 text-sm border-b last:border-0 hover:bg-gray-50 rounded"
            >
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-plus text-green-500 text-xs"></i>

                <div class="flex flex-col">
                  <span class="font-medium text-gray-700">
                    {{ row.name }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatDate(row.created_at) }}
                  </span>
                </div>
              </div>

              <div class="text-green-600 font-semibold text-xs">NEW</div>
            </div>

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

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";

import { useModalStore } from "@/stores/modal";
import StockPrintModal from "@/components/stock/StockPrintModal.vue";

import api from "@/api/api";

// stock

export default {
  name: "StockPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

  data() {
    return {
      modal: useModalStore(),
      columns: [
        {
          key: "qrcode",
          label: "QR",
          type: "img",
          width: "80px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_code",
          label: "자재코드",
          sortable: true,
          width: "200px",
        },
        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "200px",
        },
        {
          key: "warehouse_name",
          label: "창고위치",
          sortable: true,
          width: "100px",
        },
        {
          key: "location_code",
          label: "선반위치",
          sortable: true,
          width: "100px",
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "updated_at",
          label: "변경일",
          type: "date",
          align: "center",
          width: "200px",
          sortable: true,
        },
      ],

      dateRange: { start: null, end: null },

      // 검색 조건
      where: {
        material_id: "",
        warehouse_id: "",
        supplier_id: "",
        location_id: "",
        key_word: "",
        startDate: null,
        endDate: null,
      },

      rows: [],
      materials: [],
      warehouses: [],
      locations: [],

      // 카드 영역

      newMaterialList: [],
      lowStockList: [],
      total_stock: 0,
    };
  },

  methods: {
    // 모달로 리스트출력
    goLowStockPage() {
      this.$router.push("/login");
    },

    //자재 페이지로 이동
    goNewMaterialPage() {
      this.$router.push("/materials");
    },

    formatNumber(v) {
      return new Intl.NumberFormat().format(v || 0);
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

    // 데이터 로드 처리
    async loadList() {
      this.rows = [];

      const where = {
        ...this.where,
      };

      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }

      const res = await api.post("/api/stock/list", where);
      this.rows = res.data;
    },

    // 현재고 전표
    openModal() {
      this.modal.openModal(StockPrintModal, {}, "xl");
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },

    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data;
    },

    async newMonthMaterial() {
      const res = await api.post("/api/material/newMonthMaterial");
      this.newMaterialList = res.data;
    },

    async lowStockMaterials() {
      const res = await api.post("/api/stock/lowStockMaterials");
      this.lowStockList = res.data;
    },

    async totalStockCount() {
      const res = await api.post("/api/stock/stockSummary");
      const data = res.data;
      this.total_stock = data.total_qty;
      console.log(data);
    },
  },
  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadWarehouse();
    this.loadLocation();
    this.newMonthMaterial();
    this.lowStockMaterials();
    this.totalStockCount();
  },
};
</script>
