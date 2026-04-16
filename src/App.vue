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
