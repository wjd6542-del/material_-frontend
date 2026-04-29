<template>
  <div class="p-2 sm:p-4 md:p-6">
    <div class="bg-white rounded-xl shadow border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">발주 세부내역</h2>
      </div>

      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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
            <label class="form-label">품목</label>
            <SearchSelect
              v-model="where.material_id"
              :options="materials"
              labelKey="name"
              valueKey="id"
              placeholder="품목 선택"
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
            <select v-model="where.status" @change="loadList" class="field">
              <option value="">전체</option>
              <option value="draft">임시저장</option>
              <option value="ordered">발주완료</option>
              <option value="received">구매완료</option>
              <option value="canceled">취소</option>
            </select>
          </div>

          <div class="sm:col-span-2 lg:col-span-4 xl:col-span-5 flex justify-end">
            <button @click="resetFilters" class="btn">
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

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";
import { formatDateOnly } from "@/utils/date";

const INITIAL_WHERE = {
  material_id: "",
  supplier_id: "",
  status: "",
};

export default {
  name: "PurchaseOrderDetailPage",

  components: { BaseTable, SearchSelect, DateRangePicker },

  mixins: [
    createListMixin({
      endpoint: "/api/purchaseOrder/detail/list",
      initialWhere: INITIAL_WHERE,
    }),
    createRefDataMixin(["materials", "suppliers"]),
  ],

  data() {
    return {
      columns: [
        { key: "order_no", label: "발주번호", width: "180px", align: "center", sortable: true },
        { key: "supplier_name", label: "거래처", sortable: true, width: "160px" },
        { key: "material_name", label: "품목명", sortable: true, width: "240px" },
        { key: "spec", label: "규격", sortable: true, width: "160px" },
        { key: "quantity", label: "수량", type: "number", align: "right", width: "100px" },
        { key: "price", label: "단가", type: "currency", align: "right", width: "140px" },
        { key: "supply_amount", label: "판매가", type: "currency", align: "right", width: "150px" },
        { key: "order_date", label: "발주일", align: "center", width: "140px", sortable: true, formatter: formatDateOnly },
        { key: "delivery_date", label: "납기일", align: "center", width: "140px", sortable: true, formatter: formatDateOnly },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "180px", sortable: true },
      ],
      materials: [],
      suppliers: [],
    };
  },

  methods: {
    resetFilters() {
      this.where = { ...INITIAL_WHERE };
      this.dateRange = { start: null, end: null };
      this.loadList();
    },
  },

  mounted() {
    this.loadRefData();
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
