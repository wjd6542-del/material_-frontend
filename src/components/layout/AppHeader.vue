<template>
  <div
    class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6"
  >
    <!-- left -->
    <div class="flex items-center gap-4">
      <button
        class="text-gray-500 hover:text-gray-700"
        @click="$emit('toggle-sidebar')"
      >
        <i class="fa-solid fa-bars"></i>
      </button>

      <h1 class="text-lg font-semibold text-gray-800">
        {{ route.meta.title }}
      </h1>
    </div>

    <!-- right -->
    <div class="flex items-center gap-6">
      <!-- 입고 확인 -->
      <div
        class="relative cursor-pointer text-gray-600 hover:text-blue-600"
        @click="openNotification('INBOUND')"
      >
        입고
        <span
          v-if="notificationStore.counts.INBOUND > 0"
          class="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-blue-500 text-white rounded-full px-1"
        >
          {{ notificationStore.counts.INBOUND }}
        </span>
      </div>

      <!-- 출고 확인 -->
      <div
        class="relative cursor-pointer text-gray-600 hover:text-red-600"
        @click="openNotification('OUTBOUND')"
      >
        출고
        <span
          v-if="notificationStore.counts.OUTBOUND > 0"
          class="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full px-1"
        >
          {{ notificationStore.counts.OUTBOUND }}
        </span>
      </div>

      <!-- 신규 물품 -->
      <div
        class="relative cursor-pointer text-gray-600 hover:text-green-600"
        @click="openNotification('MATERIAL')"
      >
        자재
        <span
          v-if="notificationStore.counts.MATERIAL > 0"
          class="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-green-500 text-white rounded-full px-1"
        >
          {{ notificationStore.counts.MATERIAL }}
        </span>
      </div>

      <!-- 사용자 -->
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <i class="fa-solid fa-user-shield"></i>
        {{ authStore.user?.name }}

        <button class="ml-3 text-red-500 hover:text-red-700" @click="logout">
          로그아웃
        </button>
      </div>
    </div>
  </div>

  <Notification />
</template>

<script lang="ts">
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";

// 패널 적용
import Notification from "@/components/panel/Notification.vue";

export default {
  emits: ["toggle-sidebar"],

  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    return {
      route,
      authStore,
      notificationStore,
    };
  },

  components: {
    Notification,
  },

  methods: {
    openNotification(type) {
      this.notificationStore.openPanel(type);
    },

    read(row) {
      this.notificationStore.read(row.id);
    },

    goNotification() {
      this.$router.push("/notification");
      this.notificationStore.closePanel();
    },

    logout() {
      this.authStore.logout();
      this.$router.push("/login");
    },
  },

  mounted() {
    console.log(this.authStore);
    this.notificationStore.loadCounts();
  },
};
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
