<template>
  <div class="app-layout" :class="{ 'is-mobile': isMobile }">
    <MobileCategorySelector
      v-if="isMobile"
      :selected-id="selectedCategoryId"
      :tree="categoryTree"
      @select="selectCategory"
      @reset="selectedCategoryId = null"
    />

    <CategorySidebar
      v-if="!isMobile"
      :tree="categoryTree"
      :selected-id="selectedCategoryId"
      :width="sidebarWidth"
      :all-expanded="allExpanded"
      :drag-enabled="dragConfig.enabled"
      @select="selectCategory"
      @add-root="openAddRootModal"
      @add-child="openAddChildModal"
      @edit-cat="openEditCatModal"
      @delete-cat="deleteCategory"
      @toggle-all="toggleAll"
      @toggle-drag="toggleDragEnabled"
      @save="saveTree"
    />

    <div v-if="!isMobile" class="resize-handle" @mousedown="startResize">
      <div class="resize-handle-bar">
        <i class="fa-solid fa-grip-lines-vertical"></i>
      </div>
    </div>

    <CategoryFormModal
      :open="catModal.open"
      :edit-mode="catModal.editMode"
      :has-parent="!!catModal.parent"
      :parent-name="catModal.parentName"
      :initial-name="catModal.initialName"
      @close="closeCatModal"
      @submit="submitCatModal"
    />

    <CategoryMaterialPanel
      :selected-id="selectedCategoryId"
      :selected-name="selectedCategoryName"
      :category-path="categoryPath"
      @select="selectCategory"
    />
  </div>
</template>

<script>
import CategorySidebar from "./components/CategorySidebar.vue";
import MobileCategorySelector from "./components/MobileCategorySelector.vue";
import CategoryFormModal from "./components/CategoryFormModal.vue";
import CategoryMaterialPanel from "./components/CategoryMaterialPanel.vue";
import api from "@/api/api";
import {
  findPath,
  findParentNode,
  setAllOpen,
  initOpenState,
  buildSavePayload,
  removeNode,
  moveNode,
} from "@/utils/categoryTree";

const MAX_DEPTH = 10;
const MOBILE_BREAKPOINT = 1024;
const SIDEBAR_MIN = 280;
const SIDEBAR_MAX = 700;

export default {
  name: "MaterialCategoryPage",
  components: {
    CategorySidebar,
    MobileCategorySelector,
    CategoryFormModal,
    CategoryMaterialPanel,
  },
  provide() {
    return {
      dragState: this.dragState,
      moveCategory: this.moveCategory,
      dragConfig: this.dragConfig,
    };
  },
  data() {
    return {
      categoryTree: [],
      selectedCategoryId: null,
      isMobile: false,
      allExpanded: true,
      sidebarWidth: 420,
      dragState: {
        draggingItem: null,
        dropTarget: null,
        dropPosition: null,
      },
      dragConfig: { enabled: false },
      catModal: {
        open: false,
        editMode: false,
        parent: null,
        target: null,
        parentName: "",
        initialName: "",
      },
    };
  },
  computed: {
    categoryPath() {
      return findPath(this.categoryTree, this.selectedCategoryId) || [];
    },
    selectedCategoryName() {
      const path = this.categoryPath;
      return path.length > 0 ? path[path.length - 1].name : "";
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    this.loadCategoryTree();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    },
    selectCategory(id) {
      this.selectedCategoryId = id;
    },
    toggleAll() {
      this.allExpanded = !this.allExpanded;
      setAllOpen(this.categoryTree, this.allExpanded);
    },
    toggleDragEnabled() {
      this.dragConfig.enabled = !this.dragConfig.enabled;
      this.dragState.draggingItem = null;
      this.dragState.dropTarget = null;
      this.dragState.dropPosition = null;
    },
    startResize(e) {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = this.sidebarWidth;
      const onMove = (ev) => {
        const w = startWidth + (ev.clientX - startX);
        this.sidebarWidth = Math.max(SIDEBAR_MIN, Math.min(w, SIDEBAR_MAX));
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

    // 카테고리 모달
    openAddRootModal() {
      this.catModal = {
        open: true,
        editMode: false,
        parent: null,
        target: null,
        parentName: "",
        initialName: "",
      };
    },
    openAddChildModal(parent) {
      if (parent.depth >= MAX_DEPTH) {
        alert(`최대 ${MAX_DEPTH}단계까지만 등록할 수 있습니다.`);
        return;
      }
      this.selectedCategoryId = parent.id;
      this.catModal = {
        open: true,
        editMode: false,
        parent,
        target: null,
        parentName: this.getPathNames(parent.id),
        initialName: "",
      };
    },
    openEditCatModal(item) {
      this.selectedCategoryId = item.id;
      const parentNode = findParentNode(this.categoryTree, item.id);
      this.catModal = {
        open: true,
        editMode: true,
        parent: null,
        target: item,
        parentName: parentNode ? this.getPathNames(parentNode.id) : "",
        initialName: item.name,
      };
    },
    closeCatModal() {
      this.catModal.open = false;
    },
    submitCatModal(name) {
      const { editMode, parent, target } = this.catModal;

      if (editMode) {
        target.name = name;
        this.selectedCategoryId = target.id;
      } else if (parent) {
        const tempId = Date.now();
        if (!parent.children) parent.children = [];
        parent.children.push(this.makeNewNode(tempId, name, parent));
        parent.isOpen = true;
        this.selectedCategoryId = tempId;
      } else {
        const tempId = Date.now();
        this.categoryTree.push(this.makeNewNode(tempId, name, null));
        this.selectedCategoryId = tempId;
      }

      this.closeCatModal();
    },
    makeNewNode(id, name, parent) {
      return {
        id,
        name,
        code: `CAT-${id}`,
        sort: parent ? parent.children.length : this.categoryTree.length,
        parentId: parent ? parent.id : null,
        path: "",
        depth: parent ? parent.depth + 1 : 1,
        isNew: true,
        isOpen: true,
        children: [],
      };
    },
    getPathNames(id) {
      const path = findPath(this.categoryTree, id) || [];
      return path.map((n) => n.name).join(" > ");
    },

    async deleteCategory(id) {
      const ok = await this.$confirm(
        "선택된 자재를 삭제하시겠습니까?",
        "삭제 확인",
      );
      if (!ok) return;
      removeNode(this.categoryTree, id);
      if (this.selectedCategoryId === id) this.selectedCategoryId = null;
    },

    async loadCategoryTree() {
      const res = await api.post("/api/category/getCategoryTree");
      initOpenState(res.data);
      this.categoryTree = res.data;
    },

    async saveTree() {
      try {
        const payload = buildSavePayload(this.categoryTree);
        await api.post("/api/category/save", payload);
        this.$toast.success("카테고리가 저장처리 되었습니다");
        await this.loadCategoryTree();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    moveCategory(sourceId, targetId, position) {
      moveNode(this.categoryTree, sourceId, targetId, position);
    },
  },
};
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family: "Inter", -apple-system, sans-serif;
  overflow: hidden;
}

.resize-handle {
  width: 12px;
  position: relative;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  transition: background 0.15s;
  flex-shrink: 0;
  z-index: 10;
}
.resize-handle:hover,
.resize-handle:active {
  background: #dbeafe;
  border-color: #93c5fd;
}
.resize-handle-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  color: #94a3b8;
  font-size: 10px;
  transition: color 0.15s;
}
.resize-handle:hover .resize-handle-bar,
.resize-handle:active .resize-handle-bar {
  color: #3b82f6;
}

@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
    overflow-y: auto;
  }
}
</style>
