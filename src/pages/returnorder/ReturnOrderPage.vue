<template>
  <div class="p-4 lg:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- 테이블 -->
      <div
        class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="text-base font-semibold text-gray-800">반품 목록</h2>
        </div>

        <div class="p-4 pb-0 flex items-center gap-1">
          <button
            @click="goRegister"
            class="btn btn-primary"
          >
            <i class="fa-solid fa-add"></i>
          </button>

          <button
            @click="batchDelete"
            class="btn btn-danger flex items-center gap-1"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
          <div class="w-[450px]">
            <DateRangePicker
              v-model="dateRange"
              :minuteStep="5"
              :showQuickButtons="true"
              @change="loadList"
            />
          </div>
          <div class="w-[450px]">
            <BaseInput
              v-model="where.return_no"
              placeholder="반품번호 입력"
              @change="loadList"
            />
          </div>
        </div>

        <div class="p-4">
          <BaseTable
            ref="returnorderTable"
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

      <!-- 카드 -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- 이번달 구매 -->
        <div class="bg-white rounded-xl border border-gray-200 shadow">
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-2 text-gray-700 font-medium">
              <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
              <span>이번달 구매 수량</span>
            </div>
          </div>
          <div class="p-4">
            <div class="text-3xl font-semibold text-gray-800">1,245</div>
            <div class="text-sm text-gray-400 mt-1">이번 달 구매 기준</div>
          </div>
        </div>
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
import ReturnOrderVoucherPrintModal from "@/components/returnorder/ReturnOrderVoucherPrintModal.vue";
import { createListMixin } from "@/mixins/listPage";

export default {
  name: "ReturnOrderPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/returnorder/list",
      deleteEndpoint: "/api/returnorder/batchDelete",
      tableRef: "returnorderTable",
      initialWhere: { return_no: "" },
    }),
  ],

  data() {
    return {
      modal: useModalStore(),
      columns: [
        { key: "id", label: "전표", type: "button", width: "80px", align: "center" },
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "return_no", label: "반품번호", width: "200px", align: "center", sortable: true },
        { key: "username", label: "작성자", sortable: true, width: "100px" },
        { key: "status", label: "상태", sortable: true, width: "100px" },
        { key: "memo", label: "메모", type: "text", width: "250px" },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "200px", sortable: true },
      ],
    };
  },

  methods: {
    // 반품 등록 페이지로 이동
    goRegister() {
      this.$router.push("/returnorder/register");
    },

    // 셀 클릭: 반품번호 → 수정 페이지, 전표 → 프린트 모달
    onCellClick(data) {
      if (data.key === "return_no") {
        this.$router.push({
          path: "/returnorder/register",
          query: { id: data.row.id },
        });
      } else if (data.key === "id") {
        this.modal.openModal(
          ReturnOrderVoucherPrintModal,
          { id: data.row.id },
          "xl",
        );
      }
    },
  },
};
</script>
