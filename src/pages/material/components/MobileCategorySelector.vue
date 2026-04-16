<template>
  <div class="mobile-header">
    <div class="mobile-header-inner">
      <label class="mobile-search-label">
        <i class="fa-solid fa-layer-group"></i> 카테고리 선택
      </label>
      <div
        ref="wrapper"
        class="relative w-full"
        :style="{ zIndex: open ? 9999 : 1 }"
      >
        <!-- 트리거 -->
        <div
          class="trigger"
          :class="{ 'trigger-open': open }"
          @click="toggle"
        >
          <div class="flex-1 truncate leading-none">
            {{ selectedLabel || '카테고리명을 입력하세요...' }}
          </div>
          <div class="flex items-center gap-2 ml-2 h-full">
            <button
              v-if="selectedId"
              @click.stop="reset"
              class="text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
            <i
              class="fa-solid fa-chevron-down transition-transform duration-200 flex items-center justify-center text-[10px]"
              :class="open ? 'rotate-180 text-blue-500' : 'text-gray-400'"
            ></i>
          </div>
        </div>

        <!-- 드롭다운 -->
        <div
          v-if="open"
          class="absolute left-0 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style="top: calc(100% + 4px); z-index: 9999; min-width: 280px"
        >
          <!-- 검색 -->
          <div class="p-3 bg-gray-50 border-b flex items-center gap-2">
            <button
              type="button"
              @click.stop="toggleExpandAll"
              class="flex-shrink-0 w-9 h-9 flex items-center justify-center border rounded-lg bg-white hover:bg-gray-100 text-gray-600 transition-colors"
              :title="allExpanded ? '전체 닫기' : '전체 열기'"
            >
              <i
                class="fa-solid"
                :class="allExpanded ? 'fa-folder-minus' : 'fa-folder-plus'"
              ></i>
            </button>
            <input
              ref="searchInput"
              v-model="keyword"
              type="text"
              placeholder="카테고리 검색..."
              class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <!-- 트리 영역 -->
          <div class="max-h-72 overflow-y-auto p-2">
            <template v-if="keyword">
              <div
                v-for="item in filteredFlat"
                :key="item.id"
                class="tree-select-item"
                :class="{ selected: item.id === selectedId }"
                :style="{ paddingLeft: item.depth * 20 + 8 + 'px' }"
                @click="select(item.id)"
              >
                <span class="tree-select-toggle invisible">
                  <i class="fa-solid fa-chevron-right"></i>
                </span>
                <i
                  class="fa-solid text-sm"
                  :class="[
                    item.childCount > 0 ? 'fa-folder text-amber-300' : 'fa-folder text-amber-200',
                    item.id === selectedId && 'text-blue-500',
                  ]"
                ></i>
                <span
                  class="tree-select-label"
                  :class="{ 'font-semibold text-blue-700': item.id === selectedId }"
                >
                  {{ item.name }}
                </span>
                <span v-if="item.childCount > 0" class="tree-select-count">
                  {{ item.childCount }}
                </span>
                <i
                  v-if="item.id === selectedId"
                  class="fa-solid fa-check text-blue-500 text-xs ml-auto"
                ></i>
              </div>
              <div v-if="filteredFlat.length === 0" class="tree-select-empty">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>일치하는 카테고리가 없습니다</span>
              </div>
            </template>
            <template v-else>
              <div v-if="tree.length === 0" class="tree-select-empty">
                <i class="fa-solid fa-folder-open"></i>
                <span>카테고리가 없습니다</span>
              </div>
              <TreeSelectNode
                v-for="node in tree"
                :key="node.id"
                :node="node"
                :selected-id="selectedId"
                :expanded-ids="expandedIds"
                :is-root="true"
                @select="select"
                @toggle="toggleNode"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TreeSelectNode from "@/components/base/TreeSelectNode.vue";

