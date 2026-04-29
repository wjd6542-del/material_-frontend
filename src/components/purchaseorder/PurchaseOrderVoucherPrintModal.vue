<template>
  <div class="print-area bg-white text-gray-800 p-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <i class="fa-solid fa-clipboard-list text-teal-600"></i>
        발주 전표
      </div>

      <div class="text-sm text-gray-500">
        <BaseDateText :value="data.created_at" show-time />
      </div>
    </div>

    <!-- 발주 정보 / 사업자 정보 (좌우 분할) -->
    <div class="grid grid-cols-2 gap-6 border-b pb-4 mb-6">
      <!-- 왼쪽: 발주 정보 -->
      <div>
        <div class="text-[11px] font-bold text-gray-400 mb-2 uppercase">
          발주 정보
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <div class="text-xs text-gray-400">발주번호</div>
            <div class="font-medium">{{ data.order_no || "-" }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">거래처</div>
            <div class="font-medium">{{ data.supplier_name || "-" }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">발주일자</div>
            <div class="font-medium">
              <BaseDateText :value="data.order_date" />
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400">납기일자</div>
            <div class="font-medium">
              <BaseDateText :value="data.delivery_date" />
            </div>
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
          <th class="py-2 text-center w-12">#</th>

          <th class="py-2 text-left">
            <div class="flex items-center gap-1">
              <i class="fa-solid fa-box text-gray-400"></i>
              품목명
            </div>
          </th>

          <th class="py-2 text-left">규격</th>

          <th class="py-2 text-right">
            <div class="flex items-center justify-end gap-1">
              <i class="fa-solid fa-hashtag text-gray-400"></i>
              수량
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(row, idx) in items"
          :key="idx"
          class="border-b border-gray-100"
        >
          <td class="py-2 text-center text-gray-400">{{ idx + 1 }}</td>
          <td class="py-2">{{ row.material_name || "-" }}</td>
          <td class="py-2 text-gray-500">{{ row.spec || "-" }}</td>
          <td class="py-2 text-right font-medium">
            {{ formatNumber(row.quantity) }}
          </td>
        </tr>

        <tr v-if="!items.length">
          <td colspan="4" class="py-6 text-center text-gray-400">
            등록된 품목이 없습니다
          </td>
        </tr>
      </tbody>
      <tfoot v-if="items.length">
        <tr class="border-t-2 border-gray-800 bg-gray-50">
          <td colspan="3" class="py-3 text-right text-base font-semibold">
            총 수량
          </td>
          <td class="py-3 text-right text-base font-bold text-teal-600 font-mono">
            {{ formatNumber(totalQuantity) }}
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

<script>
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";
import BaseDateText from "@/components/base/BaseDateText.vue";

export default {
  name: "PurchaseOrderVoucherPrintModal",

  components: {
    BaseDateText,
  },

  props: {
    id: [Number, String],
  },

  data() {
    return {
      modal: useModalStore(),
      data: {},
      business: {},
    };
  },

  computed: {
    // 전표 품목 배열을 반환한다
    items() {
      return Array.isArray(this.data?.items) ? this.data.items : [];
    },

    // 총 수량 합계
    totalQuantity() {
      return this.items.reduce(
        (sum, it) => sum + (Number(it.quantity) || 0),
        0,
      );
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

    // 발주 전표 상세를 로드한다
    async loadData() {
      try {
        const res = await api.post("/api/purchaseOrder/info", { id: this.id });
        this.data = res.data || {};
      } catch (e) {
        this.$toast?.error?.("발주 전표를 불러오지 못했습니다.");
      }
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
  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none !important;
    border: none !important;
  }

  .no-print {
    display: none !important;
  }
}
</style>
