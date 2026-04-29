<template>
  <div class="flex flex-col gap-3" style="height: 75vh">
    <!-- 헤더 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-amber-500"></i>
          거래처 변경 이력
        </h2>
        <p class="text-[11px] text-slate-400 mt-0.5">
          <span v-if="supplier_name" class="font-semibold">{{ supplier_name }}</span>
          <span v-else class="italic">거래처 정보 없음</span>
          <span class="ml-1 text-slate-400">· 금액/구분 변경 시 스냅샷이 기록됩니다</span>
        </p>
      </div>
      </div>

    <!-- 본체 -->
    <div class="flex-1 overflow-auto border rounded-lg">
      <div v-if="loading" class="h-full flex items-center justify-center text-slate-400 text-xs py-10">
        <i class="fa-solid fa-spinner fa-spin mr-1.5"></i>불러오는 중...
      </div>
      <div
        v-else-if="!list.length"
        class="h-full flex flex-col items-center justify-center text-slate-400 py-10"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
          <i class="fa-regular fa-file-lines text-xl text-slate-300"></i>
        </div>
        <p class="text-xs font-semibold text-slate-500">등록된 변경 이력이 없습니다</p>
        <p class="text-[11px] text-slate-400 mt-0.5">
          거래처 저장 시 자동으로 이력이 기록됩니다
        </p>
      </div>

      <table v-else class="w-full text-xs">
        <thead class="bg-slate-50 text-slate-500 sticky top-0">
          <tr>
            <th class="th text-center w-10">#</th>
            <th class="th text-center w-20">구분</th>
            <th class="th text-center w-20">타입</th>
            <th class="th text-right">미수금</th>
            <th class="th text-right">미지급금</th>
            <th class="th text-left">사유</th>
            <th class="th text-center w-24">변경자</th>
            <th class="th text-center w-36">일시</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in list"
            :key="row.id"
            class="border-t border-slate-100 hover:bg-slate-50/50"
          >
            <td class="td text-center text-slate-400 font-mono">
              {{ list.length - idx }}
            </td>
            <td class="td text-center">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                :class="actionBadgeClass(row.action)"
              >
                {{ actionLabel(row.action) }}
              </span>
            </td>
            <td class="td text-center">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                :class="typeBadgeClass(row.type)"
              >
                {{ typeLabel(row.type) }}
              </span>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ fmt(row.receivable) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'receivable')">
                {{ diffDisplay(row, 'receivable', idx) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ fmt(row.payable) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'payable')">
                {{ diffDisplay(row, 'payable', idx) }}
              </div>
            </td>
            <td class="td text-slate-600">
              {{ row.reason || "-" }}
            </td>
            <td class="td text-center text-slate-500">
              {{ row.updated_by_name || row.user?.name || "-" }}
            </td>
            <td class="td text-center text-slate-500 text-[11px]">
              {{ fmtDate(row.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 풋터 범례 -->
    <div class="flex items-center justify-between pt-1">
      <div class="flex items-center gap-3 text-[10px] text-slate-400">
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-arrow-up text-red-500"></i>
          증가
        </span>
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-arrow-down text-blue-500"></i>
          감소
        </span>
      </div>
      <button
        type="button"
        @click="modal.closeModal()"
        class="btn"
      >
        닫기
      </button>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";

export default {
  name: "SupplierHistoryModal",

  props: {
    supplier_id: { type: Number, required: true },
    supplier_name: { type: String, default: "" },
  },

  data() {
    return {
      modal: useModalStore(),
      list: [],
      loading: false,
    };
  },

  methods: {
    // 숫자 포맷 (천단위 콤마)
    fmt(v) {
      return (Number(v) || 0).toLocaleString();
    },

    // 날짜 포맷
    fmtDate(s) {
      if (!s) return "-";
      const d = new Date(s);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${mo}-${da} ${h}:${m}`;
    },

    // 액션 배지
    actionBadgeClass(action) {
      switch (action) {
        case "CREATE":
          return "bg-emerald-100 text-emerald-700";
        case "UPDATE":
          return "bg-blue-100 text-blue-700";
        default:
          return "bg-slate-100 text-slate-600";
      }
    },
    actionLabel(action) {
      if (action === "CREATE") return "최초";
      if (action === "UPDATE") return "변경";
      return action || "-";
    },

    // 타입 배지 (INBOUND: 구매, OUTBOUND: 판매)
    typeBadgeClass(type) {
      if (type === "INBOUND") return "bg-amber-100 text-amber-700";
      if (type === "OUTBOUND") return "bg-indigo-100 text-indigo-700";
      return "bg-slate-100 text-slate-600";
    },
    typeLabel(type) {
      if (type === "INBOUND") return "구매";
      if (type === "OUTBOUND") return "판매";
      return type || "-";
    },

    // 이전 이력과의 차이 (list 는 최신 → 과거 순)
    diff(row, field) {
      const idx = this.list.indexOf(row);
      if (idx < 0 || idx >= this.list.length - 1) return 0;
      const cur = Number(row[field]) || 0;
      const prev = Number(this.list[idx + 1][field]) || 0;
      return cur - prev;
    },
    diffClass(row, field) {
      const d = this.diff(row, field);
      if (d > 0) return "text-red-500 font-semibold";
      if (d < 0) return "text-blue-500 font-semibold";
      return "text-slate-400";
    },
    diffDisplay(row, field, idx) {
      if (idx >= this.list.length - 1) return "-";
      const d = this.diff(row, field);
      if (d === 0) return "-";
      const arrow = d > 0 ? "▲" : "▼";
      return `${arrow} ${Math.abs(d).toLocaleString()}`;
    },

    // 이력 로드
    async loadData() {
      this.loading = true;
      try {
        const res = await api.post("/api/supplier/history", {
          supplier_id: this.supplier_id,
        });
        const raw = Array.isArray(res.data) ? res.data : [];
        this.list = raw.sort((a, b) => {
          const ta = new Date(a.created_at).getTime();
          const tb = new Date(b.created_at).getTime();
          return tb - ta;
        });
      } catch (e) {
        this.list = [];
        this.$toast?.error("거래처 이력을 불러오지 못했습니다.");
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.loadData();
  },
};
</script>

<style scoped>
.th {
  @apply px-2 py-1.5 text-[10px] font-black uppercase tracking-wider;
}
.td {
  @apply px-2 py-1 align-middle;
}
</style>
