<template>
  <div class="p-2 sm:p-4 md:p-6">
    <div class="bg-white rounded-xl shadow border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">발주 세부내역</h2>
      </div>

      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div
          class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
        >
          <div class="sm:col-span-2 xl:col-span-2">
            <label class="form-label">조회 기간</label>
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              @change="loadList"
              class="w-full"
            />
          </div>

          <div>
            <label class="form-label">자재</label>
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="자재 선택"
              @change="loadList"
            />
          </div>

          <div>
            <label class="form-label">거래처</label>
            <SearchSelect
              v-model="where.supplier_id"
              :options="suppliers"
              labelKey="name"
              valueKey="id"
              placeholder="거래처 선택"
              @change="loadList"
            />
          </div>

          <div>
            <label class="form-label">상태</label>
            <select
              v-model="where.status"
              @change="loadList"
              class="field"
            >
              <option value="">전체</option>
              <option value="draft">임시저장</option>
              <option value="ordered">발주완료</option>
              <option value="received">구매완료</option>
              <option value="canceled">취소</option>
            </select>
          </div>

          <div class="sm:col-span-2 lg:col-span-4 xl:col-span-5 flex justify-end">
            <button
              @click="resetFilters"
              class="btn"
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
            ref="orderDetailTable"
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

function formatDateOnly(v) {
  if (!v) return "-";
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default {
  name: "PurchaseOrderDetailPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

  data() {
    return {
      columns: [
        {
          key: "order_no",
          label: "발주번호",
          width: "180px",
          align: "center",
          sortable: true,
        },
        {
          key: "supplier_name",
          label: "거래처",
          sortable: true,
          width: "160px",
        },
        {
          key: "material_name",
          label: "자재명",
          sortable: true,
          width: "240px",
        },
        {
          key: "spec",
          label: "규격",
          sortable: true,
          width: "160px",
        },
        {
          key: "quantity",
          label: "수량",
          type: "number",
          align: "right",
          width: "100px",
        },
        {
          key: "price",
          label: "단가",
          type: "currency",
          align: "right",
          width: "140px",
        },
        {
          key: "supply_amount",
          label: "판매가",
          type: "currency",
          align: "right",
          width: "150px",
        },
        {
          key: "order_date",
          label: "발주일",
          align: "center",
          width: "140px",
          sortable: true,
          formatter: formatDateOnly,
        },
        {
          key: "delivery_date",
          label: "납기일",
          align: "center",
          width: "140px",
          sortable: true,
          formatter: formatDateOnly,
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

      dateRange: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      },

      where: {
        material_id: "",
        supplier_id: "",
        status: "",
        startDate: null,
        endDate: null,
      },

      rows: [],
      materials: [],
      suppliers: [],
    };
  },

  methods: {
    // 검색 조건으로 발주 세부 내역을 로드한다
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

        const res = await api.post("/api/purchaseOrder/detail/list", where);
        this.rows = res.data;
        console.log(res.data);
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      }
    },

    // 검색 조건을 초기화하고 목록을 재조회한다
    resetFilters() {
      this.where = {
        material_id: "",
        supplier_id: "",
        status: "",
        startDate: null,
        endDate: null,
      };
      this.dateRange = { start: null, end: null };
      this.loadList();
    },

    // 자재 옵션을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    // 거래처 옵션을 로드한다
    async loadSupplier() {
      const res = await api.post("/api/supplier/list");
      this.suppliers = res.data;
    },
  },

  mounted() {
    this.loadList();
    this.loadMaterial();
    this.loadSupplier();
  },
};
</script>

<style scoped>
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

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
