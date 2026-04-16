<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const open = ref(false);
const dropdownRef = ref(null);

// 드롭다운 열림 상태를 토글한다
const toggle = () => {
  open.value = !open.value;
};

// 드롭다운을 닫는다
const close = () => {
  open.value = false;
};

// 드롭다운 외부 클릭 시 닫기 처리한다
const handleClickOutside = (e) => {
  if (!dropdownRef.value) return;

  if (!dropdownRef.value.contains(e.target)) {
    close();
  }
};

// 마운트 시 document 클릭 리스너를 등록한다
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// 언마운트 직전 document 클릭 리스너를 제거한다
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block">
    <!-- trigger -->
    <div @click="toggle">
      <slot name="trigger" :open="open"></slot>
    </div>

    <!-- dropdown -->
    <div
      v-if="open"
      class="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg min-w-[160px] overflow-hidden z-50"
    >
      <slot :close="close"></slot>
    </div>
  </div>
</template>
