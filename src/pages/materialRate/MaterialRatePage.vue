<template>
  <div
    class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
  >
    <div class="max-w-4xl mx-auto">
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
          class="absolute -top-10 -right-10 w-48 h-48 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div class="relative flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
            >
              <i class="fa-solid fa-percent text-white text-xl"></i>
            </div>
            <div>
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-1"
              >
                Material Rate
              </div>
              <h2
                class="text-xl md:text-2xl font-black text-white tracking-tight"
              >
                자재 요율 기본 설정
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                자재 등록 시 기본으로 적용될 판매·도매·온라인 요율을 관리합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="openHistory"
            class="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
            변경 이력
          </button>
        </div>
      </div>

      <!-- 본문 카드 -->
      <form
        @submit.prevent="saveRate"
        class="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-200/70 overflow-hidden"
      >
        <!-- 판매 요율 -->
        <section class="p-6 md:p-8 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <i class="fa-solid fa-tag text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >01</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                판매 요율
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                판매1은 원가 대비, 판매2는 판매1(BASE) 대비 요율입니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
              <label class="form-label">
                판매 1 요율
                <span class="ml-1 text-[9px] font-bold text-blue-500">원가 대비</span>
              </label>
              <div class="relative">
                <i
                  class="fa-solid fa-percent absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  :value="pct('outbound_rate1')"
                  @input="onRateInput('outbound_rate1', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input pl-10 text-right pr-8"
                  placeholder="0"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">%</span>
              </div>
            </div>

            <div>
              <label class="form-label">
                판매 2 요율
                <span class="ml-1 text-[9px] font-bold text-slate-400">BASE 대비</span>
              </label>
              <div class="relative">
                <i
                  class="fa-solid fa-percent absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  :value="pct('outbound_rate2')"
                  @input="onRateInput('outbound_rate2', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input pl-10 text-right pr-8"
                  placeholder="0"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 도매 요율 -->
        <section class="p-6 md:p-8 border-b border-slate-100 bg-slate-50/40">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <i class="fa-solid fa-boxes-stacked text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >02</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                도매 요율
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                판매1(BASE) 대비 요율로 계산됩니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
              <label class="form-label">도매 1 요율</label>
              <div class="relative">
                <i
                  class="fa-solid fa-percent absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  :value="pct('wholesale_rate1')"
                  @input="onRateInput('wholesale_rate1', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input pl-10 text-right pr-8"
                  placeholder="0"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div>
              <label class="form-label">도매 2 요율</label>
              <div class="relative">
                <i
                  class="fa-solid fa-percent absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  :value="pct('wholesale_rate2')"
                  @input="onRateInput('wholesale_rate2', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input pl-10 text-right pr-8"
                  placeholder="0"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 온라인 요율 -->
        <section class="p-6 md:p-8">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <i class="fa-solid fa-globe text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >03</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                온라인 요율
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                판매1(BASE) 대비 요율로 계산됩니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
              <label class="form-label">온라인 요율</label>
              <div class="relative">
                <i
                  class="fa-solid fa-percent absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  :value="pct('online_rate')"
                  @input="onRateInput('online_rate', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input pl-10 text-right pr-8"
                  placeholder="0"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 하단 액션 -->
        <div
          class="bg-gradient-to-r from-slate-50 to-slate-100/60 px-6 md:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 border-t border-slate-200/70"
        >
          <p class="text-[11px] text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-info text-[10px]"></i>
            저장 시 변경 이력이 자동으로 기록됩니다.
          </p>
          <div class="flex items-center gap-2 justify-end">
            <button
              type="button"
              @click="loadRate"
              class="px-5 py-2.5 text-sm font-bold rounded-xl text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              <i class="fa-solid fa-rotate-left me-1"></i>
              초기화
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white shadow-md shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              {{ saving ? "저장 중" : "저장" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import MaterialRateHistoryModal from "@/components/material/MaterialRateHistoryModal.vue";

export default {
  name: "MaterialRatePage",

  data() {
    return {
      modal: useModalStore(),
      saving: false,
      form: {
        id: 0,
        outbound_rate1: 0,
        outbound_rate2: 0,
        wholesale_rate1: 0,
        wholesale_rate2: 0,
        online_rate: 0,
      },
    };
  },

  methods: {
    // 비율(소수) → 퍼센트 표기
    pct(key) {
      const v = Number(this.form[key]) || 0;
      if (!v) return 0;
      return Math.round(v * 10000) / 100;
    },

    // 소수 4자리까지 반올림
    roundRate(v) {
      return Math.round((Number(v) || 0) * 10000) / 10000;
    },

    // 퍼센트 입력 → 소수값으로 저장
    onRateInput(key, e) {
      const pctVal = Number(e?.target?.value) || 0;
      this.form[key] = this.roundRate(pctVal / 100);
    },

    // 요율 정보 로드
    async loadRate() {
      try {
        const res = await api.post("/api/materialRate/info");
        if (res.data) Object.assign(this.form, res.data);
      } catch (e) {
        // 신규 등록 화면으로 간주
      }
    },

    // 저장
    async saveRate() {
      this.saving = true;
      try {
        const res = await api.post("/api/materialRate/save", this.form);
        if (res.data) Object.assign(this.form, res.data);
        this.$toast?.success("저장되었습니다.");
      } catch (e) {
        this.$toast?.error(e.response?.data?.message || "저장 실패");
      } finally {
        this.saving = false;
      }
    },

    // 이력 모달 오픈
    openHistory() {
      this.modal.openModal(
        MaterialRateHistoryModal,
        { rate_id: this.form.id || 0 },
        "full",
      );
    },
  },

  mounted() {
    this.loadRate();
  },
};
</script>

<style scoped>
.form-label {
  @apply block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2;
}

.form-input {
  @apply w-full py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition-all
         focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500
         placeholder:text-slate-300 text-slate-800 font-medium font-mono tabular-nums;
}
</style>
