<template>
  <div class="print-area bg-white text-gray-800 p-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center border-b pb-4 mb-6">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <i class="fa-solid fa-truck-fast text-blue-600"></i>
        반품 전표
      </div>

      <div class="text-sm text-gray-500">
        {{ formatDate(data.created_at) }}
      </div>
    </div>

    <!-- 정보 -->
    <div class="grid grid-cols-3 gap-4 text-sm mb-6">
      <div class="space-y-1">
        <div><span class="text-gray-400">전표번호</span></div>
        <div class="font-medium">{{ data.return_no }}</div>
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
    <div class="flex justify-end gap-3 mt-10 no-print">
      <button
        @click="print"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition"
      >
        <i class="fa-solid fa-print"></i>
        프린트
      </button>

      <button
        @click="modal.closeModal()"
        class="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl"
      >
        <i class="fa-solid fa-xmark"></i>
        닫기
      </button>
    </div>
  </div>
</template>

<script>
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";

export default {
  name: "returnorderVoucherPrint",

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
    items() {
      return this.data?.items || [];
    },
  },

  methods: {
    // 날짜 포맷
    formatDate(date) {
      const d = new Date(date);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    },

    // 숫자 포맷
    formatNumber(num) {
      if (!num && num !== 0) return "0";

      return Number(num).toLocaleString();
    },

    // 출력
    print() {
      window.print();
    },

    totalAmount(data) {
      const list = data.items;

      let total = 0;
      list.forEach((row) => {
        total += Number(row.quantity) * Number(row.sale_price);
      });
      this.total_amount = total;
    },

    async loadData() {
      const res = await api.post(`/api/returnorder/${this.id}`, {
        id: this.id,
      });
      this.data = res.data;
      console.log(res.data);

      this.totalAmount(res.data);
    },
  },

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
