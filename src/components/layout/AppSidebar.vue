<template>
  <aside
    :class="[
      'h-screen bg-[#0f1117] text-gray-300 flex flex-col transition-all duration-300 border-r border-gray-800 shrink-0 z-50',
      isMobile ? 'fixed top-0 left-0' : 'sticky top-0',
      isMobile
        ? open
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full'
        : open
          ? 'w-64'
          : 'w-20',
    ]"
  >
    <!-- Logo Section -->
    <div
      class="h-14 flex items-center shrink-0 border-b border-gray-800/50 bg-[#0f1117]"
      :class="open ? 'px-4 justify-between' : 'justify-center'"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow shrink-0 text-sm"
        >
          W
        </div>

        <div v-if="open" class="flex items-baseline overflow-hidden shrink-0">
          <span class="text-[22px] font-black text-white tracking-tighter uppercase">
            WMS
          </span>
          <span
            class="ml-1 text-[13px] font-bold text-blue-500 tracking-tight uppercase self-end mb-[2px]"
          >
            PRO
          </span>
        </div>
      </div>

      <!-- 모바일: 사이드바 닫기 버튼 -->
      <button
        v-if="isMobile && open"
        class="text-gray-400 hover:text-white p-1"
        @click="emit('close')"
      >
        <i class="fa-solid fa-xmark text-base"></i>
      </button>
    </div>

    <!-- Menu Section -->
    <nav
      class="flex-1 px-2.5 py-2.5 space-y-0.5 custom-scrollbar"
      :class="open ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'"
    >
      <div v-for="menu in menus" :key="menu.label" class="relative group">
        <!-- [Case 1] 자식이 있는 부모 메뉴 -->
        <div
          v-if="menu.children && hasAnyChildPermission(menu)"
          class="menu-item group"
          :class="{ 'active-parent-bg': isParentActive(menu) }"
          @click.stop="toggle(menu)"
        >
          <i
            class="fa-solid w-5 text-center text-base shrink-0 transition-colors"
            :class="[
              menu.icon,
              isParentActive(menu)
                ? 'text-blue-500'
                : 'text-gray-400 group-hover:text-white',
            ]"
          ></i>
          <span
            v-if="open"
            class="flex-1 ml-2 text-[13px] font-medium truncate"
          >
            {{ menu.label }}
          </span>
          <i
            v-if="open"
            class="fa-solid fa-chevron-down text-[10px] transition-transform opacity-50"
            :class="{ 'rotate-180': menu.open }"
          />
        </div>

        <!-- [Case 2] 단일 메뉴 -->
        <RouterLink
          v-else-if="menu.to && (!menu.permission || hasPermission(menu.permission))"
          :to="menu.to"
          class="menu-item group"
          :class="{ 'active-link': isActive(menu.to) }"
          @click="isMobile && emit('close')"
        >
          <i
            class="fa-solid w-5 text-center text-base shrink-0 transition-colors"
            :class="[
              menu.icon,
              isActive(menu.to)
                ? 'text-white'
                : 'text-gray-400 group-hover:text-white',
            ]"
          ></i>
          <span v-if="open" class="ml-2 text-[13px] font-medium truncate">
            {{ menu.label }}
          </span>
          <div v-if="isActive(menu.to)" class="active-bar"></div>
        </RouterLink>

        <!-- [열림 상태] 하위 메뉴 -->
        <transition name="submenu">
          <div
            v-if="open && menu.children && menu.open && hasAnyChildPermission(menu)"
            class="mt-0.5 ml-3.5 border-l border-gray-800 space-y-0"
          >
            <template v-for="sub in menu.children" :key="sub.to">
              <RouterLink
                v-if="!sub?.permission || hasPermission(sub?.permission)"
                :to="sub.to"
                class="sub-item"
                :class="{ 'active-sub': isActive(sub.to) }"
                @click="isMobile && emit('close')"
              >
                {{ sub.label }}
              </RouterLink>
            </template>
          </div>
        </transition>

        <!-- [닫힘 상태] 호버 팝업 메뉴 (데스크탑 전용) -->
        <div
          v-if="!open && !isMobile && menu.children && hasAnyChildPermission(menu)"
          class="absolute left-full top-0 ml-2 z-[100] hidden group-hover:block"
        >
          <div class="absolute left-[-12px] top-0 w-[12px] h-full"></div>
          <div
            class="bg-[#1a1d24] border border-gray-700 rounded-lg shadow-2xl min-w-[160px] py-1.5 overflow-hidden"
          >
            <div
              class="px-3 py-1 text-[9px] text-gray-500 font-bold border-b border-gray-800/50 mb-0.5 uppercase tracking-widest"
            >
              {{ menu.label }}
            </div>
            <template v-for="sub in menu.children" :key="sub.to">
              <RouterLink
                v-if="!sub?.permission || hasPermission(sub?.permission)"
                :to="sub.to"
                class="block px-3 py-1.5 text-[12px] transition-colors"
                :class="
                  isActive(sub.to)
                    ? 'text-blue-400 bg-blue-500/10 font-bold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                "
              >
                {{ sub.label }}
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getMenuTree } from "@/data/permissions";

