<template>
  <div>
    <div
      class="tree-select-item"
      :class="{ selected: isSelected }"
      :style="{ paddingLeft: depth * 20 + 8 + 'px' }"
      @click="onSelect"
    >
      <span
        class="tree-select-toggle"
        :class="{ invisible: !hasChildren }"
        @click="toggleExpand"
      >
        <i
          class="fa-solid fa-chevron-right"
          :class="{ 'rotate-90': expanded }"
        ></i>
      </span>
      <i
        class="fa-solid text-sm"
        :class="[
          expanded && hasChildren
            ? 'fa-folder-open text-amber-400'
            : 'fa-folder text-amber-300',
          isSelected && 'text-blue-500',
        ]"
      ></i>
      <span
        class="tree-select-label"
        :class="{ 'font-semibold text-blue-700': isSelected }"
      >
        {{ node.name }}
      </span>
      <span v-if="hasChildren" class="tree-select-count">
        {{ node.children.length }}
      </span>
      <i
        v-if="isSelected"
        class="fa-solid fa-check text-blue-500 text-xs ml-auto"
      ></i>
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
</template>

<script>
export default {
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
</style>
