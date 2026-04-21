<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div
          class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow"
        >
          <i class="fa-solid fa-database"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold mb-3">권한 초기 셋팅</h2>
          <p class="text-xs text-slate-400">
            정의된 권한 목록을 서버에 일괄 등록합니다.
          </p>
        </div>
      </div>

      <span
        class="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full"
      >
        총 {{ seeds.length }} 건
      </span>
    </div>

    <div class="flex items-center gap-2 mb-3">
      <div class="relative flex-1">
        <i
          class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"
        ></i>
        <input
          v-model="search"
          placeholder="권한명 / 코드 검색..."
          class="field pl-9"
        />
      </div>
      <select
        v-model="filterAction"
        class="field w-auto"
      >
        <option value="">전체 Action</option>
        <option v-for="a in actionOptions" :key="a" :value="a">
          {{ a.toUpperCase() }}
        </option>
      </select>
    </div>

    <div
      class="max-h-[480px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100"
    >
      <template v-for="g in filteredGroups" :key="g.group">
        <div
          class="sticky top-0 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider"
        >
          {{ g.label }} ({{ g.items.length }})
        </div>
        <div
          v-for="item in g.items"
          :key="item.code"
          class="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50"
        >
          <div class="flex items-center gap-3">
            <span
              class="text-[10px] font-black uppercase px-2 py-0.5 rounded border"
              :class="actionBadge(item.action)"
            >
              {{ item.action }}
            </span>
            <div>
              <div class="text-sm font-semibold text-slate-700">
                {{ item.name }}
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                {{ item.code }}
              </div>
            </div>
          </div>
          <span
            v-if="item.path"
            class="text-[11px] text-slate-400 font-mono truncate max-w-[160px]"
          >
            {{ item.path }}
          </span>
        </div>
      </template>

      <div
        v-if="filteredGroups.length === 0"
        class="py-10 text-center text-sm text-slate-400"
      >
        검색 결과가 없습니다.
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
import { getSeedPermissions } from "@/data/permissions";
import api from "@/api/api";

export default {
  name: "PermissionSeedModal",

  props: {
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),
      seeds: getSeedPermissions(),
      search: "",
      filterAction: "",
      loading: false,
    };
  },

  computed: {
    // 사용 중인 action 목록
    actionOptions() {
      const set = new Set(this.seeds.map((s) => s.action));
      return Array.from(set);
    },

    // 검색/필터가 반영된 그룹별 목록
    filteredGroups() {
      const kw = this.search.trim().toLowerCase();
      const action = this.filterAction;

      const filtered = this.seeds.filter((s) => {
        if (action && s.action !== action) return false;
        if (!kw) return true;
        return (
          s.code.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw)
        );
      });

      const groupMap = new Map();
      for (const s of filtered) {
        if (!groupMap.has(s.group)) {
          groupMap.set(s.group, {
            group: s.group,
            label: s.groupLabel || s.group,
            items: [],
          });
        }
        groupMap.get(s.group).items.push(s);
      }
      return Array.from(groupMap.values());
    },
  },

  methods: {
    // action 종류별 뱃지 색상
    actionBadge(action) {
      const map = {
        view: "bg-blue-50 text-blue-600 border-blue-100",
        create: "bg-emerald-50 text-emerald-600 border-emerald-100",
        update: "bg-amber-50 text-amber-600 border-amber-100",
        delete: "bg-rose-50 text-rose-600 border-rose-100",
        print: "bg-purple-50 text-purple-600 border-purple-100",
        move: "bg-teal-50 text-teal-600 border-teal-100",
        read: "bg-sky-50 text-sky-600 border-sky-100",
      };
      return map[action] || "bg-slate-50 text-slate-500 border-slate-200";
    },

    // 시드 권한을 서버에 일괄 저장한다
    // setting/Permission.vue 의 batchSave 스키마와 동일한 필드 셋으로 전송한다
    async save() {
      const ok = await this.$confirm(
        `정의된 ${this.seeds.length}개의 권한을 서버에 일괄 등록하시겠습니까?`,
        "초기 셋팅 확인",
      );
      if (!ok) return;

      // 서버에 보낼 페이로드 (UI 전용 필드 제외)
      const rows = this.seeds.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        group: s.group,
        action: s.action,
        sort: s.sort,
      }));

      this.loading = true;
      try {
        await api.post("/api/permission/batchSave", rows);
        this.$toast.success("권한 초기 셋팅이 완료되었습니다.");
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
