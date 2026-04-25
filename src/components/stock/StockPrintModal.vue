<template>
  <div class="print-area bg-white text-gray-800 p-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center border-b pb-4 mb-6">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <i class="fa-solid fa-boxes-stacked text-green-600"></i>
        현재고
      </div>

      <div class="text-sm text-gray-500">
        <BaseDateText :value="now" show-time />
      </div>
    </div>

    <!-- 테이블 -->
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b-2 border-gray-300 text-gray-600">
          <th class="py-2 text-left">
            <div class="flex items-center gap-1">
              <i class="fa-solid fa-box text-gray-400"></i>
              품목
            </div>
          </th>
          <th class="py-2 text-center">
            <div class="flex items-center justify-center gap-1">
              <i class="fa-solid fa-warehouse text-gray-400"></i>
              창고
            </div>
          </th>
          <th class="py-2 text-center">
            <div class="flex items-center justify-center gap-1">
              <i class="fa-solid fa-location-dot text-gray-400"></i>
              위치
            </div>
          </th>
          <th class="py-2 text-right">
            <div class="flex items-center justify-end gap-1">
              <i class="fa-solid fa-hashtag text-gray-400"></i>
              현재고
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in list" :key="row.id" class="border-b">
          <td class="py-2">{{ row.material?.name }}</td>
          <td class="py-2 text-center">{{ row.warehouse?.name }}</td>
          <td class="py-2 text-center">{{ row.location?.code }}</td>
          <td class="py-2 text-right font-semibold">
            {{ formatNumber(row.quantity) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 합계 -->
    <div class="flex justify-end mt-6">
      <div
        class="w-64 border-t-2 border-gray-800 pt-3 flex justify-between text-lg font-semibold"
      >
        <span>총 현재고</span>
        <span class="text-green-600">
          {{ formatNumber(total_qty) }}
        </span>
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
  name: "StockPrint",

  components: {
    BaseDateText,
  },

  data() {
    return {
      modal: useModalStore(),
      list: [],
      total_qty: 0,
      user: {},
      tell: import.meta.env.VITE_TELL,
      now: new Date(),
    };
  },

  methods: {
    // 숫자를 천단위 구분자 문자열로 포맷팅한다
    formatNumber(num) {
      return Number(num || 0).toLocaleString();
    },

    // 브라우저 프린트 다이얼로그를 호출한다
    print() {
      window.print();
    },

    // 전체 재고 수량 합계를 계산한다
    calcTotal() {
      let total_qty = 0;

      this.list.forEach((row) => {
        total_qty += row.quantity;
      });

      this.total_qty = total_qty;
    },

    // 재고 목록을 로드하고 합계를 계산한다
    async loadData() {
      const res = await api.post("/api/stock/list");
      this.list = res.data;
      this.calcTotal();
    },
  },

  // 마운트 시 재고 목록을 로드한다
  mounted() {
    this.loadData();
  },
};
</script>
