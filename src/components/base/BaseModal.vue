<template>
  <Transition name="modal">
    <div
      v-if="modal.isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        class="bg-white rounded-xl shadow-xl p-4 md:p-6 w-full mx-4"
        :class="sizeClass"
      >
        <!-- 동적 모달 컴포넌트 -->
        <component :is="modal.component" v-bind="modal.props" />
      </div>
    </div>
  </Transition>
</template>

<script>
import { useModalStore } from "@/stores/modal";

export default {
  computed: {
    modal() {
      return useModalStore();
    },

    sizeClass() {
      switch (this.modal.size) {
        case "sm":
          return "max-w-sm";
        case "md":
          return "max-w-lg";
        case "lg":
          return "max-w-2xl";
        case "xl":
          return "max-w-4xl";
        case "full":
          return "max-w-7xl";
        default:
          return "max-w-lg";
      }
    },
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