export default {
  name: "MobileCategorySelector",
  components: { TreeSelectNode },
  props: {
    selectedId: { type: Number, default: null },
    tree: { type: Array, required: true },
  },
  emits: ["select", "reset"],
  data() {
    return {
      open: false,
      keyword: "",
      expandedIds: new Set(),
    };
  },
  computed: {
    // 트리를 평면화한 리스트를 반환한다
    flatList() {
      return this.flatten(this.tree);
    },
    // 확장 가능한 모든 노드 id 배열을 반환한다
    allExpandableIds() {
      const ids = [];
      const walk = (list) => {
        for (const n of list) {
          if (n.children && n.children.length > 0) {
            ids.push(n.id);
            walk(n.children);
          }
        }
      };
      walk(this.tree);
      return ids;
    },
    // 모든 노드가 펼쳐져 있는지 여부
    allExpanded() {
      return (
        this.allExpandableIds.length > 0 &&
        this.expandedIds.size >= this.allExpandableIds.length
      );
    },
    // 선택된 카테고리의 전체 경로 이름
    selectedLabel() {
      const found = this.flatList.find((c) => c.id === this.selectedId);
      return found ? found.fullName : "";
    },
    // 키워드로 필터링된 플랫 리스트를 반환한다
    filteredFlat() {
      if (!this.keyword) return [];
      const kw = this.keyword.toLowerCase();
      return this.flatList.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.fullName.toLowerCase().includes(kw),
      );
    },
  },
  methods: {
    // 드롭다운을 토글하고 열릴 때 확장/포커스를 처리한다
    toggle() {
      this.open = !this.open;
      this.keyword = "";
      if (this.open) {
        this.expandToSelected();
        this.$nextTick(() => this.$refs.searchInput?.focus());
      }
    },
    // 단일 노드의 확장/축소 상태를 토글한다
    toggleNode(id) {
      const next = new Set(this.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      this.expandedIds = next;
    },
    // 전체 확장/축소를 토글한다
    toggleExpandAll() {
      if (this.allExpanded) {
        this.expandedIds = new Set();
      } else {
        this.expandedIds = new Set(this.allExpandableIds);
      }
    },
    // 특정 id 노드까지의 부모 id 경로 배열을 찾는다
    findPathToId(nodes, targetId, path = []) {
      for (const n of nodes) {
        if (n.id === targetId) return path;
        if (n.children && n.children.length > 0) {
          const found = this.findPathToId(n.children, targetId, [
            ...path,
            n.id,
          ]);
          if (found) return found;
        }
      }
      return null;
    },
    // 선택된 노드 경로와 루트 노드들을 확장 상태로 설정한다
    expandToSelected() {
      const next = new Set();
      for (const n of this.tree) {
        if (n.children && n.children.length > 0) next.add(n.id);
      }
      if (this.selectedId != null) {
        const path = this.findPathToId(this.tree, this.selectedId);
        if (path) path.forEach((id) => next.add(id));
      }
      this.expandedIds = next;
    },
    // 특정 카테고리를 선택하고 드롭다운을 닫는다
    select(id) {
      this.$emit("select", id);
      this.open = false;
    },
    // 선택 해제 이벤트를 emit한다
    reset() {
      this.$emit("reset");
      this.open = false;
    },
    // 외부 클릭 시 드롭다운을 닫는다
    handleClickOutside(e) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },
    // 중첩 트리를 경로 정보가 포함된 평면 리스트로 변환한다
    flatten(nodes, parentPath = "", depth = 0) {
      const result = [];
      for (const n of nodes) {
        const fullName = parentPath ? `${parentPath} > ${n.name}` : n.name;
        const childCount = n.children ? n.children.length : 0;
        result.push({
          id: n.id,
          name: n.name,
          path: parentPath,
          fullName,
          depth,
          childCount,
        });
        if (childCount > 0) {
          result.push(...this.flatten(n.children, fullName, depth + 1));
        }
      }
      return result;
    },
  },
  // 마운트 시 외부 클릭 리스너를 등록한다
  mounted() {
    document.addEventListener("click", this.handleClickOutside, true);
  },
  // 언마운트 직전 외부 클릭 리스너를 제거한다
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  },
};
</script>

<style scoped>
.mobile-header {
  display: none;
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.mobile-search-label {
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 14px;
  color: #334155;
  transition: all 0.15s;
  box-sizing: border-box;
}
.trigger:hover {
  border-color: #cbd5e1;
}
.trigger-open {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.tree-select-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #334155;
  transition: background 0.12s;
}
.tree-select-item:hover {
  background: #f1f5f9;
}
.tree-select-item.selected {
  background: #eff6ff;
}

.tree-select-toggle {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 9px;
  color: #94a3b8;
}
.tree-select-toggle.invisible {
  visibility: hidden;
}

.tree-select-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-select-count {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 8px;
  font-weight: 600;
  padding: 0 4px;
  flex-shrink: 0;
}

.tree-select-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  color: #94a3b8;
  font-size: 13px;
}
.tree-select-empty i {
  font-size: 20px;
  color: #cbd5e1;
}

@media (max-width: 1024px) {
  .mobile-header {
    display: block;
    position: sticky;
    top: 0;
    z-index: 100;
  }
}
</style>
