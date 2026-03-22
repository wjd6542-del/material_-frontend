<template>
  <div class="flex h-screen bg-gray-100 p-4 gap-4">
    <!-- 좌측 계정 리스트 -->
    <div
      class="w-80 bg-white border flex flex-col rounded-3xl shadow-sm overflow-hidden"
    >
      <!-- 헤더 -->
      <div class="p-5 border-b bg-white">
        <div class="flex items-center gap-2 mb-4">
          <div
            class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"
          >
            <i class="fa-solid fa-users text-blue-500"></i>
          </div>
          <h2 class="text-lg font-bold text-gray-800">계정 목록</h2>
        </div>

        <!-- 검색 -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="계정 검색..."
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
          />
          <i
            class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-400 text-sm"
          ></i>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user)"
          class="group p-3 rounded-2xl border border-transparent cursor-pointer transition-all flex items-center gap-3"
          :class="
            selectedUser?.id === user.id
              ? 'bg-blue-600 text-white shadow-md border-blue-600'
              : 'bg-white hover:border-gray-200 hover:shadow-sm'
          "
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm shadow-sm"
            :class="
              selectedUser?.id === user.id
                ? 'bg-white/20 text-white'
                : 'bg-blue-50 text-blue-600'
            "
          >
            {{ user.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold truncate">{{ user.name }}</div>
            <div
              class="text-xs truncate"
              :class="
                selectedUser?.id === user.id ? 'text-blue-100' : 'text-gray-400'
              "
            >
              {{ user.email }}
            </div>
          </div>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-lg text-nowrap"
            :class="
              user.role === 'admin'
                ? selectedUser?.id === user.id
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-50 text-purple-600'
                : selectedUser?.id === user.id
                  ? 'bg-white/10 text-white'
                  : 'bg-gray-100 text-gray-500'
            "
          >
            {{ user.role === "admin" ? "관리자" : "사용자" }}
          </span>
        </div>
      </div>
    </div>

    <!-- 우측 권한 설정 영역 -->
    <div class="flex-1 flex flex-col min-w-0">
      <transition name="page" mode="out-in">
        <div
          v-if="selectedUser"
          :key="selectedUser.id"
          class="bg-white rounded-3xl border shadow-sm flex flex-col h-full overflow-hidden"
        >
          <!-- 상단 툴바 -->
          <div
            class="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
          >
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider"
                  >Access Control</span
                >
                <h3 class="text-xl font-black text-gray-800">
                  {{ selectedUser.name }}
                  <span class="font-normal text-gray-400 text-base ml-1"
                    >IP 관리</span
                  >
                </h3>
              </div>
              <p class="text-sm text-gray-500 italic">
                허용된 화이트 IP 리스트를 관리합니다.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="addRow"
                class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold transition flex items-center gap-2 shadow-sm"
              >
                <i class="fa-solid fa-plus text-blue-500"></i> 추가
              </button>
              <button
                @click="saveIps"
                class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold transition shadow-blue-200 shadow-lg flex items-center gap-2"
              >
                <i class="fa-solid fa-floppy-disk"></i> 일괄 저장
              </button>
              <div class="w-px h-6 bg-gray-200 mx-1"></div>
              <button
                @click="deleteSelected"
                :disabled="selectedRows.length === 0"
                class="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-bold transition disabled:opacity-30 disabled:grayscale flex items-center gap-2"
              >
                <i class="fa-solid fa-trash-can"></i> 삭제 ({{
                  selectedRows.length
                }})
              </button>
            </div>
          </div>

          <!-- 필터바 -->
          <div class="px-6 py-3 border-b bg-gray-50/50 flex justify-end">
            <div class="relative w-64">
              <input
                v-model="ipSearch"
                type="text"
                placeholder="IP 또는 메모 검색..."
                class="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <i
                class="fa-solid fa-search absolute left-3 top-2 text-gray-400 text-[10px]"
              ></i>
            </div>
          </div>

          <!-- 테이블 -->
          <div class="flex-1 overflow-y-auto">
            <table class="w-full border-collapse">
              <thead class="sticky top-0 bg-white z-10 shadow-sm">
                <tr
                  class="text-left text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b"
                >
                  <th class="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      @change="toggleAll"
                      :checked="isAllSelected"
                      class="rounded-md border-gray-300 text-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th class="p-4">아이피</th>
                  <th class="p-4">메모</th>
                  <th class="p-4 w-32">활성여부</th>
                  <th class="p-4 w-40 text-right">등록일</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="(item, index) in filteredIpList"
                  :key="item.id || index"
                  class="transition-all duration-200 group"
                  :class="
                    selectedRows.includes(item.id || index)
                      ? 'bg-blue-50 ring-1 ring-inset ring-blue-100'
                      : 'hover:bg-gray-50/50'
                  "
                >
                  <td class="p-4 text-center">
                    <input
                      type="checkbox"
                      v-model="selectedRows"
                      :value="item.id || index"
                      class="rounded-md border-gray-300 text-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td class="p-4">
                    <input
                      v-model="item.ip"
                      @input="autoSelectRow(item.id || index)"
                      type="text"
                      placeholder="0.0.0.0"
                      class="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 text-sm font-mono font-medium text-gray-700 transition-all"
                    />
                  </td>
                  <td class="p-4">
                    <input
                      v-model="item.memo"
                      @input="autoSelectRow(item.id || index)"
                      type="text"
                      placeholder="메모 입력"
                      class="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 text-sm text-gray-600 transition-all"
                    />
                  </td>
                  <td class="p-4">
                    <label
                      class="relative inline-flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="item.is_active"
                        @change="autoSelectRow(item.id || index)"
                        class="sr-only peer"
                      />
                      <div
                        class="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"
                      ></div>
                      <span
                        class="ml-2 text-[11px] font-bold"
                        :class="
                          item.is_active ? 'text-blue-600' : 'text-gray-400'
                        "
                      >
                        {{ item.is_active ? "ACTIVE" : "OFF" }}
                      </span>
                    </label>
                  </td>
                  <td class="p-4 text-right text-xs text-gray-400 font-mono">
                    {{ item.created_at || "방금 전" }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 빈 화면 -->
            <div
              v-if="filteredIpList.length === 0"
              class="flex flex-col items-center justify-center py-20 text-gray-300"
            >
              <i class="fa-solid fa-shield-halved text-6xl mb-4 opacity-20"></i>
              <p class="text-sm">등록된 화이트 IP가 없습니다.</p>
            </div>
          </div>
        </div>

        <!-- 미선택 화면 -->
        <div
          v-else
          class="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200"
        >
          <!-- 배경 장식 요소 (선택 사항) -->
          <div
            class="absolute inset-0 opacity-[0.03] pointer-events-none"
            :style="dotPattern"
          ></div>

          <div
            class="relative z-10 flex flex-col items-center max-w-lg w-full px-6"
          >
            <!-- 아이콘 애니메이션 영역 -->
            <div class="relative mb-10">
              <div
                class="absolute inset-0 bg-blue-400 blur-[60px] opacity-20 animate-pulse"
              ></div>
              <div
                class="relative w-28 h-28 bg-white rounded-[32px] shadow-2xl shadow-blue-100 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500"
              >
                <i class="fa-solid fa-user-shield text-5xl text-blue-500"></i>
              </div>
              <!-- 보조 아이콘들 -->
              <div
                class="absolute -top-4 -right-4 w-12 h-12 bg-emerald-50 rounded-2xl shadow-sm flex items-center justify-center animate-bounce"
                style="animation-duration: 3s"
              >
                <i class="fa-solid fa-check text-emerald-500 text-xl"></i>
              </div>
              <div
                class="absolute -bottom-2 -left-6 w-10 h-10 bg-purple-50 rounded-xl shadow-sm flex items-center justify-center animate-bounce"
                style="animation-duration: 4s"
              >
                <i class="fa-solid fa-lock text-purple-400 text-sm"></i>
              </div>
            </div>

            <!-- 텍스트 가이드 -->
            <h3
              class="text-2xl font-black text-gray-800 mb-3 tracking-tight text-center"
            >
              보안 계정 관리 시스템
            </h3>
            <p class="text-gray-400 text-center leading-relaxed mb-10">
              화이트리스트 IP 설정을 위해 <br />
              좌측 목록에서 대상 계정을 선택하여 관리를 시작하세요.
            </p>

            <!-- 하단 상태 요약 (가짜 데이터/정적 가이드) -->
            <div class="grid grid-cols-2 gap-4 w-full">
              <div
                class="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex items-center gap-4"
              >
                <div
                  class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"
                >
                  <i class="fa-solid fa-shield-halved text-blue-500"></i>
                </div>
                <div>
                  <div
                    class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
                  >
                    Access Status
                  </div>
                  <div class="text-sm font-bold text-gray-700">
                    보안 활성화됨
                  </div>
                </div>
              </div>
              <div
                class="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex items-center gap-4"
              >
                <div
                  class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"
                >
                  <i class="fa-solid fa-earth-asia text-orange-500"></i>
                </div>
                <div>
                  <div
                    class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
                  >
                    IP Filtering
                  </div>
                  <div class="text-sm font-bold text-gray-700">
                    개별 IP 제어
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  data() {
    return {
      search: "",
      users: [],
      selectedUser: null,
      ipSearch: "",
      ipList: [],
      selectedRows: [],
    };
  },

  mounted() {
    this.loadUsers();
  },

  computed: {
    filteredUsers() {
      if (!this.search) return this.users;
      const s = this.search.toLowerCase();
      return this.users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
      );
    },
    filteredIpList() {
      if (!this.ipSearch) return this.ipList;
      const s = this.ipSearch.toLowerCase();
      return this.ipList.filter(
        (item) =>
          item.ip.includes(s) ||
          (item.memo && item.memo.toLowerCase().includes(s)),
      );
    },
    isAllSelected() {
      return (
        this.ipList.length > 0 &&
        this.selectedRows.length === this.ipList.length
      );
    },

    dotPattern() {
      return {
        backgroundImage: `radial-gradient(#3b82f6 1px, transparent 0)`,
        backgroundSize: `24px 24px`,
      };
    },
  },

  methods: {
    // 계정 정보 호출
    async loadUsers() {
      const res = await api.post("/api/user/list");
      this.users = res.data;
    },

    //계정 선택
    async selectUser(user) {
      this.selectedUser = user;
      this.selectedRows = [];
      await this.loadUserIps(user.id);
    },

    // 계정 아이피 리스트 호출
    async loadUserIps(userId) {
      const res = await api.post("/api/user/ip/list", { user_id: userId });
      this.ipList = res.data;
    },

    autoSelectRow(key) {
      if (!this.selectedRows.includes(key)) {
        this.selectedRows.push(key);
      }
    },

    // 로우 추가
    addRow() {
      this.ipList.unshift({
        id: null,
        ip: "",
        memo: "",
        is_active: true,
        created_at: "",
      });
      this.autoSelectRow(null || 0);
    },

    toggleAll() {
      if (this.isAllSelected) {
        this.selectedRows = [];
      } else {
        this.selectedRows = this.ipList.map((item, index) => item.id || index);
      }
    },

    // 아이피 저장
    async saveIps() {
      try {
        if (this.selectedRows.length == 0) {
          this.$toast.error("아이피 항목을 선택하세요");
          return;
        }

        const ok = await this.$confirm("권한을 저장하시겠습니까?", "확인");
        if (!ok) return;

        // 핵심: 선택된 ID/Index를 바탕으로 실제 데이터 객체들만 추출
        const payload = {
          user_id: this.selectedUser.id,
          // ipList에 실제 수정된 데이터(Object)들이 담깁니다.
          ipList: this.ipList.filter((item, index) =>
            this.selectedRows.includes(item.id || index),
          ),
        };

        await api.post("/api/user/ip/batchSave", payload);

        this.$toast.success("아이피 정보가 저장되었습니다");
        this.selectedRows = [];
        this.loadUserIps(this.selectedUser.id);
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 아이피 삭제 처리
    // 아이피 삭제 처리 (서버 연동)
    async deleteSelected() {
      try {
        if (this.selectedRows.length === 0) return;

        const ok = await this.$confirm(
          `선택한 ${this.selectedRows.length}개의 항목을 서버에서 삭제하시겠습니까?`,
          "삭제 확인",
        );
        if (!ok) return;

        // 1. 삭제할 객체들 추출
        const deleteList = this.ipList.filter((item, index) =>
          this.selectedRows.includes(item.id || index),
        );

        // 2. 신규 추가된 로우(id가 null)는 서버에 갈 필요 없이 로컬에서만 제거
        const serverDeleteList = deleteList.filter((item) => item.id !== null);

        if (serverDeleteList.length > 0) {
          await api.post("/api/user/ip/batchDelete", {
            user_id: this.selectedUser.id,
            ipList: serverDeleteList,
          });
        }

        this.$toast.success("선택한 항목이 삭제되었습니다.");

        // 3. UI 갱신 (다시 불러오기)
        this.selectedRows = [];
        this.loadUserIps(this.selectedUser.id);
      } catch (e) {
        this.$toast.error("삭제 중 오류가 발생했습니다.");
      }
    },
  },
};
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

/* style scoped에 추가 */
@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 기존 animate-bounce 대신 커스텀을 쓰면 더 부드럽습니다 */
.animate-bounce {
  animation: bounce-subtle 3s infinite ease-in-out;
}
</style>
