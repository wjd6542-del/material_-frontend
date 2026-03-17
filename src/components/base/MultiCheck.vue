<template>
  <div ref="wrapper" class="relative w-full">
    <!-- 라벨 -->
    <label v-if="label" class="block mb-1 text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <!-- 선택 영역 -->
    <div
      @click="toggle"
      class="border rounded px-3 py-2 cursor-pointer flex items-center justify-between min-h-[42px]"
    >
      <!-- 선택 값 표시 -->
      <div class="flex flex-wrap gap-1 flex-1">
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="item[idKey]"
            class="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <i v-if="item.icon" :class="item.icon"></i>
            {{ item[textKey] }}
          </span>
        </template>

        <span v-else class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
      </div>

      <!-- 우측 버튼 -->
      <div class="flex items-center gap-2">
        <button
          v-if="selectedItems.length"
          @click.stop="clearAll"
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
      class="absolute z-50 mt-1 w-full bg-white border rounded shadow"
    >
      <!-- 검색 -->
      <div class="p-2 border-b">
        <input
          v-model="keyword"
          type="text"
          placeholder="검색..."
          class="w-full text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- 리스트 -->
      <div class="max-h-60 overflow-y-auto">
        <label
          v-for="item in filteredItems"
          :key="item[idKey]"
          class="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
        >
          <input
            type="checkbox"
            :value="item[idKey]"
            v-model="innerValue"
            @change="emitChange"
          />

          <i v-if="item.icon" :class="item.icon"></i>

          {{ item[textKey] }}
        </label>

        <div
          v-if="!filteredItems.length"
          class="text-center text-xs text-gray-400 py-3"
        >
          검색 결과 없음
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "MultiCheck",

  props: {
    label: String,
    placeholder: { type: String, default: "선택하세요." },
    items: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
    idKey: { type: String, default: "id" },
    textKey: { type: String, default: "name" },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      open: false,
      innerValue: [...this.modelValue],
      keyword: "",
    };
  },

  watch: {
    modelValue(val: any[]) {
      this.innerValue = [...val];
    },
  },

  computed: {
    selectedItems(): any[] {
      return this.items.filter((item: any) =>
        this.innerValue.includes(item[this.idKey]),
      );
    },

    filteredItems(): any[] {
      if (!this.keyword) return this.items;

      const keyword = this.keyword.toLowerCase();

      return this.items.filter((item: any) =>
        String(item[this.textKey]).toLowerCase().includes(keyword),
      );
    },
  },

  mounted() {
    document.addEventListener("mousedown", this.handleClick);
  },

  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleClick);
  },

  methods: {
    toggle() {
      this.open = !this.open;
    },

    handleClick(e: any) {
      if (!this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },

    emitChange() {
      this.$emit("update:modelValue", this.innerValue);
      this.$emit("change", this.innerValue);
    },

    clearAll() {
      this.innerValue = [];
      this.$emit("update:modelValue", []);
      this.$emit("change", []);
    },
  },
};
</script>
