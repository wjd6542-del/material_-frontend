<template>
  <div class="w-full">
    <!-- 실제 input -->
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    />

    <!-- 커스텀 UI -->
    <div
      @click="triggerFile"
      class="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition"
    >
      <div class="flex flex-col items-center gap-2 text-gray-500">
        <i class="fa-solid fa-image text-2xl"></i>
        <p class="text-sm font-medium">
          {{ placeholder }}
        </p>
        <p class="text-xs text-gray-400">클릭하여 이미지 선택</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: "BaseImageUploader",
  props: {
    multiple: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: "이미지를 업로드하세요",
    },
  },
  emits: ["change"],
  methods: {
    // 숨겨진 파일 input을 프로그램적으로 클릭한다
    triggerFile() {
      this.$refs.fileInput.click();
    },

    // 파일변경 이벤트
    onFileChange(e) {
      // 이벤트 그대로 전달
      this.$emit("change", e);

      // 같은 파일 다시 선택 가능하게 초기화
      e.target.value = "";
    },
  },
};
</script>
