<template>
  <div class="p-4">
    <h2 class="text-base font-semibold mb-3">
      {{ title }}
    </h2>

    <div
      class="bg-gray-900 text-green-300 text-xs rounded-lg p-3 overflow-auto max-h-[500px]"
    >
      <pre>{{ formattedJson }}</pre>
    </div>

    <div class="flex justify-end mt-3">
      <button class="btn" @click="modal.closeModal()">닫기</button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";

export default {
  props: {
    title: String,
    data: [Object, String],
  },

  data() {
    return {
      modal: useModalStore(),
    };
  },

  computed: {
    // data를 JSON으로 파싱하여 들여쓰기된 문자열로 반환한다
    formattedJson() {
      try {
        const json =
          typeof this.data === "string" ? JSON.parse(this.data) : this.data;

        return JSON.stringify(json, null, 2);
      } catch {
        return this.data;
      }
    },
  },
};
</script>
