<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">자재</h2>

    <div class="space-y-3">
      <!-- 자재명 -->
      <div>
        <label class="text-sm text-gray-600">자재명</label>
        <input
          v-model="form.name"
          placeholder="자재명 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <!-- 카테고리 -->
      <div>
        <label class="text-sm text-gray-600">카테고리</label>
        <SearchSelect
          v-model="form.category_id"
          :options="categorys"
          labelKey="name"
          valueKey="id"
          @change="changeCode"
        />
      </div>

      <!-- 코드 -->
      <div>
        <label class="text-sm text-gray-600">자재코드</label>
        <input
          v-model="form.code"
          class="mt-1 w-full border rounded px-3 py-2"
          :disabled="isEdit"
        />
      </div>

      <!-- 규격 -->
      <div>
        <label class="text-sm text-gray-600">규격</label>
        <input
          v-model="form.spec"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <!-- 단위 -->
      <div>
        <label class="text-sm text-gray-600">단위</label>
        <SearchSelect
          v-model="form.unit"
          :options="selects"
          labelKey="text"
          valueKey="value"
        />
      </div>

      <!-- 안전재고 -->
      <div>
        <label class="text-sm text-gray-600">안전재고</label>
        <input
          v-model="form.safety_stock"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <!-- 메모 -->
      <div>
        <label class="text-sm text-gray-600">메모</label>
        <textarea
          v-model="form.memo"
          class="mt-1 w-full border rounded px-3 py-2"
        ></textarea>
      </div>

      <!-- 이미지 업로드 -->
      <div>
        <label class="text-sm text-gray-600">이미지</label>
        <BaseImage :multiple="false" @change="handleFiles" />

        <!-- 🔥 이미지 프리뷰 -->
        <div class="flex gap-2 flex-wrap mt-2">
          <div
            v-for="img in form.images"
            :key="img.id"
            class="relative w-24 h-24 border rounded overflow-hidden"
          >
            <img :src="url + img.file_url" class="w-full h-full object-cover" />

            <!-- 삭제 -->
            <button
              @click="removeImage(img)"
              class="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="flex justify-end gap-2 mt-6">
      <button class="px-3 py-1.5 border rounded" @click="modal.closeModal()">
        취소
      </button>

      <button class="px-3 py-1.5 bg-blue-600 text-white rounded" @click="save">
        저장
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import BaseImage from "@/components/base/BaseImage.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";

export default {
  name: "MaterialModal",

  components: {
    BaseImage,
    SearchSelect,
  },

  props: {
    id: { type: Number, default: 0 },
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
    /* =========================
     데이터 매핑
    ========================== */
    mappingData(data) {
      for (const key in this.form) {
        this.form[key] = data[key];
      }

      // 🔥 이미지 매핑
      this.form.images = (data.images || []).map((img) => ({
        id: img.id,
        file_url: img.file_url,
        isNew: false,
      }));
    },

    async loadData() {
      const res = await api.post(`/api/material/${this.id}`, {
        id: this.id,
      });
      this.mappingData(res.data);
    },

    async loadCategory() {
      const res = await api.post("/api/category/list");
      this.categorys = res.data;
    },

    /* =========================
     코드 자동 생성
    ========================== */
    changeCode() {
      // 수정 상태이면 자동 코드생성 비활성
      if (this.isEdit) {
        return;
      }

      const category = this.categorys.find(
        (row) => row.id == this.form.category_id,
      );

      if (!category?.code) return;

      this.form.code = `${category.code.toUpperCase()}-${Date.now()}`;
    },

    /* =========================
     이미지 선택
    ========================== */
    handleFiles(e) {
      if (!e?.target?.files) return;

      const file = e.target.files[0];

      // 1장 정책
      this.form.images = [];
      this.newFiles = [file];

      const preview = URL.createObjectURL(file);

      this.form.images.push({
        id: Date.now(),
        preview,
        isNew: true,
      });

      e.target.value = "";
    },

    /* =========================
     이미지 삭제
    ========================== */
    removeImage(img) {
      // 기존 이미지
      if (!img.isNew) {
        this.deleteImageIds.push(img.id);
      }

      // 신규 이미지
      if (img.isNew) {
        this.newFiles = [];
      }

      this.form.images = this.form.images.filter((item) => item.id !== img.id);
    },

    /* =========================
     저장
    ========================== */
    async save() {
      try {
        const formData = new FormData();

        formData.append("name", this.form.name);
        formData.append("code", this.form.code);
        formData.append("spec", this.form.spec);
        formData.append("unit", this.form.unit);
        formData.append("memo", this.form.memo);
        formData.append("category_id", String(this.form.category_id));
        formData.append("is_active", String(this.form.is_active));
        formData.append("safety_stock", String(this.form.safety_stock));

        if (this.isEdit && this.editId) {
          formData.append("id", String(this.editId));
          formData.append(
            "deleteImageIds",
            JSON.stringify(this.deleteImageIds),
          );
        }

        this.newFiles.forEach((file) => {
          formData.append("images", file);
        });

        if (this.isEdit) {
          await api.post("/api/material/update", formData);
          this.$toast.success("수정 완료");
        } else {
          await api.post("/api/material/save", formData);
          this.$toast.success("등록 완료");
        }

        this.modal.closeModal();
        this.onSaved && this.onSaved();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },

  mounted() {
    this.loadCategory();

    if (this.id) {
      this.loadData();
      this.isEdit = true;
      this.editId = this.id;
    }
  },
};
</script>
