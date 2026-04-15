<template>
  <li class="tree-item" :class="{ 'is-root': isRoot }">
    <div
      class="item-row group"
      :class="{
        active: isSelected,
        'is-new': item.isNew,
        'drop-before': isDropTarget && dropPos === 'before',
        'drop-after': isDropTarget && dropPos === 'after',
        'drop-inside': isDropTarget && dropPos === 'inside',
        'is-dragging': isDragging,
        'drag-ready': dragConfig.enabled,
      }"
      :draggable="dragConfig.enabled"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent.stop="onDrop"
      @dragend="onDragEnd"
      @click="$emit('select', item.id)"
    >
      <span class="toggle-area" @click.stop="toggle">
        <i
          v-if="item.children?.length > 0"
          class="fa-solid fa-chevron-right toggle-arrow"
          :class="{ open: item.isOpen }"
        ></i>
        <span v-else class="toggle-spacer"></span>
      </span>

      <span class="node-content">
        <span class="folder-icon-wrap">
          <i
            class="fa-solid"
            :class="[
              item.isOpen && item.children?.length > 0
                ? 'fa-folder-open'
                : 'fa-folder',
              isSelected ? 'text-blue-500' : 'text-amber-400',
            ]"
          ></i>
        </span>

        <span class="depth-badge">[{{ item.depth }}]</span>
        <span class="node-label">{{ item.name }}</span>
        <span v-if="item.isNew" class="new-badge">
          <i class="fa-solid fa-star new-badge-icon"></i>
          NEW
        </span>

        <span
          v-if="item.children?.length > 0"
          class="child-count"
          :class="{ 'child-count--active': isSelected }"
        >
          <i class="fa-solid fa-layer-group child-count-icon"></i>
          {{ item.children.length }}
        </span>
      </span>

      <div class="action-btns">
        <button
          @click.stop="$emit('edit-cat', item)"
          class="action-btn edit"
          title="수정"
        >
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button
          @click.stop="$emit('add-child', item)"
          class="action-btn add"
          title="하위 추가"
        >
          <i class="fa-solid fa-circle-plus"></i>
        </button>
        <button
          @click.stop="$emit('delete-cat', item.id)"
          class="action-btn del"
          title="삭제"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>

    <transition name="tree-expand">
      <ul
        v-if="item.children?.length > 0"
        v-show="item.isOpen"
        class="child-tree"
      >
        <CategoryItem
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :selected-id="selectedId"
          :is-root="false"
          @select="$emit('select', $event)"
          @add-child="$emit('add-child', $event)"
          @edit-cat="$emit('edit-cat', $event)"
          @delete-cat="$emit('delete-cat', $event)"
        />
      </ul>
    </transition>
  </li>
</template>

<script>
export default {
  name: "CategoryItem",
  inject: ["dragState", "moveCategory", "dragConfig"],
  props: {
    item: { type: Object, required: true },
    selectedId: { type: Number, default: null },
    isRoot: { type: Boolean, default: false },
  },
  emits: ["select", "add-child", "edit-cat", "delete-cat"],
  data() {
    return {
      dropPos: null,
    };
  },
  computed: {
    isSelected() {
      return this.selectedId === this.item.id;
    },
    isDragging() {
      return this.dragState.draggingItem?.id === this.item.id;
    },
    isDropTarget() {
      return (
        this.dragState.dropTarget?.id === this.item.id &&
        this.dragState.draggingItem?.id !== this.item.id
      );
    },
  },
  methods: {
    toggle() {
      if (this.item.children?.length > 0)
        this.item.isOpen = !this.item.isOpen;
    },
    onDragStart(e) {
      if (!this.dragConfig.enabled) {
        e.preventDefault();
        return;
      }
      this.dragState.draggingItem = this.item;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(this.item.id));
    },
    onDragOver(e) {
      if (!this.dragConfig.enabled) return;
      if (
        !this.dragState.draggingItem ||
        this.dragState.draggingItem.id === this.item.id
      )
        return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const h = rect.height;

      if (y < h * 0.25) {
        this.dropPos = "before";
      } else if (y > h * 0.75) {
        this.dropPos = "after";
      } else {
        this.dropPos = "inside";
      }

      this.dragState.dropTarget = this.item;
      this.dragState.dropPosition = this.dropPos;
    },
    onDragLeave() {
      if (this.dragState.dropTarget?.id === this.item.id) {
        this.dragState.dropTarget = null;
        this.dragState.dropPosition = null;
      }
      this.dropPos = null;
    },
    onDrop() {
      if (!this.dragConfig.enabled) return;
      if (
        !this.dragState.draggingItem ||
        this.dragState.draggingItem.id === this.item.id
      )
        return;

      this.moveCategory(
        this.dragState.draggingItem.id,
        this.item.id,
        this.dropPos,
      );

      this.dragState.draggingItem = null;
      this.dragState.dropTarget = null;
      this.dragState.dropPosition = null;
      this.dropPos = null;
    },
    onDragEnd() {
      this.dragState.draggingItem = null;
      this.dragState.dropTarget = null;
      this.dragState.dropPosition = null;
      this.dropPos = null;
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

/* 신규 추가 항목 */
.item-row.is-new {
  background: linear-gradient(135deg, #fef9c3, #fef3c7);
  box-shadow: inset 0 0 0 1.5px #fde68a;
}
.item-row.is-new:hover {
  background: linear-gradient(135deg, #fef08a, #fde68a);
}
.item-row.is-new.active {
  background: linear-gradient(135deg, #fef3c7, #e0f2fe);
  box-shadow: inset 0 0 0 1.5px #fbbf24;
}
.new-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #ffffff;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  padding: 2px 7px;
  border-radius: 999px;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.4);
  animation: new-pulse 1.8s ease-in-out infinite;
}
.new-badge-icon {
  font-size: 8px;
}
@keyframes new-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 1px 3px rgba(245, 158, 11, 0.4);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.6);
  }
}

/* 토글 화살표 */
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

/* 노드 내용 */
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

/* 액션 버튼 */
.action-btns {
  display: none;
  margin-left: auto;
  padding-left: 12px;
  gap: 2px;
}
.item-row:hover .action-btns {
  display: flex;
}
.action-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  color: #94a3b8;
  transition: all 0.15s;
}
.action-btn.edit:hover {
  background: #eff6ff;
  color: #3b82f6;
}
.action-btn.add:hover {
  background: #f0fdf4;
  color: #22c55e;
}
.action-btn.del:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* 트리 가이드라인 */
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
.tree-item {
  position: relative;
}
.tree-item:not(.is-root)::before {
  content: "";
  position: absolute;
  top: 16px;
  left: -10px;
  width: 10px;
  border-top: 1.5px solid #e2e8f0;
}

/* 드래그 앤 드롭 */
.item-row.drag-ready {
  cursor: grab;
}
.item-row.drag-ready:active {
  cursor: grabbing;
}
.is-dragging {
  opacity: 0.35;
}
.drop-before {
  box-shadow: inset 0 2px 0 0 #3b82f6 !important;
}
.drop-after {
  box-shadow: inset 0 -2px 0 0 #3b82f6 !important;
}
.drop-inside {
  background: #dbeafe !important;
  box-shadow: inset 0 0 0 1.5px #93c5fd !important;
}

/* 펼침 트랜지션 */
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
