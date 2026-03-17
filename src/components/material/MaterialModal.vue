<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">자재</h2>

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
        <SearchSelect
          v-model="form.category_id"
          :options="categorys"
          labelKey="name"
          valueKey="id"
          @change="changeCode"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">자재코드</label>
        <input
          v-model="form.code"
          placeholder="아이디 입력"
          class="mt-1 w-full border rounded px-3 py-2"
          :disabled="isEdit"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">규격</label>
        <input
          v-model="form.spec"
          placeholder="규격 입력"
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
          placeholder="안전재고 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">메모</label>
        <textarea
          v-model="form.memo"
          placeholder="메모 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        ></textarea>
      </div>
      <div>
        <label class="text-sm text-gray-600">이미지</label>
        <BaseImage :multiple="false" @change="(e) => handleFiles(e)" />
      </div>
    </div>

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
    };
  },

  methods: {
    mappingData(data) {
      for (const key in this.form) {
        const value = data[key];
        this.form[key] = value;
      }
    },

    // 로드시 데이터 셋팅
    async loadData() {
      const res = await api.post(`/api/material/${this.id}`, { id: this.id });
      this.mappingData(res.data);
    },

    // 카테고리 정보
    async loadCategory() {
      const res = await api.post("/api/category/list");
      this.categorys = res.data;
    },

    // 카테고리 정보 수정시
    // 자재 코드에 카테고리 코드 주입
    changeCode() {
      const id = this.form.category_id;

      const category = this.categorys.find((row) => row.id == id);

      if (!category || !category.code) return;

      if (!this.form.code) return;

      // 뒤쪽 번호 유지
      const number = Date.now();

      // 새 코드 생성
      this.form.code = `${category.code.toUpperCase()}-${number}`;
    },

    // 저장처리
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
        formData.append("safety_stock", String(this.form.category_id));

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
        if (this.onSaved) {
          this.onSaved();
        }
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    handleFiles(e) {
      if (!e?.target?.files || !this.form) return;

      const files = Array.from(e.target.files);
      // images 배열 없으면 생성
      if (!this.form.images) {
        this.form.images = [];
      }

      // 🔥 banner는 1장만 허용
      const file = files[0];
      const preview = URL.createObjectURL(file);
      const tempImage = {
        id: Date.now(),
        file,
        preview,
        type: "banner",
        isNew: true,
      };
      this.form.images.push(tempImage);
      e.target.value = "";
    },
  },

  // 로드시 셋팅
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
