<template>
  <div class="flex h-screen">
    <AppSidebar :open="sidebarOpen" />

    <div class="flex flex-col flex-1">
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 overflow-auto p-6">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in" appear>
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";

const sidebarOpen = ref(true);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>
