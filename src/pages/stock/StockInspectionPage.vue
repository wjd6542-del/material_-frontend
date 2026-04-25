<template>
  <div
    class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30"
  >
    <div class="max-w-6xl mx-auto">
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
          class="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
            >
              <i class="fa-solid fa-clipboard-check text-white text-xl"></i>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-widest text-emerald-300 mb-1">
                Stock Inspection
              </div>
              <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">
                재고 검사
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                품목 코드를 스캔해서 실재고와 장부재고의 일치 여부를 검사합니다.
              </p>
            </div>
          </div>

          <!-- 요약 배지 -->
          <div class="flex items-center gap-2 text-[11px]">
            <span class="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-sm">
              <i class="fa-solid fa-list-ol text-emerald-300 mr-1"></i>
              총 <b class="font-black">{{ rows.length }}</b>건
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 backdrop-blur-sm">
              <i class="fa-solid fa-check mr-1"></i>
              맞음 <b class="font-black">{{ matchCount }}</b>
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-300/40 text-rose-200 backdrop-blur-sm">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>
              불일치 <b class="font-black">{{ mismatchCount }}</b>
            </span>
          </div>
        </div>
      </div>

      <!-- 스캔 입력 -->
      <div
        class="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-4 md:p-5 mb-6"
      >
        <label class="form-label">품목 코드 스캔</label>
        <div class="relative">
          <i
            class="fa-solid fa-barcode absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-lg"
          ></i>
          <input
            ref="scanInput"
            v-model="scanCode"
            type="text"
            class="w-full h-12 pl-12 pr-12 text-base font-mono bg-slate-50 border-2 border-slate-200 rounded-xl outline-none transition-all focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
            placeholder="품목 코드 스캔 또는 입력 후 Enter"
            @keydown.enter.prevent="onScan"
            @focus="hint = true"
            @blur="hint = false"
          />
          <button
            v-if="scanCode"
            type="button"
            @click="scanCode = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p v-if="hint || loading" class="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-circle-info"></i>
          {{ loading ? "조회 중..." : "코드 입력 후 Enter (스캐너가 자동 엔터를 전송함)" }}
        </p>
      </div>

      <!-- 검사 테이블 -->
      <div class="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-boxes-stacked text-emerald-500"></i>
            <h3 class="text-sm font-black text-slate-800">검사 목록</h3>
          </div>
          <button
            type="button"
            @click="resetAll"
            :disabled="!rows.length"
            class="h-[30px] px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-[11px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <i class="fa-solid fa-rotate-left text-[10px]"></i>
            전체 초기화
          </button>
        </div>

        <div class="overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="th text-center w-10">#</th>
                <th class="th text-left" style="min-width: 200px">품목</th>
                <th class="th text-left" style="min-width: 220px">카테고리 경로</th>
                <th class="th text-left" style="min-width: 160px">위치</th>
                <th class="th text-right w-24">장부재고</th>
                <th class="th text-right w-24">실사재고</th>
                <th class="th text-center w-28">상태</th>
                <th class="th text-center w-40">검사</th>
                <th class="th text-center w-16">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in rows"
                :key="r.key"
                class="border-t border-slate-100"
                :class="rowRowClass(r)"
              >
                <td class="td text-center text-slate-400 font-mono">
                  {{ i + 1 }}
                </td>
                <td class="td">
                  <div class="flex flex-col">
                    <span class="text-xs font-mono text-slate-400">
                      {{ r.material_code }}
                    </span>
                    <span class="text-sm font-semibold text-slate-800 truncate">
                      {{ r.material_name }}
                    </span>
                    <span v-if="r.spec" class="text-[10px] text-slate-400 truncate">
                      {{ r.spec }}
                    </span>
                  </div>
                </td>
                <td class="td">
                  <div
                    v-if="r.category_path"
                    class="flex items-center gap-1 flex-wrap text-[11px]"
                  >
                    <template v-for="(seg, si) in r.category_path" :key="si">
                      <span
                        :class="si === r.category_path.length - 1 ? 'font-semibold text-slate-700' : 'text-slate-400'"
                      >
                        {{ seg }}
                      </span>
                      <i
                        v-if="si < r.category_path.length - 1"
                        class="fa-solid fa-angle-right text-[9px] text-slate-300"
                      ></i>
                    </template>
                  </div>
                  <span v-else class="text-[11px] text-slate-300">-</span>
                </td>
                <td class="td text-slate-600 text-[12px]">
                  {{ r.location_label || "-" }}
                </td>
                <td class="td text-right font-mono font-bold text-slate-700 tabular-nums">
                  {{ Number(r.expected || 0).toLocaleString() }}
                  <span class="text-[10px] text-slate-400 font-sans font-medium">{{ r.unit || "" }}</span>
                </td>
                <td class="td text-right font-mono tabular-nums">
                  <input
                    v-model.number="r.counted"
                    type="number"
                    min="0"
                    class="cell-input text-right"
                  />
                </td>
                <td class="td text-center">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold"
                    :class="statusBadgeClass(r)"
                  >
                    <i :class="statusIcon(r)" class="text-[9px]"></i>
                    {{ statusLabel(r) }}
                  </span>
                </td>
                <td class="td text-center">
                  <button
                    type="button"
                    @click="inspect(r)"
                    class="h-[30px] px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition active:scale-[0.98] inline-flex items-center gap-1"
                  >
                    <i class="fa-solid fa-plus text-[10px]"></i>
                    조사 실시
                  </button>
                </td>
                <td class="td text-center">
                  <button
                    type="button"
                    @click="removeRow(r)"
                    class="text-red-400 hover:text-red-600 w-7 h-7 rounded-lg hover:bg-red-50 transition"
                    title="행 삭제"
                  >
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="!rows.length">
                <td colspan="9" class="p-0">
                  <div
                    class="flex flex-col items-center justify-center py-14 px-6 text-center bg-gradient-to-b from-white to-slate-50/60"
                  >
                    <div
                      class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 flex items-center justify-center mb-4 shadow-sm"
                    >
                      <i class="fa-solid fa-barcode text-2xl text-emerald-400"></i>
                    </div>
                    <p class="text-sm font-bold text-slate-700 mb-1">
                      품목 코드를 스캔하여 검사를 시작하세요
                    </p>
                    <p class="text-xs text-slate-400">
                      위 입력창에 코드 입력 후 Enter
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

