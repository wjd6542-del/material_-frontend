<template>
  <aside class="sidebar" :style="{ width: width + 'px' }">
    <div class="sidebar-header">
      <div class="sidebar-title">
        <div class="sidebar-title-icon">
          <i class="fa-solid fa-boxes-stacked"></i>
        </div>
        <div>
          <h2>자재 카테고리</h2>
          <p class="sidebar-subtitle">분류 체계 관리</p>
        </div>
      </div>
      <div class="search-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input v-model="searchQuery" placeholder="검색..." />
      </div>
    </div>

    <div class="tree-toolbar">
      <button @click="$emit('toggle-all')" class="toolbar-btn">
        <i
          class="fa-solid"
          :class="allExpanded ? 'fa-compress' : 'fa-expand'"
        ></i>
        {{ allExpanded ? "전체 닫기" : "전체 열기" }}
      </button>
      <div class="toolbar-divider"></div>
      <button
        @click="$emit('toggle-drag')"
        class="toolbar-btn"
        :class="dragEnabled ? 'drag-on' : 'drag-off'"
        :title="
          dragEnabled
            ? '이동 모드 켜짐 (클릭하여 잠금)'
            : '이동 모드 꺼짐 (클릭하여 활성화)'
        "
      >
        <i
          class="fa-solid"
          :class="dragEnabled ? 'fa-arrows-up-down-left-right' : 'fa-lock'"
        ></i>
        {{ dragEnabled ? "이동 ON" : "이동 OFF" }}
      </button>
      <button @click="$emit('add-root')" class="toolbar-btn accent">
        <i class="fa-solid fa-plus"></i> 추가
      </button>
      <button @click="$emit('save')" class="toolbar-btn save">
        <i class="fa-solid fa-floppy-disk"></i> 저장
      </button>
    </div>

    <div class="tree-scroll-area">
      <div v-if="tree.length === 0" class="tree-empty">
        <div class="tree-empty-visual">
          <div class="tree-empty-icon">
            <i class="fa-solid fa-folder-tree"></i>
          </div>
          <div class="tree-empty-decoration">
            <span></span><span></span><span></span>
          </div>
        </div>
        <p class="tree-empty-title">카테고리가 비어있습니다</p>
        <p class="tree-empty-desc">
          첫 번째 카테고리를 등록하여<br />자재 분류를 시작하세요.
        </p>
        <button @click="$emit('add-root')" class="tree-empty-btn">
          <i class="fa-solid fa-plus mr-1.5"></i> 첫 카테고리 만들기
        </button>
      </div>
      <div
        v-else-if="searchQuery && filteredTree.length === 0"
        class="tree-no-result"
      >
        <div class="tree-no-result-icon">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <p class="tree-no-result-title">검색 결과 없음</p>
        <p class="tree-no-result-desc">
          '<strong>{{ searchQuery }}</strong>' 에 대한<br />일치하는 카테고리가
          없습니다.
        </p>
        <button @click="searchQuery = ''" class="tree-no-result-btn">
          <i class="fa-solid fa-arrow-rotate-left mr-1"></i> 검색 초기화
        </button>
      </div>
      <ul v-else class="tree-root">
        <CategoryItem
          v-for="cat in filteredTree"
          :key="cat.id"
          :item="cat"
          :selected-id="selectedId"
          :is-root="true"
          @select="$emit('select', $event)"
          @add-child="$emit('add-child', $event)"
          @edit-cat="$emit('edit-cat', $event)"
          @delete-cat="$emit('delete-cat', $event)"
        />
      </ul>
    </div>
  </aside>
</template>

<script>
import CategoryItem from "../CategoryItem.vue";
import { filterTree } from "@/utils/categoryTree";

export default {
  name: "CategorySidebar",
  components: { CategoryItem },
  props: {
    tree: { type: Array, required: true },
    selectedId: { type: Number, default: null },
    width: { type: Number, default: 420 },
    allExpanded: { type: Boolean, default: true },
    dragEnabled: { type: Boolean, default: false },
  },
  emits: [
    "select",
    "add-root",
    "add-child",
    "edit-cat",
    "delete-cat",
    "toggle-all",
    "toggle-drag",
    "save",
  ],
  data() {
    return { searchQuery: "" };
  },
  computed: {
    // 검색어로 필터링된 카테고리 트리를 반환한다
    filteredTree() {
      if (!this.searchQuery) return this.tree;
      return filterTree(this.tree, this.searchQuery);
    },
  },
};
</script>

<style scoped>
.sidebar {
  min-width: 280px;
  max-width: 700px;
  background: #ffffff;
  border-right: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.sidebar-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.sidebar-title-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}
.sidebar-title h2 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.sidebar-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}
.search-wrapper {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: #cbd5e1;
  font-size: 13px;
}
.search-wrapper input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  background: #f8fafc;
  transition: all 0.15s;
}
.search-wrapper input:focus {
  border-color: #93c5fd;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.tree-toolbar {
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
}
.toolbar-btn {
  padding: 5px 10px;
  font-size: 11.5px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}
.toolbar-btn:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.toolbar-btn.accent {
  color: #3b82f6;
  font-weight: 600;
}
.toolbar-btn.accent:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.toolbar-btn.save {
  color: #10b981;
  font-weight: 600;
}
.toolbar-btn.save:hover {
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.toolbar-btn.drag-on {
  color: #f59e0b;
  background: #fffbeb;
  border-color: #fcd34d;
  font-weight: 600;
}
.toolbar-btn.drag-on:hover {
  background: #fef3c7;
  border-color: #f59e0b;
}
.toolbar-btn.drag-off {
  color: #94a3b8;
  font-weight: 500;
}
.toolbar-btn.drag-off:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.toolbar-divider {
  width: 1px;
  height: 16px;
  background: #e2e8f0;
  margin: 0 4px;
}

.tree-scroll-area {
  flex: 1;
  overflow: auto;
  padding: 12px 16px;
}
.tree-root {
  width: max-content;
  min-width: 100%;
  padding: 0;
}
:deep(.tree-root *) {
  white-space: nowrap !important;
}

.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px 20px;
}
.tree-empty-visual {
  position: relative;
  margin-bottom: 24px;
}
.tree-empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #3b82f6;
  position: relative;
  z-index: 1;
}
.tree-empty-decoration {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  gap: 3px;
}
.tree-empty-decoration span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #bfdbfe;
}
.tree-empty-decoration span:nth-child(2) {
  background: #93c5fd;
  width: 8px;
  height: 8px;
}
.tree-empty-decoration span:nth-child(3) {
  background: #dbeafe;
  width: 5px;
  height: 5px;
}
.tree-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}
.tree-empty-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 24px;
}
.tree-empty-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.tree-empty-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.tree-no-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px 20px;
  animation: fadeInUp 0.3s ease;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.tree-no-result-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #d97706;
  margin-bottom: 20px;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.15);
}
.tree-no-result-title {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}
.tree-no-result-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 20px;
}
.tree-no-result-desc strong {
  color: #d97706;
  font-weight: 600;
}
.tree-no-result-btn {
  padding: 8px 20px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tree-no-result-btn:hover {
  background: #f1f5f9;
  color: #334155;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
</style>
