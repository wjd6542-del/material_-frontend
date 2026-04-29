<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
      @click="onBackdropClick"
    >
      <div
        class="w-[380px] rounded-xl bg-white shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- 헤더 -->
        <div
          class="flex items-center gap-3 px-4 py-3 border-b"
          :class="theme.headerBg"
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            :class="theme.iconWrap"
          >
            <i :class="['fa-solid', theme.icon, 'text-white']"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="text-[10px] font-bold uppercase tracking-widest"
              :class="theme.label"
            >
              {{ variantLabel }}
            </div>
            <div class="text-sm font-bold text-slate-800 truncate">
              {{ title }}
            </div>
          </div>
        </div>

        <!-- 내용 -->
        <div class="px-4 py-4 text-[13px] text-slate-700 whitespace-pre-line">
          {{ message }}
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50/60">
          <button
            v-if="type === 'confirm'"
            class="h-[32px] px-4 rounded-md text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
            @click="emit('cancel')"
          >
            취소
          </button>
          <button
            class="h-[32px] px-4 rounded-md text-xs font-bold text-white shadow-sm"
            :class="theme.okBtn"
            @click="emit('ok')"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed } from "vue";

type Variant = "info" | "warning" | "danger";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    message?: string;
    type?: string;
    variant?: Variant;
  }>(),
  { variant: "info" },
);

const emit = defineEmits<{
  (e: "ok"): void;
  (e: "cancel"): void;
}>();

// variant 별 시각 메타데이터를 한 곳에서 관리
const VARIANT_THEMES: Record<Variant, {
  icon: string;
  iconWrap: string;
  headerBg: string;
  label: string;
  okBtn: string;
}> = {
  info: {
    icon: "fa-circle-info",
    iconWrap: "bg-blue-500 shadow-md shadow-blue-500/30",
    headerBg: "bg-blue-50/60",
    label: "text-blue-600",
    okBtn: "bg-blue-600 hover:bg-blue-700",
  },
  warning: {
    icon: "fa-triangle-exclamation",
    iconWrap: "bg-amber-500 shadow-md shadow-amber-500/30",
    headerBg: "bg-amber-50/60",
    label: "text-amber-600",
    okBtn: "bg-amber-600 hover:bg-amber-700",
  },
  danger: {
    icon: "fa-circle-exclamation",
    iconWrap: "bg-red-500 shadow-md shadow-red-500/30",
    headerBg: "bg-red-50/60",
    label: "text-red-600",
    okBtn: "bg-red-600 hover:bg-red-700",
  },
};

const theme = computed(() => VARIANT_THEMES[props.variant] || VARIANT_THEMES.info);

const variantLabel = computed(() => {
  if (props.variant === "danger") return "DANGER · 주의";
  if (props.variant === "warning") return "WARNING · 경고";
  return props.type === "confirm" ? "CONFIRM · 확인" : "INFO · 안내";
});

// 배경 클릭 시 confirm은 취소, alert는 확인으로 처리
function onBackdropClick() {
  if (props.type === "confirm") emit("cancel");
  else emit("ok");
}
</script>
