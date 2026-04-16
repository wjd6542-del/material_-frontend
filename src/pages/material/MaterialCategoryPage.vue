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
  // 하위 컴포넌트에 드래그 상태/설정과 이동 함수를 주입한다
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
    // 선택된 카테고리의 루트→노드 경로 배열을 반환한다
    categoryPath() {
      return findPath(this.categoryTree, this.selectedCategoryId) || [];
    },
    // 선택된 카테고리의 이름을 반환한다
    selectedCategoryName() {
      const path = this.categoryPath;
      return path.length > 0 ? path[path.length - 1].name : "";
    },
  },
  // 마운트 시 모바일 여부 판별 및 리스너 등록, 트리 로드
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    this.loadCategoryTree();
  },
  // 언마운트 직전 리사이즈 리스너를 제거한다
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  methods: {
    // 윈도우 너비 기준으로 모바일 모드 여부를 설정한다
    checkMobile() {
      this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    },
    // 특정 카테고리 id를 선택 상태로 설정한다
    selectCategory(id) {
      this.selectedCategoryId = id;
    },
    // 전체 트리의 펼침/접힘을 토글한다
    toggleAll() {
      this.allExpanded = !this.allExpanded;
      setAllOpen(this.categoryTree, this.allExpanded);
    },
    // 드래그 기능 활성화를 토글하고 드래그 상태를 초기화한다
    toggleDragEnabled() {
      this.dragConfig.enabled = !this.dragConfig.enabled;
      this.dragState.draggingItem = null;
      this.dragState.dropTarget = null;
      this.dragState.dropPosition = null;
    },
    // 사이드바 너비 조정을 위한 드래그 리사이즈를 시작한다
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
    // 루트 카테고리 추가 모달을 연다
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
    // 하위 카테고리 추가 모달을 연다 (최대 depth 체크)
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
    // 카테고리 수정 모달을 연다
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
    // 카테고리 모달을 닫는다
    closeCatModal() {
      this.catModal.open = false;
    },
    // 모달에서 입력된 이름으로 카테고리 추가/수정을 로컬 트리에 반영한다
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
    // 신규 카테고리 노드 객체를 구성한다
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
    // 해당 id의 루트→노드 이름 경로를 "A > B > C" 형식으로 반환한다
    getPathNames(id) {
      const path = findPath(this.categoryTree, id) || [];
      return path.map((n) => n.name).join(" > ");
    },

    // 사용자 확인 후 카테고리를 로컬 트리에서 제거한다
    async deleteCategory(id) {
      const ok = await this.$confirm(
        "선택된 자재를 삭제하시겠습니까?",
        "삭제 확인",
      );
      if (!ok) return;
      removeNode(this.categoryTree, id);
      if (this.selectedCategoryId === id) this.selectedCategoryId = null;
    },

    // 카테고리 트리를 서버에서 로드하고 펼침 상태를 초기화한다
    async loadCategoryTree() {
      const res = await api.post("/api/category/getCategoryTree");
      initOpenState(res.data);
      this.categoryTree = res.data;
    },

    // 변경된 트리를 서버에 저장하고 재조회한다
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

    // 드래그 결과를 받아 트리 내에서 카테고리를 이동시킨다
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
