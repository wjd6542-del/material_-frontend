<template>
  <div class="p-4 lg:p-6">
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">자재 목록</h2>
      </div>

      <div class="p-4 pb-0 flex items-center gap-1">
        <button
          v-if="auth.hasPermission('material.create')"
          @click="openModal"
          class="h-[40px] px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('material.create')"
          @click="batchDelete"
          class="h-[40px] px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 flex items-center gap-1"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
        <div class="w-[450px]">
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />
        </div>
        <div class="w-[350px]">
          <SearchSelect
            v-model="where.category_id"
            :options="categorys"
            labelKey="name"
            valueKey="id"
            placeholder="카테고리 검색"
            @change="loadList"
          />
        </div>
        <div class="w-[350px]">
          <BaseInput
            v-model="where.keyword"
            placeholder="자재명 / 메모 검색"
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

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import { useModalStore } from "@/stores/modal";
import MaterialModal from "@/components/material/MaterialModal.vue";
import BaseInput from "@/components/base/BaseInput.vue";

import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import ImageModal from "@/components/base/ImageModal.vue";
import { useAuthStore } from "@/stores/auth";

import api from "@/api/api";

export default {
  name: "MaterialListPage",

  components: {
    BaseTable,
    MaterialModal,
    SearchSelect,
    DateRangePicker,
    BaseInput,
  },

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      columns: [
        {
          key: "qrcode",
          label: "QR",
          type: "img",
          width: "80px",
          align: "center",
          sortable: true,
        },
        {
          key: "image",
          label: "이미지",
          type: "img",
          width: "100px",
          align: "center",
          sortable: true,
        },
        {
          key: "code",
          label: "코드",
          width: "200px",
          sortable: true,
        },
        {
          key: "name",
          label: "자재명",
          minWidth: "200px",
        },

        {
          key: "category_name",
          label: "카테고리",
          type: "text",
          align: "center",
          width: "120px",
          sortable: true,
        },
        {
          key: "spec",
          label: "규격",
          type: "text",
          align: "center",
          width: "120px",
          sortable: true,
        },
        {
          key: "unit",
          label: "단위",
          type: "text",
          align: "center",
          width: "120px",
          sortable: true,
        },
        {
          key: "safety_stock",
          label: "안전재고",
          type: "text",
          align: "right",
          width: "120px",
          sortable: true,
        },
        {
          key: "memo",
          label: "메모",
          type: "text",
          width: "200px",
          sortable: true,
        },
        {
          key: "created_at",
          label: "등록일",
          type: "date",
          align: "center",
          width: "230px",
          sortable: true,
        },
      ],

      rows: [],

      categorys: [],

      dateRange: { start: null, end: null },
      where: {
        category_id: "",
        keyword: "",
      },

      url: import.meta.env.VITE_API_URL,
    };
  },

  methods: {
    // 삭제
    async batchDelete() {
      const rows = this.$refs.materialTable.getSelectedRows();
      if (!rows.length) {
        this.$toast.error("테이블에서 데이터를 선택하세요");
        return;
      }

      let ids = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        ids.push({ id: row.id });
      }

      const ok = await this.$confirm(
        `선택된 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      try {
        await api.post("/api/material/batchDelete", ids);
        this.$toast.success("선택 자재가 삭제되었습니다");
        this.loadList();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 추가 처리
    openModal() {
      this.modal.openModal(MaterialModal, { onSaved: this.loadList });
    },

    // 데이터 로드 처리
    async loadList() {
      this.rows = [];
      const where = {
        ...this.where,
      };

      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }
      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }
      const res = await api.post("/api/material/list", where);

      const list = res.data.map((row) => {
        const images = (row.images || []).map((img) => ({
          ...img,
          file_url: this.url + img.file_url,
        }));

        return {
          ...row,
          image: images[0]?.file_url || "",
        };
      });

      this.rows = list;
    },

    // 셀클릭시
    onCellClick(data) {
      // 자재명 클릭시 모달 상세 오픈
      if (data.key == "name" || data.key == "code") {
        if (!this.auth.hasPermission("material.update")) {
          return;
        }

        this.modal.openModal(MaterialModal, {
          id: data.row.id,
          onSaved: this.loadList,
        });
      } else if (data.key == "image") {
        if (!data.value) {
          return;
        }
        console.log(data.image);
        this.modal.openModal(ImageModal, { image: data.value });
      }
    },

    async loadCategory() {
      const res = await api.post("/api/category/list");
      this.categorys = res.data;
    },
  },
  mounted() {
    this.loadCategory();
    this.loadList();
  },
};
</script>
