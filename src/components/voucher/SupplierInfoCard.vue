<template>
  <div
    class="rounded-xl border bg-gradient-to-br to-white p-4"
    :class="cardClass"
  >
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex items-start gap-3 min-w-0">
        <div
          class="w-10 h-10 rounded-lg text-white flex items-center justify-center shadow-sm shrink-0"
          :class="iconBgClass"
        >
          <i class="fa-solid fa-building text-sm"></i>
        </div>
        <div class="min-w-0">
          <div
            class="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            :class="labelTextClass"
          >
            {{ labelText }}
          </div>
          <div class="text-sm font-black text-slate-800 truncate">
            {{ supplier.name }}
            <span
              v-if="supplier.registration_no"
              class="ml-1 text-[11px] text-slate-400 font-mono font-medium"
            >
              {{ supplier.registration_no }}
            </span>
          </div>
          <div
            class="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap"
          >
            <span v-if="supplier.phone" class="inline-flex items-center gap-1">
              <i class="fa-solid fa-phone text-[10px] text-slate-400"></i>
              {{ supplier.phone }}
            </span>
            <span v-if="supplier.mobile" class="inline-flex items-center gap-1">
              <i class="fa-solid fa-mobile-screen text-[10px] text-slate-400"></i>
              {{ supplier.mobile }}
            </span>
            <span v-if="supplier.email" class="inline-flex items-center gap-1">
              <i class="fa-solid fa-envelope text-[10px] text-slate-400"></i>
              {{ supplier.email }}
            </span>
            <span
              v-if="supplier.address"
              class="inline-flex items-center gap-1 truncate"
            >
              <i class="fa-solid fa-location-dot text-[10px] text-slate-400"></i>
              {{ supplier.address }} {{ supplier.address_detail || "" }}
            </span>
          </div>
        </div>
      </div>

      <!-- 미수금/미지급금 표시 -->
      <div
        class="shrink-0 rounded-lg border bg-white px-4 py-2 text-right"
        :class="balanceBorderClass"
      >
        <div
          class="text-[10px] font-bold uppercase tracking-widest mb-0.5 inline-flex items-center gap-1"
          :class="balanceLabelClass"
        >
          <i class="fa-solid fa-circle-exclamation text-[9px]"></i>
          {{ balanceLabel }}
        </div>
        <div
          class="text-base font-black font-mono tabular-nums"
          :class="balanceValueClass"
        >
          {{ Number(balanceAmount).toLocaleString() }}
          <span class="text-[10px] text-slate-400 font-sans font-medium">원</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
// type: "inbound"  → 구매 (거래처에 지급할 미지급금: payable)
// type: "outbound" → 판매 (거래처로부터 받을 미수금: receivable)
export default {
  name: "SupplierInfoCard",
  props: {
    supplier: { type: Object, required: true },
    type: {
      type: String,
      default: "inbound",
      validator: (v) => ["inbound", "outbound"].includes(v),
    },
  },
  computed: {
    isInbound() {
      return this.type === "inbound";
    },
    cardClass() {
      return this.isInbound
        ? "border-blue-200 from-blue-50/60"
        : "border-rose-200 from-rose-50/60";
    },
    iconBgClass() {
      return this.isInbound ? "bg-blue-500" : "bg-rose-500";
    },
    labelTextClass() {
      return this.isInbound ? "text-blue-600" : "text-rose-600";
    },
    labelText() {
      return this.isInbound ? "Supplier" : "Customer";
    },
    balanceLabel() {
      return this.isInbound ? "미지급금" : "미수금";
    },
    balanceAmount() {
      return Number(
        this.isInbound ? this.supplier.payable : this.supplier.receivable,
      ) || 0;
    },
    balanceBorderClass() {
      return this.isInbound ? "border-indigo-200" : "border-amber-200";
    },
    balanceLabelClass() {
      return this.isInbound ? "text-indigo-500" : "text-amber-500";
    },
    balanceValueClass() {
      if (this.balanceAmount > 0) {
        return this.isInbound ? "text-indigo-700" : "text-amber-700";
      }
      return "text-slate-400";
    },
  },
};
</script>
