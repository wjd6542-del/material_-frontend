<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">구매 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('inbound.create')"
          @click="goRegister"
          class="btn btn-primary shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('inbound.delete')"
          @click="batchDelete"
          class="btn btn-danger flex items-center gap-1 shrink-0"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
        <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[280px] sm:max-w-[450px]">
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />
        </div>
        <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[450px]">
          <BaseInput
            v-model="where.inbound_no"
            placeholder="구매번호 입력"
            @change="loadList"
          />
        </div>
        <div class="w-full sm:w-[160px] shrink-0">
          <SearchSelect
            v-model="where.is_unpaid"
            :options="paymentFilterOptions"
            labelKey="text"
            valueKey="value"
            placeholder="지급 여부"
            @change="loadList"
          />
        </div>
      </div>

      <div class="p-4">
        <BaseTable
          ref="inboundTable"
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
import SearchSelect from "@/components/base/SearchSelect.vue";
import { useModalStore } from "@/stores/modal";
import InboundVoucherPrintModal from "@/components/inbound/InboundVoucherPrintModal.vue";
import { useAuthStore } from "@/stores/auth";

import api from "@/api/api";

export default {
  name: "InboundPage",

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
          key: "inbound_no",
          label: "구매번호",
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
          key: "is_unpaid_label",
          label: "지급 여부",
          type: "text",
          align: "center",
          width: "110px",
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
          width: "200px",
          sortable: true,
        },
      ],

      paymentFilterOptions: [
        { text: "전체", value: "" },
        { text: "미지급", value: "true" },
        { text: "지급 완료", value: "false" },
      ],

      rows: [],
      where: { inbound_no: "", is_unpaid: "" },
      dateRange: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    };
  },

  methods: {
    // 삭제
    // 선택된 구매 전표들을 사용자 확인 후 일괄 삭제한다
    async batchDelete() {
      const rows = this.$refs.inboundTable.getSelectedRows();
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
        "삭제 확인", "danger",
      );
      if (!ok) return;

      try {
        await api.post("/api/inbound/batchDelete", ids);
        this.$toast.success("선택 항목이 삭제되었습니다");
        this.loadList();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 구매 등록 페이지로 이동한다
    goRegister() {
      this.$router.push("/inbound/register");
    },

    // 데이터 로드 처리
    // 검색 조건을 반영해 구매 목록을 로드한다
    async loadList() {
      this.rows = [];

      const where = {
        ...this.where,
      };

      // is_unpaid 값은 select 특성상 문자열("true"/"false"/"")이므로 서버에 boolean 으로 변환해 전송
      if (where.is_unpaid === "true") where.is_unpaid = true;
      else if (where.is_unpaid === "false") where.is_unpaid = false;
      else delete where.is_unpaid;

      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }

      const res = await api.post("/api/inbound/list", where);
      const list = Array.isArray(res.data) ? res.data : [];
      this.rows = list.map((r) => ({
        ...r,
        is_unpaid_label: r.is_unpaid ? "미지급" : "지급 완료",
      }));
    },

    // 셀클릭시
    // 전표번호 셀은 수정 페이지, ID 셀은 전표 프린트 모달을 연다
    onCellClick(data) {
      if (data.key == "inbound_no") {
        if (!this.auth.hasPermission("inbound.update")) {
          return;
        }
        this.$router.push({
          path: "/inbound/register",
          query: { id: data.row.id },
        });
      } else if (data.key == "id") {
        this.modal.openModal(
          InboundVoucherPrintModal,
          {
            id: data.row.id,
          },
          "xl",
        );
      }
    },
  },
  // 마운트 시 구매 목록을 로드한다
  mounted() {
    this.loadList();
  },
};
</script>
