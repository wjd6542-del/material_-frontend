<template>
  <div
    class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 shrink-0"
  >
    <!-- left -->
    <div class="flex items-center gap-2 md:gap-3 min-w-0">
      <button
        class="text-gray-500 hover:text-gray-700 shrink-0"
        @click="$emit('toggle-sidebar')"
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
          v-for="t in notiTypes"
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

          <!-- 호버 툴팁 -->
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
              v-for="t in notiTypes"
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

          <!-- 사용자 이름: 태블릿 이상에서만 표시 -->
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
          <!-- 사용자 정보 -->
          <div class="px-3 py-2.5 border-b">
            <div class="text-xs font-semibold text-gray-800">
              {{ authStore.user?.name }}
            </div>
            <div class="text-[11px] text-gray-500">
              {{ authStore.user?.role_name || "사용자" }}
            </div>
          </div>

          <!-- 메뉴 -->
          <div class="py-1">
            <button
              class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              @click="$router.push('/mypage')"
            >
              <i class="fa-solid fa-user text-gray-500"></i>
              내 정보
            </button>

            <button
              class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              @click="$router.push('/notification')"
            >
              <i class="fa-solid fa-bell text-gray-500"></i>
              알림
            </button>
          </div>

          <!-- 로그아웃 -->
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

<script lang="ts">
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useBookmarkStore } from "@/stores/bookmark";
import { useChatStore } from "@/stores/chat";

import Notification from "@/components/panel/Notification.vue";
import Bookmark from "@/components/panel/Bookmark.vue";
import ChatPanel from "@/components/chat/ChatPanel.vue";

import { useModalStore } from "@/stores/modal";

export default {
  emits: ["toggle-sidebar"],

  // 라우트와 auth/알림/북마크 스토어를 초기화한다
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    const noti = useNotificationStore();
    const bookmark = useBookmarkStore();
    const chat = useChatStore();

    return {
      route,
      authStore,
      noti,
      bookmark,
      chat,
    };
  },

  components: {
    Notification,
    Bookmark,
    ChatPanel,
  },

  data() {
    return {
      modal: useModalStore(),
      userMenu: false,
      notiMenu: false,

      // 알림 타입별 메타 (데스크탑 헤더 + 모바일 드롭다운 공용)
      notiTypes: [
        {
          type: "PURCHASEORDER",
          label: "발주",
          icon: "fa-clipboard-list",
          bg: "bg-teal-50",
          text: "text-teal-600",
          hoverBg: "group-hover:bg-teal-100",
          badge: "bg-teal-500",
        },
        {
          type: "MATERIAL",
          label: "자재",
          icon: "fa-box",
          bg: "bg-green-50",
          text: "text-green-600",
          hoverBg: "group-hover:bg-green-100",
          badge: "bg-green-500",
        },
        {
          type: "INBOUND",
          label: "구매",
          icon: "fa-arrow-down",
          bg: "bg-blue-50",
          text: "text-blue-600",
          hoverBg: "group-hover:bg-blue-100",
          badge: "bg-blue-500",
        },
        {
          type: "OUTBOUND",
          label: "판매",
          icon: "fa-arrow-up",
          bg: "bg-red-50",
          text: "text-red-600",
          hoverBg: "group-hover:bg-red-100",
          badge: "bg-red-500",
        },
        {
          type: "RETURNORDER",
          label: "반품",
          icon: "fa-rotate-left",
          bg: "bg-orange-50",
          text: "text-orange-600",
          hoverBg: "group-hover:bg-orange-100",
          badge: "bg-orange-500",
        },
        {
          type: "STOCK",
          label: "재고",
          icon: "fa-boxes-stacked",
          bg: "bg-purple-50",
          text: "text-purple-600",
          hoverBg: "group-hover:bg-purple-100",
          badge: "bg-purple-500",
        },
      ],
    };
  },

  computed: {
    // 모든 알림 카운트의 합계를 반환한다
    totalNotifications() {
      const c = this.noti.counts;
      return (
        (c.MATERIAL || 0) +
        (c.INBOUND || 0) +
        (c.OUTBOUND || 0) +
        (c.RETURNORDER || 0) +
        (c.PURCHASEORDER || 0) +
        (c.STOCK || 0)
      );
    },
  },

  methods: {
    // 사용자 드롭다운 메뉴 열림 상태를 토글한다
    toggleUserMenu() {
      this.userMenu = !this.userMenu;
      if (this.userMenu) this.notiMenu = false;
    },

    // 모바일 알림 드롭다운 열림 상태를 토글한다
    toggleNotiMenu() {
      this.notiMenu = !this.notiMenu;
      if (this.notiMenu) this.userMenu = false;
    },

    // 모바일 알림 드롭다운에서 타입 선택 시 패널을 연다
    selectNotiType(type) {
      this.notiMenu = false;
      this.openNotification(type);
    },

    // 모바일 알림 드롭다운에서 북마크 선택 시
    selectBookmark() {
      this.notiMenu = false;
      this.openBookmark();
    },

    // 헤더 외부 클릭 시 드롭다운 메뉴들을 닫는다
    handleOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.userMenu = false;
        this.notiMenu = false;
      }
    },

    // 특정 타입의 알림 패널을 연다
    openNotification(type) {
      this.noti.openPanel(type);
    },

    // 로그아웃 처리 후 로그인 페이지로 이동한다
    logout() {
      this.authStore.logout();
      this.$router.push("/login");
    },

    // 북마크 열기
    // 북마크 패널을 연다
    openBookmark() {
      this.bookmark.openPanel();
    },

    // 채팅 패널을 연다
    openChat() {
      this.chat.openPanel();
    },
  },

  // 마운트 시 알림 카운트 로드 및 외부 클릭 리스너 등록
  mounted() {
    this.noti.loadCounts();
    document.addEventListener("click", this.handleOutside);
  },

  // 언마운트 직전 외부 클릭 리스너를 제거한다
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
