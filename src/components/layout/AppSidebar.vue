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
      class="h-16 flex items-center shrink-0 border-b border-gray-800/50 bg-[#0f1117]"
      :class="open ? 'px-5 justify-between' : 'justify-center'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0 text-base"
        >
          W
        </div>

        <div v-if="open" class="flex items-baseline overflow-hidden shrink-0">
          <span
            class="text-[25px] font-black text-white tracking-tighter uppercase"
          >
            WMS
          </span>
          <span
            class="ml-1 text-[15px] font-bold text-blue-500 tracking-tight uppercase self-end mb-[2px]"
          >
            PRO
          </span>
        </div>
      </div>

      <!-- 모바일: 사이드바 닫기 버튼 -->
      <button
        v-if="isMobile && open"
        class="text-gray-400 hover:text-white p-1"
        @click="$emit('close')"
      >
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <!-- Menu Section -->
    <nav
      class="flex-1 p-3 space-y-1 custom-scrollbar"
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
            class="fa-solid w-6 text-center text-lg shrink-0 transition-colors"
            :class="[
              menu.icon,
              isParentActive(menu)
                ? 'text-blue-500'
                : 'text-gray-400 group-hover:text-white',
            ]"
          >
          </i>
          <span
            v-if="open"
            class="flex-1 ml-2 text-[14px] font-medium truncate"
            >{{ menu.label }}</span
          >
          <i
            v-if="menu.children && open"
            class="fa-solid fa-chevron-down text-[10px] transition-transform opacity-50"
            :class="{ 'rotate-180': menu.open }"
          />
        </div>

        <!-- [Case 2] 단일 메뉴 -->
        <RouterLink
          v-else-if="
            menu.to && (!menu.permission || hasPermission(menu.permission))
          "
          :to="menu.to"
          class="menu-item group"
          :class="{ 'active-link': isActive(menu.to) }"
          @click="isMobile && $emit('close')"
        >
          <i
            class="fa-solid w-6 text-center text-lg shrink-0 transition-colors"
            :class="[
              menu.icon,
              isActive(menu.to)
                ? 'text-white'
                : 'text-gray-400 group-hover:text-white',
            ]"
          >
          </i>
          <span v-if="open" class="ml-2 text-[14px] font-medium truncate">{{
            menu.label
          }}</span>

          <div v-if="isActive(menu.to)" class="active-bar"></div>
        </RouterLink>

        <!-- 🔥 [열림상태] 서브메뉴 -->
        <transition name="submenu">
          <div
            v-if="
              open && menu.children && menu.open && hasAnyChildPermission(menu)
            "
            class="mt-1 ml-4 border-l border-gray-800 space-y-0.5"
          >
            <template v-for="sub in menu.children" :key="sub.to">
              <RouterLink
                v-if="!sub?.permission || hasPermission(sub?.permission)"
                :to="sub.to"
                class="sub-item"
                :class="{ 'active-sub': isActive(sub.to) }"
                @click="isMobile && $emit('close')"
              >
                {{ sub.label }}
              </RouterLink>
            </template>
          </div>
        </transition>

        <!-- 🔥 [닫힘상태] 호버 팝업 메뉴 (데스크탑 전용) -->
        <div
          v-if="
            !open && !isMobile && menu.children && hasAnyChildPermission(menu)
          "
          class="absolute left-full top-0 ml-2 z-[100] hidden group-hover:block"
        >
          <div class="absolute left-[-12px] top-0 w-[12px] h-full"></div>
          <div
            class="bg-[#1a1d24] border border-gray-700 rounded-lg shadow-2xl min-w-[170px] py-2 overflow-hidden"
          >
            <div
              class="px-4 py-1.5 text-[10px] text-gray-500 font-bold border-b border-gray-800/50 mb-1 uppercase tracking-widest"
            >
              {{ menu.label }}
            </div>
            <template v-for="sub in menu.children" :key="sub.to">
              <RouterLink
                v-if="!sub?.permission || hasPermission(sub?.permission)"
                :to="sub.to"
                class="block px-4 py-2 text-[13px] transition-colors"
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

