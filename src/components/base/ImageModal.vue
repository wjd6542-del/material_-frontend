<template>
  <transition name="fade">
    <div
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      @click.self="modal.closeModal()"
    >
      <!-- 이미지 -->
      <div class="relative max-w-5xl w-full px-4">
        <img
          :src="image"
          class="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />

        <!-- 닫기 -->
        <button
          @click="modal.closeModal()"
          class="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
// @ts-nocheck
import { useModalStore } from "@/stores/modal";

export default {
  name: "ImageModal",

  props: {
    image: String,
  },

  data() {
    return {
      modal: useModalStore(),
    };
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
