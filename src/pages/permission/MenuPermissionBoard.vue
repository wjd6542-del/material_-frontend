<template>
  <div class="bg-white rounded-3xl shadow border overflow-hidden">
    <!-- 헤더 -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b bg-gray-50"
    >
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <i class="fa-solid fa-user-shield text-blue-500"></i>
        {{ role.name }} 권한 설정
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
        <!-- ===================== 미보유 ===================== -->
        <div class="bg-white rounded-2xl shadow-sm border p-4">
          <div class="flex justify-between mb-3">
            <h3 class="font-semibold text-gray-600">미보유 권한</h3>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded">
              {{ filteredUnassigned.length }}
            </span>
          </div>

          <!-- 검색 + 전체 -->
          <div class="flex gap-2 mb-3">
            <div class="relative flex-1">
              <i
                class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400 text-sm"
              ></i>
              <input
                v-model="searchUnassigned"
                type="text"
                placeholder="권한명으로 검색"
                class="w-full pl-8 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              @click="addFiltered"
              :disabled="!filteredUnassigned.length"
              class="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40"
            >
              전체
            </button>
          </div>

          <!-- action 버튼 -->
          <div class="flex gap-2 mb-3 flex-wrap">
            <button
              v-for="action in actions"
              :key="action"
              @click="addByAction(action)"
              :disabled="getUnassignedCount(action) === 0"
              :class="[
                'px-2 py-1 text-xs rounded disabled:opacity-40',
                getActionMeta(action).color,
              ]"
            >
              {{ action.toUpperCase() }}
              ({{ getUnassignedCount(action) }})
            </button>
          </div>

          <!-- 리스트 -->
          <div
            v-if="filteredUnassigned.length"
            class="space-y-2 max-h-[400px] overflow-y-auto"
          >
            <div
              v-for="item in filteredUnassigned"
              :key="item.id"
              class="group p-3 bg-gray-50 border rounded-xl flex justify-between items-center hover:bg-white"
            >
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'flex items-center gap-1 px-2 py-1 text-xs rounded',
                    getActionMeta(item.action).color,
                  ]"
                >
                  <i :class="['fa-solid', getActionMeta(item.action).icon]"></i>
                </span>

                <span class="text-sm">{{ item.name }}</span>
              </div>

              <button
                @click="addPermission(item)"
                class="opacity-0 group-hover:opacity-100 transition text-blue-500"
              >
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- empty -->
          <div v-else class="text-center py-10 text-gray-400 text-sm">
            추가할 권한 없음
          </div>
        </div>

        <!-- 중앙 -->
        <div class="flex flex-col justify-center items-center gap-4">
          <button
            @click="addAll"
            class="w-12 h-12 rounded-full bg-blue-500 text-white hover:scale-105"
          >
            <i class="fa-solid fa-angles-right"></i>
          </button>

          <button
            @click="removeAll"
            class="w-12 h-12 rounded-full bg-gray-400 text-white hover:scale-105"
          >
            <i class="fa-solid fa-angles-left"></i>
          </button>
        </div>

        <!-- ===================== 보유 ===================== -->
        <div class="bg-white rounded-2xl shadow-sm border p-4">
          <div class="flex justify-between mb-3">
            <h3 class="font-semibold text-green-600">보유 권한</h3>
            <span class="text-xs bg-green-100 px-2 py-1 rounded">
              {{ filteredAssigned.length }}
            </span>
          </div>

          <!-- 검색 -->
          <div class="relative mb-3">
            <i
              class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400 text-sm"
            ></i>
            <input
              v-model="searchAssigned"
              type="text"
              placeholder="권한명으로 검색"
              class="w-full pl-8 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <!-- action 제거 -->
          <div class="flex gap-2 mb-3 flex-wrap">
            <button
              v-for="action in actions"
              :key="action"
              @click="removeByAction(action)"
              :disabled="getAssignedCount(action) === 0"
              :class="[
                'px-2 py-1 text-xs rounded disabled:opacity-40',
                getActionMeta(action).color,
              ]"
            >
              {{ action.toUpperCase() }}
              ({{ getAssignedCount(action) }})
            </button>
          </div>

          <!-- 리스트 -->
          <div
            v-if="filteredAssigned.length"
            class="space-y-2 max-h-[400px] overflow-y-auto"
          >
            <div
              v-for="item in filteredAssigned"
              :key="item.id"
              class="group p-3 bg-green-50 border rounded-xl flex justify-between items-center"
            >
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'flex items-center gap-1 px-2 py-1 text-xs rounded',
                    getActionMeta(item.action).color,
                  ]"
                >
                  <i :class="['fa-solid', getActionMeta(item.action).icon]"></i>
                </span>

                <span class="text-sm">{{ item.name }}</span>
              </div>

              <button @click="removePermission(item)" class="text-red-500">
                ←
              </button>
            </div>
          </div>

          <div v-else class="text-center py-10 text-gray-400 text-sm">
            권한 없음
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  props: {
    roleId: Number,
  },

  data() {
    return {
      role: "",
      assigned: [],
      unassigned: [],
      all: [],

      searchUnassigned: "",
      searchAssigned: "",
      actions: ["view", "create", "update", "delete"],
    };
  },

  computed: {
    filteredUnassigned() {
      if (!this.searchUnassigned) return this.unassigned;
      return this.unassigned.filter((p) =>
        p.name.toLowerCase().includes(this.searchUnassigned.toLowerCase()),
      );
    },

    filteredAssigned() {
      if (!this.searchAssigned) return this.assigned;
      return this.assigned.filter((p) =>
        p.name.toLowerCase().includes(this.searchAssigned.toLowerCase()),
      );
    },
  },

  watch: {
    roleId: {
      immediate: true,
      handler() {
        if (this.roleId) this.loadPermissions();
      },
    },
  },

  methods: {
    async loadPermissions() {
      const res = await api.post("/api/permission/list");

      const res_role = await api.post(`/api/role/${this.roleId}`, {
        id: this.roleId,
      });

      this.role = res_role.data;

      this.all = res.data;

      const assignedIds =
        this.role?.permissions?.map((p) => p.permission_id) || [];

      this.assigned = this.all.filter((p) => assignedIds.includes(p.id));
      this.unassigned = this.all.filter((p) => !assignedIds.includes(p.id));
    },

    getActionMeta(action) {
      const map = {
        view: { icon: "fa-eye", color: "bg-blue-100 text-blue-600" },
        create: { icon: "fa-plus", color: "bg-green-100 text-green-600" },
        update: { icon: "fa-pen", color: "bg-yellow-100 text-yellow-600" },
        delete: { icon: "fa-trash", color: "bg-red-100 text-red-600" },
      };
      return (
        map[action] || { icon: "fa-circle", color: "bg-gray-100 text-gray-500" }
      );
    },

    getUnassignedCount(action) {
      return this.unassigned.filter((p) => p.action === action).length;
    },

    getAssignedCount(action) {
      return this.assigned.filter((p) => p.action === action).length;
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

    addFiltered() {
      const list = this.filteredUnassigned;
      this.assigned.push(...list);
      const ids = list.map((p) => p.id);
      this.unassigned = this.unassigned.filter((p) => !ids.includes(p.id));
    },

    addByAction(action) {
      const list = this.unassigned.filter((p) => p.action === action);
      this.assigned.push(...list);
      const ids = list.map((p) => p.id);
      this.unassigned = this.unassigned.filter((p) => !ids.includes(p.id));
    },

    removeByAction(action) {
      const list = this.assigned.filter((p) => p.action === action);
      this.unassigned.push(...list);
      const ids = list.map((p) => p.id);
      this.assigned = this.assigned.filter((p) => !ids.includes(p.id));
    },

    async save() {
      const ok = await this.$confirm("권한을 저장하시겠습니까?", "확인");
      if (!ok) return;

      try {
        await api.post("/api/role/permissionSave", {
          role_id: this.roleId,
          permission_ids: this.assigned.map((p) => p.id),
        });

        this.$toast.success("권한 저장 완료");
        this.loadPermissions();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },
};
</script>
