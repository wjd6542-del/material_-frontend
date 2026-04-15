<template>
  <div
    ref="wrapper"
    class="relative w-full"
    :style="{ zIndex: open ? 9999 : 1 }"
  >
    <!-- 트리거 -->
    <div :class="triggerClasses" @click="toggle">
      <div class="flex-1 truncate leading-none">
        {{ selectedLabel || placeholder }}
      </div>
      <div class="flex items-center gap-2 ml-2 h-full">
        <button
          v-if="modelValue"
          @click.stop="clear"
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
      <div class="max-h-72 overflow-y-auto p-3">
        <template v-if="keyword">
          <!-- 검색 모드: 플랫 리스트(동일 UI) -->
          <ul class="tree-root">
            <li
              v-for="item in filteredFlat"
              :key="item.id"
              class="tree-item is-root"
            >
              <div
                class="item-row"
                :class="{ active: item.id === modelValue }"
                @click="select(item.id)"
              >
                <span class="toggle-area">
                  <span class="toggle-spacer"></span>
                </span>
                <span class="node-content">
                  <span class="folder-icon-wrap">
                    <i
                      class="fa-solid fa-folder"
                      :class="item.id === modelValue ? 'text-blue-500' : 'text-amber-400'"
                    ></i>
                  </span>
                  <span v-if="item.depth != null" class="depth-badge">[{{ item.depth }}]</span>
                  <span class="node-label">
                    <span v-if="item.path" class="node-path">{{ item.path }} ›</span>
                    {{ item.name }}
                  </span>
                  <span
                    v-if="item.childCount > 0"
                    class="child-count"
                    :class="{ 'child-count--active': item.id === modelValue }"
                  >
                    <i class="fa-solid fa-layer-group child-count-icon"></i>
                    {{ item.childCount }}
                  </span>
                </span>
                <i
                  v-if="item.id === modelValue"
                  class="fa-solid fa-check text-blue-500 text-xs ml-auto"
                ></i>
              </div>
            </li>
          </ul>
          <div v-if="filteredFlat.length === 0" class="tree-select-empty">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>일치하는 카테고리가 없습니다</span>
          </div>
        </template>
        <template v-else>
          <!-- 트리 모드 -->
          <div v-if="tree.length === 0" class="tree-select-empty">
            <i class="fa-solid fa-folder-open"></i>
            <span>카테고리가 없습니다</span>
          </div>
          <ul v-else class="tree-root">
            <TreeSelectNode
              v-for="node in tree"
              :key="node.id"
              :node="node"
              :selected-id="modelValue"
              :expanded-ids="expandedIds"
              :is-root="true"
              @select="select"
              @toggle="toggleNode"
            />
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import TreeSelectNode from "@/components/base/TreeSelectNode.vue";

export default {
  name: "CategoryTreeSelect",
  components: { TreeSelectNode },
  props: {
    modelValue: { type: [Number, null], default: null },
    placeholder: { type: String, default: "카테고리 선택" },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      open: false,
      keyword: "",
      tree: [],
      flatList: [],
      expandedIds: new Set(),
      allExpandableIds: [],
    };
  },
  computed: {
    selectedLabel() {
      const found = this.flatList.find((c) => c.id === this.modelValue);
      return found ? found.fullName : "";
    },
    allExpanded() {
      return (
        this.allExpandableIds.length > 0 &&
        this.expandedIds.size >= this.allExpandableIds.length
      );
    },
    filteredFlat() {
      if (!this.keyword) return [];
      const kw = this.keyword.toLowerCase();
      return this.flatList.filter((c) =>
        c.name.toLowerCase().includes(kw) ||
        c.fullName.toLowerCase().includes(kw)
      );
    },
    triggerClasses() {
      const parentClass = this.$attrs.class || "";
      const hasPadding = /p[xy]?-/.test(parentClass);
      const hasHeight = /h-/.test(parentClass);
      const hasBorder = /border/.test(parentClass);
      const hasRounded = /rounded/.test(parentClass);
      return [
        "flex justify-between items-center cursor-pointer transition-all box-border relative",
        !hasHeight && !hasPadding && "h-10 px-3",
        !hasPadding && hasHeight && "px-3",
        !hasBorder && "border border-gray-300",
        !hasRounded && "rounded",
        parentClass,
        this.open
          ? "ring-4 ring-blue-50 border-blue-500"
          : "hover:border-gray-400",
      ];
    },
  },
  methods: {
    toggle() {
      this.open = !this.open;
      this.keyword = "";
      if (this.open) {
        if (this.tree.length === 0) {
          this.loadTree();
        } else {
          this.expandToSelected();
        }
        this.$nextTick(() => this.$refs.searchInput?.focus());
      }
    },
    toggleNode(id) {
      const next = new Set(this.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      this.expandedIds = next;
    },
    toggleExpandAll() {
      if (this.allExpanded) {
        this.expandedIds = new Set();
      } else {
        this.expandedIds = new Set(this.allExpandableIds);
      }
    },
    collectExpandableIds(nodes) {
      const ids = [];
      const walk = (list) => {
        for (const n of list) {
          if (n.children && n.children.length > 0) {
            ids.push(n.id);
            walk(n.children);
          }
        }
      };
      walk(nodes);
      return ids;
    },
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
    expandToSelected() {
      const next = new Set();
      for (const n of this.tree) {
        if (n.children && n.children.length > 0) next.add(n.id);
      }
      if (this.modelValue != null) {
        const path = this.findPathToId(this.tree, this.modelValue);
        if (path) path.forEach((id) => next.add(id));
      }
      this.expandedIds = next;
    },
    select(id) {
      this.$emit("update:modelValue", id);
      this.$emit("change", id);
      this.open = false;
    },
    clear() {
      this.$emit("update:modelValue", null);
      this.$emit("change", null);
      this.open = false;
    },
    handleClickOutside(e) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },
    async loadTree() {
      try {
        const res = await api.post("/api/category/getCategoryTree");
        this.tree = res.data || [];
        this.flatList = this.flatten(this.tree);
        this.allExpandableIds = this.collectExpandableIds(this.tree);
        this.expandToSelected();
      } catch {
        this.tree = [];
        this.flatList = [];
        this.allExpandableIds = [];
        this.expandedIds = new Set();
      }
    },
    flatten(nodes, parentPath = "", depth = 1) {
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
  mounted() {
    document.addEventListener("click", this.handleClickOutside, true);
    this.loadTree();
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  },
};
</script>

<style scoped>
.tree-root {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree-item {
  position: relative;
  list-style: none;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
  margin-bottom: 1px;
}
.item-row:hover {
  background: #f8fafc;
  box-shadow: inset 0 0 0 1.5px #e2e8f0;
}
.item-row.active {
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  box-shadow: inset 0 0 0 1.5px #bfdbfe;
  color: #1d4ed8;
  font-weight: 600;
}

.toggle-area {
  width: 14px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1px;
}
.toggle-spacer {
  width: 9px;
}

.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.folder-icon-wrap {
  font-size: 14px;
  width: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.depth-badge {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  flex-shrink: 0;
}
.node-label {
  font-size: 13.5px;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}
.node-path {
  color: #94a3b8;
  font-weight: 500;
  margin-right: 2px;
}
.child-count {
  font-size: 11px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 10px;
  font-weight: 600;
  flex-shrink: 0;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.15s ease;
}
.child-count-icon {
  font-size: 9px;
  opacity: 0.7;
}
.child-count--active {
  background: #dbeafe;
  color: #2563eb;
  border-color: #bfdbfe;
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
</style>
