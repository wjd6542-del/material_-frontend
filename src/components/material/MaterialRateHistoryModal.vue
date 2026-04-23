<template>
  <div class="flex flex-col gap-3" style="height: 75vh">
    <!-- 헤더 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-amber-500"></i>
          자재 요율 변경 이력
        </h2>
        <p class="text-[11px] text-slate-400 mt-0.5">
          기본 요율 저장 시점마다 스냅샷이 기록됩니다
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
        <p class="text-xs font-semibold text-slate-500">등록된 변경 이력이 없습니다</p>
        <p class="text-[11px] text-slate-400 mt-0.5">
          요율 저장 시 자동으로 이력이 기록됩니다
        </p>
      </div>

      <table v-else class="w-full text-xs">
        <thead class="bg-slate-50 text-slate-500 sticky top-0">
          <tr>
            <th class="th text-center w-10">#</th>
            <th class="th text-right">
              판매1
              <span class="ml-0.5 text-[9px] text-blue-500">원가 대비</span>
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
            <td class="td text-right font-mono tabular-nums bg-blue-50/30">
              <div>{{ pctText(row.outbound_rate1) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'outbound_rate1')">
                {{ diffDisplay(row, 'outbound_rate1', idx) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ pctText(row.outbound_rate2) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'outbound_rate2')">
                {{ diffDisplay(row, 'outbound_rate2', idx) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ pctText(row.wholesale_rate1) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'wholesale_rate1')">
                {{ diffDisplay(row, 'wholesale_rate1', idx) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ pctText(row.wholesale_rate2) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'wholesale_rate2')">
                {{ diffDisplay(row, 'wholesale_rate2', idx) }}
              </div>
            </td>
            <td class="td text-right font-mono tabular-nums">
              <div>{{ pctText(row.online_rate) }}</div>
              <div class="text-[9px] mt-0.5" :class="diffClass(row, 'online_rate')">
                {{ diffDisplay(row, 'online_rate', idx) }}
              </div>
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
          인상
        </span>
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-arrow-down text-blue-500"></i>
          인하
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded bg-blue-50 border border-blue-200"></span>
          BASE 요율 (판매1)
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
  name: "MaterialRateHistoryModal",

  props: {
    rate_id: { type: Number, default: 0 },
  },

  data() {
    return {
      modal: useModalStore(),
      list: [],
      loading: false,
    };
  },

  methods: {
    // 비율(소수) → 퍼센트 표기
    pctText(v) {
      const p = (Number(v) || 0) * 100;
      if (!p) return "0%";
      return `${Math.round(p * 100) / 100}%`;
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

    // 이전 이력과의 차이 계산 (list는 최신 → 과거 순)
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
    // 변동 없거나 비교 대상 없는 경우 '-' 표기 통일
    diffDisplay(row, field, idx) {
      if (idx >= this.list.length - 1) return "-";
      const d = this.diff(row, field);
      if (d === 0) return "-";
      const arrow = d > 0 ? "▲" : "▼";
      const pct = Math.round(Math.abs(d) * 10000) / 100;
      return `${arrow} ${pct}%`;
    },

    // 이력 로드
    async loadData() {
      this.loading = true;
      try {
        const res = await api.post("/api/materialRate/history", {
          rate_id: this.rate_id,
        });
        const raw = Array.isArray(res.data) ? res.data : [];
        this.list = raw.sort((a, b) => {
          const ta = new Date(a.created_at).getTime();
          const tb = new Date(b.created_at).getTime();
          return tb - ta;
        });
      } catch (e) {
        this.list = [];
        this.$toast?.error("요율 이력을 불러오지 못했습니다.");
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
