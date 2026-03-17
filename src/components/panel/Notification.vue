<template>
  <teleport to="body">
    <!-- overlay -->
    <div
      v-show="notificationStore.panelOpen"
      class="fixed inset-0 bg-black/20 z-[90] transition-opacity duration-200"
      @click="notificationStore.closePanel()"
    ></div>

    <!-- panel -->
    <transition name="slide">
      <div
        v-if="notificationStore.panelOpen"
        class="fixed top-16 right-0 h-[calc(100vh-64px)] w-full sm:w-[380px] bg-white shadow-2xl z-[100] flex flex-col border-l"
      >
        <!-- header -->
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-semibold text-lg">
            <i class="fa-regular fa-bell"></i> 알림 -
            {{ notificationStore.type }}
          </h3>

          <button @click="notificationStore.closePanel()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- list -->
        <div class="flex-1 overflow-y-auto">
          <!-- empty -->
          <div
            v-if="notificationStore.list.length === 0"
            class="h-full flex flex-col items-center justify-center text-gray-400 gap-3"
          >
            <div
              class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
            >
              <i class="fa-regular fa-bell text-xl"></i>
            </div>

            <div class="text-sm font-medium text-gray-500">
              등록된 알림이 없습니다
            </div>

            <div class="text-xs text-gray-400">
              새로운 알림이 도착하면 여기에 표시됩니다
            </div>
          </div>

          <div
            v-for="row in notificationStore.list"
            :key="row.id"
            :class="[
              'px-4 py-3 border-b flex gap-3 items-start transition cursor-pointer',
              row.is_read
                ? 'hover:bg-gray-50'
                : 'bg-blue-50/60 hover:bg-blue-100',
            ]"
          >
            <!-- 아이콘 -->
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
              :class="{
                'bg-blue-500': row.type === 'INBOUND',
                'bg-red-500': row.type === 'OUTBOUND',
                'bg-green-500': row.type === 'MATERIAL',
              }"
            >
              <i
                :class="{
                  'fa-solid fa-truck-ramp-box': row.type === 'INBOUND',
                  'fa-solid fa-dolly': row.type === 'OUTBOUND',
                  'fa-solid fa-box': row.type === 'MATERIAL',
                }"
              ></i>
            </div>

            <!-- 내용 -->
            <div class="flex-1">
              <div class="text-sm font-semibold text-gray-800">
                {{ row.title }}
              </div>

              <div class="text-xs text-gray-500 mt-0.5">
                {{ row.message }}
              </div>

              <div class="text-[11px] text-gray-400 mt-1">
                {{ row.created_at }}
              </div>
            </div>

            <!-- 액션 -->
            <div class="flex items-center gap-2">
              <span
                v-if="!row.is_read"
                class="w-2 h-2 rounded-full bg-blue-500"
              ></span>

              <button
                v-if="!row.is_read"
                class="text-xs text-blue-500 hover:text-blue-700"
                @click="read(row)"
              >
                읽기
              </button>
            </div>
          </div>
        </div>

        <!-- footer -->
        <div class="border-t p-3">
          <button
            class="w-full text-sm text-blue-600 hover:bg-gray-50 py-2 rounded"
            @click="goNotification"
          >
            전체 알림 보기
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { useNotificationStore } from "@/stores/notification";
import { useRouter } from "vue-router";

export default {
  setup() {
    const notificationStore = useNotificationStore();
    const router = useRouter();

    // 읽기 처리 진행
    const read = (row) => {
      try {
        notificationStore.read(row.id);
        this.$toast.success(`알림 읽기 처리 적용 되었습니다`);
      } catch (e) {
        this.$toast.error(e.message);
      }
    };

    // 이동처리 진행
    const goNotification = () => {
      router.push("/notification");
      notificationStore.closePanel();
    };

    return {
      notificationStore,
      read,
      goNotification,
    };
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

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}
</style>
