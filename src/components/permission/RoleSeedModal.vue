<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div
          class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow"
        >
          <i class="fa-solid fa-user-shield"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold mb-3">역할 초기 셋팅</h2>
          <p class="text-xs text-slate-400">
            기본 역할 목록을 서버에 일괄 등록합니다.
          </p>
        </div>
      </div>

      <span
        class="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full"
      >
        총 {{ seeds.length }} 건
      </span>
    </div>

    <div
      class="max-h-[480px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100"
    >
      <div
        v-for="item in seeds"
        :key="item.name"
        class="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            :class="item.is_super ? 'bg-purple-500' : 'bg-emerald-500'"
          >
            <i class="fa-solid fa-user-shield text-xs"></i>
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-700 flex items-center gap-2">
              {{ item.description }}
              <span
                v-if="item.is_super"
                class="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full"
              >
                SUPER
              </span>
            </div>
            <div class="text-[11px] text-slate-400 font-mono">
              {{ item.name }}
            </div>
          </div>
        </div>
        <span class="text-[11px] text-slate-400 font-mono">
          sort: {{ item.sort }}
        </span>
      </div>

      <div
        v-if="seeds.length === 0"
        class="py-10 text-center text-sm text-slate-400"
      >
        등록할 역할이 없습니다.
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button
        @click="modal.closeModal()"
        class="btn"
      >
        취소
      </button>
      <button
        @click="save"
        :disabled="loading"
        class="btn btn-primary"
      >
        <i v-if="loading" class="fa-solid fa-spinner fa-spin text-[10px]"></i>
        <i v-else class="fa-solid fa-floppy-disk text-[10px]"></i>
        <span>{{ loading ? "저장 중..." : "일괄 저장" }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { useModalStore } from "@/stores/modal";
import { getSeedRoles } from "@/data/roles";
import api from "@/api/api";

export default {
  name: "RoleSeedModal",

  props: {
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),
      seeds: getSeedRoles(),
      loading: false,
    };
  },

  methods: {
    // 시드 역할을 서버에 일괄 저장한다
    // setting/Role.vue 의 batchSave 스키마와 동일한 필드 셋으로 전송한다
    async save() {
      const ok = await this.$confirm(
        `정의된 ${this.seeds.length}개의 역할을 서버에 일괄 등록하시겠습니까?`,
        "초기 셋팅 확인",
      );
      if (!ok) return;

      // 서버에 보낼 페이로드
      const rows = this.seeds.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        sort: s.sort,
        is_super: s.is_super,
      }));

      this.loading = true;
      try {
        await api.post("/api/role/batchSave", rows);
        this.$toast.success("역할 초기 셋팅이 완료되었습니다.");
        if (typeof this.onSaved === "function") this.onSaved();
        this.modal.closeModal();
      } catch (e) {
        this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
