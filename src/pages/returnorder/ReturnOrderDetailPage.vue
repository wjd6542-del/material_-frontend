<template>
  <div>
    <div class="lg:col-span-3">
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">판매 수량</div>
            <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <i class="fa-solid fa-box"></i>
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-gray-800">
            {{ formatNumber(summary?.quantity ?? 0) }}
          </div>
        </div>

        <div class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">판매 금액</div>
            <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-purple-600">
            {{ formatNumber(summary?.sale_amount ?? 0) }}
          </div>
        </div>

        <div class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">원가</div>
            <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <i class="fa-solid fa-coins"></i>
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-gray-700">
            {{ formatNumber(summary?.cost_amount ?? 0) }}
          </div>
        </div>

        <div class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">손익</div>
            <div
              class="w-10 h-10 flex items-center justify-center rounded-xl"
              :class="
                summary?.profit >= 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-500'
              "
            >
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div
            class="mt-3 text-2xl font-bold"
            :class="summary?.profit >= 0 ? 'text-green-600' : 'text-red-500'"
          >
            {{ formatNumber(summary?.profit ?? 0) }}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 mt-5">
      <div class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200">
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="text-base font-semibold text-gray-800">반품 세부내역</h2>
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
            placeholder="품목 선택"
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
            placeholder="창고 위치 선택"
            @change="loadList"
          />
        </div>

        <div class="p-4">
          <BaseTable
            ref="returnDetailTable"
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
import api from "@/api/api";

export default {
  name: "ReturnOrderDetailPage",

  components: { BaseTable, SearchSelect, DateRangePicker },

  mixins: [
    createListMixin({
      endpoint: "/api/returnorder/detail/list",
      initialWhere: {
        material_id: "",
        warehouse_id: "",
        supplier_id: "",
        location_id: "",
        key_word: "",
      },
    }),
    createRefDataMixin(["materials", "warehouses", "locations"]),
  ],

  data() {
    return {
      columns: [
        { key: "qrcode", label: "QR", type: "img", width: "100px", align: "center", sortable: true },
        { key: "return_no", label: "반품번호", width: "200px", align: "center", sortable: true },
        { key: "material_code", label: "품목코드", sortable: true, align: "center", width: "230px" },
        { key: "material_name", label: "품목명", sortable: true, width: "280px" },
        { key: "warehouse_name", label: "창고", sortable: true, align: "center", width: "80px" },
        { key: "location", label: "창고 위치", sortable: true, align: "center", width: "130px" },
        { key: "quantity", label: "수량", type: "number", align: "right", width: "80px", sortable: true },
        { key: "cost_amount", label: "원가", type: "currency", align: "right", width: "250px", sortable: true },
        { key: "sale_amount", label: "판매금액", type: "currency", align: "right", width: "250px", sortable: true },
        { key: "profit", label: "손익", type: "currency", align: "right", width: "250px", sortable: true },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "200px", sortable: true },
      ],
      materials: [],
      warehouses: [],
      locations: [],
      total: 0,
      group: null,
      summary: null,
    };
  },

  methods: {
    formatNumber(val) {
      return Number(val || 0).toLocaleString();
    },

    // 보드 카운트 로드
    async loadBoardCount() {
      try {
        const res = await api.post("/api/returnorder/boardCount");
        this.total = res.data?.totalCount || 0;
        this.group = res.data?.groupCount || null;
        this.summary = res.data?.summary || null;
      } catch (e) {
        // ignore
      }
    },
  },

  mounted() {
    this.loadBoardCount();
    this.loadRefData();
  },
};
</script>
