<template>
  <div ref="wrapper" class="relative w-full">
    <!-- 라벨 -->
    <label
      v-if="label"
      class="mb-1 text-[11px] font-semibold text-slate-600 flex items-center gap-1"
    >
      {{ label }}
      <span
        v-if="selectedItems.length"
        class="text-[10px] text-blue-500 font-normal"
      >
        ({{ selectedItems.length }})
      </span>
    </label>

    <!-- 선택 영역 -->
    <div
      @click="toggle"
      class="border border-gray-300 rounded-md px-2 py-0.5 cursor-pointer flex items-center justify-between min-h-[30px] text-xs"
    >
      <!-- 선택 값 표시 -->
      <div class="flex flex-wrap gap-1 flex-1">
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="item[idKey]"
            class="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded"
          >
            <i v-if="item.icon" :class="item.icon"></i>
            {{ item[textKey] }}
            <button
              type="button"
              class="hover:text-red-200"
              @click.stop="removeItem(item[idKey])"
            >
              <i class="fa-solid fa-xmark text-[9px]"></i>
            </button>
          </span>
        </template>

        <span v-else class="text-gray-400 text-xs">
          {{ placeholder }}
        </span>
      </div>

      <!-- 우측 버튼 -->
      <div class="flex items-center gap-1 ml-1.5">
        <button
          v-if="selectedItems.length"
          @click.stop="clearAll"
          class="text-gray-400 hover:text-red-500 text-[10px]"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down text-[9px] transition-transform duration-200"
          :class="open ? 'rotate-180 text-blue-500' : 'text-gray-400'"
        ></i>
      </div>
    </div>

    <!-- 드롭다운 -->
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg"
    >
      <!-- 검색 -->
      <div class="p-2 bg-gray-50 border-b">
        <div class="relative">
          <i
            class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"
          ></i>
          <input
            ref="searchInput"
            v-model="keyword"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full h-[30px] text-xs border rounded-md pl-7 pr-7 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keydown.esc="open = false"
          />
          <button
            v-if="keyword"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-[10px]"
            @click="keyword = ''"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 액션 바 -->
      <div
        v-if="filteredItems.length"
        class="flex items-center justify-between px-3 py-1.5 border-b bg-gray-50 text-[11px] text-gray-600"
      >
        <span>
          {{ keyword ? `검색결과 ${filteredItems.length}건` : `전체 ${items.length}건` }}
        </span>
        <div class="flex gap-2">
          <button
            type="button"
            class="text-blue-600 hover:underline font-medium"
            @click="selectAllFiltered"
          >
            {{ keyword ? "검색결과 전체선택" : "전체선택" }}
          </button>
          <button
            type="button"
            class="text-gray-500 hover:underline font-medium"
            @click="clearFiltered"
          >
            해제
          </button>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="max-h-56 overflow-y-auto">
        <label
          v-for="item in filteredItems"
          :key="item[idKey]"
          class="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-blue-50 cursor-pointer"
        >
          <input
            type="checkbox"
            class="w-3.5 h-3.5"
            :checked="isChecked(item[idKey])"
            @change="toggleItem(item[idKey])"
          />

          <i v-if="item.icon" :class="item.icon"></i>

          <span class="flex-1" v-html="highlight(item[textKey])"></span>

          <span
            v-if="subTextKey && item[subTextKey]"
            class="text-[10px] text-gray-400"
            v-html="highlight(String(item[subTextKey]))"
          ></span>
        </label>

        <div
          v-if="!filteredItems.length && !canQuickAdd"
          class="text-center text-xs text-gray-400 py-5"
        >
          검색 결과 없음
        </div>

        <button
          v-if="canQuickAdd"
          type="button"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 border-t"
          @click="quickAdd"
        >
          <i class="fa-solid fa-plus text-[10px]"></i>
          <span>
            "<strong>{{ keyword.trim() }}</strong>" 추가
          </span>
        </button>
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
    searchPlaceholder: { type: String, default: "검색..." },
    items: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
    idKey: { type: String, default: "id" },
    textKey: { type: String, default: "name" },
    subTextKey: { type: String, default: "" },
    searchKeys: { type: Array, default: () => [] },
    creatable: { type: Boolean, default: false },
  },

  emits: ["update:modelValue", "change", "create"],

  data() {
    return {
      open: false,
      innerValue: [...this.modelValue],
      keyword: "",
    };
  },

  watch: {
    // 외부 modelValue 변경 시 내부 선택 배열을 동기화한다
    modelValue(val: any[]) {
      this.innerValue = [...val];
    },
    // 드롭다운 열림/닫힘에 따라 검색창 포커스와 키워드를 관리한다
    open(val: boolean) {
      if (val) {
        this.$nextTick(() => (this.$refs.searchInput as HTMLInputElement)?.focus());
      } else {
        this.keyword = "";
      }
    },
  },

  computed: {
    // 현재 선택된 아이템 객체 배열을 반환한다
    selectedItems(): any[] {
      return this.items.filter((item: any) =>
        this.innerValue.some((v: any) => v == item[this.idKey]),
      );
    },

    // 검색 대상 키 목록(중복 제거)을 반환한다
    searchTargets(): string[] {
      const keys: string[] = [
        this.textKey,
        ...(this.searchKeys as string[]),
      ];
      if (this.subTextKey) keys.push(this.subTextKey);
      return [...new Set(keys.filter(Boolean))];
    },

    // 키워드로 필터링한 아이템 목록을 반환한다
    filteredItems(): any[] {
      const kw = this.keyword.trim().toLowerCase();
      if (!kw) return this.items;

      return this.items.filter((item: any) =>
        this.searchTargets.some((key) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(kw),
        ),
      );
    },

    // 입력된 키워드가 기존 항목에 없어 추가 가능한지 여부를 반환한다
    canQuickAdd(): boolean {
      const kw = this.keyword.trim();
      if (!this.creatable || !kw) return false;
      return !this.items.some(
        (item: any) =>
          String(item[this.textKey] ?? "").toLowerCase() === kw.toLowerCase(),
      );
    },
  },

  // 마운트 시 외부 클릭 리스너를 등록한다
  mounted() {
    document.addEventListener("mousedown", this.handleClick);
  },

  // 언마운트 직전 외부 클릭 리스너를 제거한다
  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleClick);
  },

  methods: {
    // 드롭다운 열림 상태를 토글한다
    toggle() {
      this.open = !this.open;
    },

    // 외부 클릭 시 드롭다운을 닫는다
    handleClick(e: any) {
      if (!this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },

    // 특정 id가 현재 선택된 상태인지 확인한다
    isChecked(id: any): boolean {
      return this.innerValue.some((v: any) => v == id);
    },

    // 지정 id의 선택 상태를 토글한다
    toggleItem(id: any) {
      if (this.isChecked(id)) {
        this.innerValue = this.innerValue.filter((v: any) => v != id);
      } else {
        this.innerValue = [...this.innerValue, id];
      }
      this.emitChange();
    },

    // 변경 이벤트(v-model 업데이트 + change)를 emit한다
    emitChange() {
      this.$emit("update:modelValue", this.innerValue);
      this.$emit("change", this.innerValue);
    },

    // 선택된 모든 항목을 해제한다
    clearAll() {
      this.innerValue = [];
      this.emitChange();
    },

    // 지정 id 항목을 선택 배열에서 제거한다
    removeItem(id: any) {
      this.innerValue = this.innerValue.filter((v: any) => v !== id);
      this.emitChange();
    },

    // 현재 필터링된 아이템 전체를 선택에 추가한다
    selectAllFiltered() {
      const ids = this.filteredItems.map((i: any) => i[this.idKey]);
      const merged = [...new Set([...this.innerValue, ...ids])];
      this.innerValue = merged;
      this.emitChange();
    },

    // 현재 필터링된 아이템만 선택에서 해제한다
    clearFiltered() {
      const ids = this.filteredItems.map((i: any) => i[this.idKey]);
      this.innerValue = this.innerValue.filter(
        (v: any) => !ids.includes(v),
      );
      this.emitChange();
    },

    // 키워드로 새 항목 생성 요청을 emit하고 콜백으로 선택 반영한다
    quickAdd() {
      const name = this.keyword.trim();
      if (!name) return;
      this.$emit("create", {
        name,
        select: (id: any) => {
          if (id == null) return;
          if (!this.innerValue.includes(id)) {
            this.innerValue = [...this.innerValue, id];
            this.emitChange();
          }
          this.keyword = "";
        },
      });
    },

    // HTML 안전 인코딩 후 검색어를 하이라이트 태그로 감싼다
    highlight(text: string): string {
      const safe = String(text ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c] as string,
      );
      const kw = this.keyword.trim();
      if (!kw) return safe;
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return safe.replace(
        new RegExp(`(${escaped})`, "gi"),
        '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>',
      );
    },
  },
};
</script>
