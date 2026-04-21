<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-show="notificationStore.panelOpen"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
        @click="notificationStore.closePanel()"
      ></div>
    </transition>

    <transition name="slide">
      <div
        v-if="notificationStore.panelOpen"
        class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] z-[100] flex flex-col"
      >
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col gap-1">
          <div class="flex justify-between items-center">
            <h3
              class="font-bold text-xl text-slate-800 flex items-center gap-2.5"
            >
              <span class="p-2 bg-blue-50 rounded-xl">
                <i class="fa-regular fa-bell text-blue-600"></i>
              </span>
              알림센터 - {{ typeLabel(notificationStore.type) }}
            </h3>

            <button
              @click.stop="notificationStore.closePanel()"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div
            v-if="notificationStore.list.length === 0"
            class="h-full flex flex-col items-center justify-center text-slate-400 p-8"
          >
            <div
              class="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100"
            >
              <i class="fa-regular fa-bell-slash text-3xl text-slate-200"></i>
            </div>
            <p class="text-slate-500 font-medium">새로운 알림이 없습니다</p>
            <p class="text-xs text-slate-400 mt-1">
              도착하는 알림은 여기에 표시됩니다.
            </p>
          </div>

          <div class="divide-y divide-slate-50">
            <div
              v-for="row in notificationStore.list"
              :key="row.id"
              :class="[
                'group relative px-6 py-4 flex gap-4 transition-all cursor-pointer',
                row.is_read
                  ? 'opacity-70 hover:bg-slate-50'
                  : 'bg-blue-50/30 hover:bg-blue-50/60',
              ]"
              @click="move(row)"
            >
              <div
                class="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-white text-base shadow-sm group-hover:scale-110 transition-transform"
                :class="{
                  'bg-blue-500 shadow-indigo-100': row.type === 'INBOUND',
                  'bg-rose-500 shadow-rose-100': row.type === 'OUTBOUND',
                  'bg-emerald-500 shadow-emerald-100': row.type === 'MATERIAL',
                  'bg-orange-500 shadow-emerald-100':
                    row.type === 'RETURNORDER',
                  'bg-teal-500 shadow-emerald-100':
                    row.type === 'PURCHASEORDER',
                  'bg-purple-500 shadow-emerald-100': row.type === 'STOCK',
                }"
              >
                <i
                  :class="{
                    'fa-solid fa-arrow-down': row.type === 'INBOUND',
                    'fa-solid fa-arrow-up': row.type === 'OUTBOUND',
                    'fa-solid fa-box': row.type === 'MATERIAL',
                    'fa-solid fa-rotate-left': row.type === 'RETURNORDER',
                    'fa-solid fa-clipboard-list': row.type === 'PURCHASEORDER',
                    'fa-solid fa-boxes-stacked': row.type === 'STOCK',
                  }"
                ></i>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                  <div
                    class="text-[14px] font-bold text-slate-700 truncate leading-tight"
                  >
                    {{ row.title }}
                  </div>
                  <span
                    v-if="!row.is_read"
                    class="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5 animate-pulse"
                  ></span>
                </div>

                <div
                  class="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-relaxed"
                >
                  {{ row.message }}
                </div>

                <div class="flex items-center justify-between mt-2.5">
                  <span
                    class="text-[11px] text-slate-400 flex items-center gap-1"
                  >
                    <i class="fa-regular fa-clock opacity-70"></i>
                    <BaseDateText :value="row.created_at" show-time />
                  </span>

                  <button
                    v-if="!row.is_read"
                    class="text-[11px] font-bold text-blue-600 hover:underline px-2 py-0.5 rounded bg-blue-50"
                    @click.stop="read(row)"
                  >
                    읽음 표시
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-100 bg-white">
          <button
            class="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-all active:scale-[0.98]"
            @click="goNotification"
          >
            전체 알림 확인하기
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { useNotificationStore } from "@/stores/notification";
import BaseDateText from "@/components/base/BaseDateText.vue";

export default {
  name: "NotificationPanel",

  components: {
    BaseDateText,
  },

  data() {
    return {
      notificationStore: useNotificationStore(),
    };
  },

  methods: {
    // 타입 코드를 한글 라벨로 변환
    typeLabel(type) {
      const map = {
        INBOUND: "입고",
        OUTBOUND: "출고",
        MATERIAL: "자재",
        PURCHASEORDER: "발주",
        RETURNORDER: "반품",
        STOCK: "재고",
      };
      return map[type] || type;
    },

    // 읽기 처리
    read(row) {
      try {
        this.notificationStore.read(row.id);
        if (this.$toast) this.$toast.success("알림을 읽음 처리했습니다.");
      } catch (e) {
        if (this.$toast) this.$toast.error(e.message);
      }
    },

    // 전체 알림 이동
    goNotification() {
      this.$router.push("/notification");
      this.notificationStore.closePanel();
    },

    // 상세 이동
    move(data) {
      this.$router.push({
        path: "/notification",
        query: { id: data.id },
      });
      this.notificationStore.closePanel();
    },
  },
};
</script>

<style scoped>
/* 슬라이드 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* 페이드 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 스크롤바 커스텀 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* 한 줄/두 줄 생략 처리 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
