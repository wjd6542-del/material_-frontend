<template>
  <div class="p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-base font-semibold text-slate-800">
          {{ title || "변경 이력" }}
        </h2>
        <span
          v-if="actionMeta"
          class="badge"
          :class="`badge-${actionMeta.variant}`"
        >
          <i class="fa-solid badge-icon" :class="actionMeta.icon"></i>
          {{ actionMeta.label }}
        </span>
      </div>
      <div class="flex items-center gap-3 text-xs text-slate-500">
        <span v-if="row?.target_type" class="font-mono">
          {{ row.target_type }}
        </span>
        <span v-if="row?.created_at">
          {{ formatDateTime(row.created_at) }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3 text-xs text-slate-500 mb-3">
      <div class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-200"></span>
        변경됨 ({{ changedCount }})
      </div>
      <div class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200"></span>
        추가됨 ({{ addedCount }})
      </div>
      <div class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 rounded-sm bg-rose-100 border border-rose-200"></span>
        삭제됨 ({{ removedCount }})
      </div>
      <label class="ml-auto inline-flex items-center gap-1.5 cursor-pointer select-none">
        <input v-model="onlyChanged" type="checkbox" class="accent-blue-600" />
        변경된 항목만 보기
      </label>
    </div>

    <div
      v-if="!hasAnyData"
      class="text-center py-10 text-slate-400 border border-dashed rounded-lg"
    >
      변경 이력 데이터가 없습니다.
    </div>

    <div
      v-else-if="diff.length === 0"
      class="grid grid-cols-2 gap-3 border border-slate-200 rounded-lg p-3 max-h-[500px] overflow-auto"
    >
      <div>
        <div class="text-[11px] font-bold text-slate-400 uppercase mb-1">이전</div>
        <pre class="bg-slate-50 text-xs rounded p-2 whitespace-pre-wrap break-all">{{ rawBefore || "—" }}</pre>
      </div>
      <div>
        <div class="text-[11px] font-bold text-slate-400 uppercase mb-1">이후</div>
        <pre class="bg-slate-50 text-xs rounded p-2 whitespace-pre-wrap break-all">{{ rawAfter || "—" }}</pre>
      </div>
    </div>

    <div v-else class="border border-slate-200 rounded-lg overflow-auto max-h-[500px]">
      <table class="w-full text-xs">
        <thead class="bg-slate-50 sticky top-0 z-10">
          <tr class="text-slate-600">
            <th class="th text-left w-1/4">필드</th>
            <th class="th text-left">이전</th>
            <th class="th text-left">이후</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="visibleDiff.length === 0">
            <td colspan="3" class="td text-center py-6 text-slate-400">
              표시할 항목이 없습니다.
            </td>
          </tr>
          <tr
            v-for="entry in visibleDiff"
            :key="entry.key"
            :class="rowClass(entry)"
            class="border-t border-slate-100"
          >
            <td class="td font-mono text-slate-600 whitespace-nowrap align-top">
              <i
                v-if="entry.status !== 'same'"
                class="fa-solid fa-circle-dot mr-1 text-[8px]"
                :class="iconColor(entry.status)"
              ></i>
              {{ entry.key }}
            </td>
            <td class="td text-slate-700 align-top break-all">
              <span
                v-if="entry.before === undefined"
                class="text-slate-300"
              >—</span>
              <span
                v-else
                :class="entry.status === 'changed' || entry.status === 'removed' ? 'line-through text-slate-400' : ''"
              >{{ formatValue(entry.before) }}</span>
            </td>
            <td class="td text-slate-700 align-top break-all">
              <span
                v-if="entry.after === undefined"
                class="text-slate-300"
              >—</span>
              <span
                v-else
                :class="entry.status === 'changed' || entry.status === 'added' ? 'font-semibold text-slate-900' : ''"
              >{{ formatValue(entry.after) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-end mt-4">
      <button class="btn" @click="modal.closeModal()">닫기</button>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { useModalStore } from "@/stores/modal";
import { formatDateTime } from "@/utils/date";

const ACTION_META = {
  CREATE: { variant: "info", icon: "fa-plus", label: "생성" },
  UPDATE: { variant: "warning", icon: "fa-pen", label: "수정" },
  DELETE: { variant: "error", icon: "fa-trash", label: "삭제" },
};

function parse(data) {
  if (data == null || data === "") return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export default {
  props: {
    title: String,
    row: Object,
    before: [Object, String],
    after: [Object, String],
  },

  data() {
    return {
      modal: useModalStore(),
      onlyChanged: false,
    };
  },

  computed: {
    actionMeta() {
      return ACTION_META[this.row?.action] || null;
    },
    parsedBefore() {
      return parse(this.before ?? this.row?.before_data);
    },
    parsedAfter() {
      return parse(this.after ?? this.row?.after_data);
    },
    diff() {
      const b = this.parsedBefore;
      const a = this.parsedAfter;

      // 객체가 아닐 경우 단일 row로 표현
      if (!isPlainObject(b) && !isPlainObject(a)) {
        if (b == null && a == null) return [];
        const same = JSON.stringify(b) === JSON.stringify(a);
        return [
          {
            key: "value",
            before: b,
            after: a,
            status: a == null ? "removed" : b == null ? "added" : same ? "same" : "changed",
          },
        ];
      }

      const beforeObj = isPlainObject(b) ? b : {};
      const afterObj = isPlainObject(a) ? a : {};
      const keys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]));

      return keys.map((key) => {
        const bv = beforeObj[key];
        const av = afterObj[key];
        const inB = key in beforeObj;
        const inA = key in afterObj;
        let status = "same";
        if (inB && !inA) status = "removed";
        else if (!inB && inA) status = "added";
        else if (JSON.stringify(bv) !== JSON.stringify(av)) status = "changed";
        return { key, before: bv, after: av, status };
      });
    },
    visibleDiff() {
      return this.onlyChanged
        ? this.diff.filter((r) => r.status !== "same")
        : this.diff;
    },
    rawBefore() {
      const v = this.parsedBefore;
      if (v == null) return "";
      return typeof v === "string" ? v : JSON.stringify(v, null, 2);
    },
    rawAfter() {
      const v = this.parsedAfter;
      if (v == null) return "";
      return typeof v === "string" ? v : JSON.stringify(v, null, 2);
    },
    hasAnyData() {
      return this.parsedBefore != null || this.parsedAfter != null;
    },
    changedCount() {
      return this.diff.filter((r) => r.status === "changed").length;
    },
    addedCount() {
      return this.diff.filter((r) => r.status === "added").length;
    },
    removedCount() {
      return this.diff.filter((r) => r.status === "removed").length;
    },
  },

  methods: {
    formatDateTime,
    formatValue(v) {
      if (v === null) return "null";
      if (v === undefined) return "";
      if (typeof v === "object") return JSON.stringify(v);
      if (typeof v === "boolean") return v ? "true" : "false";
      return String(v);
    },
    rowClass(row) {
      if (row.status === "changed") return "bg-amber-50/60";
      if (row.status === "added") return "bg-emerald-50/60";
      if (row.status === "removed") return "bg-rose-50/60";
      return "";
    },
    iconColor(status) {
      if (status === "changed") return "text-amber-500";
      if (status === "added") return "text-emerald-500";
      if (status === "removed") return "text-rose-500";
      return "text-slate-300";
    },
  },
};

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
</script>
