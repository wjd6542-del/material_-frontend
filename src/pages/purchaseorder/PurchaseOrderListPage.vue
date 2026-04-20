<template>
  <div>
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">발주 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('purchaseorder.create')"
          @click="goRegister"
          class="h-[40px] px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('purchaseorder.delete')"
          @click="batchDelete"
          class="h-[40px] px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 flex items-center gap-1 shrink-0"
        >
          <i class="fa-solid fa-trash"></i>
        </button>

        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[280px] sm:max-w-[450px]"
        >
          <DateRangePicker
            v-model="dateRange"
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
          <BaseInput
            v-model="where.supplier_name"
            placeholder="거래처명 입력"
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
        />
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/api";

export default {
  name: "PurchaseOrderListPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
  },

  data() {
    return {
      auth: useAuthStore(),
      columns: [
        {
          key: "order_no",
          label: "발주번호",
          type: "button",
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
          key: "total_amount",
          label: "발주금액",
          type: "number",
          width: "140px",
          align: "right",
          sortable: true,
        },
        {
          key: "status_label",
          label: "상태",
          width: "100px",
          align: "center",
          sortable: true,
        },
        {
          key: "username",
          label: "작성자",
          width: "100px",
          sortable: true,
        },
        {
          key: "memo",
          label: "메모",
          type: "text",
          width: "250px",
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
      rows: [],
      where: { order_no: "", supplier_name: "" },
      dateRange: { start: null, end: null },
    };
  },

  methods: {
    // 발주 등록 페이지로 이동
    goRegister() {
      this.$router.push("/purchaseorder/register");
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
          "/purchaseorder/batchDelete",
          rows.map((r) => ({ id: r.id })),
        );
        this.$toast.success("선택 항목이 삭제되었습니다");
        this.loadList();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 검색 조건을 반영해 발주 목록을 로드한다
    async loadList() {
      this.rows = [];
      const where = { ...this.where };
      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }

      try {
        const res = await api.post("/purchaseorder/list", where);
        this.rows = res.data;
      } catch (e) {
        this.$toast?.error?.("목록 로드 실패");
      }
    },

    // 발주번호 셀 클릭 시 수정 페이지로 이동
    onCellClick(data) {
      if (data.key === "order_no") {
        if (!this.auth.hasPermission("purchaseorder.update")) return;
        this.$router.push(`/purchaseorder/register?id=${data.row.id}`);
      }
    },
  },

  mounted() {
    this.loadList();
  },
};
</script>
