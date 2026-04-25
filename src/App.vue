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

<script lang="ts">
import { useAuthStore } from "@/stores/auth";
import BaseModal from "@/components/base/BaseModal.vue";

import { alertStore } from "@/plugins/alert.store";
import AlertModal from "@/components/base/AlertModal.vue";
import { useNotificationStore } from "@/stores/notification";
import { useChatStore } from "@/stores/chat";
import { watch } from "vue";

export default {
  components: { BaseModal, AlertModal },

  // 전역 알림 스토어를 템플릿에 노출한다
  setup() {
    return { alertStore };
  },

  // 앱 생성 시 auth 복원과 알림 자동 갱신을 시작한다
  created() {
    const auth = useAuthStore();
    auth.restore();

    const noti = useNotificationStore();
    noti.startAutoRefresh();

    const chat = useChatStore();

    // 로그인 상태 변화에 따라 소켓 연결/해제
    const syncChat = async (isLogin: boolean) => {
      if (isLogin) {
        chat.connect();
        await chat.ensurePublicRoom();
        await chat.loadRooms();
        await chat.loadUnreadCount();
      } else {
        chat.disconnect();
      }
    };

    // 최초 복원 후 즉시 동기화
    syncChat(auth.isLogin);

    // 로그인 상태 변화 감지
    watch(
      () => auth.isLogin,
      (isLogin) => syncChat(isLogin),
    );
  },
};
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
