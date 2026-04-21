<template>
  <TransitionGroup name="modal" tag="div">
    <div
      v-for="(entry, index) in modal.stack"
      :key="index"
      class="fixed inset-0 flex items-center justify-center bg-black/40"
      :style="{ zIndex: 50 + index * 10 }"
    >
      <div
        class="bg-white rounded-xl shadow-xl p-4 md:p-6 w-full mx-4"
        :class="sizeClass(entry.size)"
      >
        <!-- 동적 모달 컴포넌트 -->
        <component :is="entry.component" v-bind="entry.props" />
      </div>
    </div>
  </TransitionGroup>
</template>

<script>
import { useModalStore } from "@/stores/modal";

export default {
  computed: {
    // 모달 Pinia 스토어 인스턴스를 반환한다
    modal() {
      return useModalStore();
    },
  },

  methods: {
    // 모달 size 속성에 대응하는 Tailwind max-width 클래스를 반환한다
    sizeClass(size) {
      switch (size) {
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
