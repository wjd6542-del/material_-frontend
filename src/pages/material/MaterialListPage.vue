<template>
  <div class="p-4 lg:p-6">
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">품목 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('material.create')"
          @click="openModal"
          class="btn btn-primary shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('material.create')"
          @click="batchDelete"
          class="btn btn-danger flex items-center gap-1 shrink-0"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[280px] sm:max-w-[450px]"
        >
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[350px]"
        >
          <CategoryTreeSelect
            v-model="where.category_id"
            placeholder="카테고리 검색"
            show-material-count
            @change="loadList"
          />
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[350px]"
        >
          <MultiCheck
            v-model="where.tag_ids"
            :items="tags"
            idKey="id"
            textKey="name"
            :search-keys="['code']"
            sub-text-key="code"
            placeholder="태그 검색"
            search-placeholder="태그명/코드 검색..."
            @change="loadList"
          />
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[350px]"
        >
          <BaseInput
            v-model="where.keyword"
            placeholder="품목명 / 메모 검색"
            @change="loadList"
          />
        </div>
      </div>

      <div class="p-4">
        <BaseTable
          ref="materialTable"
          :columns="columns"
          :rows="rows"
          sortable
          selectable
          pagination
          :pageSize="10"
          :pageSizeOptions="[10, 20, 50, 100]"
          @cell-click="onCellClick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import { useModalStore } from "@/stores/modal";
import MaterialModal from "@/components/material/MaterialModal.vue";
import MaterialPriceHistoryModal from "@/components/material/MaterialPriceHistoryModal.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import MultiCheck from "@/components/base/MultiCheck.vue";
import CategoryTreeSelect from "@/components/base/CategoryTreeSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import ImageModal from "@/components/base/ImageModal.vue";
import { useAuthStore } from "@/stores/auth";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";

const API_URL = import.meta.env.VITE_API_URL;

export default {
  name: "MaterialListPage",

  components: {
    BaseTable,
    MaterialModal,
    CategoryTreeSelect,
    DateRangePicker,
    BaseInput,
    MultiCheck,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/material/list",
      deleteEndpoint: "/api/material/batchDelete",
      tableRef: "materialTable",
      initialWhere: { category_id: "", keyword: "", tag_ids: [] },
      initialDateRange: () => ({ start: null, end: null }),
      // 응답 row 의 첫 이미지를 절대 URL 로 정규화
      mapRow: (row) => {
        const images = (row.images || []).map((img) => ({
          ...img,
          file_url: API_URL + img.file_url,
        }));
        return { ...row, image: images[0]?.file_url || "" };
      },
    }),
    createRefDataMixin(["categories", "tags"]),
  ],

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      categorys: [],
      tags: [],
      columns: [
        { key: "price_history", label: "이력", type: "button", width: "90px", align: "center" },
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "image", label: "이미지", type: "img", width: "100px", align: "center", sortable: true },
        { key: "code", label: "코드", width: "200px", sortable: true },
        { key: "name", label: "품목명", minWidth: "200px" },
        { key: "category_name", label: "카테고리", type: "text", align: "center", width: "120px", sortable: true },
        { key: "spec", label: "규격", type: "text", align: "center", width: "120px", sortable: true },
        { key: "unit", label: "단위", type: "text", align: "center", width: "120px", sortable: true },
        { key: "safety_stock", label: "안전재고", type: "text", align: "right", width: "120px", sortable: true },
        { key: "memo", label: "메모", type: "text", width: "200px", sortable: true },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "230px", sortable: true },
      ],
    };
  },

  methods: {
    // 품목 등록 모달을 연다
    openModal() {
      this.modal.openModal(MaterialModal, { onSaved: this.loadList });
    },

    // 셀 클릭: 품목명/코드 → 상세 모달, 이미지 → 이미지 모달, 이력 → 가격 이력
    onCellClick(data) {
      if (data.key === "name" || data.key === "code") {
        if (!this.auth.hasPermission("material.update")) return;
        this.modal.openModal(MaterialModal, {
          id: data.row.id,
          onSaved: this.loadList,
        });
      } else if (data.key === "image") {
        if (!data.value) return;
        this.modal.openModal(ImageModal, { image: data.value });
      } else if (data.key === "price_history") {
        this.modal.openModal(
          MaterialPriceHistoryModal,
          {
            material_id: data.row.id,
            material_code: data.row.code,
            material_name: data.row.name,
          },
          "full",
        );
      }
    },

  },

  mounted() {
    this.loadRefData();
  },
};
</script>
