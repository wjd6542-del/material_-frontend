<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click="onBackdropClick"
    >
      <!-- 모달 박스 -->
      <div class="w-[360px] rounded-lg bg-white shadow-lg" @click.stop>
        <!-- 헤더 -->
        <div class="px-4 py-3 border-b font-semibold">
          {{ title }}
        </div>

        <!-- 내용 -->
        <div class="px-4 py-4 text-sm text-gray-700 whitespace-pre-line">
          {{ message }}
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            v-if="type === 'confirm'"
            class="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300"
            @click="$emit('cancel')"
          >
            취소
          </button>

          <button
            class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
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
  },
  emits: ["ok", "cancel"],
  methods: {
    onBackdropClick() {
      // confirm → cancel / alert → ok
      this.type === "confirm" ? this.$emit("cancel") : this.$emit("ok");
    },
  },
};
</script>
