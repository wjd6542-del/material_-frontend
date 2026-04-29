<template>
  <div
    ref="headerRoot"
    class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 shrink-0"
  >
    <!-- left -->
    <div class="flex items-center gap-2 md:gap-3 min-w-0">
      <button
        class="text-gray-500 hover:text-gray-700 shrink-0"
        @click="emit('toggle-sidebar')"
      >
        <i class="fa-solid fa-bars text-sm"></i>
      </button>

      <h1 class="text-xs md:text-sm font-semibold text-gray-800 truncate">
        {{ route.meta.title }}
      </h1>
    </div>

    <!-- right -->
    <div class="flex items-center gap-1.5 md:gap-2 shrink-0">
      <!-- 알림 아이콘들: 태블릿 이상에서만 표시 -->
      <template v-if="authStore.hasPermission('notification.view')">
        <!-- 데스크탑: 타입별 아이콘 (호버 시 라벨 툴팁) -->
        <div
          v-for="t in NOTI_TYPES"
          :key="t.type"
          class="hidden md:flex relative cursor-pointer group"
          @click="openNotification(t.type)"
        >
          <div
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs transition"
            :class="[t.bg, t.text, t.hoverBg]"
          >
            <i class="fa-solid" :class="t.icon"></i>
          </div>
          <span
            v-if="noti.counts[t.type] > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] text-white rounded-full px-1"
            :class="t.badge"
          >
            {{ noti.counts[t.type] > 99 ? "99+" : noti.counts[t.type] }}
          </span>

          <!-- 호버 툴팁 -->
          <span
            class="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-[11px] font-semibold text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
          >
            {{ t.label }}
          </span>
        </div>

        <!-- 북마크 -->
        <div
          class="hidden md:flex relative cursor-pointer group"
          @click="openBookmark"
        >
          <div
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition"
          >
            <i class="fa-solid fa-bookmark"></i>
          </div>

          <span
            class="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-[11px] font-semibold text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
          >
            북마크
          </span>
        </div>
      </template>

      <!-- 채팅 (권한 무관 노출) -->
      <div
        class="hidden md:flex relative cursor-pointer group"
        @click="openChat"
      >
        <div
          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition"
        >
          <i class="fa-solid fa-comments"></i>
        </div>
        <span
          v-if="chat.totalUnread > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] text-white rounded-full px-1 bg-red-500"
        >
          {{ chat.totalUnread > 99 ? "99+" : chat.totalUnread }}
        </span>
        <span
          class="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-[11px] font-semibold text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
        >
          채팅
        </span>
      </div>

      <!-- 모바일 채팅 -->
      <button
        class="md:hidden relative w-8 h-8 flex items-center justify-center rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
        @click="openChat"
      >
        <i class="fa-solid fa-comments"></i>
        <span
          v-if="chat.totalUnread > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full px-1"
        >
          {{ chat.totalUnread > 99 ? "99+" : chat.totalUnread }}
        </span>
      </button>

      <template v-if="authStore.hasPermission('notification.view')">
        <!-- 모바일: 알림 통합 버튼 + 드롭다운 -->
        <div class="md:hidden relative">
          <button
            class="relative w-8 h-8 flex items-center justify-center rounded-lg text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
            @click.stop="toggleNotiMenu"
          >
            <i class="fa-solid fa-bell"></i>
            <span
              v-if="totalNotifications > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full px-1"
            >
              {{ totalNotifications > 99 ? "99+" : totalNotifications }}
            </span>
          </button>

          <!-- 드롭다운 -->
          <div
            v-if="notiMenu"
            class="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-xl py-2 z-50"
          >
            <button
              v-for="t in NOTI_TYPES"
              :key="t.type"
              class="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between gap-2"
              @click="selectNotiType(t.type)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="t.bg"
                >
                  <i class="fa-solid text-sm" :class="[t.icon, t.text]"></i>
                </div>
                <span class="text-gray-700 font-medium truncate">{{ t.label }}</span>
              </div>
              <span
                v-if="noti.counts[t.type] > 0"
                class="min-w-[20px] h-[20px] flex items-center justify-center text-[11px] text-white rounded-full px-1.5"
                :class="t.badge"
              >
                {{ noti.counts[t.type] > 99 ? "99+" : noti.counts[t.type] }}
              </span>
            </button>

            <!-- 북마크 -->
            <div class="border-t mt-1 pt-1">
              <button
                class="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"
                @click="selectBookmark"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-50"
                >
                  <i class="fa-solid fa-bookmark text-sm text-purple-600"></i>
                </div>
                <span class="text-gray-700 font-medium">북마크</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 사용자 드롭다운 -->
      <div class="relative">
        <button
          @click.stop="toggleUserMenu"
          class="flex items-center gap-1.5 px-1.5 md:px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <div
            class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs shrink-0"
          >
            <i class="fa-solid fa-user"></i>
          </div>
          <span class="hidden md:inline text-xs text-gray-700">
            {{ authStore.user?.name }}
          </span>
          <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
        </button>

        <!-- dropdown -->
        <div
          v-if="userMenu"
          class="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-xl py-2 z-50"
        >
          <div class="px-3 py-2.5 border-b">
            <div class="text-xs font-semibold text-gray-800">
              {{ authStore.user?.name }}
            </div>
            <div class="text-[11px] text-gray-500">
              {{ authStore.user?.role_name || "사용자" }}
            </div>
          </div>

          <div class="py-1">
            <button
              class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              @click="router.push('/mypage')"
            >
              <i class="fa-solid fa-user text-gray-500"></i>
              내 정보
            </button>
            <button
              class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              @click="router.push('/notification')"
            >
              <i class="fa-solid fa-bell text-gray-500"></i>
              알림
            </button>
          </div>

          <div class="border-t mt-1 pt-1">
            <button
              class="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-500 flex items-center gap-2"
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
  <Bookmark />
  <ChatPanel />
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useBookmarkStore } from "@/stores/bookmark";
import { useChatStore } from "@/stores/chat";

