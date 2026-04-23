<template>
  <div class="min-h-full bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-6">
    <div class="print-area max-w-6xl mx-auto">
      <!-- 헤더 -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 p-6 md:p-8 mb-6 no-print-card"
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

        <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
              <i class="fa-solid fa-sitemap text-white text-xl"></i>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                Category Path
              </div>
              <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">
                전체 카테고리 경로
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                전체 {{ flatList.length }}개 · 루트 {{ tree.length }}개
              </p>
            </div>
          </div>

          <div class="self-start md:self-center flex items-center gap-2 no-print">
            <div class="relative flex-1 md:flex-none md:w-64">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[11px]"></i>
              <input
                v-model="keyword"
                type="text"
                placeholder="카테고리 검색..."
                class="w-full h-[34px] pl-8 pr-3 text-xs border border-white/20 bg-white/10 text-white placeholder:text-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button
              type="button"
              @click="print"
              class="px-4 h-[34px] rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            >
              <i class="fa-solid fa-print"></i>
              프린트
            </button>
          </div>
        </div>
      </div>

      <!-- 프린트 전용 헤더 (print-only) -->
      <div class="hidden print-only mb-5">
        <div class="flex justify-between items-end border-b-2 border-slate-800 pb-2">
          <div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-0.5">
              Category Path
            </div>
            <div class="text-xl font-black text-slate-900">전체 카테고리 경로</div>
          </div>
          <div class="text-xs text-slate-500">
            <div>출력 {{ printedAt }}</div>
            <div>전체 {{ flatList.length }}개 · 루트 {{ tree.length }}개</div>
          </div>
        </div>
      </div>

      <!-- 깊이 색상 가이드 -->
      <div
        v-if="!loading && maxDepth >= 0 && flatList.length"
        class="mb-4 bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-2 flex-wrap no-print-card"
      >
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">
          Depth
        </span>
        <template v-for="d in maxDepth + 1" :key="d">
          <span
            class="inline-flex items-center justify-center w-7 h-6 rounded-md text-[10px] font-bold tabular-nums"
            :class="depthBadgeClass(d - 1)"
          >
            D{{ d }}
          </span>
          <i
            v-if="d < maxDepth + 1"
            class="fa-solid fa-angle-right text-[10px] text-slate-300"
          ></i>
        </template>
      </div>

      <!-- 본문 -->
      <div
        v-if="loading"
        class="bg-white rounded-3xl shadow-md border border-slate-200 p-10 text-center text-slate-400 text-sm"
      >
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>불러오는 중...
      </div>
      <div
        v-else-if="!filteredGroups.length"
        class="bg-white rounded-3xl shadow-md border border-slate-200 p-10 text-center text-slate-400"
      >
        <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-3">
          <i class="fa-regular fa-folder-open text-2xl text-amber-400"></i>
        </div>
        <p class="text-sm font-semibold text-slate-500">카테고리가 없습니다</p>
      </div>
      <div v-else class="space-y-4">
        <!-- 루트 카테고리 그룹 -->
        <section
          v-for="group in filteredGroups"
          :key="group.root.id"
          class="category-group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <header
            class="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-amber-50/60 to-transparent"
          >
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm shadow-amber-100">
                <i class="fa-solid fa-folder-tree text-sm"></i>
              </div>
              <div>
                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  ROOT
                </div>
                <div class="text-sm font-black text-slate-800 tracking-tight">
                  {{ group.root.name }}
                </div>
              </div>
            </div>
            <span class="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">
              {{ group.items.length }}개
            </span>
          </header>

          <ul class="divide-y divide-slate-50">
            <template v-for="item in group.items" :key="item.id">
              <li
                class="relative px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors no-print-row"
                :class="
                  expandedId === item.id
                    ? 'bg-amber-200 border-l-4 border-amber-600 pl-[16px] ring-1 ring-amber-300 shadow-sm'
                    : 'hover:bg-slate-50/70 border-l-4 border-transparent'
                "
                @click="toggleExpand(item)"
              >
                <!-- 깊이 인디케이터 -->
                <span
                  class="shrink-0 inline-flex items-center justify-center w-7 h-6 rounded-md text-[10px] font-bold tabular-nums"
                  :class="depthBadgeClass(item.depth)"
                >
                  D{{ item.depth + 1 }}
                </span>

                <!-- 경로 (breadcrumb 스타일) -->
                <div class="flex-1 min-w-0 flex items-center gap-1 text-xs flex-wrap">
                  <template v-for="(seg, si) in item.pathSegments" :key="si">
                    <span
                      :class="
                        si === item.pathSegments.length - 1
                          ? 'font-bold text-slate-800'
                          : 'text-slate-400'
                      "
                      v-html="highlight(seg)"
                    ></span>
                    <i
                      v-if="si < item.pathSegments.length - 1"
                      class="fa-solid fa-angle-right text-[9px] text-slate-300 mx-0.5"
                    ></i>
                  </template>
                </div>

                <!-- ID / 자식 개수 / 자재 개수 -->
                <div class="shrink-0 flex items-center gap-2 text-[10px] text-slate-400">
                  <span
                    v-if="materialCountByCategory[item.id]"
                    v-tip="`자재 갯수 · ${materialCountByCategory[item.id]}개`"
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold"
                  >
                    <i class="fa-solid fa-box text-[9px]"></i>
                    {{ materialCountByCategory[item.id] }}
                  </span>
                  <span
                    v-if="item.childCount > 0"
                    v-tip="`하부 카테고리 갯수 · ${item.childCount}개`"
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold"
                  >
                    <i class="fa-solid fa-layer-group text-[9px]"></i>
                    {{ item.childCount }}
                  </span>
                  <span class="font-mono">#{{ item.id }}</span>
                  <i
                    class="fa-solid fa-chevron-down text-[10px] text-slate-300 ml-0.5 transition-transform"
                    :class="expandedId === item.id ? 'rotate-180 text-amber-500' : ''"
                  ></i>
                </div>
              </li>

              <!-- 콜랩스 패널 -->
              <transition
                name="collapse"
                @enter="onCollapseEnter"
                @after-enter="onCollapseAfterEnter"
                @leave="onCollapseLeave"
              >
                <li
                  v-if="expandedId === item.id"
                  class="bg-slate-50/60 border-t border-slate-100 overflow-hidden no-print-row"
                >
                  <div class="px-5 py-3">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2 text-[11px] text-slate-500">
                        <i class="fa-solid fa-box text-amber-500"></i>
                        <span class="font-semibold text-slate-700">{{ item.name }}</span>
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-bold tabular-nums">
                          {{ expandedMaterials.length }}
                        </span>
                      </div>
                    </div>

                    <div
                      v-if="materialsLoading"
                      class="flex items-center justify-center py-6 text-slate-400 text-xs"
                    >
                      <i class="fa-solid fa-spinner fa-spin mr-1.5"></i>불러오는 중...
                    </div>
                    <div
                      v-else-if="!expandedMaterials.length"
                      class="flex items-center justify-center py-6 text-[11px] text-slate-400"
                    >
                      <i class="fa-regular fa-folder-open mr-1.5"></i>
                      등록된 자재가 없습니다
                    </div>
                    <ul
                      v-else
                      class="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden"
                    >
                      <li
                        v-for="mat in expandedMaterials"
                        :key="mat.id"
                        class="px-3 py-2 flex items-center gap-3 hover:bg-slate-50/70"
                      >
                        <div class="shrink-0 w-10 h-10 rounded-md border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                          <img
                            v-if="mat.image"
                            :src="mat.image"
                            class="w-full h-full object-cover"
                            @error="(e) => (e.target.style.display = 'none')"
                          />
                          <i v-else class="fa-regular fa-image text-slate-300 text-xs"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-bold text-slate-800 truncate">
                            {{ mat.name }}
                          </div>
                          <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {{ mat.code }}
                            <span v-if="mat.spec" class="ml-1 text-slate-300">· {{ mat.spec }}</span>
                          </div>
                        </div>
                        <div class="shrink-0 text-right">
                          <div class="text-[11px] font-bold text-slate-700 tabular-nums">
                            {{ fmtPrice(mat.outbound_price1) }}
                          </div>
                          <div class="text-[9px] text-slate-400 tabular-nums">
                            재고 {{ fmtPrice(mat.stock_qty || 0) }} {{ mat.unit || "" }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </li>
              </transition>
            </template>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  name: "CategoryPathPage",

  data() {
    return {
      tree: [],
      flatList: [],
      keyword: "",
      loading: false,
      printedAt: this.fmtNow(),

      // 인라인 콜랩스
      expandedId: null,
      materialsLoading: false,
      allMaterials: [],
      url: import.meta.env.VITE_API_URL,
    };
  },

  computed: {
    // 현재 트리에서 사용 중인 최대 깊이 (depth 인덱스, 0-base)
    maxDepth() {
      let max = 0;
      for (const it of this.flatList) {
        if ((it.depth || 0) > max) max = it.depth;
      }
      return max;
    },

    // category_id → 소속 자재 개수
    materialCountByCategory() {
      const map = Object.create(null);
      for (const m of this.allMaterials) {
        const cid = m.category_id;
        if (cid == null) continue;
        map[cid] = (map[cid] || 0) + 1;
      }
      return map;
    },

    // 현재 펼쳐진 카테고리에 소속된 자재 리스트
    expandedMaterials() {
      if (!this.expandedId) return [];
      return this.allMaterials.filter((m) => m.category_id === this.expandedId);
    },

    // 루트 단위로 그룹핑 + 검색 필터 적용
    filteredGroups() {
      const kw = this.keyword.trim().toLowerCase();
      const filtered = kw
        ? this.flatList.filter(
            (c) =>
              c.name.toLowerCase().includes(kw) ||
              c.fullPath.toLowerCase().includes(kw),
          )
        : this.flatList;

      // 루트별 그룹
      const groupsMap = new Map();
      for (const item of filtered) {
        const rootId = item.rootId;
        if (!groupsMap.has(rootId)) {
          const root = this.flatList.find((c) => c.id === rootId);
          groupsMap.set(rootId, { root, items: [] });
        }
        groupsMap.get(rootId).items.push(item);
      }
      // 루트 정렬 (sort → name)
      return [...groupsMap.values()].sort((a, b) => {
        const sa = a.root?.sort ?? 0;
        const sb = b.root?.sort ?? 0;
        if (sa !== sb) return sa - sb;
        return (a.root?.name || "").localeCompare(b.root?.name || "");
      });
    },
  },

  methods: {
    // 현재 시각 표기 (YYYY-MM-DD HH:mm)
    fmtNow() {
      const d = new Date();
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${mo}-${da} ${h}:${m}`;
    },

    // 검색어 하이라이트
    highlight(text) {
      const kw = this.keyword.trim();
      if (!kw || !text) return text || "";
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(${escaped})`, "gi");
      return String(text).replace(
        re,
        '<mark class="bg-amber-200 text-amber-900 rounded px-0.5">$1</mark>',
      );
    },

    // 깊이별 배지 색상 (D1~D10, 최대 10댑스 가정)
    depthBadgeClass(depth) {
      const palette = [
        "bg-amber-100 text-amber-700",     // D1
        "bg-blue-100 text-blue-700",       // D2
        "bg-emerald-100 text-emerald-700", // D3
        "bg-violet-100 text-violet-700",   // D4
        "bg-pink-100 text-pink-700",       // D5
        "bg-teal-100 text-teal-700",       // D6
        "bg-orange-100 text-orange-700",   // D7
        "bg-indigo-100 text-indigo-700",   // D8
        "bg-cyan-100 text-cyan-700",       // D9
        "bg-rose-100 text-rose-700",       // D10
      ];
      const d = depth || 0;
      return palette[d] || "bg-slate-100 text-slate-600";
    },

    // 트리 → 평탄화 (depth, rootId, pathSegments, fullPath, childCount 추가)
    flatten(nodes, depth = 0, rootId = null, parentPath = []) {
      const result = [];
      for (const n of nodes) {
        const currentRootId = depth === 0 ? n.id : rootId;
        const segments = [...parentPath, n.name];
        const entry = {
          id: n.id,
          name: n.name,
          depth,
          rootId: currentRootId,
          pathSegments: segments,
          fullPath: segments.join(" > "),
          childCount: n.children?.length || 0,
          sort: n.sort ?? 0,
        };
        result.push(entry);
        if (n.children?.length) {
          result.push(
            ...this.flatten(n.children, depth + 1, currentRootId, segments),
          );
        }
      }
      return result;
    },

    // 카테고리 트리 로드
    async loadTree() {
      this.loading = true;
      try {
        const res = await api.post("/api/category/getCategoryTree");
        this.tree = Array.isArray(res.data) ? res.data : [];
        this.flatList = this.flatten(this.tree);
      } catch {
        this.tree = [];
        this.flatList = [];
      } finally {
        this.loading = false;
      }
    },

    // 프린트
    print() {
      this.printedAt = this.fmtNow();
      this.$nextTick(() => window.print());
    },

    // 금액/수량 포맷
    fmtPrice(v) {
      return (Number(v) || 0).toLocaleString();
    },

    // 카테고리 행 토글 (같은 행 재클릭 시 닫기)
    toggleExpand(item) {
      this.expandedId = this.expandedId === item.id ? null : item.id;
    },

    // 전체 자재 로드 → 카테고리 매핑/콜랩스 리스트에 공용 사용
    async loadAllMaterials() {
      this.materialsLoading = true;
      try {
        const res = await api.post("/api/material/list", {});
        const list = (Array.isArray(res.data) ? res.data : []).map((row) => {
          const firstImage = row.images?.[0]?.file_url;
          return {
            ...row,
            image: firstImage ? this.url + firstImage : "",
          };
        });
        this.allMaterials = list;
      } catch {
        this.allMaterials = [];
      } finally {
        this.materialsLoading = false;
      }
    },

    // 콜랩스 애니메이션: height auto ↔ 0 보간을 위해 JS 트랜지션 사용
    onCollapseEnter(el) {
      el.style.height = "0";
      el.offsetHeight; // reflow
      el.style.height = el.scrollHeight + "px";
    },
    onCollapseAfterEnter(el) {
      el.style.height = "auto";
    },
    onCollapseLeave(el) {
      el.style.height = el.scrollHeight + "px";
      el.offsetHeight; // reflow
      el.style.height = "0";
    },
  },

  mounted() {
    this.loadTree();
    this.loadAllMaterials();
  },
};
</script>

<style scoped>
.print-only {
  display: none;
}

/* 콜랩스 애니메이션 (JS 트랜지션으로 height 보간) */
.collapse-enter-active,
.collapse-leave-active {
  transition: height 260ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  height: 0;
}

</style>

<style>
@media print {
  @page {
    size: A4;
    margin: 12mm 14mm;
  }

  html,
  body {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 모든 요소 숨김 후 print-area만 보이게 */
  body * {
    visibility: hidden !important;
  }
  .print-area,
  .print-area * {
    visibility: visible !important;
  }

  .print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: none !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
  }

  .no-print,
  .no-print-card {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  /* 카드 스타일 단순화 */
  .category-group {
    box-shadow: none !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 8px !important;
    page-break-inside: avoid;
    margin-bottom: 8px !important;
    background: #fff !important;
  }

  .category-group header {
    background: #f1f5f9 !important;
    padding: 6px 10px !important;
  }

  .category-group ul li {
    padding: 4px 10px !important;
    font-size: 11px !important;
  }

  * {
    transition: none !important;
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
