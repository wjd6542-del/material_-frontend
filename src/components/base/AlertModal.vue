<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
      @click="onBackdropClick"
    >
      <!-- 모달 박스 -->
      <div class="w-[360px] rounded-lg bg-white shadow-lg" @click.stop>
        <!-- 헤더 -->
        <div class="px-3 py-2.5 border-b text-base font-semibold">
          {{ title }}
        </div>

        <!-- 내용 -->
        <div class="px-3 py-3 text-xs text-gray-700 whitespace-pre-line">
          {{ message }}
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-2 px-3 py-2.5 border-t">
          <button v-if="type === 'confirm'" class="btn" @click="$emit('cancel')">
            취소
          </button>

          <button class="btn btn-primary" @click="$emit('ok')">확인</button>
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
  },
  emits: ["ok", "cancel"],
  methods: {
    // 배경 클릭 시 confirm은 취소, alert는 확인으로 emit 처리한다
    onBackdropClick() {
      // confirm → cancel / alert → ok
      this.type === "confirm" ? this.$emit("cancel") : this.$emit("ok");
    },
  },
};
</script>
