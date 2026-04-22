<template>
  <div class="flex flex-col gap-3" style="height: 75vh">
    <!-- 헤더 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-amber-500"></i>
          금액 변동 이력
        </h2>
        <p class="text-[11px] text-slate-400 mt-0.5">
          <span v-if="materialLabel" class="font-mono">{{ materialLabel }}</span>
          <span v-else class="italic">자재 정보 없음</span>
        </p>
      </div>
      <button
        type="button"
        @click="modal.closeModal()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
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
        <p class="text-xs font-semibold text-slate-500">등록된 변동 이력이 없습니다</p>
        <p class="text-[11px] text-slate-400 mt-0.5">
          금액 변경 시 자동으로 이력이 기록됩니다
        </p>
      </div>

      <table v-else class="w-full text-xs">
        <thead class="bg-slate-50 text-slate-500 sticky top-0">
          <tr>
            <th class="th text-center w-10">#</th>
            <th class="th text-center w-20">구분</th>
            <th class="th text-right">구매</th>
            <th class="th text-right">
              판매1
              <span class="ml-0.5 text-[9px] text-blue-500">BASE</span>
            </th>
            <th class="th text-right">판매2</th>
            <th class="th text-right">도매1</th>
            <th class="th text-right">도매2</th>
            <th class="th text-right">온라인</th>
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
            <td class="td text-right font-mono tabular-nums">
              {{ fmt(row.inbound_price) }}
              <div class="text-[9px] text-slate-400 mt-0.5"
                v-if="idx < list.length - 1 && diff(row, 'inbound_price') !== 0">
                <span :class="diffClass(row, 'inbound_price')">
                  {{ diffText(row, 'inbound_price') }}
                </span>
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums bg-blue-50/30">
              {{ fmt(row.outbound_price1) }}
              <div class="text-[9px] text-slate-400 mt-0.5"
                v-if="idx < list.length - 1 && diff(row, 'outbound_price1') !== 0">
                <span :class="diffClass(row, 'outbound_price1')">
                  {{ diffText(row, 'outbound_price1') }}
                </span>
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ fmt(row.outbound_price2) }}</div>
              <div class="text-[9px] text-slate-400">
                {{ pctText(row.outbound_rate2) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ fmt(row.wholesale_price1) }}</div>
              <div class="text-[9px] text-slate-400">
                {{ pctText(row.wholesale_rate1) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ fmt(row.wholesale_price2) }}</div>
              <div class="text-[9px] text-slate-400">
                {{ pctText(row.wholesale_rate2) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ fmt(row.online_price) }}</div>
              <div class="text-[9px] text-slate-400">
                {{ pctText(row.online_rate) }}
              </div>
            </td>
            <td class="td text-center text-slate-500">
              {{ row.changed_by_name || row.user?.name || "-" }}
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
          인상
        </span>
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-arrow-down text-blue-500"></i>
          인하
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded bg-blue-50 border border-blue-200"></span>
          BASE 단가 (판매1)
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
  name: "MaterialPriceHistoryModal",

  props: {
    material_id: { type: Number, required: true },
    material_code: { type: String, default: "" },
    material_name: { type: String, default: "" },
  },

  data() {
    return {
      modal: useModalStore(),
      list: [],
      loading: false,
    };
  },

  computed: {
    materialLabel() {
      if (this.material_code && this.material_name) {
        return `${this.material_code} · ${this.material_name}`;
      }
      return this.material_code || this.material_name;
    },
  },

  methods: {
    // 숫자 포맷 (천단위 콤마)
    fmt(v) {
      return (Number(v) || 0).toLocaleString();
    },

    // 비율 포맷 (소수 → 퍼센트)
    pctText(v) {
      const p = (Number(v) || 0) * 100;
      if (!p) return "-";
      return `${Math.round(p * 100) / 100}%`;
    },

    // 날짜 포맷 (YYYY-MM-DD HH:mm)
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

    // 구분 배지
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

    // 이전 이력과의 차이 계산 (list는 최신 → 과거 순이어야 함)
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
      return "";
    },
    diffText(row, field) {
      const d = this.diff(row, field);
      if (d === 0) return "";
      const arrow = d > 0 ? "▲" : "▼";
      return `${arrow} ${Math.abs(d).toLocaleString()}`;
    },

    // 이력 로드
    async loadData() {
      this.loading = true;
      try {
        const res = await api.post("/api/material/priceHistory", {
          material_id: this.material_id,
        });
        const raw = Array.isArray(res.data) ? res.data : [];
        // 최신 → 과거 순으로 정렬 (created_at desc)
        this.list = raw.sort((a, b) => {
          const ta = new Date(a.created_at).getTime();
          const tb = new Date(b.created_at).getTime();
          return tb - ta;
        });
      } catch (e) {
        this.list = [];
        this.$toast?.error("가격 이력을 불러오지 못했습니다.");
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