interface SubMenu {
  to: string;
  label: string;
  permission?: string;
}

interface Menu {
  icon: string;
  label: string;
  to?: string;
  permission?: string;
  open?: boolean;
  children?: SubMenu[];
}

defineProps<{
  open?: boolean;
  isMobile?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const route = useRoute();
const auth = useAuthStore();

// permissions 트리를 사이드바 메뉴 데이터 구조로 매핑
function buildMenus(): Menu[] {
  const toSub = (n: any): SubMenu => ({
    to: n.path,
    label: n.label,
    permission: n.permission,
  });

  return getMenuTree().map((n: any) => {
    if (n.children?.length) {
      return {
        icon: n.icon,
        label: n.label,
        open: false,
        children: n.children.map(toSub),
      };
    }
    return {
      icon: n.icon,
      to: n.path,
      label: n.label,
      permission: n.permission,
    };
  });
}

const menus = ref<Menu[]>(buildMenus());

// 부모 메뉴 펼침 토글 (사이드바 열린 상태에서만)
function toggle(menu: Menu) {
  if (menu.children) menu.open = !menu.open;
}

// 주어진 경로가 현재 활성 라우트인가
function isActive(path: string): boolean {
  if (path === "/dashboard" && route.path === "/") return true;
  return route.path === path;
}

// 부모 메뉴의 하위 중 활성 항목이 있는가
function isParentActive(menu: Menu): boolean {
  return menu.children?.some((sub) => isActive(sub.to)) || false;
}

// 권한 보유 여부 (auth 스토어 캐싱됨)
function hasPermission(code: string): boolean {
  return auth.hasPermission(code);
}

// 부모 메뉴의 자식 중 사용자가 볼 수 있는 항목이 하나라도 있는가
function hasAnyChildPermission(menu: Menu): boolean {
  return (
    menu.children?.some(
      (sub) => !sub.permission || hasPermission(sub.permission),
    ) || false
  );
}

// 현재 경로에 해당하는 부모 메뉴를 자동 펼침 처리
function updateMenuOpen(path: string) {
  menus.value.forEach((menu) => {
    if (menu.children?.some((c) => c.to === path)) menu.open = true;
  });
}

// 마운트 시 + 라우트 변경 시 부모 메뉴 펼침 갱신
watch(
  () => route.path,
  (newPath) => updateMenuOpen(newPath),
  { immediate: true },
);
</script>

<style scoped>
.menu-item {
  @apply relative flex items-center px-2.5 py-2 rounded-md cursor-pointer
         text-gray-400 transition-all duration-150
         hover:bg-gray-800 hover:text-white;
}

.active-link {
  @apply bg-blue-600 text-white font-bold shadow shadow-blue-900/40;
}

.active-parent-bg {
  @apply bg-gray-800/60 text-white;
}

.active-bar {
  @apply absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full;
}

.sub-item {
  @apply block pl-8 py-1.5 text-[12px] text-gray-500 hover:text-white transition-colors relative;
}

.active-sub {
  @apply text-blue-400 font-bold;
}
.active-sub::before {
  content: "";
  @apply absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-blue-500;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 10px;
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease-in-out;
  max-height: 500px;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
