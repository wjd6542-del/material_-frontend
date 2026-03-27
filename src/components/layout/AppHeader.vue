<template>
  <div
    class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0"
  >
    <!-- left -->
    <div class="flex items-center gap-3 md:gap-4 min-w-0">
      <button
        class="text-gray-500 hover:text-gray-700 shrink-0"
        @click="$emit('toggle-sidebar')"
      >
        <i class="fa-solid fa-bars text-lg"></i>
      </button>

      <h1 class="text-base md:text-lg font-semibold text-gray-800 truncate">
        {{ route.meta.title }}
      </h1>
    </div>

    <!-- right -->
    <div class="flex items-center gap-2 md:gap-6 shrink-0">
      <!-- 알림 아이콘들: 태블릿 이상에서만 표시 -->
      <template v-if="authStore.hasPermission('notification.view')">
        <!-- 자재 -->
        <div
          class="hidden md:flex relative cursor-pointer group"
          @click="openNotification('MATERIAL')"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition"
          >
            <i class="fa-solid fa-box"></i>
          </div>
          <span
            v-if="noti.counts.MATERIAL > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-green-500 text-white rounded-full px-1"
          >
            {{ noti.counts.MATERIAL }}
          </span>
        </div>

        <!-- 입고 -->
        <div
          class="hidden md:flex relative cursor-pointer group"
          @click="openNotification('INBOUND')"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition"
          >
            <i class="fa-solid fa-arrow-down"></i>
          </div>
          <span
            v-if="noti.counts.INBOUND > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-blue-500 text-white rounded-full px-1"
          >
            {{ noti.counts.INBOUND }}
          </span>
        </div>

        <!-- 출고 -->
        <div
          class="hidden md:flex relative cursor-pointer group"
          @click="openNotification('OUTBOUND')"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100 transition"
          >
            <i class="fa-solid fa-arrow-up"></i>
          </div>
          <span
            v-if="noti.counts.OUTBOUND > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full px-1"
          >
            {{ noti.counts.OUTBOUND }}
          </span>
        </div>

        <!-- 반품 -->
        <div
          class="hidden md:flex relative cursor-pointer group"
          @click="openNotification('RETURNORDER')"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition"
          >
            <i class="fa-solid fa-rotate-left"></i>
          </div>
          <span
            v-if="noti.counts.RETURNORDER > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-orange-500 text-white rounded-full px-1 border-2 border-white"
          >
            {{ noti.counts.RETURNORDER }}
          </span>
        </div>

        <!-- 재고 -->
        <div
          class="hidden md:flex relative cursor-pointer group"
          @click="openNotification('STOCK')"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-red-100 transition"
          >
            <i class="fa-solid fa-boxes-stacked"></i>
          </div>
          <span
            v-if="noti.counts.STOCK > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-purple-500 text-white rounded-full px-1"
          >
            {{ noti.counts.STOCK }}
          </span>
        </div>

        <!-- 모바일: 알림 통합 버튼 -->
        <button
          class="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
          @click="openNotification('MATERIAL')"
        >
          <i class="fa-solid fa-bell"></i>
          <span
            v-if="totalNotifications > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full px-1"
          >
            {{ totalNotifications > 99 ? '99+' : totalNotifications }}
          </span>
        </button>
      </template>

      <!-- 사용자 드롭다운 -->
      <div class="relative">
        <button
          @click.stop="toggleUserMenu"
          class="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 transition"
        >
          <div
            class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"
          >
            <i class="fa-solid fa-user"></i>
          </div>

          <!-- 사용자 이름: 태블릿 이상에서만 표시 -->
          <span class="hidden md:inline text-sm text-gray-700">
            {{ authStore.user?.name }}
          </span>

          <i class="fa-solid fa-chevron-down text-xs text-gray-400"></i>
        </button>

        <!-- dropdown -->
        <div
          v-if="userMenu"
          class="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-xl py-2 z-50"
        >
          <!-- 사용자 정보 -->
          <div class="px-4 py-3 border-b">
            <div class="text-sm font-semibold text-gray-800">
              {{ authStore.user?.name }}
            </div>
            <div class="text-xs text-gray-500">
              {{ authStore.user?.role_name || "사용자" }}
            </div>
          </div>

          <!-- 메뉴 -->
          <div class="py-1">
            <button
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3"
              @click="$router.push('/mypage')"
            >
              <i class="fa-solid fa-user text-gray-500"></i>
              내 정보
            </button>

            <button
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3"
              @click="$router.push('/notification')"
            >
              <i class="fa-solid fa-bell text-gray-500"></i>
              알림
            </button>
          </div>

          <!-- 로그아웃 -->
          <div class="border-t mt-1 pt-1">
            <button
              class="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-3"
              @click="logout"
            >
              <i class="fa-solid fa-right-from-bracket"></i>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Notification />
</template>

<script lang="ts">
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import Notification from "@/components/panel/Notification.vue";

import { useModalStore } from "@/stores/modal";

export default {
  emits: ["toggle-sidebar"],

  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    const noti = useNotificationStore();

    return {
      route,
      authStore,
      noti,
    };
  },

  components: {
    Notification,
  },

  data() {
    return {
      modal: useModalStore(),
      userMenu: false,
    };
  },

  computed: {
    totalNotifications() {
      const c = this.noti.counts;
      return (c.MATERIAL || 0) + (c.INBOUND || 0) + (c.OUTBOUND || 0) + (c.RETURNORDER || 0) + (c.STOCK || 0);
    },
  },

  methods: {
    toggleUserMenu() {
      this.userMenu = !this.userMenu;
    },

    handleOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.userMenu = false;
      }
    },

    openNotification(type) {
      this.noti.openPanel(type);
    },

    logout() {
      this.authStore.logout();
      this.$router.push("/login");
    },
  },

  mounted() {
    this.noti.loadCounts();
    document.addEventListener("click", this.handleOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleOutside);
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
