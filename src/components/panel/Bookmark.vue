<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-show="bookmarkStore.panelOpen"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
        @click="bookmarkStore.closePanel()"
      ></div>
    </transition>

    <transition name="slide">
      <div
        v-if="bookmarkStore.panelOpen"
        class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] z-[100] flex flex-col"
      >
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h3
              class="font-bold text-xl text-slate-800 flex items-center gap-2.5"
            >
              <span class="p-2 bg-indigo-50 rounded-xl">
                <i class="fa-solid fa-bookmark text-indigo-600"></i>
              </span>
              북마크
            </h3>

            <div class="flex items-center gap-2">
              <button
                class="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-100"
                @click="addCurrent"
              >
                <i class="fa-solid fa-plus text-xs"></i>
                추가
              </button>

              <button
                @click="bookmarkStore.closePanel()"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          <div class="relative group">
            <i
              class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <input
              v-model="keyword"
              type="text"
              placeholder="제목 또는 경로 검색..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
          <div
            v-if="filteredList.length === 0"
            class="h-full flex flex-col items-center justify-center text-slate-400 p-8"
          >
            <div
              class="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 relative"
            >
              <i class="fa-solid fa-folder-open text-3xl text-slate-200"></i>
              <div
                class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-400 rounded-full border-4 border-white animate-pulse"
              ></div>
            </div>
            <p class="text-slate-500 font-medium text-center">
              {{
                keyword
                  ? `'${keyword}' 검색 결과가 없어요`
                  : "저장된 북마크가 없네요"
              }}
            </p>
            <p class="text-xs text-slate-400 mt-1 text-center leading-relaxed">
              상단의 추가 버튼을 눌러<br />현재 페이지를 저장해 보세요!
            </p>
          </div>

          <div class="space-y-1">
            <div
              v-for="row in filteredList"
              :key="row.id"
              class="group relative p-3 rounded-2xl flex gap-4 items-center transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100"
            >
              <div
                class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:rotate-6 transition-transform"
              >
                <i class="fa-solid fa-link text-xs opacity-80"></i>
              </div>

              <div class="flex-1 min-w-0 cursor-pointer" @click="move(row)">
                <div
                  class="text-[14px] font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors"
                >
                  {{ row.title }}
                </div>
                <div
                  class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"
                >
                  <i class="fa-regular fa-compass opacity-70"></i>
                  <span class="truncate">{{ row.path }}</span>
                </div>
              </div>

              <button
                class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                @click.stop="remove(row)"
              >
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-50/80 backdrop-blur-md p-4 text-[11px] text-slate-400 flex justify-center items-center gap-2 border-t border-slate-100"
        >
          <i class="fa-solid fa-circle-info opacity-70"></i>
          <span>북마크는 페이지 바로가기 기능입니다.</span>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
// @ts-nocheck
import { useBookmarkStore } from "@/stores/bookmark";
import { useRoute } from "vue-router";

export default {
  name: "BookmarkPanel",

  data() {
    return {
      bookmarkStore: useBookmarkStore(),
      route: useRoute(),
      keyword: "",
    };
  },

  computed: {
    // 키워드로 제목/경로를 필터링한 북마크 목록을 반환한다
    filteredList() {
      if (!this.keyword) return this.bookmarkStore.list;

      const k = this.keyword.toLowerCase();

      return this.bookmarkStore.list.filter((v) => {
        return (
          v.title?.toLowerCase().includes(k) ||
          v.path?.toLowerCase().includes(k)
        );
      });
    },
  },

  methods: {
    // 현재 라우트를 북마크에 추가한다
    addCurrent() {
      this.bookmarkStore.addCurrent(this.route);
      // Toast의 경우 프로젝트 환경에 맞게 유지 (this.$toast 가 정의되어 있어야 함)
      if (this.$toast) this.$toast.success("북마크에 추가되었습니다.");
    },

    // 북마크 항목 클릭 시 해당 경로로 이동하고 패널을 닫는다
    move(row) {
      this.$router.push(row.path);
      this.bookmarkStore.closePanel();
    },

    // 북마크 항목을 삭제한다
    remove(row) {
      this.bookmarkStore.remove(row.id);
      if (this.$toast) this.$toast.info("삭제되었습니다.");
    },
  },
};
</script>

<style scoped>
/* 슬라이드 애니메이션 (진입/진출 시 더 부드럽게) */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* 페이드 애니메이션 (오버레이용) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 스크롤바 디자인 (깔끔하게) */
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
</style>
