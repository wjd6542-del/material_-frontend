<template>
  <div class="w-full">
    <!-- label -->
    <label v-if="label" class="block text-[11px] font-semibold text-slate-600 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- input -->
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="updateValue"
      class="w-full h-[30px] rounded-md border px-2.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      :class="error ? 'border-red-500' : 'border-gray-300'"
    />

    <!-- error -->
    <p v-if="error" class="text-[11px] text-red-500 mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: "BaseInput",
  props: {
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    error: String,
    type: {
      type: String,
      default: "text",
    },
    required: Boolean,
    disabled: Boolean,
  },
  emits: ["update:modelValue"],
  methods: {
    // input 변경 시 v-model 업데이트 이벤트를 emit한다
    updateValue(e: Event) {
      const target = e.target as HTMLInputElement;
      this.$emit("update:modelValue", target.value);
    },
  },
};
</script>
