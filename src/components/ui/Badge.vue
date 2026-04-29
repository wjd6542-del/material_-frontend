<template>
  <span :class="['badge', `badge-${variant}`]">
    <i v-if="icon" :class="[icon, 'badge-icon']"></i>
    <slot />
  </span>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: "Badge",
  props: {
    // success | error | warning | info | indigo | neutral | muted
    variant: { type: String, default: "neutral" },
    // FontAwesome 등 아이콘 클래스 (선택)
    icon: { type: String, default: "" },
  },
};
</script>
