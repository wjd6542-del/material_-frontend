<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <BaseModal />

  <AlertModal
    :visible="alertStore.visible"
    :title="alertStore.title"
    :message="alertStore.message"
    :type="alertStore.type"
    :variant="alertStore.variant"
    @ok="alertStore.ok"
    @cancel="alertStore.cancel"
  />
</template>

<script setup lang="ts">
// @ts-nocheck
import BaseModal from "@/components/base/BaseModal.vue";
import AlertModal from "@/components/base/AlertModal.vue";
import { alertStore } from "@/plugins/alert.store";
import { useAppInit } from "@/composables/useAppInit";

useAppInit();
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.18s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
