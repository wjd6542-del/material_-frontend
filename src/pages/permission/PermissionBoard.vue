<template>
  <div class="p-1 bg-slate-50/50 rounded-3xl">
    <div
      class="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200"
          >
            <i class="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800">
              {{ user.name }}
              <span class="text-slate-400 font-medium ml-1">권한 설정</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <i class="fa-solid fa-info-circle"></i>
              사용자에게 할당할 시스템 접근 권한을 선택하세요. (최대 1개)
            </p>
          </div>
        </div>

        <button
          @click="save"
          class="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95"
        >
          <i class="fa-solid fa-floppy-disk group-hover:animate-pulse"></i>
          <span class="font-bold">설정 저장하기</span>
        </button>
      </div>

      <div class="p-8 bg-slate-50/30">
        <div class="grid grid-cols-[1fr,80px,1fr] gap-6 items-center">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span
                class="text-[12px] font-black text-slate-400 uppercase tracking-[0.1em]"
                >Available Permissions</span
              >
              <span
                class="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg"
              >
                {{ unassigned.length }}
              </span>
            </div>

            <div
              class="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 h-[500px] flex flex-col"
            >
              <div class="space-y-2 overflow-y-auto pr-1 custom-scroll">
                <div
                  v-for="item in unassigned"
                  :key="item.id"
                  @click="addPermission(item)"
                  class="group p-4 bg-slate-50 border border-transparent rounded-2xl flex justify-between items-center cursor-pointer hover:border-blue-200 hover:bg-blue-50/50 transition-all hover:translate-x-1"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-all shadow-sm"
                    >
                      <i class="fa-solid fa-lock-open text-xs"></i>
                    </div>
                    <div>
                      <span class="text-sm font-bold text-slate-700 block">{{
                        item.description
                      }}</span>
                      <span
                        class="text-[10px] text-slate-400 uppercase font-mono"
                        >{{ item.name || "ROLE_CODE" }}</span
                      >
                    </div>
                  </div>
                  <i
                    class="fa-solid fa-chevron-right text-slate-300 group-hover:text-blue-400 text-xs transition-transform group-hover:translate-x-1"
                  ></i>
                </div>

                <div
                  v-if="unassigned.length === 0"
                  class="flex flex-col items-center justify-center py-32 text-slate-300"
                >
                  <div
                    class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"
                  >
                    <i
                      class="fa-solid fa-circle-check text-3xl text-emerald-400"
                    ></i>
                  </div>
                  <p class="text-sm font-bold text-slate-400">
                    모든 권한이 할당됨
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col justify-center items-center gap-4">
            <button
              @click="addAll"
              class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all hover:-translate-y-1 active:scale-90"
            >
              <i class="fa-solid fa-angles-right"></i>
            </button>
            <button
              @click="removeAll"
              class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all hover:translate-y-1 active:scale-90"
            >
              <i class="fa-solid fa-angles-left"></i>
            </button>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span
                class="text-[12px] font-black text-blue-600 uppercase tracking-[0.1em]"
                >Assigned Role</span
              >
              <span
                :class="[
                  'text-xs font-bold px-2.5 py-1 rounded-lg transition-colors',
                  assigned.length > 1
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600',
                ]"
              >
                {{ assigned.length }} / 1
              </span>
            </div>

            <div
              :class="[
                'rounded-[24px] border-2 shadow-sm p-4 h-[500px] flex flex-col transition-all',
                assigned.length > 0
                  ? 'bg-blue-50/30 border-blue-100 shadow-blue-100/50'
                  : 'bg-white border-slate-200',
              ]"
            >
              <div class="space-y-3 overflow-y-auto pr-1 custom-scroll">
                <div
                  v-for="(item, index) in assigned"
                  :key="item.id"
                  class="group p-4 bg-white border border-blue-200 rounded-2xl flex justify-between items-center shadow-md shadow-blue-900/5 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200"
                    >
                      <i class="fa-solid fa-user-shield text-sm"></i>
                    </div>
                    <div>
                      <span class="text-sm font-black text-slate-800 block">{{
                        item.description
                      }}</span>
                      <span
                        class="text-[10px] text-blue-500 font-bold uppercase font-mono"
                        >ID: {{ item.id }}</span
                      >
                    </div>
                  </div>

                  <div
                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      @click="moveUp(index)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <i class="fa-solid fa-arrow-up text-[10px]"></i>
                    </button>
                    <button
                      @click="moveDown(index)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <i class="fa-solid fa-arrow-down text-[10px]"></i>
                    </button>
                    <button
                      @click="removePermission(item)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
                    >
                      <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>

                <div
                  v-if="assigned.length === 0"
                  class="flex flex-col items-center justify-center py-28 text-slate-300 border-2 border-dashed border-slate-100 rounded-[20px]"
                >
                  <div
                    class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"
                  >
                    <i class="fa-solid fa-fingerprint text-3xl"></i>
                  </div>
                  <p class="text-sm font-bold text-slate-400">
                    할당된 권한 없음
                  </p>
                  <p class="text-[11px] mt-1 text-slate-300">
                    왼쪽 리스트에서 선택해 주세요
                  </p>
                </div>

                <div
                  v-if="assigned.length > 1"
                  class="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 animate-headShake"
                >
                  <i
                    class="fa-solid fa-circle-exclamation text-red-500 text-sm mt-0.5"
                  ></i>
                  <div>
                    <p class="text-[12px] text-red-700 font-bold">
                      권한 할당 오류
                    </p>
                    <p class="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                      현재 <b>{{ assigned.length }}개</b>의 권한이
                      선택되었습니다. <br />계정당 <b>하나의 권한</b>만 할당
                      가능합니다.
                    </p>
                  </div>
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
  props: { user: Object },

  data() {
    return {
      assigned: [],
      unassigned: [],
      all: [],
      url: import.meta.env.VITE_API_URL,
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
      const assignedIds = [this.user.role_id];

      this.assigned = all.filter((p) => assignedIds.includes(p.id));
      this.unassigned = all.filter((p) => !assignedIds.includes(p.id));
    },

    addPermission(item) {
      // UX: 이미 하나가 있으면 추가를 막지는 않되 시각적으로 경고함 (또는 여기서 막을 수도 있음)
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
      const temp = [...this.assigned];
      [temp[index - 1], temp[index]] = [temp[index], temp[index - 1]];
      this.assigned = temp;
    },

    moveDown(index) {
      if (index === this.assigned.length - 1) return;
      const temp = [...this.assigned];
      [temp[index + 1], temp[index]] = [temp[index], temp[index + 1]];
      this.assigned = temp;
    },

    async save() {
      if (this.assigned.length === 0) {
        this.$toast.error("최소 하나의 권한을 선택해야 합니다.");
        return;
      }

      if (this.assigned.length > 1) {
        this.$toast.error("계정은 하나의 권한만 가질 수 있습니다.");
        return;
      }

      const ok = await this.$confirm(
        `[${this.assigned[0].description}] 권한을 계정에 적용하시겠습니까?`,
        "권한 적용 확인",
      );
      if (!ok) return;

      const body = {
        user_id: this.user.id,
        role_id: this.assigned[0].id,
      };

      try {
        await api.post("/api/user/setPermission", body);
        this.$toast.success("계정 권한이 성공적으로 적용되었습니다.");
        this.loadRoles();
      } catch (e) {
        this.$toast.error(e.message || "권한 적용 중 오류가 발생했습니다.");
      }
    },

    async loadRoles() {
      try {
        const res = await api.post("/api/role/list");
        this.all = res.data;
        this.loadPermissions();
      } catch (e) {
        console.error("Roles 로드 실패:", e);
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

/* 진동 애니메이션 (경고용) */
@keyframes headShake {
  0% {
    transform: translateX(0);
  }
  6.5% {
    transform: translateX(-6px) rotateY(-9deg);
  }
  18.5% {
    transform: translateX(5px) rotateY(7deg);
  }
  31.5% {
    transform: translateX(-3px) rotateY(-5deg);
  }
  43.5% {
    transform: translateX(2px) rotateY(3deg);
  }
  50% {
    transform: translateX(0);
  }
}
.animate-headShake {
  animation: headShake 0.6s ease-in-out;
}
</style>