<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth";

export default defineComponent({
  props: {
    open: { type: Boolean, default: true },
    isMobile: { type: Boolean, default: false },
  },

  emits: ["close"],

  data() {
    return {
      menus: [
        {
          to: "/dashboard",
          icon: "fa-chart-line",
          label: "대시보드",
          permission: "dashboard.view",
        },
        {
          icon: "fa-clipboard-list",
          label: "발주관리",
          open: false,
          children: [
            {
              to: "/purchaseorder",
              label: "발주 목록",
              permission: "purchaseorder.view",
            },
            {
              to: "/purchaseorder/detail",
              label: "발주 세부내역",
              permission: "purchaseorder.detail.view",
            },
            {
              to: "/purchaseorder/register",
              label: "발주 등록",
              permission: "purchaseorder.create",
            },
          ],
        },
        {
          icon: "fa-box",
          label: "자재관리",
          open: false,
          children: [
            {
              to: "/materials",
              label: "자재목록",
              permission: "material.view",
            },
            {
              to: "/materials/print",
              label: "자재라벨",
              permission: "material.print.view",
            },
            {
              to: "/materials/category",
              label: "자재 카테고리",
              permission: "material.category.view",
            },
            {
              to: "/materials/category/column",
              label: "자재 카테고리 (가로)",
              permission: "material.category.view",
            },
          ],
        },
        {
          icon: "fa-arrow-down",
          label: "입고관리",
          open: false,
          children: [
            { to: "/inbound", label: "입고목록", permission: "inbound.view" },
            {
              to: "/inbound/detail",
              label: "입고 세부내역",
              permission: "inbound.view",
            },
            {
              to: "/inbound/scan",
              label: "입고 스캔",
              permission: "inbound.scan.view",
            },
          ],
        },
        {
          icon: "fa-arrow-up",
          label: "출고관리",
          open: false,
          children: [
            { to: "/outbound", label: "출고목록", permission: "outbound.view" },
            {
              to: "/outbound/detail",
              label: "출고 세부내역",
              permission: "outbound.detail.view",
            },
            {
              to: "/outbound/scan",
              label: "출고 스캔",
              permission: "outbound.scan.view",
            },
          ],
        },
        {
          icon: "fa-rotate-left",
          label: "반품관리",
          open: false,
          children: [
            {
              to: "/returnorder",
              label: "반품목록",
              permission: "returnorder.view",
            },
            {
              to: "/returnorder/detail",
              label: "반품 세부내역",
              permission: "returnorder.detail.view",
            },
            {
              to: "/returnorder/scan",
              label: "반품 스캔",
              permission: "returnorder.scan.view",
            },
          ],
        },
        {
          icon: "fa-boxes-stacked",
          label: "재고관리",
          open: false,
          children: [
            { to: "/stock", label: "재고현황", permission: "stock.view" },
            {
              to: "/stock/move",
              label: "재고이동",
              permission: "stock.move.view",
            },
            {
              to: "/stock/detail",
              label: "재고 변동 이력",
              permission: "stock.detail.view",
            },
            {
              to: "/stock/change",
              label: "재고 흐름",
              permission: "stock.change.view",
            },
            {
              to: "/stock/warehouse",
              label: "재고 위치 (창고)",
              permission: "stock.warehouse.view",
            },
            {
              to: "/stock/location",
              label: "재고 위치 (위치)",
              permission: "stock.location.view",
            },
            {
              to: "/stock/shelf",
              label: "재고 위치 (선반)",
              permission: "stock.shelf.view",
            },
          ],
        },
        {
          icon: "fa-warehouse",
          label: "창고관리",
          open: false,
          children: [
            {
              to: "/warehouse",
              label: "창고관리",
              permission: "warehouse.view",
            },
            {
              to: "/warehouse/location",
              label: "위치관리",
              permission: "warehouse.location.view",
            },
            {
              to: "/warehouse/shelf",
              label: "선반관리",
              permission: "warehouse.shelf",
            },
          ],
        },
        {
          icon: "fa-chart-simple",
          label: "통계",
          open: false,
          children: [
            {
              to: "/statistics/inbound",
              label: "입고 통계",
              permission: "statistics.inbound",
            },
            {
              to: "/statistics/outbound",
              label: "출고 통계",
              permission: "statistics.outbound",
            },
            {
              to: "/statistics/return",
              label: "반품 통계",
              permission: "statistics.return",
            },
            {
              to: "/statistics/stock",
              label: "재고 통계",
              permission: "statistics.stock",
            },
          ],
        },
        {
          icon: "fa-user-shield",
          label: "권한관리",
          open: false,
          children: [
            {
              to: "/permission/user",
              label: "계정권한",
              permission: "permission.user",
            },
            {
              to: "/permission/menu",
              label: "메뉴권한",
              permission: "permission.menu",
            },
          ],
        },
        {
          icon: "fa-user",
          label: "계정관리",
          open: false,
          children: [
            { to: "/user", label: "계정목록", permission: "usermanager.view" },
            {
              to: "/user/ip",
              label: "계정 아이피",
              permission: "usermanager.ip",
            },
          ],
        },
        {
          to: "/business",
          icon: "fa-building",
          label: "사업자 정보",
          permission: "business.view",
        },
        {
          to: "/notification",
          icon: "fa-bell",
          label: "알림",
          permission: "notification.view",
        },
        {
          to: "/setting",
          icon: "fa-gear",
          label: "환경설정",
          permission: "setting.view",
        },
        {
          to: "/log",
          icon: "fa-clipboard-list",
          label: "로그",
          permission: "logs.view",
        },
      ],
    };
  },
  methods: {
    // 부모 메뉴의 펼침 상태를 토글한다 (사이드바가 열려 있을 때만)
    toggle(menu: any) {
      if (this.open) menu.open = !menu.open;
    },
    // 주어진 경로가 현재 활성 라우트인지 판단한다
    isActive(path: string) {
      const currentPath = this.$route.path;
      if (path === "/dashboard" && currentPath === "/") return true;
      return currentPath === path;
    },
    // 부모 메뉴의 하위 중 활성 항목이 있는지 확인한다
    isParentActive(menu: any) {
      return menu.children?.some((sub: any) => this.isActive(sub.to));
    },
    // 현재 경로에 해당하는 부모 메뉴를 자동 펼침 처리한다
    updateMenuOpen(path: string) {
      this.menus.forEach((menu: any) => {
        if (menu.children?.some((c: any) => c.to === path)) menu.open = true;
      });
    },
    // auth 스토어로 특정 권한 보유 여부를 확인한다
    hasPermission(permission: string) {
      return useAuthStore().hasPermission(permission);
    },
    // 부모 메뉴의 자식 중 사용자가 볼 수 있는 항목이 하나라도 있는지 확인한다
    hasAnyChildPermission(menu: any) {
      return menu.children?.some(
        (sub: any) => !sub.permission || this.hasPermission(sub.permission),
      );
    },
  },
  // 마운트 시 현재 경로 기준으로 메뉴 펼침 상태를 초기화한다
  mounted() {
    this.updateMenuOpen(this.$route.path);
  },
  watch: {
    // 라우트 경로 변경 시 부모 메뉴 펼침 상태를 갱신한다
    "$route.path"(newPath) {
      this.updateMenuOpen(newPath);
    },
  },
});
</script>

<style scoped>
.menu-item {
  @apply relative flex items-center px-3 py-2.5 rounded-lg cursor-pointer
         text-gray-400 transition-all duration-150
         hover:bg-gray-800 hover:text-white;
}

.active-link {
  @apply bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40;
}

.active-parent-bg {
  @apply bg-gray-800/60 text-white;
}

.active-bar {
  @apply absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full;
}

.sub-item {
  @apply block pl-9 py-2 text-[13px] text-gray-500 hover:text-white transition-colors relative;
}

.active-sub {
  @apply text-blue-400 font-bold;
}
.active-sub::before {
  content: "";
  @apply absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-blue-500;
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