import Notification from "@/components/panel/Notification.vue";
import Bookmark from "@/components/panel/Bookmark.vue";
import ChatPanel from "@/components/chat/ChatPanel.vue";
import { NOTI_TYPES } from "@/data/notificationTypes";

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const noti = useNotificationStore();
const bookmark = useBookmarkStore();
const chat = useChatStore();

const headerRoot = ref<HTMLElement | null>(null);
const userMenu = ref(false);
const notiMenu = ref(false);

// 모든 알림 타입 카운트의 합계
const totalNotifications = computed(() =>
  NOTI_TYPES.reduce((sum, t) => sum + (noti.counts[t.type] || 0), 0),
);

function toggleUserMenu() {
  userMenu.value = !userMenu.value;
  if (userMenu.value) notiMenu.value = false;
}

function toggleNotiMenu() {
  notiMenu.value = !notiMenu.value;
  if (notiMenu.value) userMenu.value = false;
}

function selectNotiType(type: string) {
  notiMenu.value = false;
  openNotification(type);
}

function selectBookmark() {
  notiMenu.value = false;
  openBookmark();
}

// 헤더 외부 클릭 시 드롭다운 메뉴들을 닫는다
function handleOutside(e: MouseEvent) {
  if (headerRoot.value && !headerRoot.value.contains(e.target as Node)) {
    userMenu.value = false;
    notiMenu.value = false;
  }
}

function openNotification(type: string) {
  noti.openPanel(type);
}

function openBookmark() {
  bookmark.openPanel();
}

function openChat() {
  chat.openPanel();
}

function logout() {
  authStore.logout();
  router.push("/login");
}

onMounted(() => {
  noti.loadCounts();
  document.addEventListener("click", handleOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutside);
});
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
