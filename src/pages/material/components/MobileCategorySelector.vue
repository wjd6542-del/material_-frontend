<template>
  <div class="mobile-header">
    <div class="mobile-header-inner relative">
      <label class="mobile-search-label">
        <i class="fa-solid fa-layer-group"></i> 카테고리 선택
      </label>
      <div class="relative">
        <input
          type="text"
          v-model="searchTerm"
          @focus="isOpen = true"
          placeholder="카테고리명을 입력하세요..."
          class="mobile-search-input"
        />
        <button
          v-if="selectedId || searchTerm"
          @click="reset"
          class="absolute right-10 top-3.5 text-slate-300 hover:text-red-400 transition-colors"
        >
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
        <i
          class="fa-solid fa-chevron-down absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-xs"
        ></i>
      </div>
      <ul v-if="isOpen" class="mobile-dropdown">
        <li
          v-for="cat in filtered"
          :key="cat.id"
          @click="select(cat)"
          class="mobile-dropdown-item"
          :class="{ active: selectedId === cat.id }"
        >
          <span>{{ cat.prefix }}{{ cat.name }}</span>
          <i
            v-if="selectedId === cat.id"
            class="fa-solid fa-check text-xs"
          ></i>
        </li>
        <li
          v-if="filtered.length === 0"
          class="p-4 text-center text-slate-400 text-sm"
        >
          결과가 없습니다.
        </li>
      </ul>
      <div
        v-if="isOpen"
        @click="isOpen = false"
        class="fixed inset-0 z-[90]"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MobileCategorySelector",
  props: {
    selectedId: { type: Number, default: null },
    categories: { type: Array, required: true },
    selectedName: { type: String, default: "" },
  },
  emits: ["select", "reset"],
  data() {
    return {
      searchTerm: "",
      isOpen: false,
    };
  },
  computed: {
    filtered() {
      if (!this.searchTerm) return this.categories;
      const q = this.searchTerm.toLowerCase();
      return this.categories.filter((c) => c.name.toLowerCase().includes(q));
    },
  },
  watch: {
    selectedName: {
      immediate: true,
      handler(v) {
        this.searchTerm = v || "";
      },
    },
  },
  methods: {
    select(cat) {
      this.searchTerm = cat.name;
      this.isOpen = false;
      this.$emit("select", cat.id);
    },
    reset() {
      this.searchTerm = "";
      this.isOpen = false;
      this.$emit("reset");
    },
  },
};
</script>

<style scoped>
.mobile-header {
  display: none;
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.mobile-search-label {
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.mobile-search-input {
  width: 100%;
  padding: 11px 36px 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #f8fafc;
}
.mobile-search-input:focus {
  border-color: #93c5fd;
  background: white;
}
.mobile-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 280px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.mobile-dropdown-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.1s;
}
.mobile-dropdown-item:hover {
  background: #f8fafc;
}
.mobile-dropdown-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .mobile-header {
    display: block;
    position: sticky;
    top: 0;
    z-index: 100;
  }
}
</style>
