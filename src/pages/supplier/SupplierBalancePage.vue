<template>
  <div
    class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
  >
    <div class="max-w-7xl mx-auto">
      <!-- 헤더 -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 p-6 md:p-8 mb-6"
      >
        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image: radial-gradient(#fff 1px, transparent 1px);
            background-size: 18px 18px;
          "
        ></div>
        <div
          class="absolute -top-10 -right-10 w-48 h-48 bg-amber-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div class="relative flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
          >
            <i class="fa-solid fa-coins text-white text-xl"></i>
          </div>
          <div>
            <div
              class="text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-1"
            >
              Supplier Balance
            </div>
            <h2
              class="text-xl md:text-2xl font-black text-white tracking-tight"
            >
              거래처 금액 정보
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              구매처(INBOUND)의 미지급금과 고객사(OUTBOUND)의 미수금을 한눈에
              파악합니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 요약 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- 미지급금 (구매처) -->
        <div
          class="bg-white rounded-2xl border border-indigo-200 shadow-md shadow-slate-200/40 overflow-hidden"
        >
          <div
            class="px-5 py-3 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/30"
              >
                <i class="fa-solid fa-arrow-down text-xs"></i>
              </div>
              <span class="text-sm font-black text-slate-800">
                미지급금 (구매처)
              </span>
              <span
                v-tip="'INBOUND 거래처에 지급해야 할 매입채무'"
                class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black cursor-help"
              >
                i
              </span>
            </div>
            <span
              class="text-[11px] text-slate-400 font-semibold"
            >
              {{ inboundCount }}개사
            </span>
          </div>
          <div class="p-5">
            <div class="text-3xl font-black font-mono tabular-nums text-indigo-700">
              {{ fmt(totalPayable) }}
              <span class="text-sm font-sans text-slate-400 font-semibold ml-1">
                원
              </span>
            </div>
            <div class="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-circle text-indigo-300 text-[6px]"></i>
                미지급 거래처
                <b class="text-indigo-700">{{ inboundActiveCount }}</b>
              </span>
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-circle text-slate-300 text-[6px]"></i>
                완납
                <b class="text-slate-600">{{ inboundCount - inboundActiveCount }}</b>
              </span>
            </div>
          </div>
        </div>

        <!-- 미수금 (고객사) -->
        <div
          class="bg-white rounded-2xl border border-amber-200 shadow-md shadow-slate-200/40 overflow-hidden"
        >
          <div
            class="px-5 py-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30"
              >
                <i class="fa-solid fa-arrow-up text-xs"></i>
              </div>
              <span class="text-sm font-black text-slate-800">
                미수금 (고객사)
              </span>
              <span
                v-tip="'OUTBOUND 거래처로부터 받아야 할 매출채권'"
                class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black cursor-help"
              >
                i
              </span>
            </div>
            <span
              class="text-[11px] text-slate-400 font-semibold"
            >
              {{ outboundCount }}개사
            </span>
          </div>
          <div class="p-5">
            <div class="text-3xl font-black font-mono tabular-nums text-amber-700">
              {{ fmt(totalReceivable) }}
              <span class="text-sm font-sans text-slate-400 font-semibold ml-1">
                원
              </span>
            </div>
            <div class="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-circle text-amber-300 text-[6px]"></i>
                미수 거래처
                <b class="text-amber-700">{{ outboundActiveCount }}</b>
              </span>
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-circle text-slate-300 text-[6px]"></i>
                완납
                <b class="text-slate-600">{{ outboundCount - outboundActiveCount }}</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 본문 카드 -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 overflow-hidden"
      >
        <!-- 필터 -->
        <div
          class="px-4 py-3 border-b border-slate-100 bg-slate-50/40 flex items-center gap-2 flex-wrap"
        >
          <div class="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              v-for="opt in typeOptions"
              :key="opt.value"
              @click="typeFilter = opt.value"
              class="h-[28px] px-3 rounded-md text-[11px] font-bold transition"
              :class="
                typeFilter === opt.value
                  ? opt.activeClass
                  : 'text-slate-500 hover:bg-slate-50'
              "
            >
              <i v-if="opt.icon" :class="opt.icon" class="mr-1 text-[10px]"></i>
              {{ opt.label }}
            </button>
          </div>

          <div class="relative flex-1 min-w-[200px]">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"
            ></i>
            <input
              v-model="keyword"
              type="text"
              placeholder="거래처명 / 사업자등록번호 검색"
              class="w-full h-[30px] pl-7 pr-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select v-model="balanceFilter" class="h-[30px] px-2 text-xs bg-white border border-slate-200 rounded-md w-[140px]">
            <option value="">잔액 전체</option>
            <option value="positive">잔액 있음</option>
            <option value="zero">잔액 없음</option>
          </select>

          <button
            type="button"
            @click="resetFilters"
            :disabled="!hasFilter"
            class="h-[30px] px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-[11px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <i class="fa-solid fa-rotate-left text-[10px]"></i>
            초기화
          </button>

          <span class="ml-auto text-[11px] text-slate-400">
            {{ filteredRows.length }} / {{ rows.length }}건
          </span>
        </div>

        <!-- 테이블 -->
        <div class="overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 sticky top-0 z-10">
              <tr>
                <th class="th text-center w-10">#</th>
                <th class="th text-center w-20">구분</th>
                <th class="th text-left" style="min-width: 180px">거래처명</th>
                <th class="th text-left" style="min-width: 140px">
                  사업자등록번호
                </th>
                <th class="th text-left" style="min-width: 130px">연락처</th>
                <th class="th text-right" style="min-width: 130px">
                  <span class="inline-flex items-center justify-end gap-1">
                    미수금
                    <span
                      v-tip="'고객사로부터 받을 금액'"
                      class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black cursor-help"
                    >i</span>
                  </span>
                </th>
                <th class="th text-right" style="min-width: 130px">
                  <span class="inline-flex items-center justify-end gap-1">
                    미지급금
                    <span
                      v-tip="'구매처에 지급할 금액'"
                      class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black cursor-help"
                    >i</span>
                  </span>
                </th>
                <th class="th text-center w-20">이력</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in filteredRows"
                :key="r.id"
                class="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td class="td text-center text-slate-400 font-mono">
                  {{ i + 1 }}
                </td>
                <td class="td text-center">
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    :class="typeBadgeClass(r.type)"
                  >
                    {{ typeLabel(r.type) }}
                  </span>
                </td>
                <td class="td">
                  <div class="font-semibold text-slate-800 truncate">
                    {{ r.name }}
                  </div>
                  <div
                    v-if="r.email"
                    class="text-[10px] text-slate-400 truncate"
                  >
                    {{ r.email }}
                  </div>
                </td>
                <td class="td font-mono text-slate-600">
                  {{ r.registration_no || "-" }}
                </td>
                <td class="td text-slate-600 text-[12px]">
                  <div v-if="r.phone || r.mobile" class="space-y-0.5">
                    <div v-if="r.phone">
                      <i class="fa-solid fa-phone text-[9px] text-slate-300 mr-1"></i>
                      {{ r.phone }}
                    </div>
                    <div v-if="r.mobile">
                      <i class="fa-solid fa-mobile-screen text-[9px] text-slate-300 mr-1"></i>
                      {{ r.mobile }}
                    </div>
                  </div>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td
                  class="td text-right font-mono tabular-nums"
                  :class="
                    Number(r.receivable) > 0
                      ? 'text-amber-700 font-bold'
                      : 'text-slate-300'
                  "
                >
                  {{ fmt(r.receivable) }}
                </td>
                <td
                  class="td text-right font-mono tabular-nums"
                  :class="
                    Number(r.payable) > 0
                      ? 'text-indigo-700 font-bold'
                      : 'text-slate-300'
                  "
                >
                  {{ fmt(r.payable) }}
                </td>
                <td class="td text-center">
                  <button
                    type="button"
                    @click="openHistory(r)"
                    v-tip="'변경 이력 보기'"
                    class="text-amber-500 hover:text-amber-700 w-7 h-7 rounded-lg hover:bg-amber-50 transition"
                  >
                    <i class="fa-solid fa-clock-rotate-left text-[11px]"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="!filteredRows.length">
                <td colspan="8" class="p-0">
                  <div
                    v-if="loading"
                    class="flex items-center justify-center py-12 text-slate-400 text-sm"
                  >
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                    불러오는 중...
                  </div>
                  <div
                    v-else
                    class="flex flex-col items-center justify-center py-14 px-6 text-center"
                  >
                    <div
                      class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2"
                    >
                      <i class="fa-regular fa-folder-open text-xl text-slate-300"></i>
                    </div>
                    <p class="text-xs font-semibold text-slate-500">
                      조회된 거래처가 없습니다
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import SupplierHistoryModal from "@/components/setting/SupplierHistoryModal.vue";

export default {
  name: "SupplierBalancePage",

  data() {
    return {
      modal: useModalStore(),
      loading: false,
      rows: [],
      typeFilter: "", // "" | "INBOUND" | "OUTBOUND"
      keyword: "",
      balanceFilter: "", // "" | "positive" | "zero"

      typeOptions: [
        {
          value: "",
          label: "전체",
          activeClass: "bg-slate-700 text-white",
          icon: "fa-solid fa-list",
        },
        {
          value: "INBOUND",
          label: "구매처",
          activeClass: "bg-indigo-500 text-white",
          icon: "fa-solid fa-arrow-down",
        },
        {
          value: "OUTBOUND",
          label: "고객사",
          activeClass: "bg-amber-500 text-white",
          icon: "fa-solid fa-arrow-up",
        },
      ],
    };
  },

  computed: {
    inboundList() {
      return this.rows.filter((r) => r.type === "INBOUND");
    },
    outboundList() {
      return this.rows.filter((r) => r.type === "OUTBOUND");
    },
    inboundCount() {
      return this.inboundList.length;
    },
    outboundCount() {
      return this.outboundList.length;
    },
    inboundActiveCount() {
      return this.inboundList.filter((r) => Number(r.payable) > 0).length;
    },
    outboundActiveCount() {
      return this.outboundList.filter((r) => Number(r.receivable) > 0).length;
    },
    totalPayable() {
      return this.inboundList.reduce(
        (sum, r) => sum + (Number(r.payable) || 0),
        0,
      );
    },
    totalReceivable() {
      return this.outboundList.reduce(
        (sum, r) => sum + (Number(r.receivable) || 0),
        0,
      );
    },

    hasFilter() {
      return !!(this.typeFilter || this.keyword || this.balanceFilter);
    },

    // 필터링된 거래처 목록
    filteredRows() {
      const tf = this.typeFilter;
      const kw = this.keyword.trim().toLowerCase();
      const bf = this.balanceFilter;

      return this.rows.filter((r) => {
        if (tf && r.type !== tf) return false;

        if (kw) {
          const name = String(r.name || "").toLowerCase();
          const reg = String(r.registration_no || "").toLowerCase();
          if (!name.includes(kw) && !reg.includes(kw)) return false;
        }

        // 잔액 필터: 미수금/미지급금 중 하나라도 양수면 "있음", 둘 다 0이면 "없음"
        const balance =
          (Number(r.receivable) || 0) + (Number(r.payable) || 0);
        if (bf === "positive" && balance <= 0) return false;
        if (bf === "zero" && balance > 0) return false;

        return true;
      });
    },
  },

  methods: {
    fmt(v) {
      return (Number(v) || 0).toLocaleString();
    },

    typeBadgeClass(type) {
      if (type === "INBOUND") return "bg-indigo-100 text-indigo-700";
      if (type === "OUTBOUND") return "bg-amber-100 text-amber-700";
      return "bg-slate-100 text-slate-600";
    },
    typeLabel(type) {
      if (type === "INBOUND") return "구매";
      if (type === "OUTBOUND") return "판매";
      return type || "-";
    },

    resetFilters() {
      this.typeFilter = "";
      this.keyword = "";
      this.balanceFilter = "";
    },

    // 거래처 변경 이력 모달
    openHistory(row) {
      this.modal.openModal(
        SupplierHistoryModal,
        {
          supplier_id: row.id,
          supplier_name: row.name,
        },
        "full",
      );
    },

    // 거래처 목록 로드
    async loadList() {
      this.loading = true;
      try {
        const res = await api.post("/api/supplier/list", {});
        const list = Array.isArray(res.data) ? res.data : [];
        this.rows = list.map((r) => ({
          ...r,
          type: r.type || "INBOUND",
          receivable: Number(r.receivable) || 0,
          payable: Number(r.payable) || 0,
        }));
      } catch (e) {
        this.rows = [];
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.loadList();
  },
};
</script>

<style scoped>
.th {
  @apply px-3 py-2 text-[10px] font-black uppercase tracking-wider;
}
.td {
  @apply px-3 py-2 align-middle;
}
</style>
