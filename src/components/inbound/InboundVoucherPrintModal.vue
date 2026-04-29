<template>
  <div class="print-area bg-white text-gray-800 p-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <i class="fa-solid fa-truck-arrow-right text-blue-600"></i>
        구매 전표
      </div>

      <div class="text-sm text-gray-500">
        <BaseDateText :value="data.created_at" show-time />
      </div>
    </div>

    <!-- 구매 정보 / 사업자 정보 (좌우 분할) -->
    <div class="grid grid-cols-2 gap-6 border-b pb-4 mb-6">
      <!-- 왼쪽: 구매 정보 -->
      <div>
        <div class="text-[11px] font-bold text-gray-400 mb-2 uppercase">
          구매 정보
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <div class="text-xs text-gray-400">전표번호</div>
            <div class="font-medium">{{ data.inbound_no || "-" }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">거래처</div>
            <div class="font-medium">
              {{ data.supplier?.name || "-" }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400">구매일자</div>
            <div class="font-medium">
              <BaseDateText :value="data.purchase_date" />
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400">담당자</div>
            <div class="font-medium">{{ data.user?.name || "-" }}</div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 사업자 정보 -->
      <div>
        <div class="text-[11px] font-bold text-gray-400 mb-2 uppercase">
          사업자 정보
        </div>
        <div class="text-base font-bold text-gray-800">
          {{ business.company_name || "-" }}
        </div>
        <div class="mt-1 text-xs text-gray-500 space-y-0.5">
          <div>
            대표자: {{ business.ceo_name || "-" }}
            <span class="mx-2 text-gray-300">|</span>
            사업자등록번호: {{ business.registration_no || "-" }}
          </div>
          <div v-if="business.address || business.address_detail">
            {{
              [business.address, business.address_detail]
                .filter(Boolean)
                .join(" ")
            }}
          </div>
          <div v-if="business.phone || business.mobile || business.fax">
            <span v-if="business.phone">대표전화 {{ business.phone }}</span>
            <span v-if="business.mobile" class="ms-2">
              대표전화2 {{ business.mobile }}
            </span>
            <br />
            <span v-if="business.fax"> FAX {{ business.fax }} </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 메모 -->
    <div v-if="data.memo" class="mb-6">
      <div class="text-gray-400 text-sm mb-1">메모</div>
      <div
        class="text-sm text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded border border-gray-100"
      >
        {{ data.memo }}
      </div>
    </div>

    <!-- 테이블 -->
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b-2 border-gray-300 text-gray-600 text-sm">
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
              공급가액
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in items" :key="row.id" class="border-b border-gray-100">
          <td class="py-2">{{ row.material?.name }}</td>
          <td class="py-2 text-center text-gray-500">
            {{ row.warehouse?.name }}
          </td>

          <td class="text-center py-2 text-gray-500">
            {{ row.location?.code }}
          </td>

          <td class="py-2 text-right">
            {{ formatNumber(row.quantity) }}
          </td>

          <td class="py-2 text-right">
            {{ formatNumber(row.price) }}
          </td>

          <td class="py-2 text-right font-medium">
            {{
              formatNumber(row.supply_amount || row.quantity * (row.price || 0))
            }}
          </td>
        </tr>
      </tbody>
      <tfoot v-if="items.length">
        <tr class="border-t-2 border-gray-800 bg-gray-50">
          <td colspan="3" class="py-3 pl-2 text-left text-base font-semibold">
            총 합계
          </td>
          <td
            class="py-3 text-right text-base font-bold text-blue-600 font-mono"
          >
            {{ formatNumber(totalQuantity) }}
          </td>
          <td
            class="py-3 text-right text-base font-bold text-blue-600 font-mono"
          >
            {{ formatNumber(totalPrice) }}
          </td>
          <td
            class="py-3 text-right text-base font-bold text-blue-600 font-mono"
          >
            {{ formatNumber(total_amount) }}
            <span
              class="text-xs text-gray-500 font-sans font-medium ml-1"
            ></span>
          </td>
        </tr>
      </tfoot>
    </table>

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

<script lang="ts">
// @ts-nocheck
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";
import BaseDateText from "@/components/base/BaseDateText.vue";

export default {
  name: "InboundVoucherPrint",

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
      business: {},
      total_amount: 0,
      tell: import.meta.env.VITE_TELL,
    };
  },

  computed: {
    // 전표 품목 배열을 반환한다
    items() {
      return this.data?.items || [];
    },

    // 수량 합계
    totalQuantity() {
      return this.items.reduce(
        (sum, it) => sum + (Number(it.quantity) || 0),
        0,
      );
    },

    // 단가 합계
    totalPrice() {
      return this.items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
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

    // 품목 공급가액 합계로 총액을 계산한다 (supply_amount 우선, 없으면 수량×단가)
    totalAmount(data) {
      const list = Array.isArray(data?.items) ? data.items : [];

      let total = 0;
      list.forEach((row) => {
        const supply = Number(row.supply_amount);
        if (!Number.isNaN(supply) && supply > 0) {
          total += supply;
        } else {
          total += Number(row.quantity || 0) * Number(row.price || 0);
        }
      });
      this.total_amount = total;
    },

    // 구매 전표 상세와 총액을 로드한다
    async loadData() {
      const res = await api.post(`/api/inbound/${this.id}`, { id: this.id });
      this.data = res.data;
      this.totalAmount(res.data);
    },

    // 사업자 정보를 로드한다
    async loadBusiness() {
      try {
        const res = await api.post("/api/business/info");
        this.business = res.data || {};
      } catch (e) {
        this.business = {};
      }
    },
  },

  // 마운트 시 사업자 정보 및 전표 상세를 로드한다
  mounted() {
    this.loadBusiness();
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
