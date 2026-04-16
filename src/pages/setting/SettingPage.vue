<template>
  <div
    class="p-4 lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
  >
    <!-- 탭 헤더 -->
    <div class="flex border-b mb-4">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        @click="changeTab(tab.key, idx)"
        class="px-4 py-2 text-sm border-b-2 -mb-px transition"
        :class="
          activeTab === tab.key
            ? 'border-blue-500 text-blue-600 font-medium'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
      >
        <i :class="tab.icon" class="me-1"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- 탭 영역 -->
    <div class="relative min-h-[300px]">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" :key="activeTab" />
      </transition>
    </div>
  </div>
</template>

<script>
import { markRaw } from "vue";

import Setting from "@/components/setting/Setting.vue";
import Category from "@/components/setting/Category.vue";
import Supplier from "@/components/setting/Supplier.vue";
import Warehouse from "@/components/setting/Warehouse.vue";
import Role from "@/components/setting/Role.vue";
import Location from "@/components/setting/Location.vue";
import Permission from "@/components/setting/Permission.vue";
import Tag from "@/components/setting/Tag.vue";

/* 🔥 markRaw 로 컴포넌트 보호 */
const tabs = [
  {
    key: "setting",
    label: "설정",
    icon: "fa-solid fa-gear",
    component: markRaw(Setting),
  },
  {
    key: "amenities",
    label: "카테고리",
    icon: "fa-solid fa-folder",
    component: markRaw(Category),
  },
  {
    key: "tag",
    label: "자재 태그",
    icon: "fa-solid fa-tags",
    component: markRaw(Tag),
  },
  {
    key: "supplier",
    label: "거래처",
    icon: "fa-solid fa-building",
    component: markRaw(Supplier),
  },
  {
    key: "warehouse",
    label: "창고설정",
    icon: "fa-solid fa-warehouse",
    component: markRaw(Warehouse),
  },
  {
    key: "location",
    label: "선반설정",
    icon: "fa-solid fa-boxes-stacked",
    component: markRaw(Location),
  },
  {
    key: "role",
    label: "관리자 권한",
    icon: "fa-solid fa-shield-halved",
    component: markRaw(Role),
  },

  {
    key: "permission",
    label: "접근 권한",
    icon: "fa-solid fa-shield-halved",
    component: markRaw(Permission),
  },
];

export default {
  name: "SettingPage",

  data() {
    return {
      activeTab: "setting",
      activeIndex: 0,
    };
  },

  computed: {
    // 탭 메타 정의 배열을 반환한다
    tabs() {
      return tabs; // reactive 아님
    },
    // 현재 활성 탭에 해당하는 컴포넌트를 반환한다
    currentComponent() {
      return tabs.find((t) => t.key === this.activeTab)?.component;
    },
  },

  watch: {
    "$route.query.tab": {
      immediate: true,
      // URL 쿼리 tab 변경 시 활성 탭을 동기화한다
      handler(val) {
        const target = tabs.find((t) => t.key === val);
        if (target) {
          this.activeTab = target.key;
          this.activeIndex = tabs.indexOf(target);
        }
      },
    },
  },

  methods: {
    // 탭 클릭 시 활성 탭을 변경하고 쿼리 파라미터에 반영한다
    changeTab(key, newIndex) {
      if (this.activeTab === key) return;

      this.activeTab = key;
      this.activeIndex = newIndex;

      this.$router.push({
        query: {
          ...this.$route.query,
          tab: key,
        },
      });
    },
  },
};
</script>
