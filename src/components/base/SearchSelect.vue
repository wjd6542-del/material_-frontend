<template>
  <div ref="wrapper" :class="['relative w-full', $attrs.class]">
    <!-- 트리거: 부모의 스타일을 triggerClasses와 합쳐서 적용 -->
    <div
      :class="[
        'flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-all border-2',
        open
          ? 'border-blue-500 ring-4 ring-blue-50'
          : 'border-gray-200 hover:border-gray-300',
        // 여기에 텍스트 크기나 굵기 등이 부모 클래스($attrs.class)로부터 자연스럽게 먹히도록 합니다.
      ]"
      @click="toggle"
    >
      <!-- 선택된 라벨: 부모가 지정한 텍스트 스타일이 잘 보이도록 함 -->
      <div class="flex-1 truncate pr-2">
        <span v-if="selectedLabel" class="text-gray-900 font-black">
          {{ selectedLabel }}
        </span>
        <span v-else class="text-gray-400 font-normal">
          {{ placeholder }}
        </span>
      </div>

      <div class="flex items-center gap-2 border-l pl-3 ml-1 border-gray-100">
        <!-- 삭제 버튼 -->
        <button
          v-if="modelValue !== null && modelValue !== ''"
          @click.stop="clear"
          class="text-gray-300 hover:text-red-500 transition-colors"
        >
          <i class="fa-solid fa-circle-xmark"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down text-xs transition-transform duration-300"
          :class="open ? 'rotate-180 text-blue-500' : 'text-gray-300'"
        ></i>
      </div>
    </div>

    <!-- 드롭다운: 디자인 개선 -->
    <transition name="fade-slide">
      <div
        v-if="open"
        class="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-[9999] overflow-hidden"
      >
        <!-- 검색 영역 -->
        <div class="p-3 bg-gray-50/50">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            ></i>
            <input
              ref="searchInput"
              v-model="keyword"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <!-- 리스트 -->
        <div class="max-h-64 overflow-y-auto custom-scrollbar">
          <div
            v-for="item in filteredOptions"
            :key="item[valueKey]"
            class="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
            @click="select(item)"
          >
            <span
              :class="{
                'text-blue-600 font-bold': item[valueKey] === modelValue,
              }"
            >
              {{ item[labelKey] }}
            </span>
            <i
              v-if="item[valueKey] === modelValue"
              class="fa-solid fa-check text-blue-500"
            ></i>
          </div>

          <div
            v-if="filteredOptions.length === 0"
            class="px-4 py-8 text-center text-gray-400"
          >
            <i class="fa-solid fa-inbox block text-2xl mb-2 opacity-20"></i>
            {{ emptyText }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* 드롭다운 애니메이션 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 스크롤바 디자인 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 10px;
}
</style>

<script>
export default {
  name: "SearchSelect",
  // 부모의 속성(class 등)이 트리거 div에 자동으로 붙지 않도록 설정
  inheritAttrs: false,

  props: {
    modelValue: [String, Number, null],
    options: { type: Array, required: true },
    labelKey: { type: String, default: "label" },
    valueKey: { type: String, default: "value" },
    placeholder: { type: String, default: "선택하세요" },
    searchPlaceholder: { type: String, default: "검색..." },
    emptyText: { type: String, default: "검색 결과가 없습니다" },
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
        // 기존에 여기서 $attrs.class를 더하던 부분을 제거하여 껍데기로 옮겼습니다.
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
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },
  },
};
</script>
