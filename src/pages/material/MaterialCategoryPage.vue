<template>
  <div class="app-layout" :class="{ 'is-mobile': isMobile }">
    <!-- 모바일 헤더 -->
    <div v-if="isMobile" class="mobile-header">
      <div class="mobile-header-inner relative">
        <label class="mobile-search-label">
          <i class="fa-solid fa-layer-group"></i> 카테고리 선택
        </label>
        <div class="relative">
          <input
            type="text"
            v-model="mobileSearchTerm"
            @focus="isMobileDropdownOpen = true"
            placeholder="카테고리명을 입력하세요..."
            class="mobile-search-input"
          />
          <button
            v-if="selectedCategoryId || mobileSearchTerm"
            @click="resetMobileSelection"
            class="absolute right-10 top-3.5 text-slate-300 hover:text-red-400 transition-colors"
          >
            <i class="fa-solid fa-circle-xmark"></i>
          </button>
          <i
            class="fa-solid fa-chevron-down absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-xs"
          ></i>
        </div>
        <ul v-if="isMobileDropdownOpen" class="mobile-dropdown">
          <li
            v-for="cat in searchedMobileCategories"
            :key="cat.id"
            @click="selectMobileCategory(cat)"
            class="mobile-dropdown-item"
            :class="{ active: selectedCategoryId === cat.id }"
          >
            <span>{{ cat.prefix }}{{ cat.name }}</span>
            <i
              v-if="selectedCategoryId === cat.id"
              class="fa-solid fa-check text-xs"
            ></i>
          </li>
          <li
            v-if="searchedMobileCategories.length === 0"
            class="p-4 text-center text-slate-400 text-sm"
          >
            결과가 없습니다.
          </li>
        </ul>
        <div
          v-if="isMobileDropdownOpen"
          @click="isMobileDropdownOpen = false"
          class="fixed inset-0 z-[90]"
        ></div>
      </div>
    </div>

    <!-- 사이드바 -->
    <aside
      class="sidebar"
      v-if="!isMobile"
      :style="{ width: sidebarWidth + 'px' }"
    >
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
        <button @click="toggleAll" class="toolbar-btn">
          <i
            class="fa-solid"
            :class="allExpanded ? 'fa-compress' : 'fa-expand'"
          ></i>
          {{ allExpanded ? "전체 닫기" : "전체 열기" }}
        </button>
        <div class="toolbar-divider"></div>
        <button
          @click="toggleDragEnabled"
          class="toolbar-btn"
          :class="dragConfig.enabled ? 'drag-on' : 'drag-off'"
          :title="dragConfig.enabled ? '이동 모드 켜짐 (클릭하여 잠금)' : '이동 모드 꺼짐 (클릭하여 활성화)'"
        >
          <i
            class="fa-solid"
            :class="dragConfig.enabled ? 'fa-arrows-up-down-left-right' : 'fa-lock'"
          ></i>
          {{ dragConfig.enabled ? "이동 ON" : "이동 OFF" }}
        </button>
        <button @click="openAddRootModal" class="toolbar-btn accent">
          <i class="fa-solid fa-plus"></i> 추가
        </button>
        <button @click="saveTree" class="toolbar-btn save">
          <i class="fa-solid fa-floppy-disk"></i> 저장
        </button>
      </div>

      <div class="tree-scroll-area">
        <div v-if="categoryTree.length === 0" class="tree-empty">
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
          <button @click="openAddRootModal" class="tree-empty-btn">
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
            '<strong>{{ searchQuery }}</strong
            >' 에 대한<br />일치하는 카테고리가 없습니다.
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
            :selected-id="selectedCategoryId"
            :is-root="true"
            @select="selectCategory"
            @add-child="openAddChildModal"
            @edit-cat="openEditCatModal"
            @delete-cat="deleteCategory"
          />
        </ul>
      </div>
    </aside>

    <!-- 리사이즈 핸들 -->
    <div v-if="!isMobile" class="resize-handle" @mousedown="startResize">
      <div class="resize-handle-bar">
        <i class="fa-solid fa-grip-lines-vertical"></i>
      </div>
    </div>

    <!-- 카테고리 등록/수정 모달 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div
          v-if="catModalOpen"
          class="modal-overlay"
          @click.self="closeCatModal"
        >
          <div class="modal-container">
            <div class="modal-header">
              <div
                class="modal-header-icon"
                :class="catModalEditMode ? 'edit' : 'add'"
              >
                <i
                  class="fa-solid"
                  :class="
                    catModalEditMode ? 'fa-pen-to-square' : 'fa-folder-plus'
                  "
                ></i>
              </div>
              <div>
                <h3 class="modal-title">{{ catModalTitle }}</h3>
                <p v-if="catForm.parentName" class="modal-subtitle">
                  <i
                    class="fa-solid fa-turn-up fa-rotate-90 mr-1 text-slate-300"
                  ></i>
                  {{ catForm.parentName }}
                </p>
              </div>
              <button @click="closeCatModal" class="modal-close">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-form-group">
                <label>카테고리명 <span class="text-red-400">*</span></label>
                <input
                  v-model="catForm.name"
                  placeholder="예: 금속류"
                  ref="catNameInput"
                  @keyup.enter="saveCatModal"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button @click="closeCatModal" class="modal-btn cancel">
                취소
              </button>
              <button @click="saveCatModal" class="modal-btn confirm">
                <i class="fa-solid fa-check mr-1"></i>
                {{ catModalEditMode ? "수정" : "등록" }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 메인 패널 -->
    <main class="main-panel">
      <div v-if="selectedCategoryId" class="content-card">
        <div class="content-header">
          <div>
            <div class="breadcrumb-row">
              <i class="fa-solid fa-sitemap text-slate-300 mr-1.5"></i>
              <span
                v-for="(node, idx) in categoryPath"
                :key="node.id"
                class="breadcrumb-item"
              >
                <span
                  class="breadcrumb-link"
                  :class="{ current: idx === categoryPath.length - 1 }"
                  @click="selectCategory(node.id)"
                  >{{ node.name }}</span
                >
                <i
                  v-if="idx < categoryPath.length - 1"
                  class="fa-solid fa-chevron-right breadcrumb-sep"
                ></i>
              </span>
            </div>
            <h1 class="current-cat-title">{{ selectedCategoryName }}</h1>
          </div>
          <button @click="openMaterialModal()" class="btn-add-main">
            <i class="fa-solid fa-plus mr-1.5"></i> 자재 등록
          </button>
        </div>

        <div class="table-wrap">
          <table class="styled-table">
            <thead>
              <tr>
                <th>코드</th>
                <th>자재명</th>
                <th>규격</th>
                <th>단위</th>
                <th>안전재고</th>
                <th>메모</th>
                <th style="width: 130px" class="text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in currentMaterials" :key="m.id">
                <td>
                  <span class="code-cell">{{ m.code }}</span>
                </td>
                <td class="font-semibold text-slate-800">{{ m.name }}</td>
                <td class="text-slate-500">{{ m.spec }}</td>
                <td class="text-slate-500">{{ m.unit }}</td>
                <td class="text-slate-500 text-right">{{ m.safety_stock }}</td>
                <td class="text-slate-400 text-sm">{{ m.memo }}</td>
                <td>
                  <div class="table-actions">
                    <button
                      @click="openMaterialModal(m.id)"
                      class="tbl-btn edit"
                    >
                      <i class="fa-solid fa-pencil"></i> 수정
                    </button>
                    <button @click="removeMaterial(m.id)" class="tbl-btn del">
                      <i class="fa-solid fa-trash-can"></i> 삭제
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="currentMaterials.length === 0">
                <td colspan="7" class="table-empty">
                  <div class="table-empty-inner">
                    <i class="fa-solid fa-inbox"></i>
                    <p>등록된 자재가 없습니다</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-icon">
          <i class="fa-regular fa-folder-open"></i>
        </div>
        <h2>관리할 카테고리를 선택하세요</h2>
        <p>왼쪽 트리에서 분류를 선택하거나 모바일에서 검색하세요.</p>
      </div>
    </main>
  </div>
</template>

<script>
import CategoryItem from "./CategoryItem.vue";
import MaterialModal from "@/components/material/MaterialModal.vue";
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";

export default {
  name: "MaterialCategoryPage",
  components: { CategoryItem },
  provide() {
    return {
      dragState: this.dragState,
      moveCategory: this.moveCategory,
      dragConfig: this.dragConfig,
    };
  },
  data() {
    return {
      modal: useModalStore(),
      searchQuery: "",
      selectedCategoryId: null,
      isMobile: false,
      mobileSearchTerm: "",
      isMobileDropdownOpen: false,
      allExpanded: true,
      dragState: {
        draggingItem: null,
        dropTarget: null,
        dropPosition: null,
      },
      dragConfig: {
        enabled: false,
      },
      // 카테고리 모달
      catModalOpen: false,
      catModalEditMode: false,
      catModalParent: null,
      catModalTarget: null,
      catForm: {
        name: "",
        parentName: "",
      },
      // 카테고리 트리 (Prisma 모델 기반)
      categoryTree: [],
      currentMaterials: [],
      sidebarWidth: 420,
      isResizing: false,
    };
  },
  computed: {
    flatCategories() {
      const result = [];
      const traverse = (nodes, depth = 0) => {
        nodes.forEach((n) => {
          result.push({
            id: n.id,
            name: n.name,
            prefix: "\u3000".repeat(depth) + (depth > 0 ? "\u2514 " : ""),
          });
          if (n.children) traverse(n.children, depth + 1);
        });
      };
      traverse(this.categoryTree);
      return result;
    },
    searchedMobileCategories() {
      if (!this.mobileSearchTerm) return this.flatCategories;
      return this.flatCategories.filter((cat) =>
        cat.name.toLowerCase().includes(this.mobileSearchTerm.toLowerCase()),
      );
    },
    filteredTree() {
      if (!this.searchQuery) return this.categoryTree;
      const filter = (nodes) => {
        return nodes.reduce((acc, node) => {
          const match = node.name
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
          const children = node.children ? filter(node.children) : [];
          if (match || children.length > 0)
            acc.push({ ...node, children, isOpen: true });
          return acc;
        }, []);
      };
      return filter(this.categoryTree);
    },
    categoryPath() {
      const findPath = (nodes, id, path = []) => {
        for (const n of nodes) {
          if (n.id === id) return [...path, n];
          if (n.children) {
            const res = findPath(n.children, id, [...path, n]);
            if (res) return res;
          }
        }
        return null;
      };
      return findPath(this.categoryTree, this.selectedCategoryId) || [];
    },
    selectedCategoryName() {
      const path = this.categoryPath;
      return path.length > 0 ? path[path.length - 1].name : "";
    },
    categoryBreadcrumb() {
      return this.categoryPath.map((n) => n.name).join(" > ");
    },
    catModalTitle() {
      if (this.catModalEditMode) return "카테고리 수정";
      if (this.catModalParent) return "하위 카테고리 등록";
      return "루트 카테고리 등록";
    },
  },
  watch: {
    selectedCategoryId: {
      handler(newId) {
        if (!newId) {
          this.mobileSearchTerm = "";
          this.currentMaterials = [];
          return;
        }
        const found = this.flatCategories.find((c) => c.id === newId);
        if (found) this.mobileSearchTerm = found.name;
        this.loadMaterials();
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  methods: {
    toggleDragEnabled() {
      this.dragConfig.enabled = !this.dragConfig.enabled;
      this.dragState.draggingItem = null;
      this.dragState.dropTarget = null;
      this.dragState.dropPosition = null;
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 1024;
    },
    startResize(e) {
      e.preventDefault();
      this.isResizing = true;
      const startX = e.clientX;
      const startWidth = this.sidebarWidth;

      const onMouseMove = (e) => {
        const newWidth = startWidth + (e.clientX - startX);
        this.sidebarWidth = Math.max(280, Math.min(newWidth, 700));
      };
      const onMouseUp = () => {
        this.isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    toggleAll() {
      this.allExpanded = !this.allExpanded;
      const traverse = (nodes) =>
        nodes.forEach((n) => {
          n.isOpen = this.allExpanded;
          if (n.children) traverse(n.children);
        });
      traverse(this.categoryTree);
    },
    selectCategory(id) {
      this.selectedCategoryId = id;
    },
    // 카테고리 모달
    openAddRootModal() {
      this.catModalEditMode = false;
      this.catModalParent = null;
      this.catModalTarget = null;
      this.catForm = { name: "", parentName: "" };
      this.catModalOpen = true;
      this.$nextTick(() => this.$refs.catNameInput?.focus());
    },
    openAddChildModal(parent) {
      this.selectedCategoryId = parent.id;
      this.catModalEditMode = false;
      this.catModalParent = parent;
      this.catModalTarget = null;
      this.catForm = {
        name: "",
        parentName: this.getCategoryPathNames(parent.id),
      };
      if (parent.depth >= 10) {
        alert("최대 10단계까지만 등록할 수 있습니다.");
        return;
      }
      this.catModalOpen = true;
      this.$nextTick(() => this.$refs.catNameInput?.focus());
    },
    openEditCatModal(item) {
      this.selectedCategoryId = item.id;
      this.catModalEditMode = true;
      this.catModalParent = null;
      this.catModalTarget = item;
      const parentNode = this.findParentNode(this.categoryTree, item.id);
      this.catForm = {
        name: item.name,
        parentName: parentNode ? this.getCategoryPathNames(parentNode.id) : "",
      };
      this.catModalOpen = true;
      this.$nextTick(() => this.$refs.catNameInput?.focus());
    },
    closeCatModal() {
      this.catModalOpen = false;
      this.catModalEditMode = false;
      this.catModalParent = null;
      this.catModalTarget = null;
      this.catForm = { name: "", parentName: "" };
    },
    saveCatModal() {
      if (!this.catModalOpen) return;
      if (!this.catForm.name.trim()) {
        this.$toast.error("카테고리명을 입력하세요");
        return;
      }

      let selectId = null;

      if (this.catModalEditMode) {
        // 수정 — 이름만 변경, 코드는 유지
        this.catModalTarget.name = this.catForm.name.trim();
        selectId = this.catModalTarget.id;
      } else if (this.catModalParent) {
        // 하위 추가
        const parent = this.catModalParent;
        if (!parent.children) parent.children = [];
        const tempId = Date.now();
        parent.children.push({
          id: tempId,
          name: this.catForm.name.trim(),
          code: `CAT-${tempId}`,
          sort: parent.children.length,
          parentId: parent.id,
          path: "",
          depth: parent.depth + 1,
          isNew: true,
          isOpen: true,
          children: [],
        });
        parent.isOpen = true;
        selectId = tempId;
      } else {
        // 루트 추가
        const tempId = Date.now();
        this.categoryTree.push({
          id: tempId,
          name: this.catForm.name.trim(),
          code: `CAT-${tempId}`,
          sort: this.categoryTree.length,
          parentId: null,
          path: "",
          depth: 1,
          isNew: true,
          isOpen: true,
          children: [],
        });
        selectId = tempId;
      }

      this.selectedCategoryId = selectId;
      this.closeCatModal();
    },
    getCategoryPathNames(id) {
      const findPath = (nodes, targetId, path = []) => {
        for (const n of nodes) {
          if (n.id === targetId) return [...path, n];
          if (n.children) {
            const res = findPath(n.children, targetId, [...path, n]);
            if (res) return res;
          }
        }
        return null;
      };
      const path = findPath(this.categoryTree, id) || [];
      return path.map((n) => n.name).join(" > ");
    },
    findParentNode(nodes, childId) {
      for (const n of nodes) {
        if (n.children) {
          if (n.children.some((c) => c.id === childId)) return n;
          const found = this.findParentNode(n.children, childId);
          if (found) return found;
        }
      }
      return null;
    },

    // 삭제처리
    async deleteCategory(id) {
      const ok = await this.$confirm(
        "선택된 자재를 삭제하시겠습니까?",
        "삭제 확인",
      );
      if (!ok) return;

      const remove = (nodes) => {
        const i = nodes.findIndex((n) => n.id === id);
        if (i !== -1) return nodes.splice(i, 1);
        nodes.forEach((n) => n.children && remove(n.children));
      };
      remove(this.categoryTree);
      if (this.selectedCategoryId === id) {
        this.selectedCategoryId = null;
      }
    },

    // 트리 정보 로드
    async loadCategoryTree() {
      const res = await api.post("/api/category/getCategoryTree");
      const initOpen = (nodes, depth = 1) => {
        nodes.forEach((n) => {
          n.isOpen = depth <= 2;
          if (n.children) initOpen(n.children, depth + 1);
        });
      };
      initOpen(res.data);
      this.categoryTree = res.data;
    },

    // 트리 저장
    async saveTree() {
      const buildPayload = (nodes, parentId = null, depth = 1) => {
        return nodes.map((n, i) => {
          const item = {
            name: n.name,
            code: n.code || "",
            sort: i,
            parentId: parentId,
            depth: depth,
            isNew: !!n.isNew,
          };
          if (!n.isNew) {
            item.id = n.id;
          }
          item.children = n.children
            ? buildPayload(n.children, n.isNew ? null : n.id, depth + 1)
            : [];
          return item;
        });
      };

      let payload = buildPayload(this.categoryTree);

      console.log(payload);

      try {
        const res = await api.post("/api/category/save", payload);
        this.$toast.success("카테고리가 저장처리 되었습니다");
        await this.loadCategoryTree();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 드래그 앤 드롭
    findNodeAndParent(nodes, id) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id)
          return { node: nodes[i], parent: nodes, index: i };
        if (nodes[i].children) {
          const found = this.findNodeAndParent(nodes[i].children, id);
          if (found) return found;
        }
      }
      return null;
    },
    isDescendant(parent, childId) {
      if (parent.id === childId) return true;
      if (parent.children) {
        return parent.children.some((c) => this.isDescendant(c, childId));
      }
      return false;
    },
    moveCategory(sourceId, targetId, position) {
      if (sourceId === targetId) return;

      const sourceInfo = this.findNodeAndParent(this.categoryTree, sourceId);
      const targetInfo = this.findNodeAndParent(this.categoryTree, targetId);
      if (!sourceInfo || !targetInfo) return;

      if (this.isDescendant(sourceInfo.node, targetId)) return;

      const [moved] = sourceInfo.parent.splice(sourceInfo.index, 1);

      const targetInfoAfter = this.findNodeAndParent(
        this.categoryTree,
        targetId,
      );
      if (!targetInfoAfter) {
        this.categoryTree.push(moved);
        return;
      }

      if (position === "inside") {
        if (!targetInfoAfter.node.children) targetInfoAfter.node.children = [];
        targetInfoAfter.node.children.push(moved);
        targetInfoAfter.node.isOpen = true;
      } else if (position === "before") {
        targetInfoAfter.parent.splice(targetInfoAfter.index, 0, moved);
      } else {
        targetInfoAfter.parent.splice(targetInfoAfter.index + 1, 0, moved);
      }
    },
    // 모바일
    selectMobileCategory(cat) {
      this.selectedCategoryId = cat.id;
      this.mobileSearchTerm = cat.name;
      this.isMobileDropdownOpen = false;
    },
    resetMobileSelection() {
      this.selectedCategoryId = null;
      this.mobileSearchTerm = "";
      this.isMobileDropdownOpen = false;
    },
    // 자재 관리
    async loadMaterials() {
      if (!this.selectedCategoryId) {
        this.currentMaterials = [];
        return;
      }
      try {
        const res = await api.post("/api/material/list", {
          category_id: this.selectedCategoryId,
        });
        this.currentMaterials = res.data || [];
      } catch (e) {
        this.currentMaterials = [];
      }
    },
    openMaterialModal(id) {
      const props = {
        onSaved: this.loadMaterials,
      };
      if (id) props.id = id;
      else props.category_id = this.selectedCategoryId;
      this.modal.openModal(MaterialModal, props);
    },
    async removeMaterial(id) {
      const ok = await this.$confirm(
        "선택된 자재를 삭제하시겠습니까?",
        "삭제 확인",
      );
      if (!ok) return;
      try {
        await api.post("/api/material/batchDelete", [{ id }]);
        this.$toast.success("삭제되었습니다");
        this.loadMaterials();
      } catch (e) {
        this.$toast.error(e.response?.data?.message || e.message);
      }
    },
  },

  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);

    this.loadCategoryTree();
  },
};
</script>

<style scoped>
/* ===== 레이아웃 ===== */
.app-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  overflow: hidden;
}

/* ===== 사이드바 ===== */
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

/* ===== 리사이즈 핸들 ===== */
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

/* 툴바 */
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

/* 트리 영역 */
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

/* 트리 비어있을 때 */
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

/* ===== 검색 결과 없음 ===== */
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

/* ===== 메인 패널 ===== */
.main-panel {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
.content-card {
  background: white;
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

/* 브레드크럼 */
.breadcrumb-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.breadcrumb-link {
  font-size: 12.5px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.15s;
  font-weight: 500;
}
.breadcrumb-link:hover {
  color: #3b82f6;
}
.breadcrumb-link.current {
  color: #64748b;
  font-weight: 600;
}
.breadcrumb-sep {
  font-size: 8px;
  color: #cbd5e1;
  margin: 0 6px;
}

.current-cat-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.btn-add-main {
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(30, 41, 59, 0.2);
  white-space: nowrap;
}
.btn-add-main:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
}

/* 테이블 */
.table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
}
.styled-table thead tr {
  background: #f8fafc;
}
.styled-table th {
  text-align: left;
  padding: 12px 16px;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
}
.styled-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13.5px;
}
.styled-table tbody tr {
  transition: background 0.15s;
}
.styled-table tbody tr:hover {
  background: #fafbfc;
}
.styled-table tbody tr:last-child td {
  border-bottom: none;
}
.code-cell {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
}
.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}
.tbl-btn {
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}
.tbl-btn.edit {
  color: #3b82f6;
}
.tbl-btn.edit:hover {
  background: #eff6ff;
}
.tbl-btn.del {
  color: #ef4444;
}
.tbl-btn.del:hover {
  background: #fef2f2;
}
.table-empty {
  padding: 48px 16px !important;
}
.table-empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
}
.table-empty-inner i {
  font-size: 28px;
}
.table-empty-inner p {
  font-size: 13px;
  color: #94a3b8;
}

