<template>
  <li class="tree-item" :class="{ 'is-root': isRoot }">
    <div
      class="item-row"
      :class="{ active: isSelected }"
      @click="onSelect"
    >
      <span class="toggle-area" @click.stop="toggleExpand">
        <i
          v-if="hasChildren"
          class="fa-solid fa-chevron-right toggle-arrow"
          :class="{ open: expanded }"
        ></i>
        <span v-else class="toggle-spacer"></span>
      </span>

      <span class="node-content">
        <span class="folder-icon-wrap">
          <i
            class="fa-solid"
            :class="[
              expanded && hasChildren ? 'fa-folder-open' : 'fa-folder',
              isSelected ? 'text-blue-500' : 'text-amber-400',
            ]"
          ></i>
        </span>

        <span v-if="node.depth != null" class="depth-badge">[{{ node.depth }}]</span>
        <span class="node-label">{{ node.name }}</span>

        <span
          v-if="hasChildren"
          class="child-count"
          :class="{ 'child-count--active': isSelected }"
        >
          <i class="fa-solid fa-layer-group child-count-icon"></i>
          {{ node.children.length }}
        </span>
      </span>

      <i
        v-if="isSelected"
        class="fa-solid fa-check text-blue-500 text-xs ml-auto"
      ></i>
    </div>

    <transition name="tree-expand">
      <ul v-if="hasChildren" v-show="expanded" class="child-tree">
        <TreeSelectNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :selected-id="selectedId"
          :expanded-ids="expandedIds"
          :is-root="false"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
        />
      </ul>
    </transition>
  </li>
</template>

<script>
export default {
  name: "TreeSelectNode",
  props: {
    node: { type: Object, required: true },
    selectedId: { type: Number, default: null },
    expandedIds: { type: Object, required: true },
    isRoot: { type: Boolean, default: true },
  },
  emits: ["select", "toggle"],
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0;
    },
    isSelected() {
      return this.selectedId === this.node.id;
    },
    expanded() {
      return this.expandedIds.has(this.node.id);
    },
  },
  methods: {
    toggleExpand() {
      if (this.hasChildren) this.$emit("toggle", this.node.id);
    },
    onSelect() {
      this.$emit("select", this.node.id);
    },
  },
};
</script>

<style scoped>
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
  white-space: nowrap;
  width: max-content;
  min-width: 100%;
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
  border-radius: 4px;
  transition: background 0.15s;
}
.toggle-area:hover {
  background: #e2e8f0;
}
.toggle-arrow {
  font-size: 9px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}
.toggle-arrow.open {
  transform: rotate(90deg);
}
.toggle-spacer {
  width: 9px;
}

.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
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
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.01em;
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
.child-count--active .child-count-icon {
  opacity: 0.9;
}

.child-tree {
  padding-left: 20px;
  margin: 0;
  position: relative;
}
.child-tree::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 12px;
  left: 10px;
  border-left: 1.5px solid #e2e8f0;
}
.tree-item:not(.is-root)::before {
  content: "";
  position: absolute;
  top: 16px;
  left: -10px;
  width: 10px;
  border-top: 1.5px solid #e2e8f0;
}

.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
