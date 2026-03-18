<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 좌측 계정 리스트 -->
    <div class="w-1/4 bg-white border-r flex flex-col">
      <!-- 헤더 -->
      <div class="p-4 border-b">
        <div class="flex items-center gap-2 mb-3">
          <i class="fa-solid fa-users text-blue-500"></i>
          <h2 class="text-lg font-semibold">계정 목록</h2>
        </div>

        <!-- 검색 -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="계정 검색..."
            class="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <i
            class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-sm"
          ></i>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user)"
          class="group p-3 rounded-xl border cursor-pointer transition flex items-center gap-3"
          :class="
            selectedUser?.id === user.id
              ? 'bg-blue-500 text-white shadow-lg'
              : 'hover:bg-gray-50'
          "
        >
          <!-- 아바타 -->
          <div
            class="w-10 h-10 flex items-center justify-center rounded-full font-semibold"
            :class="
              selectedUser?.id === user.id
                ? 'bg-white text-blue-500'
                : 'bg-blue-100 text-blue-600'
            "
          >
            {{ user.name.charAt(0) }}
          </div>

          <!-- 정보 -->
          <div class="flex-1">
            <div class="text-sm font-semibold">
              {{ user.name }}
            </div>

            <div
              class="text-xs"
              :class="
                selectedUser?.id === user.id ? 'text-blue-100' : 'text-gray-400'
              "
            >
              {{ user.email }}
            </div>
          </div>

          <!-- 상태 -->
          <div class="flex flex-col items-end gap-1">
            <span
              class="text-[10px] px-2 py-0.5 rounded-full"
              :class="
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              {{ user.role === "admin" ? "관리자" : "사용자" }}
            </span>

            <!-- 화살표 -->
            <i
              class="fa-solid fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition"
            ></i>
          </div>
        </div>

        <!-- empty -->
        <div
          v-if="filteredUsers.length === 0"
          class="text-center text-gray-400 text-sm mt-10"
        >
          검색 결과 없음
        </div>
      </div>
    </div>

    <!-- 우측 권한 설정 -->
    <div class="flex-1 p-6">
      <div v-if="selectedUser">
        <!-- 🔥 핵심: 강제 리렌더 -->
        <PermissionBoard :key="selectedUser.id" :user="selectedUser" />
      </div>

      <div v-else class="text-gray-400 text-center mt-20">
        계정을 선택하세요
      </div>
    </div>
  </div>
</template>

<script>
import PermissionBoard from "./PermissionBoard.vue";

export default {
  components: { PermissionBoard },

  data() {
    return {
      search: "",
      users: [],
      selectedUser: null,
    };
  },

  mounted() {
    this.loadUsers();
  },

  computed: {
    filteredUsers() {
      if (!this.search) return this.users;

      return this.users.filter(
        (u) =>
          u.name.toLowerCase().includes(this.search.toLowerCase()) ||
          u.email.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
  },

  methods: {
    async loadUsers() {
      this.users = [
        { id: 1, name: "관리자", email: "admin@test.com" },
        { id: 2, name: "직원", email: "user@test.com" },
      ];
    },

    async selectUser(user) {
      // 🔥 기존 컴포넌트 완전 제거
      this.selectedUser = null;

      await this.$nextTick();

      this.selectedUser = user;
    },
  },
};
</script>
