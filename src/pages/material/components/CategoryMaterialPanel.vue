<template>
  <main class="main-panel">
    <div v-if="selectedId" class="content-card">
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
                @click="$emit('select', node.id)"
                >{{ node.name }}</span
              >
              <i
                v-if="idx < categoryPath.length - 1"
                class="fa-solid fa-chevron-right breadcrumb-sep"
              ></i>
            </span>
          </div>
          <h1 class="current-cat-title">{{ selectedName }}</h1>
        </div>
        <button @click="openModal()" class="btn-add-main">
          <i class="fa-solid fa-plus mr-1.5"></i> 품목 등록
        </button>
      </div>

      <div class="table-wrap">
        <BaseTable
          :columns="columns"
          :rows="materials"
          sortable
          pagination
          :pageSize="10"
          :pageSizeOptions="[10, 20, 50, 100]"
          @cell-click="onCellClick"
        >
          <template #actions="{ row }">
            <div class="table-actions">
              <button @click="openModal(row.id)" class="tbl-btn edit">
                <i class="fa-solid fa-pencil"></i> 수정
              </button>
              <button @click="remove(row.id)" class="tbl-btn del">
                <i class="fa-solid fa-trash-can"></i> 삭제
              </button>
            </div>
          </template>
        </BaseTable>
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
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import MaterialModal from "@/components/material/MaterialModal.vue";
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";

const COLUMNS = [
  { key: "code", label: "코드", width: "180px", sortable: true },
  { key: "name", label: "품목명", minWidth: "180px", sortable: true },
  { key: "spec", label: "규격", align: "center", width: "120px", sortable: true },
  { key: "unit", label: "단위", align: "center", width: "100px", sortable: true },
  { key: "safety_stock", label: "안전재고", align: "right", width: "110px", sortable: true },
  { key: "memo", label: "메모", minWidth: "160px" },
  { key: "actions", label: "액션", align: "center", width: "150px" },
];

export default {
  name: "CategoryMaterialPanel",
  components: { BaseTable },
  props: {
    selectedId: { type: Number, default: null },
    selectedName: { type: String, default: "" },
    categoryPath: { type: Array, default: () => [] },
  },
  emits: ["select"],
  data() {
    return {
      modal: useModalStore(),
      materials: [],
      columns: COLUMNS,
    };
  },
  watch: {
    selectedId: {
      immediate: true,
      // 선택된 카테고리 변경 시 품목 목록을 재로드한다
      handler() {
        this.load();
      },
    },
  },
  methods: {
    // 선택된 카테고리의 품목 목록을 로드한다
    async load() {
      if (!this.selectedId) {
        this.materials = [];
        return;
      }
      try {
        const res = await api.post("/api/material/list", {
          category_id: this.selectedId,
        });
        this.materials = res.data || [];
      } catch {
        this.materials = [];
      }
    },
    // 품목명/코드 셀 클릭 시 상세 수정 모달을 연다
    onCellClick(data) {
      if (data.key === "name" || data.key === "code") {
        this.openModal(data.row.id);
      }
    },
    // 품목 등록/수정 모달을 연다 (id가 있으면 수정 모드)
    openModal(id) {
      const props = { onSaved: this.load };
      if (id) props.id = id;
      else props.category_id = this.selectedId;
      this.modal.openModal(MaterialModal, props);
    },
    // 지정 품목을 사용자 확인 후 서버에서 삭제한다
    async remove(id) {
      const ok = await this.$confirm(
        "선택된 품목을 삭제하시겠습니까?",
        "삭제 확인", "danger",
      );
      if (!ok) return;
      try {
        await api.post("/api/material/batchDelete", [{ id }]);
        this.$toast.success("삭제되었습니다");
        this.load();
      } catch (e) {
        this.$toast.error(e.response?.data?.message || e.message);
      }
    },
  },
};
</script>

<style scoped>
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

.table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
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

@media (max-width: 1024px) {
  .main-panel {
    padding: 16px;
  }
}
</style>
