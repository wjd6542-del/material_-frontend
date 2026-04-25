<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
      @click="onBackdropClick"
    >
      <!-- 모달 박스 -->
      <div
        class="w-[380px] rounded-xl bg-white shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- 헤더: variant 아이콘 + 타이틀 -->
        <div
          class="flex items-center gap-3 px-4 py-3 border-b"
          :class="headerBgClass"
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            :class="iconWrapClass"
          >
            <i :class="iconClass"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="text-[10px] font-bold uppercase tracking-widest"
              :class="variantLabelClass"
            >
              {{ variantLabel }}
            </div>
            <div class="text-sm font-bold text-slate-800 truncate">
              {{ title }}
            </div>
          </div>
        </div>

        <!-- 내용 -->
        <div class="px-4 py-4 text-[13px] text-slate-700 whitespace-pre-line">
          {{ message }}
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50/60">
          <button
            v-if="type === 'confirm'"
            class="h-[32px] px-4 rounded-md text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
            @click="$emit('cancel')"
          >
            취소
          </button>
          <button
            class="h-[32px] px-4 rounded-md text-xs font-bold text-white shadow-sm"
            :class="okBtnClass"
            @click="$emit('ok')"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    title: String,
    message: String,
    type: String,
    variant: { type: String, default: "info" }, // "info" | "warning" | "danger"
  },
  emits: ["ok", "cancel"],
  computed: {
    // variant 별 아이콘
    iconClass() {
      switch (this.variant) {
        case "danger":
          return "fa-solid fa-circle-exclamation text-white";
        case "warning":
          return "fa-solid fa-triangle-exclamation text-white";
        default:
          return "fa-solid fa-circle-info text-white";
      }
    },
    // 아이콘 원형 배경
    iconWrapClass() {
      switch (this.variant) {
        case "danger":
          return "bg-red-500 shadow-md shadow-red-500/30";
        case "warning":
          return "bg-amber-500 shadow-md shadow-amber-500/30";
        default:
          return "bg-blue-500 shadow-md shadow-blue-500/30";
      }
    },
    // 헤더 배경 틴트
    headerBgClass() {
      switch (this.variant) {
        case "danger":
          return "bg-red-50/60";
        case "warning":
          return "bg-amber-50/60";
        default:
          return "bg-blue-50/60";
      }
    },
    // variant 라벨 색상
    variantLabelClass() {
      switch (this.variant) {
        case "danger":
          return "text-red-600";
        case "warning":
          return "text-amber-600";
        default:
          return "text-blue-600";
      }
    },
    // 확인 버튼 색상
    okBtnClass() {
      switch (this.variant) {
        case "danger":
          return "bg-red-600 hover:bg-red-700";
        case "warning":
          return "bg-amber-600 hover:bg-amber-700";
        default:
          return "bg-blue-600 hover:bg-blue-700";
      }
    },
    // variant 한글 라벨
    variantLabel() {
      switch (this.variant) {
        case "danger":
          return "DANGER · 주의";
        case "warning":
          return "WARNING · 경고";
        default:
          return this.type === "confirm" ? "CONFIRM · 확인" : "INFO · 안내";
      }
    },
  },
  methods: {
    // 배경 클릭 시 confirm은 취소, alert는 확인으로 emit 처리한다
    onBackdropClick() {
      this.type === "confirm" ? this.$emit("cancel") : this.$emit("ok");
    },
  },
};
</script>
