<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const open = ref(false);
const dropdownRef = ref(null);

const toggle = () => {
  open.value = !open.value;
};

const close = () => {
  open.value = false;
};

const handleClickOutside = (e) => {
  if (!dropdownRef.value) return;

  if (!dropdownRef.value.contains(e.target)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

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
