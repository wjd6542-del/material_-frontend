<template>
  <div ref="wrapper" class="relative w-full">
    <!-- 트리거 -->
    <div :class="triggerClasses" @click="toggle">
      <div class="flex-1 text-sm truncate">
        {{ selectedLabel || placeholder }}
      </div>

      <div class="flex items-center gap-2">
        <!-- 삭제 버튼 -->
        <button
          v-if="modelValue !== null && modelValue !== ''"
          @click.stop="clear"
          class="text-gray-400 hover:text-red-500 text-sm"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down text-xs transition-transform duration-200"
          :class="open ? 'rotate-180 text-blue-500' : 'text-gray-400'"
        ></i>
      </div>
    </div>

    <!-- 드롭다운 -->
    <div
      v-if="open"
      class="absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-[9999]"
    >
      <!-- 검색 영역 -->
      <div class="p-2 border-b">
        <input
          ref="searchInput"
          v-model="keyword"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 리스트 -->
      <div class="max-h-60 overflow-y-auto">
        <div
          v-for="item in filteredOptions"
          :key="item[valueKey]"
          class="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex justify-between"
          @click="select(item)"
        >
          <span>
            <i v-if="item.icon" :class="item.icon"></i>
            {{ item[labelKey] }}</span
          >

          <i
            v-if="item[valueKey] === modelValue"
            class="fa-solid fa-check text-blue-500 text-xs"
          ></i>
        </div>

        <div
          v-if="filteredOptions.length === 0"
          class="px-3 py-2 text-sm text-gray-400"
        >
          {{ emptyText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchSelect",
  inheritAttrs: false,

  props: {
    modelValue: [String, Number, null],
    options: { type: Array, required: true },
    labelKey: { type: String, default: "label" },
    valueKey: { type: String, default: "value" },

    // 🔥 부모에서 제어
    placeholder: {
      type: String,
      default: "선택하세요",
    },

    searchPlaceholder: {
      type: String,
      default: "검색...",
    },

    emptyText: {
      type: String,
      default: "검색 결과가 없습니다",
    },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      open: false,
      keyword: "",
    };
  },

  computed: {
    selectedLabel() {
      const found = this.options.find(
        (o) => o[this.valueKey] === this.modelValue,
      );
      return found ? found[this.labelKey] : "";
    },

    filteredOptions() {
      if (!this.keyword) return this.options;

      return this.options.filter((o) =>
        String(o[this.labelKey])
          .toLowerCase()
          .includes(this.keyword.toLowerCase()),
      );
    },

    triggerClasses() {
      return [
        "flex justify-between items-center px-3 py-2 rounded cursor-pointer transition-all",
        this.open
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border border-gray-300 hover:border-gray-400",
        this.$attrs.class,
      ];
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside, true);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  },

  methods: {
    toggle() {
      this.open = !this.open;
      this.keyword = "";

      this.$nextTick(() => {
        if (this.open && this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },

    select(item) {
      const value = item[this.valueKey];
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
      this.open = false;
      this.keyword = "";
    },

    clear() {
      this.$emit("update:modelValue", "");
      this.$emit("change", "");
      this.open = false;
    },

    handleClickOutside(e) {
      if (!this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },
  },
};
</script>
