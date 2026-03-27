<template>
  <div class="p-2 sm:p-4 md:p-6">
    <div class="bg-white rounded-xl shadow border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">입고 목록</h2>
      </div>

      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3"
        >
          <div class="sm:col-span-2 lg:flex-1 min-w-[280px]">
            <label class="block text-xs font-medium text-gray-500 mb-1"
              >조회 기간</label
            >
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              @change="loadList"
              class="w-full"
            />
          </div>

          <div class="lg:w-48">
            <label class="block text-xs font-medium text-gray-500 mb-1"
              >자재</label
            >
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="자재 선택"
              @change="loadList"
            />
          </div>

          <div class="lg:w-48">
            <label class="block text-xs font-medium text-gray-500 mb-1"
              >거래처</label
            >
            <SearchSelect
              v-model="where.supplier_id"
              :options="suppliers"
              labelKey="name"
              valueKey="id"
              placeholder="거래처 선택"
              @change="loadList"
            />
          </div>

          <div class="lg:w-60">
            <label class="block text-xs font-medium text-gray-500 mb-1"
              >창고</label
            >
            <SearchSelect
              v-model="where.warehouse_id"
              :options="warehouses"
              labelKey="name"
              valueKey="id"
              placeholder="창고 선택"
              @change="loadList"
            />
          </div>

          <div class="lg:w-60">
            <label class="block text-xs font-medium text-gray-500 mb-1"
              >선반 위치</label
            >
            <SearchSelect
              v-model="where.location_id"
              :options="locations"
              labelKey="name"
              valueKey="id"
              placeholder="위치 선택"
              @change="loadList"
            />
          </div>

          <div class="flex items-center lg:ml-auto">
            <button
              @click="resetFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <i class="fa-solid fa-rotate-right"></i>
              초기화
            </button>
          </div>
        </div>
      </div>

      <div class="p-0 sm:p-4 overflow-x-auto">
        <div class="min-w-[1200px]">
          <BaseTable
            ref="inboundDetailTable"
            :columns="columns"
            :rows="rows"
            sortable
            selectable
            pagination
            :pageSize="10"
            :pageSizeOptions="[10, 20, 50, 100]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import api from "@/api/api";

export default {
  name: "InboundDetailPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

  data() {
    return {
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
          key: "inbound_code",
          label: "입고번호",
          width: "200px",
          align: "center",
          sortable: true,
        },
        {
          key: "material_code",
          label: "자재코드",
          sortable: true,
          width: "180px",
        },
        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "250px",
        },
        {
          key: "supplier_name",
          label: "거래처",
          sortable: true,
          width: "120px",
        },
        {
          key: "warehouse_name",
          label: "창고위치",
          sortable: true,
          width: "100px",
        },
        {
          key: "location_name",
          label: "선반위치",
          sortable: true,
          width: "150px",
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "unit_price",
          label: "금액(개당)",
          type: "currency",
          align: "right",
          width: "150px",
        },
        {
          key: "amount",
          label: "금액(총)",
          type: "currency",
          align: "right",
          width: "150px",
        },
        {
          key: "created_at",
          label: "등록일",
          type: "date",
          align: "center",
          width: "180px",
          sortable: true,
        },
      ],

      dateRange: { start: null, end: null },

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
      suppliers: [],
      warehouses: [],
      locations: [],
    };
  },

  methods: {
    async loadList() {
      try {
        const where = { ...this.where };
        if (this.dateRange?.start) {
          where.startDate =
            typeof this.dateRange.start === "string"
              ? this.dateRange.start
              : this.dateRange.start.toISOString();
        }
        if (this.dateRange?.end) {
          where.endDate =
            typeof this.dateRange.end === "string"
              ? this.dateRange.end
              : this.dateRange.end.toISOString();
        }

        const res = await api.post("/api/inbound/detail/list", where);
        this.rows = res.data;
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      }
    },

    resetFilters() {
      this.where = {
        material_id: "",
        warehouse_id: "",
        supplier_id: "",
        location_id: "",
        key_word: "",
        startDate: null,
        endDate: null,
      };
      this.dateRange = { start: null, end: null };
      this.loadList();
    },

    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    async loadSupplier() {
      const res = await api.post("/api/supplier/list");
      this.suppliers = res.data;
    },

    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },

    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data.map((row) => ({
        ...row,
        name: `${row.code} - ${row.name}`,
      }));
    },
  },

  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadSupplier();
    this.loadWarehouse();
    this.loadLocation();
  },
};
</script>

<style scoped>
/* 모바일에서 테이블 스크롤 시 부드럽게 처리 */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* 스크롤바 디자인 (선택 사항) */
::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
::-webkit-scrollbar-track {
  background: #f3f4f6;
}
</style>
