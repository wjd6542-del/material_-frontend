<template>
  <div class="print-area bg-white text-gray-800 p-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center border-b pb-4 mb-6">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <i class="fa-solid fa-truck-fast text-blue-600"></i>
        판매 전표
      </div>

      <div class="text-sm text-gray-500">
        <BaseDateText :value="data.created_at" show-time />
      </div>
    </div>

    <!-- 정보 -->
    <div class="grid grid-cols-3 gap-4 text-sm mb-6">
      <div class="space-y-1">
        <div><span class="text-gray-400">전표번호</span></div>
        <div class="font-medium">{{ data.outbound_no }}</div>
      </div>

      <div class="space-y-1">
        <div><span class="text-gray-400">담당자</span></div>
        <div class="font-medium">{{ data.user?.name || "-" }}</div>
      </div>

      <div class="space-y-1">
        <div><span class="text-gray-400">연락처</span></div>
        <div class="font-medium">{{ tell }}</div>
      </div>
    </div>

    <!-- 테이블 -->
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b-2 border-gray-300 text-gray-600">
          <th class="py-2 text-left">
            <div class="flex items-center gap-1">
              <i class="fa-solid fa-box text-gray-400"></i>
              자재
            </div>
          </th>
          <th class="py-2 text-center">
            <div class="flex items-center justify-center gap-1">
              <i class="fa-solid fa-warehouse text-gray-400"></i>
              창고
            </div>
          </th>
          <th class="py-2 text-right">
            <div class="flex items-center justify-end gap-1">
              <i class="fa-solid fa-hashtag text-gray-400"></i>
              수량
            </div>
          </th>
          <th class="py-2 text-right">
            <div class="flex items-center justify-end gap-1">
              <i class="fa-solid fa-coins text-gray-400"></i>
              단가
            </div>
          </th>
          <th class="py-2 text-right">
            <div class="flex items-center justify-end gap-1">
              <i class="fa-solid fa-sack-dollar text-gray-400"></i>
              금액
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in items" :key="row.id" class="border-b border-gray-100">
          <td class="py-2">{{ row.material?.name }}</td>
          <td class="py-2 text-gray-500">
            {{ row.warehouse?.name }}
          </td>

          <td class="py-2 text-right">
            {{ formatNumber(row.quantity) }}
          </td>

          <td class="py-2 text-right">
            {{ formatNumber(row.sale_price) }}
          </td>

          <td class="py-2 text-right font-medium">
            {{
              formatNumber(row.amount || row.quantity * (row.sale_price || 0))
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 합계 -->
    <div class="flex justify-end mt-6">
      <div
        class="w-64 border-t-2 border-gray-800 pt-3 flex justify-between text-lg font-semibold"
      >
        <span>총 금액</span>
        <span class="text-blue-600"> {{ formatNumber(total_amount) }} 원 </span>
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex justify-end gap-2 mt-10 no-print">
      <button @click="print" class="btn btn-primary">
        <i class="fa-solid fa-print"></i>
        프린트
      </button>

      <button @click="modal.closeModal()" class="btn">
        <i class="fa-solid fa-xmark"></i>
        닫기
      </button>
    </div>
  </div>
</template>

<script>
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";
import BaseDateText from "@/components/base/BaseDateText.vue";

export default {
  name: "OutboundVoucherPrint",

  components: {
    BaseDateText,
  },

  props: {
    id: Number,
  },

  data() {
    return {
      modal: useModalStore(),
      data: {},
      total_amount: 0,
      tell: import.meta.env.VITE_TELL,
    };
  },

  computed: {
    // 전표 품목 배열을 반환한다
    items() {
      return this.data?.items || [];
    },
  },

  methods: {
    // 숫자 포맷
    formatNumber(num) {
      if (!num && num !== 0) return "0";

      return Number(num).toLocaleString();
    },

    // 출력
    print() {
      window.print();
    },

    // 품목 수량×판매가를 합산해 총액을 계산한다
    totalAmount(data) {
      const list = data.items;

      let total = 0;
      list.forEach((row) => {
        total += Number(row.quantity) * Number(row.sale_price);
      });
      this.total_amount = total;
    },

    // 판매 전표 상세와 총액을 로드한다
    async loadData() {
      const res = await api.post(`/api/outbound/${this.id}`, { id: this.id });
      this.data = res.data;
      this.totalAmount(res.data);
    },
  },

  // 마운트 시 전표 상세를 로드한다
  mounted() {
    this.loadData();
  },
};
</script>

<style>
@media print {
  /* 전체 숨김 */
  body * {
    visibility: hidden;
  }

  /* 출력 영역만 보이기 */
  .print-area,
  .print-area * {
    visibility: visible;
  }

  /* 위치 초기화 */
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none !important;
    border: none !important;
  }

  /* 불필요 요소 제거 */
  .no-print {
    display: none !important;
  }
}
</style>
