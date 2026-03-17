<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-3">
      {{ title }}
    </h2>

    <div
      class="bg-gray-900 text-green-300 text-sm rounded-lg p-4 overflow-auto max-h-[500px]"
    >
      <pre>{{ formattedJson }}</pre>
    </div>

    <div class="flex justify-end mt-4">
      <button class="px-4 py-2 bg-gray-200 rounded" @click="modal.closeModal()">
        닫기
      </button>
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
