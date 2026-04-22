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
            <span v-if="!row.delivery_date" class="text-slate-300">-</span>
            <span
              v-else-if="daysLeft(row.delivery_date) < 0"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-bold"
            >
              <i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
              납기일 초과됨
            </span>
            <span
              v-else-if="daysLeft(row.delivery_date) === 0"
              class="inline-flex px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-xs font-bold"
              >D-DAY</span
            >
            <span
              v-else
              class="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold"
              >D-{{ daysLeft(row.delivery_date) }}</span
            >
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import PurchaseOrderVoucherPrintModal from "@/components/purchaseorder/PurchaseOrderVoucherPrintModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useModalStore } from "@/stores/modal";
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
  name: "PurchaseOrderListPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
    SearchSelect,
  },

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      columns: [
        {
          key: "qrcode",
          label: "QR",
          type: "img",
          width: "80px",
          align: "center",
        },
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
          width: "200px",
          sortable: true,
        },
        {
          key: "created_by_name",
          label: "작업자",
          align: "center",
          width: "100px",
          sortable: true,
        },
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
        {
          key: "days_left",
          label: "경과일",
          width: "120px",
          align: "center",
        },
        {
          key: "status",
          label: "상태",
          width: "100px",
          align: "center",
          sortable: true,
          formatter: (v) =>
            ({
              draft: "임시저장",
              ordered: "발주완료",
              received: "입고완료",
              canceled: "취소",
            })[v] || v,
        },
        {
          key: "memo",
          label: "메모",
          type: "text",
          width: "250px",
        },
        {
          key: "voucher",
          label: "전표",
          type: "button",
          width: "90px",
          align: "center",
        },
      ],
      rows: [],
      suppliers: [],
      statusOptions: [
        { text: "임시저장", value: "draft" },
        { text: "발주완료", value: "ordered" },
        { text: "입고완료", value: "received" },
        { text: "취소", value: "canceled" },
      ],
      where: {
        order_no: "",
        supplier_id: "",
        status: "",
      },
      orderDateRange: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      deliveryDateRange: { start: null, end: null },
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(deliveryDate);
      d.setHours(0, 0, 0, 0);
      return Math.round((d.getTime() - today.getTime()) / 86400000);
    },

    // 선택된 발주 항목을 일괄 삭제한다
    async batchDelete() {
      const rows = this.$refs.orderTable.getSelectedRows();
      if (!rows.length) {
        this.$toast.error("테이블에서 데이터를 선택하세요");
        return;
      }

      const ok = await this.$confirm(
        `선택된 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      try {
        await api.post(
          "/api/purchaseOrder/batchDelete",
          rows.map((r) => ({ id: r.id })),
        );
        this.$toast.success("선택 항목이 삭제되었습니다");
        this.loadList();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 거래처 목록을 로드한다
    async loadSuppliers() {
      try {
        const res = await api.post("/api/supplier/list", {});
        this.suppliers = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        this.$toast?.error?.("거래처 목록을 불러오지 못했습니다.");
      }
    },

    // 검색 조건을 반영해 발주 목록을 로드한다
    async loadList() {
      this.rows = [];
      const where = { ...this.where };
      if (this.orderDateRange?.start) {
        where.orderStartDate = this.orderDateRange.start.toISOString();
      }
      if (this.orderDateRange?.end) {
        where.orderEndDate = this.orderDateRange.end.toISOString();
      }
      if (this.deliveryDateRange?.start) {
        where.deliveryStartDate = this.deliveryDateRange.start.toISOString();
      }
      if (this.deliveryDateRange?.end) {
        where.deliveryEndDate = this.deliveryDateRange.end.toISOString();
      }

      try {
        const res = await api.post("/api/purchaseOrder/list", where);
        this.rows = res.data;
      } catch (e) {
        this.$toast?.error?.("목록 로드 실패");
      }
    },

    // 셀 클릭 처리: 발주번호는 수정 페이지, 전표는 전표 모달
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
    this.loadSuppliers();
    this.loadList();
  },
};
</script>