<script>
import api from "@/api/api";

export default {
  name: "StockInspectionPage",

  data() {
    return {
      scanCode: "",
      loading: false,
      hint: false,
      rows: [],
      // 카테고리 트리 (id → pathSegments 매핑용)
      categoryPathMap: Object.create(null),
    };
  },

  computed: {
    // 장부 = 실사 매칭 건수
    matchCount() {
      return this.rows.filter((r) => this.statusOf(r) === "match").length;
    },
    // 불일치 (부족/초과) 건수
    mismatchCount() {
      return this.rows.filter((r) => {
        const s = this.statusOf(r);
        return s === "short" || s === "over";
      }).length;
    },
  },

  methods: {
    // 행 상태: pending | short | match | over
    statusOf(r) {
      const e = Number(r.expected) || 0;
      const c = Number(r.counted) || 0;
      if (c === 0 && e > 0) return "pending";
      if (c < e) return "short";
      if (c === e) return "match";
      return "over";
    },
    statusLabel(r) {
      switch (this.statusOf(r)) {
        case "match":
          return "재고 맞음";
        case "short":
          return "부족";
        case "over":
          return "초과";
        default:
          return "미검사";
      }
    },
    statusBadgeClass(r) {
      switch (this.statusOf(r)) {
        case "match":
          return "bg-emerald-100 text-emerald-700";
        case "short":
          return "bg-amber-100 text-amber-700";
        case "over":
          return "bg-rose-100 text-rose-700";
        default:
          return "bg-slate-100 text-slate-500";
      }
    },
    statusIcon(r) {
      switch (this.statusOf(r)) {
        case "match":
          return "fa-solid fa-check";
        case "short":
          return "fa-solid fa-arrow-down";
        case "over":
          return "fa-solid fa-arrow-up";
        default:
          return "fa-regular fa-circle";
      }
    },
    rowRowClass(r) {
      switch (this.statusOf(r)) {
        case "match":
          return "bg-emerald-50/40";
        case "short":
          return "bg-amber-50/40";
        case "over":
          return "bg-rose-50/40";
        default:
          return "";
      }
    },

    // 조사 실시: 카운트 +1
    inspect(r) {
      r.counted = (Number(r.counted) || 0) + 1;
    },

    // 행 삭제
    removeRow(r) {
      this.rows = this.rows.filter((x) => x.key !== r.key);
    },

    // 전체 초기화
    async resetAll() {
      if (!this.rows.length) return;
      const ok = await this.$confirm?.(
        "검사 목록을 전체 초기화하시겠습니까?",
        "초기화 확인", "warning",
      );
      if (ok === false) return;
      this.rows = [];
    },

    // 스캔 처리
    async onScan() {
      const code = (this.scanCode || "").trim();
      if (!code) return;
      this.loading = true;
      try {
        const res = await api.post("/api/stock/list", { scan_code: code });
        const list = Array.isArray(res.data) ? res.data : [];
        if (!list.length) {
          this.$toast?.error("일치하는 재고를 찾을 수 없습니다.");
          this.scanCode = "";
          return;
        }
        list.forEach((s) => this.upsertRow(s));
        this.scanCode = "";
        this.$nextTick(() => this.$refs.scanInput?.focus());
      } catch (e) {
        this.$toast?.error("재고 조회 실패");
      } finally {
        this.loading = false;
      }
    },

    // 응답 1건을 검사 목록 행으로 추가(동일 키는 기존 행 재사용)
    upsertRow(s) {
      const material = s.material || {};
      const materialId = s.material_id ?? material.id ?? null;
      const locationId = s.location_id ?? s.shelf_id ?? null;
      const key = `${materialId}__${locationId ?? "global"}`;

      const existing = this.rows.find((r) => r.key === key);
      if (existing) {
        // 동일 스캔 시 바로 카운트 증가
        existing.counted = (Number(existing.counted) || 0) + 1;
        return;
      }

      const categoryId = material.category_id ?? s.category_id ?? null;
      const categoryPath = this.categoryPathMap[categoryId] || null;
      const locationLabel = this.buildLocationLabel(s);

      this.rows.unshift({
        key,
        material_id: materialId,
        material_code: material.code ?? s.material_code ?? "",
        material_name: material.name ?? s.material_name ?? "",
        spec: material.spec ?? s.spec ?? "",
        unit: material.unit ?? s.unit ?? "",
        category_path: categoryPath,
        location_label: locationLabel,
        location_id: locationId,
        expected: Number(s.quantity ?? s.stock_qty ?? 0) || 0,
        counted: 1,
      });
    },

    // 창고 > 위치 > 선반 라벨 조립
    buildLocationLabel(s) {
      const parts = [
        s.warehouse_name || s.warehouse?.name,
        s.location_name || s.location?.name,
        s.shelf_name || s.shelf?.name,
      ].filter(Boolean);
      if (parts.length) return parts.join(" > ");
      return s.shelf_label || "-";
    },

    // 카테고리 트리 로드 → id → pathSegments 매핑
    async loadCategoryPathMap() {
      try {
        const res = await api.post("/api/category/getCategoryTree");
        const tree = Array.isArray(res.data) ? res.data : [];
        const map = Object.create(null);
        const walk = (nodes, parentPath) => {
          for (const n of nodes) {
            const segs = [...parentPath, n.name];
            map[n.id] = segs;
            if (n.children?.length) walk(n.children, segs);
          }
        };
        walk(tree, []);
        this.categoryPathMap = map;
      } catch {
        this.categoryPathMap = Object.create(null);
      }
    },
  },

  mounted() {
    this.loadCategoryPathMap();
    this.$nextTick(() => this.$refs.scanInput?.focus());
  },
};
</script>

<style scoped>
.form-label {
  @apply block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2;
}
.th {
  @apply px-3 py-2 text-[10px] font-black uppercase tracking-wider;
}
.td {
  @apply px-3 py-2 align-middle;
}
.cell-input {
  @apply w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md outline-none transition
         focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500
         placeholder:text-slate-300;
}
</style>