/* 빈 상태 */
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.empty-state-icon {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #cbd5e1;
  margin-bottom: 20px;
}
.empty-state h2 {
  font-size: 17px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}
.empty-state p {
  font-size: 13.5px;
  color: #94a3b8;
  line-height: 1.5;
}

/* ===== 모달 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-container {
  background: white;
  border-radius: 16px;
  width: 440px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.modal-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.modal-header-icon.add {
  background: #ecfdf5;
  color: #10b981;
}
.modal-header-icon.edit {
  background: #eff6ff;
  color: #3b82f6;
}
.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.modal-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
  margin-left: auto;
}
.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}
.modal-body {
  padding: 24px;
}
.modal-form-group {
  margin-bottom: 16px;
}
.modal-form-group:last-child {
  margin-bottom: 0;
}
.modal-form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.modal-form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.15s;
  background: #fafbfc;
}
.modal-form-group input:focus {
  border-color: #93c5fd;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}
.modal-btn {
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.modal-btn.confirm {
  background: #3b82f6;
  color: white;
}
.modal-btn.confirm:hover {
  background: #2563eb;
}
.modal-btn.cancel {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.modal-btn.cancel:hover {
  background: #f1f5f9;
}

/* ===== 모바일 ===== */
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
.mobile-search-input {
  width: 100%;
  padding: 11px 36px 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #f8fafc;
}
.mobile-search-input:focus {
  border-color: #93c5fd;
  background: white;
}
.mobile-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 280px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.mobile-dropdown-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.1s;
}
.mobile-dropdown-item:hover {
  background: #f8fafc;
}
.mobile-dropdown-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
    overflow-y: auto;
  }
  .mobile-header {
    display: block;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .sidebar {
    display: none;
  }
  .main-panel {
    padding: 16px;
  }
}

/* ===== 트랜지션 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-container {
  transform: scale(0.95) translateY(10px);
}
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}
</style>
