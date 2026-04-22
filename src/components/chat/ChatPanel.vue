<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-show="chat.panelOpen"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
        @click="chat.closePanel()"
      ></div>
    </transition>

    <transition name="slide">
      <div
        v-if="chat.panelOpen"
        class="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] z-[100] flex flex-col"
      >
        <!-- 헤더 -->
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <button
              v-if="chat.activeRoomId"
              @click="chat.leaveRoom()"
              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              title="목록으로"
            >
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
              <span class="p-1.5 bg-blue-50 rounded-lg">
                <i class="fa-solid fa-comments text-blue-600 text-xs"></i>
              </span>
              <template v-if="chat.activeRoom">
                <span class="truncate max-w-[200px]">
                  {{ chat.activeRoom.type === "PUBLIC" ? "전체 공지방" : chat.activeRoom.name || chat.activeRoom.peer?.name }}
                </span>
              </template>
              <template v-else>채팅</template>
            </h3>
          </div>

          <div class="flex items-center gap-1">
            <button
              v-if="!chat.activeRoomId"
              @click="openUserSelect"
              class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              title="새 DM"
            >
              <i class="fa-regular fa-pen-to-square text-sm"></i>
            </button>
            <button
              v-if="chat.activeRoom && chat.activeRoom.type !== 'PUBLIC' && chat.activeRoom.type !== 'DM'"
              @click="confirmLeave"
              class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
              title="방 나가기"
            >
              <i class="fa-solid fa-right-from-bracket text-sm"></i>
            </button>
            <button
              @click="chat.closePanel()"
              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        <!-- 본문 -->
        <!-- 방 목록 뷰 -->
        <div
          v-if="!chat.activeRoomId"
          class="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div
            v-if="chat.loadingRooms"
            class="h-full flex items-center justify-center text-slate-400 text-xs py-10"
          >
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>불러오는 중...
          </div>
          <div
            v-else-if="!chat.rooms.length"
            class="h-full flex flex-col items-center justify-center text-slate-400 p-8"
          >
            <div class="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
              <i class="fa-regular fa-comment-dots text-2xl text-slate-300"></i>
            </div>
            <p class="text-slate-500 font-medium text-sm">참여중인 채팅방이 없습니다</p>
            <button @click="openUserSelect" class="mt-3 btn btn-primary">
              <i class="fa-regular fa-pen-to-square"></i>
              새 DM 시작
            </button>
          </div>
          <ul v-else class="divide-y divide-slate-50">
            <li
              v-for="r in chat.rooms"
              :key="r.id"
              @click="chat.openRoom(r.id)"
              class="px-3 py-2.5 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div
                class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white text-xs shadow-sm"
                :class="r.type === 'PUBLIC' ? 'bg-blue-500' : 'bg-slate-500'"
              >
                <i
                  class="fa-solid"
                  :class="r.type === 'PUBLIC' ? 'fa-bullhorn' : 'fa-user'"
                ></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-slate-800 text-sm truncate">
                    {{ r.type === "PUBLIC" ? (r.name || "전체 공지방") : (r.name || r.peer?.name || "DM") }}
                  </span>
                  <span
                    v-if="r.last_message"
                    class="shrink-0 text-[10px] text-slate-400"
                  >
                    {{ formatTime(r.last_message.created_at) }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-2 mt-0.5">
                  <span class="text-xs text-slate-500 truncate">
                    <template v-if="r.last_message">
                      <span class="text-slate-400">{{ r.last_message.sender_name }}:</span>
                      <span
                        v-if="r.last_message.is_deleted"
                        class="italic text-slate-300"
                      >
                        삭제된 메시지
                      </span>
                      <template v-else>{{ r.last_message.content }}</template>
                    </template>
                    <template v-else>
                      <span class="italic text-slate-300">새로운 채팅</span>
                    </template>
                  </span>
                  <span
                    v-if="r.unread > 0"
                    class="shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold"
                  >
                    {{ r.unread > 99 ? "99+" : r.unread }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- 메시지 뷰 -->
        <template v-else>
          <div
            ref="messageList"
            class="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 bg-slate-50/50"
            @scroll="onScroll"
          >
            <div
              v-if="chat.hasMoreBefore[chat.activeRoomId]"
              class="text-center text-[11px] text-slate-400 py-2"
            >
              <i v-if="chat.loadingMessages" class="fa-solid fa-spinner fa-spin"></i>
              <button
                v-else
                @click="loadMoreMessages"
                class="hover:text-blue-600"
              >
                이전 메시지 더 보기
              </button>
            </div>

            <template
              v-for="(msg, idx) in chat.activeMessages"
              :key="msg.id"
            >
              <!-- 날짜 구분선 -->
              <div
                v-if="showDateSeparator(msg, idx)"
                class="flex items-center gap-2 my-3"
              >
                <div class="flex-1 border-t border-slate-200"></div>
                <span class="text-[10px] text-slate-400 font-semibold bg-white px-2 py-0.5 rounded-full border border-slate-100">
                  {{ formatDate(msg.created_at) }}
                </span>
                <div class="flex-1 border-t border-slate-200"></div>
              </div>

              <!-- 메시지 -->
              <div
                class="group/msg flex gap-2 mb-2"
                :class="msg.sender_id === myId ? 'flex-row-reverse' : ''"
              >
                <div
                  v-if="msg.sender_id !== myId"
                  class="w-7 h-7 shrink-0 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] font-bold"
                >
                  {{ (msg.sender?.name || "?").slice(0, 1) }}
                </div>
                <div
                  class="max-w-[70%] flex flex-col"
                  :class="msg.sender_id === myId ? 'items-end' : 'items-start'"
                >
                  <span
                    v-if="msg.sender_id !== myId"
                    class="text-[10px] text-slate-500 mb-0.5 font-semibold"
                  >
                    {{ msg.sender?.name }}
                  </span>
                  <div class="flex items-end gap-1.5">
                    <!-- 내 메시지: [삭제] [시간] [말풍선] -->
                    <template v-if="msg.sender_id === myId">
                      <button
                        v-if="canDelete(msg)"
                        @click="confirmDelete(msg)"
                        class="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[10px] text-slate-400 hover:text-red-500 shrink-0"
                        title="메시지 삭제"
                      >
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                      <span class="text-[10px] text-slate-400 shrink-0">
                        {{ formatTime(msg.created_at) }}
                      </span>
                    </template>

                    <!-- 말풍선 -->
                    <div
                      v-if="msg.is_deleted"
                      class="px-3 py-1.5 rounded-2xl text-xs italic whitespace-pre-wrap break-words"
                      :class="
                        msg.sender_id === myId
                          ? 'bg-slate-200 text-slate-400 rounded-br-sm'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 rounded-bl-sm'
                      "
                    >
                      <i class="fa-regular fa-trash-can text-[10px] mr-1"></i>
                      삭제된 메시지입니다
                    </div>
                    <div
                      v-else
                      class="px-3 py-1.5 rounded-2xl text-xs whitespace-pre-wrap break-words"
                      :class="
                        msg.sender_id === myId
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                      "
                    >
                      {{ msg.content }}
                    </div>

                    <!-- 상대 메시지: [말풍선] [시간] [삭제] -->
                    <template v-if="msg.sender_id !== myId">
                      <span class="text-[10px] text-slate-400 shrink-0">
                        {{ formatTime(msg.created_at) }}
                      </span>
                      <button
                        v-if="canDelete(msg)"
                        @click="confirmDelete(msg)"
                        class="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[10px] text-slate-400 hover:text-red-500 shrink-0"
                        title="메시지 삭제"
                      >
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </template>

            <div
              v-if="!chat.activeMessages.length && !chat.loadingMessages"
              class="h-full flex flex-col items-center justify-center text-slate-400 py-10"
            >
              <i class="fa-regular fa-comment-dots text-3xl text-slate-300 mb-2"></i>
              <p class="text-xs">아직 메시지가 없습니다</p>
            </div>
          </div>

          <!-- 입력 -->
          <div class="border-t border-slate-100 p-2 bg-white">
            <form @submit.prevent="send" class="flex items-center gap-2">
              <textarea
                v-model="inputValue"
                @keydown="onKeydown"
                rows="1"
                placeholder="메시지를 입력하세요"
                class="flex-1 resize-none px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-h-24"
              ></textarea>
              <button
                type="submit"
                :disabled="!canSend"
                class="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <i class="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </form>
          </div>
        </template>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { useModalStore } from "@/stores/modal";
import ChatUserSelectModal from "@/components/chat/ChatUserSelectModal.vue";

export default {
  name: "ChatPanel",

  data() {
    return {
      chat: useChatStore(),
      auth: useAuthStore(),
      modal: useModalStore(),
      inputValue: "",
    };
  },

  computed: {
    myId() {
      return this.auth.user?.id;
    },
    canSend() {
      return !!this.inputValue.trim() && !!this.chat.activeRoomId;
    },
  },

  watch: {
    // 활성 방 변경 시 자동 스크롤
    "chat.activeRoomId"(newVal) {
      if (newVal) {
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    // 메시지 추가 시 하단 스크롤 (이미 하단이면)
    "chat.activeMessages"() {
      this.$nextTick(() => this.scrollToBottomIfNear());
    },
    "chat.panelOpen"(opened) {
      if (opened) {
        this.chat.loadRooms();
      }
    },
  },

  methods: {
    // 시간 포맷 (HH:MM)
    formatTime(s) {
      const d = new Date(s);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    },

    // 날짜 포맷 (YYYY.MM.DD (요일))
    formatDate(s) {
      const d = new Date(s);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      return `${yyyy}.${mm}.${dd} (${days[d.getDay()]})`;
    },

    // 이전 메시지와 날짜가 다르면 구분선 표시
    showDateSeparator(msg, idx) {
      if (idx === 0) return true;
      const prev = this.chat.activeMessages[idx - 1];
      const a = new Date(prev.created_at).toDateString();
      const b = new Date(msg.created_at).toDateString();
      return a !== b;
    },

    onKeydown(e) {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        this.send();
      }
    },

    async send() {
      if (!this.canSend) return;
      const content = this.inputValue.trim();
      this.inputValue = "";
      await this.chat.sendMessage(this.chat.activeRoomId, content);
      this.$nextTick(() => this.scrollToBottom());
    },

    // 상단에 가까우면 더 불러오기
    onScroll(e) {
      if (e.target.scrollTop < 40) {
        this.maybeLoadMore();
      }
    },

    async maybeLoadMore() {
      if (this.chat.loadingMessages) return;
      const roomId = this.chat.activeRoomId;
      if (!roomId) return;
      if (!this.chat.hasMoreBefore[roomId]) return;
      const list = this.chat.activeMessages;
      if (!list.length) return;
      const firstId = list[0].id;
      const prevHeight = this.$refs.messageList?.scrollHeight || 0;
      await this.chat.loadMessages(roomId, firstId);
      this.$nextTick(() => {
        const el = this.$refs.messageList;
        if (el) {
          const newHeight = el.scrollHeight;
          el.scrollTop = newHeight - prevHeight;
        }
      });
    },

    loadMoreMessages() {
      this.maybeLoadMore();
    },

    scrollToBottom() {
      const el = this.$refs.messageList;
      if (el) el.scrollTop = el.scrollHeight;
    },

    scrollToBottomIfNear() {
      const el = this.$refs.messageList;
      if (!el) return;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    },

    openUserSelect() {
      this.modal.openModal(
        ChatUserSelectModal,
        {
          onConfirm: (userId) => this.startDm(userId),
        },
        "md",
      );
    },

    async startDm(userId) {
      await this.chat.openDm(userId);
    },

    async confirmLeave() {
      const roomId = this.chat.activeRoomId;
      if (!roomId) return;
      const ok = await this.$confirm?.(
        "이 채팅방에서 나가시겠습니까?",
        "방 나가기",
      );
      if (ok === false) return;
      await this.chat.leaveRoomPersistent(roomId);
    },

    // 메시지 삭제 가능 여부 (본인 또는 슈퍼유저, 이미 삭제된 것은 제외)
    canDelete(msg) {
      if (!msg || msg.is_deleted) return false;
      if (msg.sender_id === this.myId) return true;
      return !!this.auth.user?.is_super;
    },

    // 메시지 삭제 확인 후 삭제
    async confirmDelete(msg) {
      if (!this.canDelete(msg)) return;
      const ok = await this.$confirm?.(
        "이 메시지를 삭제하시겠습니까?",
        "메시지 삭제",
      );
      if (ok === false) return;
      await this.chat.deleteMessage(msg.id);
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
