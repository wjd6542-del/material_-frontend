<template>
  <div class="flex flex-col gap-4" style="height: 70vh">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
        자재 선택
      </h2>
      <button
        type="button"
        @click="modal.closeModal()"
        class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="flex-1 flex overflow-hidden border rounded-xl">
      <!-- 왼쪽: 카테고리 트리 -->
      <aside
        class="shrink-0 bg-slate-50/60 flex flex-col overflow-hidden"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <div class="px-3 py-2.5 border-b bg-white flex items-center gap-2">
          <i class="fa-solid fa-folder-tree text-slate-400 text-sm"></i>
          <span class="text-sm font-semibold text-slate-700">카테고리</span>
          <button
            type="button"
            @click="resetCategory"
            class="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100"
            :disabled="selectedCategoryId == null && !treeKeyword"
          >
            <i class="fa-solid fa-arrow-rotate-left text-[10px]"></i>
            초기화
          </button>
        </div>

        <div class="px-2 py-2 border-b bg-white flex items-center gap-1.5">
          <button
            type="button"
            @click="toggleExpandAll"
            class="shrink-0 w-8 h-8 flex items-center justify-center border rounded-lg bg-white hover:bg-slate-100 text-slate-600 text-xs"
            :title="allExpanded ? '전체 닫기' : '전체 열기'"
          >
            <i
              class="fa-solid"
              :class="allExpanded ? 'fa-folder-minus' : 'fa-folder-plus'"
            ></i>
          </button>
          <div class="relative flex-1">
            <i
              class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"
            ></i>
            <input
              v-model="treeKeyword"
              type="text"
              placeholder="카테고리 검색..."
              class="w-full pl-7 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex-1 overflow-auto p-2">
          <div v-if="!tree.length" class="text-center text-slate-400 text-xs py-6">
            카테고리가 없습니다
          </div>
          <template v-else-if="treeKeyword">
            <ul v-if="filteredFlat.length" class="tree-root">
              <li
                v-for="item in filteredFlat"
                :key="item.id"
                class="px-2 py-1.5 rounded-lg cursor-pointer text-[13px] hover:bg-blue-50 flex items-center gap-1.5"
                :class="
                  item.id === selectedCategoryId
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600'
                "
                @click="onCategorySelect(item.id)"
              >
                <i class="fa-solid fa-folder text-amber-400 text-xs"></i>
                <span v-if="item.path" class="text-slate-400 text-[11px]">
                  {{ item.path }} ›
                </span>
                <span class="flex-1 truncate">{{ item.name }}</span>
                <span
                  v-if="materialCountMap[item.id]"
                  v-tip="`자재 갯수 · ${materialCountMap[item.id]}개`"
                  class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-semibold"
                >
                  <i class="fa-solid fa-box text-[9px]"></i>
                  {{ materialCountMap[item.id] }}
                </span>
              </li>
            </ul>
            <div v-else class="text-center text-slate-400 text-xs py-6">
              <i class="fa-solid fa-magnifying-glass block text-lg mb-1"></i>
              검색 결과가 없습니다
            </div>
          </template>
          <ul v-else class="tree-root">
            <TreeSelectNode
              v-for="node in tree"
              :key="node.id"
              :node="node"
              :selected-id="selectedCategoryId"
              :expanded-ids="expandedIds"
              :is-root="true"
              :material-count-map="materialCountMap"
              :show-material-count="true"
              @select="onCategorySelect"
              @toggle="toggleNode"
            />
          </ul>
        </div>
      </aside>

      <!-- 리사이즈 핸들 -->
      <div
        class="resize-handle"
        @mousedown="startResize"
        title="드래그해서 트리 너비 조정"
      >
        <div class="resize-handle-bar">
          <i class="fa-solid fa-grip-lines-vertical"></i>
        </div>
      </div>

      <!-- 오른쪽: 자재 목록 -->
      <section class="flex-1 flex flex-col overflow-hidden">
        <div class="px-3 py-2.5 border-b flex items-center gap-2">
          <div class="relative flex-1">
            <i
              class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"
            ></i>
            <input
              v-model="keyword"
              type="text"
              placeholder="자재명/자재번호 검색..."
              class="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span class="text-xs text-slate-400 shrink-0">
            {{ filtered.length }}개
          </span>
        </div>

        <div class="flex-1 overflow-auto">
          <div
            v-if="loading"
            class="h-full flex items-center justify-center text-slate-400 text-sm"
          >
            <i class="fa-solid fa-spinner fa-spin mr-2"></i>불러오는 중...
          </div>
          <div
            v-else-if="!filtered.length"
            class="h-full flex flex-col items-center justify-center text-slate-400 py-10"
          >
            <i class="fa-regular fa-folder-open text-3xl text-slate-300 mb-2"></i>
            <p class="text-sm">자재가 없습니다</p>
          </div>
          <table v-else class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 sticky top-0">
              <tr>
                <th class="w-10 text-center px-3 py-2.5">
                  <input
                    type="checkbox"
                    :checked="allFilteredChecked"
                    @change="toggleAllFiltered"
                  />
                </th>
                <th class="text-left px-4 py-2.5 font-semibold">자재번호</th>
                <th class="text-left px-4 py-2.5 font-semibold">자재명</th>
                <th class="text-left px-4 py-2.5 font-semibold">규격</th>
                <th class="text-center px-4 py-2.5 font-semibold">단위</th>
                <th class="text-right px-4 py-2.5 font-semibold">구매단가</th>
                <th class="text-right px-4 py-2.5 font-semibold">
                  판매단가1
                  <span class="ml-0.5 text-[9px] text-blue-500 font-bold">BASE</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in filtered"
                :key="m.id"
                @click="toggleSelect(m)"
                class="border-t border-slate-100 cursor-pointer transition-colors"
                :class="
                  selectedIds.has(m.id)
                    ? 'bg-blue-50/70 hover:bg-blue-100/50'
                    : 'hover:bg-blue-50/30'
                "
              >
                <td class="w-10 text-center px-3 py-2" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedIds.has(m.id)"
                    @change="toggleSelect(m)"
                  />
                </td>
                <td class="px-4 py-2 font-mono text-slate-700">
                  {{ m.code }}
                </td>
                <td class="px-4 py-2 text-slate-800">{{ m.name }}</td>
                <td class="px-4 py-2 text-slate-500">{{ m.spec || "-" }}</td>
                <td class="px-4 py-2 text-center text-slate-500">
                  {{ m.unit || "-" }}
                </td>
                <td
                  class="px-4 py-2 text-right font-mono tabular-nums"
                  :class="Number(m.inbound_price) > 0 ? 'text-slate-700' : 'text-slate-300'"
                >
                  {{ Number(m.inbound_price || 0).toLocaleString() }}
                </td>
                <td
                  class="px-4 py-2 text-right font-mono tabular-nums bg-blue-50/30"
                  :class="Number(m.outbound_price1) > 0 ? 'text-slate-700 font-semibold' : 'text-slate-300'"
                >
                  {{ Number(m.outbound_price1 || 0).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div class="flex items-center justify-between pt-2 border-t">
      <p class="text-xs text-slate-500">
        선택
        <span class="font-bold text-blue-600">{{ selectedIds.size }}</span>
        개
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="modal.closeModal()"
          class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          취소
        </button>
        <button
          type="button"
          @click="confirm"
          :disabled="selectedIds.size === 0"
          class="px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <i class="fa-solid fa-check text-xs"></i>
          적용
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import TreeSelectNode from "@/components/base/TreeSelectNode.vue";

export default {
  name: "MaterialSelectModal",
  components: { TreeSelectNode },

  props: {
    onConfirm: { type: Function, default: null },
    // 선택된 자재의 price 필드에 매핑할 원본 필드명
    // 발주/구매: "inbound_price", 판매: "outbound_price1" 등
    priceField: { type: String, default: "inbound_price" },
  },

  data() {
    return {
      modal: useModalStore(),
      tree: [],
      flatList: [],
      expandableIds: [],
      expandedIds: new Set(),
      selectedCategoryId: null,
      treeKeyword: "",
      materials: [],
      allMaterials: [], // 카테고리 트리 뱃지용 (필터와 무관한 전체)
      keyword: "",
      loading: false,
      selectedIds: new Set(),
      selectedMap: new Map(),
      sidebarWidth: 280,
    };
  },

  computed: {
    // category_id → 소속 자재 갯수 (트리 뱃지용)
    materialCountMap() {
      const map = Object.create(null);
      for (const m of this.allMaterials) {
        const cid = m.category_id;
        if (cid == null) continue;
        map[cid] = (map[cid] || 0) + 1;
      }
      return map;
    },

    filtered() {
      const kw = this.keyword.trim().toLowerCase();
      if (!kw) return this.materials;
      return this.materials.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(kw) ||
          (m.code || "").toLowerCase().includes(kw),
      );
    },

    filteredFlat() {
      const kw = this.treeKeyword.trim().toLowerCase();
      if (!kw) return [];
      return this.flatList.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.fullName.toLowerCase().includes(kw),
      );
    },

    allExpanded() {
      return (
        this.expandableIds.length > 0 &&
        this.expandedIds.size >= this.expandableIds.length
      );
    },

    allFilteredChecked() {
      return (
        this.filtered.length > 0 &&
        this.filtered.every((m) => this.selectedIds.has(m.id))
      );
    },
  },

  watch: {
    selectedCategoryId() {
      this.loadMaterials();
    },
  },

  methods: {
    async loadTree() {
      try {
        const res = await api.post("/api/category/getCategoryTree");
        this.tree = res.data || [];
        this.flatList = this.flatten(this.tree);
        this.expandableIds = this.collectExpandableIds(this.tree);
        const roots = new Set();
        for (const n of this.tree) {
          if (n.children && n.children.length) roots.add(n.id);
        }
        this.expandedIds = roots;
      } catch {
        this.tree = [];
        this.flatList = [];
        this.expandableIds = [];
      }
    },

    flatten(nodes, parentPath = "") {
      const result = [];
      for (const n of nodes) {
        const fullName = parentPath ? `${parentPath} > ${n.name}` : n.name;
        result.push({
          id: n.id,
          name: n.name,
          path: parentPath,
          fullName,
        });
        if (n.children && n.children.length) {
          result.push(...this.flatten(n.children, fullName));
        }
      }
      return result;
    },

    collectExpandableIds(nodes) {
      const ids = [];
      const walk = (list) => {
        for (const n of list) {
          if (n.children && n.children.length) {
            ids.push(n.id);
            walk(n.children);
          }
        }
      };
      walk(nodes);
      return ids;
    },

    toggleExpandAll() {
      if (this.allExpanded) {
        this.expandedIds = new Set();
      } else {
        this.expandedIds = new Set(this.expandableIds);
      }
    },

    async loadMaterials() {
      this.loading = true;
      try {
        const body = {};
        if (this.selectedCategoryId) body.category_id = this.selectedCategoryId;
        const res = await api.post("/api/material/list", body);
        this.materials = Array.isArray(res.data) ? res.data : [];
      } catch {
        this.materials = [];
      } finally {
        this.loading = false;
      }
    },

    // 전체 자재 로드 → 카테고리별 갯수 뱃지용 (1회만 호출)
    async loadAllMaterialsForCount() {
      try {
        const res = await api.post("/api/material/list", {});
        this.allMaterials = Array.isArray(res.data) ? res.data : [];
      } catch {
        this.allMaterials = [];
      }
    },

    toggleNode(id) {
      const next = new Set(this.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      this.expandedIds = next;
    },

    onCategorySelect(id) {
      this.selectedCategoryId = id;
    },

    // 카테고리 선택 및 트리 검색어를 초기화하고 자재 목록을 다시 로드한다
    resetCategory() {
      this.treeKeyword = "";
      if (this.selectedCategoryId == null) {
        this.loadMaterials();
      } else {
        this.selectedCategoryId = null;
      }
    },

    toggleSelect(m) {
      const next = new Set(this.selectedIds);
      if (next.has(m.id)) {
        next.delete(m.id);
        this.selectedMap.delete(m.id);
      } else {
        next.add(m.id);
        this.selectedMap.set(m.id, m);
      }
      this.selectedIds = next;
    },

    toggleAllFiltered() {
      const next = new Set(this.selectedIds);
      if (this.allFilteredChecked) {
        this.filtered.forEach((m) => {
          next.delete(m.id);
          this.selectedMap.delete(m.id);
        });
      } else {
        this.filtered.forEach((m) => {
          next.add(m.id);
          this.selectedMap.set(m.id, m);
        });
      }
      this.selectedIds = next;
    },

    // 사이드바 너비 드래그 리사이즈 (220 ~ 640)
    startResize(e) {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = this.sidebarWidth;
      const MIN = 220;
      const MAX = 640;
      const onMove = (ev) => {
        const w = startWidth + (ev.clientX - startX);
        this.sidebarWidth = Math.max(MIN, Math.min(w, MAX));
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },

    confirm() {
      if (this.selectedIds.size === 0) return;
      const picked = Array.from(this.selectedIds)
        .map((id) => this.selectedMap.get(id))
        .filter(Boolean)
        // priceField 기준으로 price 매핑
        .map((m) => ({
          ...m,
          price: Number(m?.[this.priceField]) || Number(m?.price) || 0,
        }));
      if (typeof this.onConfirm === "function") this.onConfirm(picked);
      this.modal.closeModal();
    },
  },

  mounted() {
    this.loadTree();
    this.loadMaterials();
    this.loadAllMaterialsForCount();
  },
};
</script>

<style scoped>
.tree-root {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 사이드바 리사이즈 핸들 */
.resize-handle {
  width: 10px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  transition: background 0.15s;
  flex-shrink: 0;
  user-select: none;
}
.resize-handle:hover,
.resize-handle:active {
  background: #dbeafe;
  border-color: #93c5fd;
}
.resize-handle-bar {
  color: #94a3b8;
  font-size: 10px;
  transition: color 0.15s;
}
.resize-handle:hover .resize-handle-bar,
.resize-handle:active .resize-handle-bar {
  color: #3b82f6;
}
</style>
