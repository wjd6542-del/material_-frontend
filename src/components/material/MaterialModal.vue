<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">
      자재 {{ isEdit ? "수정" : "등록" }}
    </h2>

    <div class="space-y-3">
      <div>
        <label class="text-sm text-gray-600">자재명</label>
        <input
          v-model="form.name"
          placeholder="자재명 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">카테고리</label>
        <CategoryTreeSelect
          v-model="form.category_id"
          @change="changeCode"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">자재코드</label>
        <input
          v-model="form.code"
          class="mt-1 w-full border rounded px-3 py-2"
          :disabled="isEdit"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">규격</label>
        <input
          v-model="form.spec"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">단위</label>
        <SearchSelect
          v-model="form.unit"
          :options="selects"
          labelKey="text"
          valueKey="value"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">안전재고</label>
        <input
          v-model="form.safety_stock"
          type="number"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">메모</label>
        <textarea
          v-model="form.memo"
          class="mt-1 w-full border rounded px-3 py-2"
        ></textarea>
      </div>

      <div>
        <label class="text-sm text-gray-600">이미지</label>
        <BaseImage :multiple="false" @change="handleFiles" />

        <div class="flex gap-2 flex-wrap mt-2">
          <div
            v-for="img in form.images"
            :key="img.id"
            class="relative w-24 h-24 border rounded overflow-hidden bg-gray-50"
          >
            <img
              :src="img.isNew ? img.preview : url + img.file_url"
              class="w-full h-full object-cover"
              @error="(e) => (e.target.src = '/img/no-image.png')"
            />

            <button
              @click="removeImage(img)"
              class="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <button
        class="px-3 py-1.5 border rounded hover:bg-gray-50"
        @click="modal.closeModal()"
      >
        취소
      </button>

      <button
        class="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="save"
      >
        {{ isEdit ? "수정하기" : "저장하기" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import BaseImage from "@/components/base/BaseImage.vue";
import CategoryTreeSelect from "@/components/base/CategoryTreeSelect.vue";
import api from "@/api/api";

export default {
  name: "MaterialModal",

  components: {
    BaseImage,
    CategoryTreeSelect,
  },

  props: {
    id: { type: Number, default: 0 },
    category_id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),

      selects: [
        { text: "갯수(EA)", value: "EA" },
        { text: "박스(BOX)", value: "BOX" },
        { text: "킬로(KG)", value: "KG" },
        { text: "미터(M)", value: "M" },
        { text: "톤(T)", value: "T" },
      ],

      form: {
        id: 0,
        name: "",
        code: "MAT-" + Date.now(),
        category_id: 0,
        spec: "",
        unit: "",
        safety_stock: 0,
        memo: "",
        is_active: true,
        images: [],
      },

      categorys: [],
      isEdit: false,
      editId: 0,

      deleteImageIds: [],
      newFiles: [],
      url: import.meta.env.VITE_API_URL,
    };
  },

  methods: {
    mappingData(data) {
      for (const key in this.form) {
        if (key === "images") continue; // 이미지는 별도 처리
        this.form[key] = data[key];
      }

      // 🔥 기존 서버 이미지 매핑
      this.form.images = (data.images || []).map((img) => ({
        id: img.id,
        file_url: img.file_url,
        isNew: false, // 서버에서 가져온 데이터임을 명시
      }));
    },

    async loadData() {
      const res = await api.post(`/api/material/${this.id}`, { id: this.id });
      this.mappingData(res.data);
    },

    async loadCategory() {
      const res = await api.post("/api/category/list");
      this.categorys = res.data;
    },

    changeCode() {
      if (this.isEdit) return;
      const category = this.categorys.find(
        (row) => row.id == this.form.category_id,
      );
      if (!category?.code) return;
      this.form.code = `${category.code.toUpperCase()}-${Date.now()}`;
    },

    /* =========================
     이미지 선택 (핵심 수정)
    ========================== */
    handleFiles(e) {
      if (!e?.target?.files || e.target.files.length === 0) return;

      const file = e.target.files[0];

      // 1장 정책: 기존에 새로 추가하려던 파일이 있었다면 메모리 해제
      this.form.images.forEach((img) => {
        if (img.isNew) URL.revokeObjectURL(img.preview);
      });

      // 프리뷰 리스트 초기화 (1장만 허용할 경우)
      // 만약 기존 서버 이미지는 유지하고 새로 선택한 것만 교체하고 싶다면 필터링 로직 조정 필요
      this.form.images = this.form.images.filter((img) => !img.isNew);

      const previewUrl = URL.createObjectURL(file);

      this.form.images.push({
        id: Date.now(),
        preview: previewUrl,
        isNew: true, // 신규 파일임을 명시
      });

      this.newFiles = [file];
      e.target.value = ""; // 동일 파일 재선택 가능하도록 초기화
    },

    removeImage(img) {
      if (!img.isNew) {
        this.deleteImageIds.push(img.id);
      } else {
        // 메모리 해제
        URL.revokeObjectURL(img.preview);
        this.newFiles = [];
      }
      this.form.images = this.form.images.filter((item) => item.id !== img.id);
    },

    async save() {
      try {
        const formData = new FormData();
        // 기본 필드 추가
        const fields = [
          "name",
          "code",
          "spec",
          "unit",
          "memo",
          "category_id",
          "is_active",
          "safety_stock",
        ];
        fields.forEach((field) => {
          formData.append(field, String(this.form[field]));
        });

        if (this.isEdit) {
          formData.append("id", String(this.editId));
          formData.append(
            "deleteImageIds",
            JSON.stringify(this.deleteImageIds),
          );
        }

        // 신규 파일 추가
        this.newFiles.forEach((file) => {
          formData.append("images", file);
        });

        const endpoint = this.isEdit
          ? "/api/material/update"
          : "/api/material/save";
        await api.post(endpoint, formData);

        this.$toast.success(this.isEdit ? "수정 완료" : "등록 완료");
        this.modal.closeModal();
        if (this.onSaved) this.onSaved();
      } catch (e) {
        this.$toast.error(e.response?.data?.message || e.message);
      }
    },
  },

  mounted() {
    this.loadCategory();
    if (this.id) {
      this.isEdit = true;
      this.editId = this.id;
      this.loadData();
    } else if (this.category_id) {
      this.form.category_id = this.category_id;
    }
  },

  // 컴포넌트 파괴 시 메모리 누수 방지
  beforeUnmount() {
    this.form.images.forEach((img) => {
      if (img.isNew && img.preview) URL.revokeObjectURL(img.preview);
    });
  },
};
</script>
