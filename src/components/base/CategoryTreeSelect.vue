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
      <div class="p-3 bg-gray-50 border-b">
        <input
          ref="searchInput"
          v-model="keyword"
          type="text"
          placeholder="카테고리 검색..."
          class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <!-- 트리 영역 -->
      <div class="max-h-72 overflow-y-auto p-2">
        <template v-if="keyword">
          <!-- 검색 모드: 플랫 리스트 -->
          <div
            v-for="item in filteredFlat"
            :key="item.id"
            class="tree-select-item"
            :class="{ selected: item.id === modelValue }"
            @click="select(item.id)"
          >
            <span class="tree-select-path">{{ item.path }}</span>
            <span class="tree-select-name">{{ item.name }}</span>
            <i v-if="item.id === modelValue" class="fa-solid fa-check text-blue-500 text-xs ml-auto"></i>
          </div>
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
          <TreeSelectNode
            v-for="node in tree"
            :key="node.id"
            :node="node"
            :selected-id="modelValue"
            :depth="0"
            @select="select"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

const TreeSelectNode = {
  name: "TreeSelectNode",
  props: {
    node: { type: Object, required: true },
    selectedId: { type: Number, default: null },
    depth: { type: Number, default: 0 },
  },
  emits: ["select"],
  data() {
    return {
      expanded: this.depth < 1,
    };
  },
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0;
    },
    isSelected() {
      return this.selectedId === this.node.id;
    },
  },
  methods: {
    toggleExpand(e) {
      e.stopPropagation();
      this.expanded = !this.expanded;
    },
    onSelect() {
      this.$emit("select", this.node.id);
    },
  },
  template: `
    <div>
      <div
        class="tree-select-item"
        :class="{ selected: isSelected }"
        :style="{ paddingLeft: (depth * 20 + 8) + 'px' }"
        @click="onSelect"
      >
        <span
          class="tree-select-toggle"
          :class="{ invisible: !hasChildren }"
          @click="toggleExpand"
        >
          <i class="fa-solid fa-chevron-right" :class="{ 'rotate-90': expanded }"></i>
        </span>
        <i
          class="fa-solid text-sm"
          :class="[
            expanded && hasChildren ? 'fa-folder-open text-amber-400' : 'fa-folder text-amber-300',
            isSelected && 'text-blue-500'
          ]"
        ></i>
        <span class="tree-select-label" :class="{ 'font-semibold text-blue-700': isSelected }">
          {{ node.name }}
        </span>
        <span v-if="hasChildren" class="tree-select-count">{{ node.children.length }}</span>
        <i v-if="isSelected" class="fa-solid fa-check text-blue-500 text-xs ml-auto"></i>
      </div>
      <div v-if="hasChildren && expanded">
        <TreeSelectNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :selected-id="selectedId"
          :depth="depth + 1"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
  `,
};

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
    };
  },
  computed: {
    selectedLabel() {
      const found = this.flatList.find((c) => c.id === this.modelValue);
      return found ? found.fullName : "";
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
        if (this.tree.length === 0) this.loadTree();
        this.$nextTick(() => this.$refs.searchInput?.focus());
      }
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
      } catch {
        this.tree = [];
        this.flatList = [];
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
        if (n.children && n.children.length > 0) {
          result.push(...this.flatten(n.children, fullName));
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
  border-radius: 4px;
  flex-shrink: 0;
  font-size: 9px;
  color: #94a3b8;
  transition: all 0.15s;
}
.tree-select-toggle:hover {
  background: #e2e8f0;
  color: #64748b;
}
.tree-select-toggle.invisible {
  visibility: hidden;
}
.tree-select-toggle i {
  transition: transform 0.2s;
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

.tree-select-path {
  font-size: 11px;
  color: #94a3b8;
  margin-right: 2px;
}
.tree-select-path:not(:empty)::after {
  content: " >";
}

.tree-select-name {
  font-weight: 500;
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
