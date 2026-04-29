<template>
  <div class="flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)] gap-3 bg-gray-100">
    <!-- 좌측 Role 리스트 -->
    <div class="w-full lg:w-1/4 bg-white border-r flex flex-col rounded-3xl">
      <!-- 헤더 -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-shield-halved text-blue-500"></i>
            <h2 class="text-base font-semibold">권한 그룹</h2>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              @click="openRoleSeedModal"
              class="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
            >
              <i class="fa-solid fa-user-shield text-[11px]"></i>
              역할 셋팅
            </button>

            <button
              @click="openSeedModal"
              class="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
            >
              <i class="fa-solid fa-database text-[11px]"></i>
              권한 셋팅
            </button>
          </div>
        </div>

        <!-- 검색 -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="Role 검색..."
            class="field pl-9"
          />
          <i
            class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-sm"
          ></i>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          @click="selectRole(role)"
          class="group p-3 rounded-xl border cursor-pointer transition flex items-center gap-3"
          :class="
            selectedRole?.id === role.id
              ? 'bg-blue-500 text-white shadow-lg'
              : 'hover:bg-gray-50'
          "
        >
          <!-- 아이콘 -->
          <div
            class="w-10 h-10 flex items-center justify-center rounded-full font-semibold"
            :class="
              selectedRole?.id === role.id
                ? 'bg-white text-blue-500'
                : 'bg-blue-100 text-blue-600'
            "
          >
            <i class="fa-solid fa-user-shield"></i>
          </div>

          <!-- 정보 -->
          <div class="flex-1">
            <div class="text-sm font-semibold">
              {{ role.name }}
            </div>

            <div
              class="text-xs"
              :class="
                selectedRole?.id === role.id ? 'text-blue-100' : 'text-gray-400'
              "
            >
              {{ role.description || "설명 없음" }}
            </div>
          </div>

          <!-- 상태 -->
          <div class="flex flex-col items-end gap-1">
            <span
              class="text-[10px] px-2 py-0.5 rounded-full"
              :class="
                role.is_super
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              {{ role.is_super ? "관리자" : "일반" }}
            </span>

            <i
              class="fa-solid fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition"
            ></i>
          </div>
        </div>

        <!-- empty -->
        <div
          v-if="filteredRoles.length === 0"
          class="text-center text-gray-400 text-sm mt-10"
        >
          검색 결과 없음
        </div>
      </div>
    </div>

    <!-- 우측 권한 설정 -->
    <div class="flex-1 min-w-0">
      <transition name="page">
        <MenuPermissionBoard v-if="selectedRole" :role-id="selectedRole.id" />
      </transition>

      <!-- empty -->
      <div
        v-if="!selectedRole"
        class="flex-1 p-6 flex items-center justify-center"
      >
        <div
          class="bg-white border rounded-2xl shadow-sm p-10 text-center max-w-md w-full"
        >
          <div
            class="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-blue-50 mb-4"
          >
            <i class="fa-solid fa-shield text-2xl text-blue-500"></i>
          </div>

          <div class="text-lg font-semibold text-gray-700 mb-1">
            권한 그룹을 선택하세요
          </div>

          <div class="text-sm text-gray-400 mb-4">
            좌측 Role을 선택하면 권한을 설정할 수 있습니다
          </div>

          <div class="flex justify-center gap-2">
            <span
              class="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500"
            >
              Role 기반 권한 관리
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import MenuPermissionBoard from "./MenuPermissionBoard.vue";
import PermissionSeedModal from "@/components/permission/PermissionSeedModal.vue";
import RoleSeedModal from "@/components/permission/RoleSeedModal.vue";
import { useModalStore } from "@/stores/modal";
import api from "@/api/api";

export default {
  name: "MenuPermissionPage",
  components: { MenuPermissionBoard },

  data() {
    return {
      modal: useModalStore(),
      search: "",
      roles: [],
      selectedRole: null,
    };
  },

  // 마운트 시 역할 목록을 로드한다
  mounted() {
    this.loadRoles();
  },

  computed: {
    // 검색어로 필터링된 역할 목록을 반환한다
    filteredRoles() {
      if (!this.search) return this.roles;

      return this.roles.filter(
        (r) =>
          r.name.toLowerCase().includes(this.search.toLowerCase()) ||
          (r.description || "")
            .toLowerCase()
            .includes(this.search.toLowerCase()),
      );
    },
  },

  methods: {
    // 역할 목록을 로드한다
    async loadRoles() {
      const res = await api.post("/api/role/list");
      this.roles = res.data;
    },

    // 역할 선택 시 선택 상태를 갱신한다
    selectRole(role) {
      this.selectedRole = role;
    },

    // 권한 초기 셋팅 모달을 연다
    openSeedModal() {
      this.modal.openModal(
        PermissionSeedModal,
        { onSaved: this.loadRoles },
        "lg",
      );
    },

    // 역할 초기 셋팅 모달을 연다
    openRoleSeedModal() {
      this.modal.openModal(
        RoleSeedModal,
        { onSaved: this.loadRoles },
        "md",
      );
    },
  },
};
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.page-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
