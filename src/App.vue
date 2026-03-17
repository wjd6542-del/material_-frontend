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

  <!-- panel -->
  <transition name="slide">
    <div
      v-if="bookmark.panelOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 flex flex-col"
    >
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="font-semibold text-lg">
          <i class="fa-regular fa-bookmark"></i> 북마크
        </h3>

        <button @click="bookmark.closePanel()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <BookmarkList />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { useAuthStore } from "@/stores/auth";
import BaseModal from "@/components/base/BaseModal.vue";

import { alertStore } from "@/plugins/alert.store";
import AlertModal from "@/components/base/AlertModal.vue";

// 북마크
import BookmarkList from "@/components/base/BookmarkList.vue";
import { useBookmarkStore } from "@/stores/bookmarkStore";

import { useNotificationStore } from "@/stores/notification";

export default {
  components: { BaseModal, AlertModal, BookmarkList },

  setup() {
    const bookmark = useBookmarkStore();

    return { alertStore, bookmark };
  },

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
