<template>
  <!-- 🔥 메인 카드 -->
  <div class="bg-white rounded-3xl shadow border overflow-hidden">
    <!-- 헤더 -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b bg-gray-50"
    >
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <i class="fa-solid fa-user-shield text-blue-500"></i>
        {{ user.name }} 권한 설정
      </h2>

      <button
        @click="save"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-sm"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        저장
      </button>
    </div>

    <!-- 컨텐츠 -->
    <div class="p-6 bg-gray-50">
      <div class="grid grid-cols-3 gap-6">
        <!-- 미보유 -->
        <div class="bg-white rounded-2xl shadow-sm border p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-600 flex items-center gap-2">
              <i class="fa-solid fa-circle-xmark text-gray-400"></i>
              미보유 권한
            </h3>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded">
              {{ unassigned.length }}
            </span>
          </div>

          <div class="space-y-2 max-h-[400px] overflow-y-auto">
            <!-- 리스트 -->
            <template v-if="unassigned.length">
              <div
                v-for="item in unassigned"
                :key="item.id"
                class="group p-3 bg-gray-50 border rounded-xl flex justify-between items-center hover:shadow hover:bg-white transition"
              >
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-lock text-gray-400 text-sm"></i>
                  <span class="text-sm">{{ item.description }}</span>
                </div>

                <button
                  @click="addPermission(item)"
                  class="opacity-0 group-hover:opacity-100 transition text-blue-500 hover:text-blue-700"
                >
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </template>

            <!-- 🔥 EMPTY -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div
                class="w-14 h-14 flex items-center justify-center rounded-full bg-green-50 mb-3"
              >
                <i class="fa-solid fa-circle-check text-green-500 text-xl"></i>
              </div>

              <div class="text-sm font-medium text-gray-700">
                모든 권한이 할당되었습니다
              </div>

              <div class="text-xs text-gray-400 mt-1">
                추가할 권한이 없습니다
              </div>
            </div>
          </div>
        </div>

        <!-- 중앙 -->
        <div class="flex flex-col justify-center items-center gap-4">
          <button
            @click="addAll"
            class="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105 transition"
          >
            <i class="fa-solid fa-angles-right"></i>
          </button>

          <button
            @click="removeAll"
            class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-400 hover:bg-gray-500 text-white shadow-lg hover:scale-105 transition"
          >
            <i class="fa-solid fa-angles-left"></i>
          </button>
        </div>

        <!-- 보유 -->
        <div class="bg-white rounded-2xl shadow-sm border p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-green-600 flex items-center gap-2">
              <i class="fa-solid fa-circle-check"></i>
              보유 권한
            </h3>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {{ assigned.length }}
            </span>
          </div>

          <div class="space-y-2 max-h-[400px] overflow-y-auto">
            <!-- 리스트 -->
            <template v-if="assigned.length">
              <div
                v-for="(item, index) in assigned"
                :key="item.id"
                class="group p-3 bg-green-50 border rounded-xl flex justify-between items-center hover:shadow hover:bg-white transition"
              >
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-unlock text-green-500 text-sm"></i>
                  <span class="text-sm font-medium">{{
                    item.description
                  }}</span>
                </div>

                <div
                  class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <button
                    @click="moveUp(index)"
                    class="text-gray-400 hover:text-black"
                  >
                    <i class="fa-solid fa-arrow-up"></i>
                  </button>

                  <button
                    @click="moveDown(index)"
                    class="text-gray-400 hover:text-black"
                  >
                    <i class="fa-solid fa-arrow-down"></i>
                  </button>

                  <button
                    @click="removePermission(item)"
                    class="text-red-400 hover:text-red-600"
                  >
                    <i class="fa-solid fa-arrow-left"></i>
                  </button>
                </div>
              </div>
            </template>

            <!-- 🔥 EMPTY -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div
                class="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 mb-3"
              >
                <i class="fa-solid fa-lock text-gray-400 text-xl"></i>
              </div>

              <div class="text-sm font-medium text-gray-700">
                권한이 없습니다
              </div>

              <div class="text-xs text-gray-400 mt-1">
                좌측에서 권한을 추가하세요
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  props: { user: Object },

  data() {
    return {
      // 보유 권한
      assigned: [],
      // 미보유 권한
      unassigned: [],

      all: [],
    };
  },

  watch: {
    user: {
      immediate: true,
      handler() {
        this.loadRoles();
      },
    },
  },

  methods: {
    loadPermissions() {
      const all = this.all;

      // 보유 권한 할당
      const assignedIds = [this.user.role_id];

      this.assigned = all.filter((p) => assignedIds.includes(p.id));
      this.unassigned = all.filter((p) => !assignedIds.includes(p.id));
    },

    addPermission(item) {
      this.assigned.push(item);
      this.unassigned = this.unassigned.filter((p) => p.id !== item.id);
    },

    removePermission(item) {
      this.unassigned.push(item);
      this.assigned = this.assigned.filter((p) => p.id !== item.id);
    },

    addAll() {
      this.assigned.push(...this.unassigned);
      this.unassigned = [];
    },

    removeAll() {
      this.unassigned.push(...this.assigned);
      this.assigned = [];
    },

    moveUp(index) {
      if (index === 0) return;
      [this.assigned[index - 1], this.assigned[index]] = [
        this.assigned[index],
        this.assigned[index - 1],
      ];
    },

    moveDown(index) {
      if (index === this.assigned.length - 1) return;
      [this.assigned[index + 1], this.assigned[index]] = [
        this.assigned[index],
        this.assigned[index + 1],
      ];
    },

    // 권한 적용 처리
    async save() {
      const payload = this.assigned;

      if (payload.length > 1) {
        this.$toast.error("계정은하나의 권한만 가질수 있습니다");
        return;
      }

      const ok = await this.$confirm(
        `선택한 권한을 계정에 적용 하시겠습니까?`,
        "권한 적용 확인",
      );
      if (!ok) return;

      const body = {
        user_id: this.user.id,
        role_id: payload[0].id,
      };

      console.log(body);

      try {
        await api.post("/api/user/setPermission", body);
        this.$toast.success("계정 권한이 적용되었습니다");
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 계정 권한 로드
    async loadRoles() {
      const res = await api.post("/api/role/list");
      this.all = res.data;
      this.loadPermissions();
    },
  },
};
</script>
