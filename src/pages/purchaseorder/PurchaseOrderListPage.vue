<template>
  <div>
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">발주 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('purchaseorder.create')"
          @click="goRegister"
          class="btn btn-primary shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('purchaseorder.delete')"
          @click="batchDelete"
          class="btn btn-danger shrink-0"
        >
          <i class="fa-solid fa-trash"></i>
        </button>

        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[280px] sm:max-w-[450px]"
        >
          <DateRangePicker
            v-model="orderDateRange"
            placeholder="발주일자"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />
        </div>

        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[280px] sm:max-w-[450px]"
        >
          <DateRangePicker
            v-model="deliveryDateRange"
            placeholder="납기일자"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />
        </div>

        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[450px]"
        >
          <BaseInput
            v-model="where.order_no"
            placeholder="발주번호 입력"
            @change="loadList"
          />
        </div>

        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[450px]"
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

        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[160px] sm:max-w-[240px]"
        >
          <SearchSelect
            v-model="where.status"
            :options="statusOptions"
            labelKey="text"
            valueKey="value"
            placeholder="상태 선택"
            @change="loadList"
          />
        </div>
      </div>

      <div class="p-4">
        <BaseTable
          ref="orderTable"
          :columns="columns"
          :rows="rows"
          sortable
          selectable
          pagination
          :pageSize="10"
          :pageSizeOptions="[10, 20, 50, 100]"
          @cell-click="onCellClick"
        >
          <template #days_left="{ row }">
            <span v-if="!row.delivery_date" class="badge-muted">-</span>
            <Badge
              v-else-if="daysLeft(row.delivery_date) < 0"
              variant="error"
              icon="fa-solid fa-triangle-exclamation"
            >
              납기일 초과됨
            </Badge>
            <Badge
              v-else-if="daysLeft(row.delivery_date) === 0"
              variant="warning"
            >
              D-DAY
            </Badge>
            <Badge v-else variant="info">
              D-{{ daysLeft(row.delivery_date) }}
            </Badge>
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import Badge from "@/components/ui/Badge.vue";
import PurchaseOrderVoucherPrintModal from "@/components/purchaseorder/PurchaseOrderVoucherPrintModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useModalStore } from "@/stores/modal";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";
import { formatDateOnly, todayRange, startOfDay } from "@/utils/date";

const STATUS_LABELS = {
  draft: "임시저장",
  ordered: "발주완료",
  received: "구매완료",
  canceled: "취소",
};

export default {
  name: "PurchaseOrderListPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
    SearchSelect,
    Badge,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/purchaseOrder/list",
      deleteEndpoint: "/api/purchaseOrder/batchDelete",
      tableRef: "orderTable",
      initialWhere: { order_no: "", supplier_id: "", status: "" },
      // 발주일자 / 납기일자 두 개의 DateRange 를 별도 키로 직렬화
      initialDateRange: null,
      transformWhere: (w, vm) => {
        if (vm.orderDateRange?.start) {
          w.orderStartDate = vm.orderDateRange.start.toISOString();
        }
        if (vm.orderDateRange?.end) {
          w.orderEndDate = vm.orderDateRange.end.toISOString();
        }
        if (vm.deliveryDateRange?.start) {
          w.deliveryStartDate = vm.deliveryDateRange.start.toISOString();
        }
        if (vm.deliveryDateRange?.end) {
          w.deliveryEndDate = vm.deliveryDateRange.end.toISOString();
        }
        return w;
      },
    }),
    createRefDataMixin(["suppliers"]),
  ],

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      orderDateRange: todayRange(),
      deliveryDateRange: { start: null, end: null },
      suppliers: [],
      statusOptions: Object.entries(STATUS_LABELS).map(([value, text]) => ({
        text,
        value,
      })),
      columns: [
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center" },
        { key: "order_no", label: "발주번호", width: "180px", align: "center", sortable: true },
        { key: "supplier_name", label: "거래처", width: "200px", sortable: true },
        { key: "created_by_name", label: "작업자", align: "center", width: "100px", sortable: true },
        {
          key: "order_date",
          label: "발주일자",
          width: "130px",
          align: "center",
          sortable: true,
          formatter: formatDateOnly,
        },
        {
          key: "delivery_date",
          label: "납기일자",
          width: "130px",
          align: "center",
          sortable: true,
          formatter: formatDateOnly,
        },
        { key: "days_left", label: "경과일", width: "120px", align: "center" },
        {
          key: "status",
          label: "상태",
          width: "100px",
          align: "center",
          sortable: true,
          formatter: (v) => STATUS_LABELS[v] || v,
        },
        { key: "memo", label: "메모", type: "text", width: "250px" },
        { key: "voucher", label: "전표", type: "button", width: "90px", align: "center" },
      ],
    };
  },

  methods: {
    // 발주 등록 페이지로 이동
    goRegister() {
      this.$router.push("/purchaseOrder/register");
    },

    // 오늘 기준 납기일까지 남은 일수 (음수: 초과, 0: D-DAY, 양수: 남음)
    daysLeft(deliveryDate) {
      if (!deliveryDate) return null;
      const today = startOfDay(new Date());
      const d = startOfDay(deliveryDate);
      return Math.round((d.getTime() - today.getTime()) / 86400000);
    },

    // 셀 클릭: 발주번호 → 새 탭 수정 페이지, 전표 → 전표 모달
    onCellClick(data) {
      if (data.key === "order_no") {
        if (!this.auth.hasPermission("purchaseorder.update")) return;
        const href = this.$router.resolve({
          path: "/purchaseorder/register",
          query: { id: data.row.id },
        }).href;
        window.open(href, "_blank");
        return;
      }
      if (data.key === "voucher") {
        this.modal.openModal(
          PurchaseOrderVoucherPrintModal,
          { id: data.row.id },
          "lg",
        );
      }
    },
  },

  mounted() {
    this.loadRefData();
  },
};
</script>
