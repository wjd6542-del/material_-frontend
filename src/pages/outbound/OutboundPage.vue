<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">출고 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('outbound.create')"
          @click="openModal"
          class="h-[40px] px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('outbound.create')"
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
            v-model="where.outbound_no"
            placeholder="출고번호 입력"
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

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import { useModalStore } from "@/stores/modal";
import OutboundModal from "@/components/outbound/OutboundModal.vue";
import OutboundVoucherPrintModal from "@/components/outbound/OutboundVoucherPrintModal.vue";
import { useAuthStore } from "@/stores/auth";

import api from "@/api/api";

export default {
  name: "outboundPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
  },

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      columns: [
        {
          key: "id",
          label: "전표",
          type: "button",
          width: "80px",
          align: "center",
        },
        {
          key: "qrcode",
          label: "QR",
          type: "img",
          width: "80px",
          align: "center",
          sortable: true,
        },
        {
          key: "outbound_no",
          label: "출고번호",
          width: "200px",
          align: "center",
          sortable: true,
        },
        {
          key: "username",
          label: "작성자",
          sortable: true,
          width: "100px",
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
          width: "200px",
          sortable: true,
        },
      ],

      rows: [],
      where: { outbound_no: "" },
      dateRange: { start: null, end: null },
    };
  },

  methods: {
    // 삭제
    // 선택된 출고 전표들을 사용자 확인 후 일괄 삭제한다
    async batchDelete() {
      const rows = this.$refs.outboundTable.getSelectedRows();
      if (!rows.length) {
        this.$toast.error("테이블에서 데이터를 선택하세요");
        return;
      }

      let ids = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        ids.push({ id: row.id });
      }

      const ok = await this.$confirm(
        `선택된 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      try {
        await api.post("/api/outbound/batchDelete", ids);
        this.$toast.success("선택 항목이 삭제되었습니다");
        this.loadList();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 추가 처리
    // 출고 등록 모달을 연다
    openModal() {
      this.modal.openModal(OutboundModal, { onSaved: this.loadList }, "xl");
    },

    // 데이터 로드 처리
    // 검색 조건을 반영해 출고 목록을 로드한다
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
      const res = await api.post("/api/outbound/list", where);
      this.rows = res.data;
    },

    // 셀클릭시
    // 전표번호 셀은 수정 모달, ID 셀은 전표 프린트 모달을 연다
    onCellClick(data) {
      // 자재명 클릭시 모달 상세 오픈
      if (data.key == "outbound_no") {
        if (!this.auth.hasPermission("outbound.update")) {
          return;
        }
        this.modal.openModal(
          OutboundModal,
          {
            id: data.row.id,
            onSaved: this.loadList,
          },
          "xl",
        );
        // 전표 모달 출력
      } else if (data.key == "id") {
        this.modal.openModal(
          OutboundVoucherPrintModal,
          {
            id: data.row.id,
          },
          "xl",
        );
      }
    },
  },
  // 마운트 시 출고 목록을 로드한다
  mounted() {
    this.loadList();
  },
};
</script>
