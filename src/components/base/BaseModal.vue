<template>
  <TransitionGroup name="modal" tag="div">
    <div
      v-for="(entry, index) in modal.stack"
      :key="index"
      class="fixed inset-0 flex items-center justify-center bg-black/40"
      :style="{ zIndex: 200 + index * 10 }"
    >
      <div
        class="relative bg-white rounded-xl shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        :class="sizeClass(entry.size)"
      >
        <!-- 공용 닫기 버튼 (우측 상단) -->
        <button
          type="button"
          @click="modal.closeModal()"
          class="absolute top-2.5 right-2.5 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="닫기"
        >
          <i class="fa-solid fa-xmark text-base"></i>
        </button>

        <!-- 동적 모달 컴포넌트 - 바디 영역만 스크롤 -->
        <div class="p-4 md:p-6 overflow-y-auto flex-1 min-h-0">
          <component :is="entry.component" v-bind="entry.props" />
        </div>
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
