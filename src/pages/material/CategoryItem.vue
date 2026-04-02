<template>
  <li class="tree-item" :class="{ 'is-root': isRoot }">
    <div
      class="item-row group"
      :class="{
        active: isSelected,
        'drop-before': isDropTarget && dropPos === 'before',
        'drop-after': isDropTarget && dropPos === 'after',
        'drop-inside': isDropTarget && dropPos === 'inside',
        'is-dragging': isDragging,
      }"
      draggable="true"
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

        <span class="node-label">{{ item.name }}</span>

        <span
          v-if="item.children?.length > 0"
          class="child-count"
        >
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
  inject: ["dragState", "moveCategory"],
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
      this.dragState.draggingItem = this.item;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(this.item.id));
    },
    onDragOver(e) {
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

/* 토글 화살표 */
.toggle-area {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
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
  width: 12px;
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
.node-label {
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.01em;
}
.child-count {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  color: #ffffff;
  border-radius: 9px;
  font-weight: 600;
  flex-shrink: 0;
  padding: 0 5px;
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
