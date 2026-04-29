<template>
  <div
    class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 p-6 md:p-8 mb-6"
  >
    <div
      class="absolute inset-0 opacity-10"
      style="
        background-image: radial-gradient(#fff 1px, transparent 1px);
        background-size: 18px 18px;
      "
    ></div>
    <div
      class="absolute -top-10 -right-10 w-48 h-48 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
      :class="accentBgClass"
    ></div>

    <div
      class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
        >
          <i :class="[icon, 'text-white text-xl']"></i>
        </div>
        <div>
          <div
            class="text-[11px] font-bold uppercase tracking-widest mb-1"
            :class="accentTextClass"
          >
            {{ subtitle }}
          </div>
          <h2
            class="text-xl md:text-2xl font-black text-white tracking-tight"
          >
            {{ title }}
          </h2>
          <p v-if="description" class="text-xs text-slate-400 mt-1">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="self-start md:self-center flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
const ACCENTS = {
  blue: { bg: "bg-blue-500", text: "text-blue-300" },
  teal: { bg: "bg-teal-500", text: "text-teal-300" },
  red: { bg: "bg-red-500", text: "text-red-300" },
  rose: { bg: "bg-rose-500", text: "text-rose-300" },
  orange: { bg: "bg-orange-500", text: "text-orange-300" },
  amber: { bg: "bg-amber-500", text: "text-amber-300" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-300" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-300" },
};

export default {
  name: "RegisterHeader",
  props: {
    icon: { type: String, required: true },
    subtitle: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    accent: {
      type: String,
      default: "blue",
      validator: (v) => Object.keys(ACCENTS).includes(v),
    },
  },
  computed: {
    accentBgClass() {
      return ACCENTS[this.accent]?.bg || ACCENTS.blue.bg;
    },
    accentTextClass() {
      return ACCENTS[this.accent]?.text || ACCENTS.blue.text;
    },
  },
};
</script>
