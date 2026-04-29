<template>
  <div class="flex items-center gap-3" :class="{ 'mb-6': !$slots.actions, 'mb-4': $slots.actions }">
    <div class="relative shrink-0">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
        :class="iconWrapClass"
      >
        <i :class="[icon, 'text-white text-sm']"></i>
      </div>
      <span
        class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
      >
        {{ number }}
      </span>
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
        {{ title }}
      </h3>
      <p v-if="description" class="text-[11px] text-slate-400 mt-0.5">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="shrink-0 flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
const ACCENT_GRADIENTS = {
  blue: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20",
  teal: "bg-gradient-to-br from-teal-500 to-cyan-600 shadow-teal-500/20",
  red: "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20",
  rose: "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20",
  orange: "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20",
  indigo: "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20",
  emerald: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20",
};

export default {
  name: "SectionHeader",
  props: {
    number: { type: [String, Number], required: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    accent: { type: String, default: "blue" },
  },
  computed: {
    iconWrapClass() {
      return ACCENT_GRADIENTS[this.accent] || ACCENT_GRADIENTS.blue;
    },
  },
};
</script>
