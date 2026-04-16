<template>
  <div class="column-page">
    <header class="page-header">
      <div class="header-top">
        <div class="header-left">
          <div class="header-icon">
            <i class="fa-solid fa-grip-lines-vertical"></i>
          </div>
          <div>
            <h1>자재 카테고리 (가로 댑스)</h1>
            <p class="header-sub">댑스별로 나열된 카테고리 컬럼 뷰</p>
          </div>
        </div>
      </div>

      <div class="nav-bar">
        <button class="all-paths-btn" @click="allPathsOpen = true">
          <i class="fa-solid fa-sitemap"></i>
          <span>전체 경로 보기</span>
        </button>

        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="카테고리 이름으로 검색..."
          />
          <button
            v-if="searchQuery"
            class="search-clear"
            @click="searchQuery = ''"
            title="검색 초기화"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
          <span v-if="searchQuery" class="search-count-inline">
            {{ searchResults.length }}건
          </span>
        </div>

        <div class="nav-divider"></div>

        <div class="path-area">
          <div class="path-bar-label">
            <i class="fa-solid fa-route"></i>
            <span>선택 경로</span>
          </div>
          <div v-if="path.length > 0" class="path-chips">
            <template v-for="(n, i) in path" :key="n.id">
              <button
                class="path-chip"
                :class="{ 'is-last': i === path.length - 1 }"
                @click="jumpTo(i)"
              >
                <span class="chip-depth">D{{ n.depth }}</span>
                <span class="chip-name">{{ n.name }}</span>
              </button>
              <i
                v-if="i < path.length - 1"
                class="fa-solid fa-angle-right chip-sep"
              ></i>
            </template>
          </div>
          <span v-else class="path-empty">카테고리를 선택하세요</span>
        </div>
      </div>

      <div v-if="searchQuery && searchResults.length > 0" class="search-results">
        <button
          v-for="r in searchResults"
          :key="r.id"
          class="search-result-item"
          @click="gotoSearchResult(r)"
        >
          <i class="fa-solid fa-folder search-result-icon"></i>
          <span class="search-result-path">
            <template v-for="(n, i) in r.path" :key="n.id">
              <span
                class="sr-seg"
                :class="{ 'sr-seg-last': i === r.path.length - 1 }"
                v-html="highlightMatch(n.name)"
              ></span>
              <i
                v-if="i < r.path.length - 1"
                class="fa-solid fa-angle-right sr-sep"
              ></i>
            </template>
          </span>
          <span class="search-result-depth">D{{ r.node.depth }}</span>
        </button>
      </div>
      <div
        v-else-if="searchQuery && searchResults.length === 0"
        class="search-empty"
      >
        <i class="fa-solid fa-circle-exclamation"></i>
        일치하는 카테고리가 없습니다
      </div>
    </header>

    <div class="columns-scroll" ref="scrollArea">
      <div class="columns-wrap">
        <div
          v-for="(col, idx) in columns"
          :key="idx"
          class="col"
          :class="{ 'col-empty': col.items.length === 0 }"
        >
          <div class="col-header">
            <span class="col-depth">댑스 {{ idx + 1 }}</span>
            <span class="col-count">{{ col.items.length }}</span>
          </div>
          <div class="col-body">
            <div v-if="col.items.length === 0" class="col-empty-msg">
              <i class="fa-solid fa-folder-open"></i>
              <p>하위 카테고리 없음</p>
            </div>
            <button
              v-for="item in col.items"
              :key="item.id"
              class="col-item"
              :class="{
                active: selectedIds[idx] === item.id,
                'has-children': item.children && item.children.length > 0,
              }"
              @click="selectAt(idx, item)"
            >
              <i
                class="fa-solid col-item-icon"
                :class="
                  item.children && item.children.length > 0
                    ? 'fa-folder'
                    : 'fa-file'
                "
              ></i>
              <span class="col-item-name">{{ item.name }}</span>
              <span
                v-if="item.children && item.children.length > 0"
                class="col-item-count"
              >
                {{ item.children.length }}
              </span>
              <i
                v-if="item.children && item.children.length > 0"
                class="fa-solid fa-chevron-right col-item-arrow"
              ></i>
            </button>
          </div>
        </div>

        <div v-if="selectedNode" class="col detail-col">
          <div class="col-header detail-header">
            <span class="col-depth">상세</span>
          </div>
          <div class="col-body detail-body">
            <div class="detail-icon">
              <i class="fa-solid fa-folder-tree"></i>
            </div>
            <h3 class="detail-name">{{ selectedNode.name }}</h3>
            <div class="detail-meta">
              <div class="meta-row">
                <span class="meta-label">코드</span>
                <span class="meta-val">{{ selectedNode.code || "-" }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">댑스</span>
                <span class="meta-val">{{ selectedNode.depth }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">하위 수</span>
                <span class="meta-val">
                  {{ selectedNode.children?.length || 0 }}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">경로</span>
                <span class="meta-val">
                  {{ path.map((n) => n.name).join(" > ") }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div
        v-if="allPathsOpen"
        class="modal-overlay"
        @click.self="allPathsOpen = false"
      >
        <div class="modal-box">
          <div class="modal-head">
            <div class="modal-head-left">
              <div class="modal-head-icon">
                <i class="fa-solid fa-sitemap"></i>
              </div>
              <div>
                <h2>전체 카테고리 경로</h2>
                <p class="modal-sub">
                  루트에서 말단까지 이어지는 모든 경로를 나열합니다
                </p>
              </div>
            </div>
            <button class="modal-close" @click="allPathsOpen = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-toolbar">
            <div class="modal-search-wrap">
              <i class="fa-solid fa-magnifying-glass modal-search-icon"></i>
              <input
                v-model="pathFilter"
                class="modal-search-input"
                placeholder="경로 필터..."
              />
              <button
                v-if="pathFilter"
                class="modal-search-clear"
                @click="pathFilter = ''"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <span class="modal-count-badge">
              총 <strong>{{ filteredAllPaths.length }}</strong> 건
            </span>
          </div>

          <div class="modal-body">
            <div v-if="filteredAllPaths.length === 0" class="modal-empty">
              <i class="fa-solid fa-folder-open"></i>
              <p>표시할 경로가 없습니다</p>
            </div>
            <ol v-else class="path-list">
              <li
                v-for="(p, i) in filteredAllPaths"
                :key="p.id"
                class="path-list-item"
              >
                <span class="path-index">{{ i + 1 }}</span>
                <span class="path-text">
                  <template v-for="(seg, si) in p.segments" :key="si">
                    <span
                      class="path-seg"
                      :class="{ 'path-seg-last': si === p.segments.length - 1 }"
                    >
                      {{ seg }}
                    </span>
                    <i
                      v-if="si < p.segments.length - 1"
                      class="fa-solid fa-angle-right path-arrow"
                    ></i>
                  </template>
                </span>
                <span class="path-depth-badge">D{{ p.segments.length }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from "@/api/api";
import { findPath } from "@/utils/categoryTree";

export default {
  name: "MaterialCategoryColumnPage",
  data() {
    return {
      tree: [],
      selectedIds: [],
      searchQuery: "",
      allPathsOpen: false,
      pathFilter: "",
    };
  },
  computed: {
    // 선택된 경로를 따라 각 depth의 컬럼 아이템 배열을 반환한다
    columns() {
      const cols = [{ items: this.tree }];
      let cur = this.tree;
      for (const id of this.selectedIds) {
        const node = cur.find((n) => n.id === id);
        if (!node || !node.children || node.children.length === 0) break;
        cols.push({ items: node.children });
        cur = node.children;
      }
      return cols;
    },
    // 현재 선택된 말단 노드를 반환한다
    selectedNode() {
      if (this.selectedIds.length === 0) return null;
      const last = this.selectedIds[this.selectedIds.length - 1];
      const p = findPath(this.tree, last);
      return p ? p[p.length - 1] : null;
    },
    // 선택된 노드까지의 전체 경로 배열을 반환한다
    path() {
      if (this.selectedIds.length === 0) return [];
      const last = this.selectedIds[this.selectedIds.length - 1];
      return findPath(this.tree, last) || [];
    },
    // 루트에서 말단까지 이어지는 전체 경로 목록을 생성한다
    allPaths() {
      const out = [];
      const walk = (nodes, trail) => {
        for (const n of nodes) {
          const nextTrail = [...trail, n.name];
          if (!n.children || n.children.length === 0) {
            out.push({ id: n.id, segments: nextTrail });
          } else {
            walk(n.children, nextTrail);
          }
        }
      };
      walk(this.tree, []);
      return out;
    },
    // pathFilter로 전체 경로 목록을 필터링한다
    filteredAllPaths() {
      const q = this.pathFilter.trim().toLowerCase();
      if (!q) return this.allPaths;
      return this.allPaths.filter((p) =>
        p.segments.join(" > ").toLowerCase().includes(q),
      );
    },
    // 검색어에 매칭되는 노드와 각 경로를 최대 50건까지 반환한다
    searchResults() {
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return [];
      const out = [];
      const walk = (nodes, trail) => {
        for (const n of nodes) {
          const nextTrail = [...trail, n];
          if (n.name.toLowerCase().includes(q)) {
            out.push({ id: n.id, node: n, path: nextTrail });
          }
          if (n.children?.length) walk(n.children, nextTrail);
        }
      };
      walk(this.tree, []);
      return out.slice(0, 50);
    },
  },
  // 마운트 시 카테고리 트리를 로드한다
  mounted() {
    this.loadTree();
  },
  methods: {
    // 카테고리 트리를 서버에서 로드한다
    async loadTree() {
      const res = await api.post("/api/category/getCategoryTree");
      this.tree = res.data || [];
    },
    // 특정 컬럼에서 항목 선택 시 하위 경로를 잘라내고 해당 id를 추가한다
    selectAt(colIdx, item) {
      this.selectedIds = this.selectedIds.slice(0, colIdx);
      this.selectedIds.push(item.id);
      this.$nextTick(() => {
        const el = this.$refs.scrollArea;
        if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      });
    },
    // 경로 칩 클릭 시 해당 depth까지로 선택을 축소한다
    jumpTo(index) {
      this.selectedIds = this.selectedIds.slice(0, index + 1);
    },
    // 검색 결과 클릭 시 경로를 선택 상태로 반영한다
    gotoSearchResult(r) {
      this.selectedIds = r.path.map((n) => n.id);
      this.searchQuery = "";
      this.$nextTick(() => {
        const el = this.$refs.scrollArea;
        if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      });
    },
    // 이름에서 검색어를 mark 태그로 감싸 하이라이트 처리한다
    highlightMatch(name) {
      const q = this.searchQuery.trim();
      if (!q) return this.escapeHtml(name);
      const safe = this.escapeHtml(name);
      const re = new RegExp(
        `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      return safe.replace(re, '<mark class="sr-hl">$1</mark>');
    },
    // HTML 특수 문자를 엔티티로 이스케이프한다
    escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
  },
};
</script>

<style scoped>
.column-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  font-family: "Inter", -apple-system, sans-serif;
  overflow: hidden;
}

.page-header {
  display: flex;
  flex-direction: column;
  padding: 16px 24px 14px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  gap: 14px;
}
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}
.header-left h1 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.header-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.nav-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border: 1.5px solid #bfdbfe;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.05);
}
.nav-divider {
  width: 1.5px;
  height: 28px;
  background: #bfdbfe;
  flex-shrink: 0;
}
.path-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow-x: auto;
  min-width: 0;
}
.path-bar-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.path-bar-label i {
  font-size: 13px;
}
.path-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.path-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: #fff;
  border: 1.5px solid #93c5fd;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: #1e40af;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.08);
  transition: all 0.15s ease;
}
.path-chip:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.15);
}
.path-chip.is-last {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #2563eb;
  color: #fff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.4);
}
.chip-depth {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 7px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  letter-spacing: 0.03em;
}
.path-chip.is-last .chip-depth {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.chip-name {
  font-size: 13px;
}
.chip-sep {
  font-size: 13px;
  color: #60a5fa;
  flex-shrink: 0;
}
.path-empty {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}

.search-input-wrap {
  position: relative;
  width: 320px;
  flex-shrink: 0;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
  font-size: 13px;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 78px 10px 38px;
  border: 1.5px solid #93c5fd;
  border-radius: 999px;
  font-size: 13px;
  outline: none;
  background: #fff;
  font-weight: 500;
  color: #0f172a;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.08);
}
.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}
.search-clear {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #cbd5e1;
  color: #fff;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.search-clear:hover {
  background: #64748b;
}
.search-count-inline {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10.5px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #10b981, #059669);
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
}

.search-results {
  max-height: 260px;
  overflow-y: auto;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  padding: 4px;
}
.search-result-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.12s;
}
.search-result-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.search-result-icon {
  color: #f59e0b;
  font-size: 13px;
  flex-shrink: 0;
}
.search-result-path {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #64748b;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.sr-seg {
  font-weight: 500;
}
.sr-seg-last {
  font-weight: 700;
  color: #1e40af;
}
.sr-sep {
  font-size: 9px;
  color: #cbd5e1;
}
:deep(.sr-hl) {
  background: #fef08a;
  color: #854d0e;
  padding: 0 2px;
  border-radius: 3px;
  font-weight: 700;
}
.search-result-depth {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 7px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  flex-shrink: 0;
}
.search-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fef3c7;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  font-size: 13px;
  color: #92400e;
  font-weight: 600;
}

.columns-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20px;
}
.columns-wrap {
  display: flex;
  gap: 12px;
  height: 100%;
  min-width: max-content;
}

.col {
  width: 260px;
  min-width: 260px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
  flex-shrink: 0;
}
.col-depth {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.col-count {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 999px;
}
.col-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.col-empty-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 30px 16px;
  text-align: center;
  color: #cbd5e1;
}
.col-empty-msg i {
  font-size: 28px;
  margin-bottom: 10px;
}
.col-empty-msg p {
  font-size: 12px;
  color: #94a3b8;
}

.col-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  color: #334155;
  margin-bottom: 2px;
  transition: all 0.12s ease;
}
.col-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.col-item.active {
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border-color: #bfdbfe;
  color: #1d4ed8;
  font-weight: 600;
}
.col-item-icon {
  font-size: 13px;
  color: #f59e0b;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}
.col-item.active .col-item-icon {
  color: #3b82f6;
}
.col-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.col-item-count {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.col-item.active .col-item-count {
  background: #dbeafe;
  color: #2563eb;
}
.col-item-arrow {
  font-size: 9px;
  color: #cbd5e1;
  flex-shrink: 0;
}
.col-item.active .col-item-arrow {
  color: #3b82f6;
}

.detail-col {
  width: 300px;
  min-width: 300px;
  background: linear-gradient(180deg, #fff, #f8fafc);
}
.detail-header {
  background: #eff6ff;
  border-bottom-color: #dbeafe;
}
.detail-header .col-depth {
  color: #2563eb;
}
.detail-body {
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.detail-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #3b82f6;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.detail-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 18px;
  text-align: center;
  word-break: break-all;
}
.detail-meta {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
}
.meta-label {
  color: #94a3b8;
  font-weight: 600;
}
.meta-val {
  color: #334155;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}

.all-paths-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  transition: all 0.15s ease;
}
.all-paths-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}
.all-paths-btn i {
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.modal-box {
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.35);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
}
.modal-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.modal-head-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.modal-head h2 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.modal-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.modal-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 22px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}
.modal-search-wrap {
  position: relative;
  flex: 1;
}
.modal-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
}
.modal-search-input {
  width: 100%;
  padding: 8px 32px 8px 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #fff;
  transition: all 0.15s;
}
.modal-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.modal-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: #cbd5e1;
  color: #fff;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-count-badge {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
}
.modal-count-badge strong {
  color: #2563eb;
  font-weight: 800;
  margin: 0 2px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px 18px;
}
.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  color: #cbd5e1;
}
.modal-empty i {
  font-size: 36px;
  margin-bottom: 12px;
}
.modal-empty p {
  font-size: 13px;
  color: #94a3b8;
}

.path-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.path-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f1f5f9;
  transition: all 0.12s;
}
.path-list-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.path-index {
  font-size: 10.5px;
  font-weight: 800;
  color: #94a3b8;
  min-width: 28px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.path-text {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}
.path-seg {
  color: #64748b;
  font-weight: 500;
}
.path-seg-last {
  color: #1e40af;
  font-weight: 700;
}
.path-arrow {
  font-size: 9px;
  color: #cbd5e1;
}
.path-depth-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 8px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  flex-shrink: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
  transform: scale(0.96);
}
</style>
