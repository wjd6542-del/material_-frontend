<template>
  <div class="print-area bg-white text-gray-800 p-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center border-b pb-4 mb-6">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <i class="fa-solid fa-boxes-stacked text-green-600"></i>
        현재고
      </div>

      <div class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
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
  name: "StockPrint",

  data() {
    return {
      modal: useModalStore(),
      list: [],
      total_qty: 0,
      user: {},
      tell: import.meta.env.VITE_TELL,
    };
  },

  methods: {
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

    formatNumber(num) {
      return Number(num || 0).toLocaleString();
    },

    print() {
      window.print();
    },

    calcTotal() {
      let total_qty = 0;

      this.list.forEach((row) => {
        total_qty += row.quantity;
      });

      this.total_qty = total_qty;
    },

    async loadData() {
      const res = await api.post("/api/stock/list");
      this.list = res.data;
      this.calcTotal();
    },
  },

  mounted() {
    this.loadData();
  },
};
</script>
