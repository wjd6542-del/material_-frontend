<template>
  <div class="flex h-screen overflow-hidden">
    <!-- 모바일 백드롭 -->
    <transition name="fade">
      <div
        v-if="isMobile && sidebarOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="sidebarOpen = false"
      />
    </transition>

    <AppSidebar
      :open="sidebarOpen"
      :is-mobile="isMobile"
      @close="sidebarOpen = false"
    />

    <div class="flex flex-col flex-1 min-w-0">
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 overflow-auto p-4 md:p-6">
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
import { ref, onMounted, onUnmounted } from "vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";

const MOBILE_BREAKPOINT = 768;

const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);
const sidebarOpen = ref(!isMobile.value);

// 사이드바 열림 상태를 토글한다
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// 윈도우 리사이즈에 따라 모바일 여부와 사이드바 열림 상태를 갱신한다
const handleResize = () => {
  const mobile = window.innerWidth < MOBILE_BREAKPOINT;
  if (mobile !== isMobile.value) {
    isMobile.value = mobile;
    sidebarOpen.value = !mobile;
  }
};

onMounted(() => window.addEventListener("resize", handleResize));
onUnmounted(() => window.removeEventListener("resize", handleResize));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
