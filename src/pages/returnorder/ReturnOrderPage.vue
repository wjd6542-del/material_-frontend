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
            @click="openModal"
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
          <!-- header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b bg-gray-50"
          >
            <div class="flex items-center gap-2 text-gray-700 font-medium">
              <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
              <span>이번달 구매 수량</span>
            </div>
          </div>

          <!-- body -->
          <div class="p-4">
            <div class="text-3xl font-semibold text-gray-800">1,245</div>
            <div class="text-sm text-gray-400 mt-1">이번 달 구매 기준</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import { useModalStore } from "@/stores/modal";

import ReturnOrderVoucherPrintModal from "@/components/returnorder/ReturnOrderVoucherPrintModal.vue";

import api from "@/api/api";

export default {
  name: "ReturnOrderPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
  },

  data() {
    return {
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
          key: "return_no",
          label: "반품번호",
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
          key: "status",
          label: "상태",
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
      where: { return_no: "" },
      dateRange: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    };
  },

  methods: {
    // 삭제
    // 선택된 반품 전표들을 사용자 확인 후 일괄 삭제한다
    async batchDelete() {
      const rows = this.$refs.returnorderTable.getSelectedRows();
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
        await api.post("/api/returnorder/batchDelete", ids);
        this.$toast.success("선택 항목이 삭제되었습니다");
        this.loadList();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 추가 처리
    // 반품 등록 페이지로 이동한다
    openModal() {
      this.$router.push("/returnorder/register");
    },

    // 데이터 로드 처리
    // 검색 조건을 반영해 반품 목록을 로드한다
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

      const res = await api.post("/api/returnorder/list", where);
      this.rows = res.data;

      console.log("!111", res.data);
    },

    // 셀클릭시
    // 전표번호 셀은 수정 모달, ID 셀은 전표 프린트 모달을 연다
    onCellClick(data) {
      // 품목명 클릭시 모달 상세 오픈
      if (data.key == "return_no") {
        this.modal.openModal(
          returnorderModal,
          {
            id: data.row.id,
            onSaved: this.loadList,
          },
          "xl",
        );
        // 전표 모달 출력
      } else if (data.key == "id") {
        this.modal.openModal(
          ReturnOrderVoucherPrintModal,
          {
            id: data.row.id,
          },
          "xl",
        );
      }
    },
  },
  // 마운트 시 반품 목록을 로드한다
  mounted() {
    this.loadList();
  },
};
</script>
