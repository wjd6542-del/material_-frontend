<template>
  <div class="flex flex-col gap-3" style="height: 60vh">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
        <i class="fa-solid fa-user-plus text-blue-500"></i>
        DM 시작할 사용자 선택
      </h2>
      <button
        type="button"
        @click="modal.closeModal()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- 검색 -->
    <div class="relative">
      <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
      <input
        v-model="keyword"
        @input="onInput"
        type="text"
        placeholder="이름 또는 코드로 검색..."
        class="w-full h-[30px] pl-9 pr-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- 리스트 -->
    <div class="flex-1 overflow-auto border rounded-lg">
      <div v-if="loading" class="text-center text-slate-400 text-xs py-8">
        <i class="fa-solid fa-spinner fa-spin mr-1"></i>검색 중...
      </div>
      <div
        v-else-if="!users.length"
        class="h-full flex flex-col items-center justify-center text-slate-400 py-8"
      >
        <i class="fa-regular fa-user text-2xl mb-2 text-slate-300"></i>
        <p class="text-xs">사용자가 없습니다</p>
      </div>
      <ul v-else class="divide-y divide-slate-100">
        <li
          v-for="u in users"
          :key="u.id"
          @click="select(u)"
          class="px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-blue-50/50 transition-colors"
          :class="selectedId === u.id ? 'bg-blue-50' : ''"
        >
          <div class="w-9 h-9 shrink-0 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold">
            {{ (u.name || "?").slice(0, 1) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-800 truncate">
              {{ u.name }}
            </div>
            <div class="text-[11px] text-slate-400 truncate">
              {{ u.username }}<span v-if="u.code"> · {{ u.code }}</span>
            </div>
          </div>
          <i
            v-if="selectedId === u.id"
            class="fa-solid fa-check text-blue-500 text-xs"
          ></i>
        </li>
      </ul>
    </div>

    <!-- 액션 -->
    <div class="flex items-center justify-end gap-2 pt-1">
      <button
        type="button"
        @click="modal.closeModal()"
        class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
      >
        취소
      </button>
      <button
        type="button"
        @click="confirm"
        :disabled="!selectedId"
        class="btn btn-primary disabled:opacity-40"
      >
        <i class="fa-solid fa-comment"></i>
        대화 시작
      </button>
    </div>
  </div>
</template>

<script>
import { useChatStore } from "@/stores/chat";
import { useModalStore } from "@/stores/modal";

export default {
  name: "ChatUserSelectModal",

  props: {
    onConfirm: { type: Function, default: null },
  },

  data() {
    return {
      chat: useChatStore(),
      modal: useModalStore(),
      keyword: "",
      users: [],
      loading: false,
      selectedId: null,
      debounceTimer: null,
    };
  },

  methods: {
    async load() {
      this.loading = true;
      try {
        this.users = await this.chat.searchDmUsers(this.keyword.trim());
      } finally {
        this.loading = false;
      }
    },

    onInput() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.load(), 250);
    },

    select(user) {
      this.selectedId = user.id;
    },

    confirm() {
      if (!this.selectedId) return;
      if (typeof this.onConfirm === "function") {
        this.onConfirm(this.selectedId);
      }
      this.modal.closeModal();
    },
  },

  mounted() {
    this.load();
  },
};
</script>
