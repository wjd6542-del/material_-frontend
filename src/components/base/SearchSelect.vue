<template>
  <div
    ref="wrapper"
    class="relative w-full"
    :style="{ zIndex: open ? 9999 : 1 }"
  >
    <!-- 트리거 -->
    <div :class="triggerClasses" @click="toggle">
      <div class="flex-1 truncate leading-none">
        {{ selectedLabel || placeholder }}
      </div>

      <div class="flex items-center gap-1 ml-1.5 h-full">
        <button
          v-if="modelValue !== null && modelValue !== ''"
          @click.stop="clear"
          class="text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center text-[10px]"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down transition-transform duration-200 flex items-center justify-center"
          :class="[
            open ? 'rotate-180 text-blue-500' : 'text-gray-400',
            isLargeSize ? 'text-xl' : 'text-[9px]',
          ]"
        ></i>
      </div>
    </div>

    <!-- 드롭다운: 트리거 바로 아래 강제 고정 -->
    <div
      v-if="open"
      class="absolute left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
      style="top: calc(100% + 4px); z-index: 9999"
    >
      <div class="p-2 bg-gray-50 border-b">
        <input
          ref="searchInput"
          v-model="keyword"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div class="max-h-56 overflow-y-auto">
        <div
          v-for="item in filteredOptions"
          :key="item[valueKey]"
          class="px-3 py-1.5 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors"
          @click="select(item)"
        >
          <span class="text-gray-700 group-hover:text-blue-700 font-medium">
            {{ item[labelKey] }}
          </span>
          <i
            v-if="item[valueKey] === modelValue"
            class="fa-solid fa-check text-blue-500 text-[10px]"
          ></i>
        </div>
        <div
          v-if="filteredOptions.length === 0"
          class="px-3 py-5 text-gray-400 text-center text-xs"
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
    placeholder: { type: String, default: "선택하세요" },
    searchPlaceholder: { type: String, default: "검색..." },
    emptyText: { type: String, default: "검색 결과가 없습니다" },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return { open: false, keyword: "" };
  },
  computed: {
    // 현재 선택된 옵션의 라벨을 반환한다
    selectedLabel() {
      const found = this.options.find(
        (o) => o[this.valueKey] === this.modelValue,
      );
      return found ? found[this.labelKey] : "";
    },
    // 키워드로 필터링된 옵션 목록을 반환한다
    filteredOptions() {
      if (!this.keyword) return this.options;
      return this.options.filter((o) =>
        String(o[this.labelKey])
          .toLowerCase()
          .includes(this.keyword.toLowerCase()),
      );
    },
    // 주입된 클래스에 큰 텍스트 크기가 포함됐는지 여부
    isLargeSize() {
      return /text-(xl|2xl|3xl|4xl)/.test(this.$attrs.class || "");
    },
    // 주입된 클래스 유무에 따라 트리거 버튼 클래스를 조립한다
    triggerClasses() {
      const parentClass = this.$attrs.class || "";

      const hasPadding = /p[xy]?-/.test(parentClass);
      const hasHeight = /h-/.test(parentClass);
      const hasBorder = /border/.test(parentClass);
      const hasRounded = /rounded/.test(parentClass);

      const hasText = /text-/.test(parentClass);

      return [
        "flex justify-between items-center cursor-pointer transition-all box-border relative",
        // 기본값 세팅 (주입된 클래스가 없을 때만)
        !hasHeight && !hasPadding && "h-[30px] px-2",
        !hasPadding && hasHeight && "px-2",
        !hasBorder && "border border-gray-300",
        !hasRounded && "rounded-md",
        !hasText && "text-xs",
        // 부모 주입 클래스
        parentClass,
        // 상태값
        this.open
          ? "ring-2 ring-blue-100 border-blue-500"
          : "hover:border-gray-400",
      ];
    },
  },
  methods: {
    // 드롭다운 열림 상태를 토글하고 검색창 포커스를 처리한다
    toggle() {
      this.open = !this.open;
      this.keyword = "";
      if (this.open) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) this.$refs.searchInput.focus();
        });
      }
    },
    // 옵션 선택 시 v-model을 업데이트하고 드롭다운을 닫는다
    select(item) {
      this.$emit("update:modelValue", item[this.valueKey]);
      this.$emit("change", item[this.valueKey]);
      this.open = false;
    },
    // 선택을 해제한다
    clear() {
      this.$emit("update:modelValue", "");
      this.$emit("change", "");
      this.open = false;
    },
    // 컴포넌트 외부 클릭 시 드롭다운을 닫는다
    handleClickOutside(e) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },
  },
  // 마운트 시 외부 클릭 리스너를 등록한다
  mounted() {
    document.addEventListener("click", this.handleClickOutside, true);
  },
  // 언마운트 직전 외부 클릭 리스너를 제거한다
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  },
};
</script>
