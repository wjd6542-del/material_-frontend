<template>
  <div class="p-1 bg-slate-50/50 rounded-3xl">
    <div
      class="bg-white rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200"
          >
            <i class="fa-solid fa-key text-xl"></i>
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight">
              {{ role.name || "역할" }}
              <span class="text-slate-400 font-medium ml-1 text-lg"
                >권한 구성</span
              >
            </h2>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <i class="fa-solid fa-circle-info"></i>
              각 카테고리별 권한을 조합하여 역할의 접근 범위를 설정하세요.
            </p>
          </div>
        </div>

        <button
          @click="save"
          class="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <i class="fa-solid fa-floppy-disk group-hover:animate-pulse"></i>
          <span class="font-bold tracking-wide">변경사항 저장</span>
        </button>
      </div>

      <div class="p-8 bg-slate-50/30">
        <div class="grid grid-cols-[1fr,80px,1fr] gap-8 items-center">
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-2">
                <span
                  class="text-[12px] font-black text-slate-400 uppercase tracking-widest"
                  >Available</span
                >
                <span
                  class="text-[11px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                  >{{ filteredUnassigned.length }}</span
                >
              </div>
              <button
                @click="addFiltered"
                :disabled="!filteredUnassigned.length"
                class="text-[11px] font-bold text-indigo-600 hover:underline disabled:opacity-30"
              >
                필터 결과 전체 추가
              </button>
            </div>

            <div
              class="bg-white rounded-[28px] border border-slate-200 shadow-sm p-5 h-[600px] flex flex-col gap-4"
            >
              <div class="space-y-3">
                <div class="relative">
                  <i
                    class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"
                  ></i>
                  <input
                    v-model="searchUnassigned"
                    type="text"
                    placeholder="권한 명칭으로 검색..."
                    class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-600 placeholder:text-slate-400"
                  />
                </div>
                <div class="flex gap-1.5 flex-wrap">
                  <button
                    v-for="action in actions"
                    :key="action"
                    @click="addByAction(action)"
                    :disabled="getUnassignedCount(action) === 0"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 border disabled:opacity-20 shadow-sm',
                      getActionMeta(action).color,
                      getActionMeta(action).border,
                    ]"
                  >
                    <i
                      :class="[
                        'fa-solid text-[9px]',
                        getActionMeta(action).icon,
                      ]"
                    ></i>
                    {{ action }} ({{ getUnassignedCount(action) }})
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto pr-1 space-y-2 custom-scroll">
                <div
                  v-for="item in filteredUnassigned"
                  :key="item.id"
                  @click="addPermission(item)"
                  class="group p-3.5 bg-slate-50 border border-transparent rounded-2xl flex justify-between items-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/50 transition-all hover:translate-x-1"
                >
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110',
                        getActionMeta(item.action).bg,
                        getActionMeta(item.action).border,
                        getActionMeta(item.action).text,
                      ]"
                    >
                      <i
                        :class="[
                          'fa-solid text-xs',
                          getActionMeta(item.action).icon,
                        ]"
                      ></i>
                    </div>
                    <div>
                      <span
                        class="text-[13px] font-bold text-slate-700 block"
                        >{{ item.name }}</span
                      >
                      <span class="text-[10px] text-slate-400 font-medium">{{
                        item.action.toUpperCase()
                      }}</span>
                    </div>
                  </div>
                  <i
                    class="fa-solid fa-circle-plus text-slate-200 group-hover:text-indigo-500 text-lg transition-colors"
                  ></i>
                </div>

                <div
                  v-if="filteredUnassigned.length === 0"
                  class="flex flex-col items-center justify-center py-20 text-slate-300"
                >
                  <i
                    class="fa-solid fa-layer-group text-4xl mb-3 opacity-20"
                  ></i>
                  <p class="text-sm font-medium text-slate-400">
                    검색 결과가 없습니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col justify-center items-center gap-4 mt-12">
            <button
              @click="addAll"
              class="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:-translate-y-1 active:scale-90 transition-all"
            >
              <i class="fa-solid fa-angles-right"></i>
            </button>
            <button
              @click="removeAll"
              class="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-200 text-slate-500 hover:bg-slate-300 hover:-translate-y-1 active:scale-90 transition-all"
            >
              <i class="fa-solid fa-angles-left"></i>
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-2">
                <span
                  class="text-[12px] font-black text-emerald-600 uppercase tracking-widest"
                  >Assigned</span
                >
                <span
                  class="text-[11px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md"
                  >{{ filteredAssigned.length }}</span
                >
              </div>
              <span class="text-[11px] text-slate-400 italic font-medium"
                >Click to remove</span
              >
            </div>

            <div
              class="bg-white rounded-[28px] border-2 border-emerald-50 shadow-sm p-5 h-[600px] flex flex-col gap-4"
            >
              <div class="space-y-3">
                <div class="relative">
                  <i
                    class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"
                  ></i>
                  <input
                    v-model="searchAssigned"
                    type="text"
                    placeholder="보유 권한 내 검색..."
                    class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-slate-600 placeholder:text-slate-400"
                  />
                </div>
                <div class="flex gap-1.5 flex-wrap">
                  <button
                    v-for="action in actions"
                    :key="action"
                    @click="removeByAction(action)"
                    :disabled="getAssignedCount(action) === 0"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 border disabled:opacity-10 shadow-sm',
                      getActionMeta(action).color,
                      getActionMeta(action).border,
                    ]"
                  >
                    <i
                      :class="[
                        'fa-solid text-[9px]',
                        getActionMeta(action).icon,
                      ]"
                    ></i>
                    {{ action }} ({{ getAssignedCount(action) }})
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto pr-1 space-y-2 custom-scroll">
                <div
                  v-for="item in filteredAssigned"
                  :key="item.id"
                  @click="removePermission(item)"
                  class="group p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                >
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-emerald-900/5 transition-all group-hover:bg-red-500 group-hover:text-white group-hover:border-transparent',
                        getActionMeta(item.action).bg,
                        getActionMeta(item.action).text,
                        getActionMeta(item.action).border,
                      ]"
                    >
                      <i
                        :class="[
                          'fa-solid text-xs group-hover:hidden',
                          getActionMeta(item.action).icon,
                        ]"
                      ></i>
                      <i
                        class="fa-solid fa-minus text-xs hidden group-hover:block"
                      ></i>
                    </div>
                    <div>
                      <span
                        class="text-[13px] font-bold text-emerald-900 block group-hover:text-red-700 transition-colors"
                        >{{ item.name }}</span
                      >
                      <span
                        class="text-[10px] text-emerald-600/60 font-medium group-hover:text-red-400"
                        >{{ item.action.toUpperCase() }}</span
                      >
                    </div>
                  </div>
                  <i
                    class="fa-solid fa-circle-minus text-emerald-200 group-hover:text-red-400 text-lg transition-colors"
                  ></i>
                </div>

                <div
                  v-if="filteredAssigned.length === 0"
                  class="flex flex-col items-center justify-center py-28 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl mt-2"
                >
                  <div
                    class="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3"
                  >
                    <i class="fa-solid fa-shield-slash text-2xl"></i>
                  </div>
                  <p class="text-sm font-bold text-slate-400">
                    구성된 권한이 없습니다
                  </p>
                </div>
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
    // 검색어로 필터링된 미할당 권한 목록을 반환한다
    filteredUnassigned() {
      if (!this.searchUnassigned) return this.unassigned;
      const search = this.searchUnassigned.toLowerCase();
      return this.unassigned.filter((p) =>
        p.name.toLowerCase().includes(search),
      );
    },

    // 검색어로 필터링된 할당 권한 목록을 반환한다
    filteredAssigned() {
      if (!this.searchAssigned) return this.assigned;
      const search = this.searchAssigned.toLowerCase();
      return this.assigned.filter((p) => p.name.toLowerCase().includes(search));
    },
  },

  watch: {
    roleId: {
      immediate: true,
      // roleId 변경 시 권한 데이터를 재로드한다
      handler() {
        if (this.roleId) this.loadPermissions();
      },
    },
  },

  methods: {
    // 역할의 권한 정보와 전체 권한 목록을 로드하고 분리한다
    async loadPermissions() {
      try {
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
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      }
    },

    // action 종류별 아이콘/색상 메타 정보를 반환한다
    getActionMeta(action) {
      const map = {
        view: {
          icon: "fa-eye",
          text: "text-blue-600",
          bg: "bg-blue-50",
          color: "bg-blue-50 text-blue-600",
          border: "border-blue-100",
        },
        create: {
          icon: "fa-plus",
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          color: "bg-emerald-50 text-emerald-600",
          border: "border-emerald-100",
        },
        update: {
          icon: "fa-pen-to-square",
          text: "text-amber-600",
          bg: "bg-amber-50",
          color: "bg-amber-50 text-amber-600",
          border: "border-amber-100",
        },
        delete: {
          icon: "fa-trash-can",
          text: "text-rose-600",
          bg: "bg-rose-50",
          color: "bg-rose-50 text-rose-600",
          border: "border-rose-100",
        },
      };
      return (
        map[action] || {
          icon: "fa-cube",
          text: "text-slate-500",
          bg: "bg-slate-50",
          color: "bg-slate-50 text-slate-500",
          border: "border-slate-200",
        }
      );
    },

    // 특정 action의 미할당 권한 개수를 반환한다
    getUnassignedCount(action) {
      return this.unassigned.filter((p) => p.action === action).length;
    },

    // 특정 action의 할당 권한 개수를 반환한다
    getAssignedCount(action) {
      return this.assigned.filter((p) => p.action === action).length;
    },

    // 미할당 → 할당으로 단일 권한을 이동한다
    addPermission(item) {
      this.assigned.push(item);
      this.unassigned = this.unassigned.filter((p) => p.id !== item.id);
    },

    // 할당 → 미할당으로 단일 권한을 이동한다
    removePermission(item) {
      this.unassigned.push(item);
      this.assigned = this.assigned.filter((p) => p.id !== item.id);
    },

    // 미할당 전체를 할당으로 이동한다
    addAll() {
      this.assigned.push(...this.unassigned);
      this.unassigned = [];
    },

    // 할당 전체를 미할당으로 이동한다
    removeAll() {
      this.unassigned.push(...this.assigned);
      this.assigned = [];
    },

    // 검색 결과만 할당으로 이동한다
    addFiltered() {
      const list = [...this.filteredUnassigned];
      this.assigned.push(...list);
      const ids = list.map((p) => p.id);
      this.unassigned = this.unassigned.filter((p) => !ids.includes(p.id));
      this.searchUnassigned = "";
    },

    // 특정 action의 권한 전체를 할당으로 이동한다
    addByAction(action) {
      const list = this.unassigned.filter((p) => p.action === action);
      this.assigned.push(...list);
      const ids = list.map((p) => p.id);
      this.unassigned = this.unassigned.filter((p) => !ids.includes(p.id));
    },

    // 특정 action의 권한 전체를 미할당으로 이동한다
    removeByAction(action) {
      const list = this.assigned.filter((p) => p.action === action);
      this.unassigned.push(...list);
      const ids = list.map((p) => p.id);
      this.assigned = this.assigned.filter((p) => !ids.includes(p.id));
    },

    // 현재 할당된 권한 구성을 역할에 저장한다
    async save() {
      const ok = await this.$confirm(
        "현재 구성된 권한을 역할에 저장하시겠습니까?",
        "확인",
      );
      if (!ok) return;

      try {
        await api.post("/api/role/permissionSave", {
          role_id: this.roleId,
          permission_ids: this.assigned.map((p) => p.id),
        });

        this.$toast.success("권한 구성이 저장되었습니다.");
        this.loadPermissions();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
