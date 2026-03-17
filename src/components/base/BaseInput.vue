<template>
  <div class="w-full">
    <!-- label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
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
      class="w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      :class="error ? 'border-red-500' : 'border-gray-300'"
    />

    <!-- error -->
    <p v-if="error" class="text-xs text-red-500 mt-1">
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
    updateValue(e: Event) {
      const target = e.target as HTMLInputElement;
      this.$emit("update:modelValue", target.value);
    },
  },
};
</script>
