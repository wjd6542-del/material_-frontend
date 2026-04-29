<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">판매 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('outbound.create')"
          @click="goRegister"
          class="btn btn-primary shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('outbound.create')"
          @click="batchDelete"
          class="btn btn-danger flex items-center gap-1 shrink-0"
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
            v-model="where.outbound_no"
            placeholder="판매번호 입력"
            @change="loadList"
          />
        </div>
      </div>

      <div class="p-4">
        <BaseTable
          ref="outboundTable"
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

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import { useModalStore } from "@/stores/modal";
import OutboundVoucherPrintModal from "@/components/outbound/OutboundVoucherPrintModal.vue";
import { useAuthStore } from "@/stores/auth";
import { createListMixin } from "@/mixins/listPage";

export default {
  name: "OutboundPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/outbound/list",
      deleteEndpoint: "/api/outbound/batchDelete",
      tableRef: "outboundTable",
      initialWhere: { outbound_no: "" },
    }),
  ],

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      columns: [
        { key: "id", label: "전표", type: "button", width: "80px", align: "center" },
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "outbound_no", label: "판매번호", width: "200px", align: "center", sortable: true },
        { key: "username", label: "작성자", sortable: true, width: "100px" },
        { key: "memo", label: "메모", type: "text", width: "250px" },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "200px", sortable: true },
      ],
    };
  },

  methods: {
    // 판매 등록 페이지로 이동한다
    goRegister() {
      this.$router.push("/outbound/register");
    },

    // 셀 클릭: 판매번호 → 수정, 전표 → 프린트 모달
    onCellClick(data) {
      if (data.key === "outbound_no") {
        if (!this.auth.hasPermission("outbound.update")) return;
        this.$router.push({
          path: "/outbound/register",
          query: { id: data.row.id },
        });
      } else if (data.key === "id") {
        this.modal.openModal(
          OutboundVoucherPrintModal,
          { id: data.row.id },
          "xl",
        );
      }
    },
  },
};
</script>
