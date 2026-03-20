<template>
  <aside
    :class="[
      'bg-gray-900 text-gray-200 flex flex-col transition-all duration-300',
      open ? 'w-64' : 'w-16',
    ]"
  >
    <!-- Logo -->
    <div
      class="h-16 flex items-center border-b border-gray-800"
      :class="open ? 'px-6 justify-start' : 'justify-center'"
    >
      <span class="text-lg font-semibold tracking-wide">
        <span v-if="open">자재관리</span>
        <span v-else>M</span>
      </span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-3 space-y-1">
      <div v-for="menu in menus" :key="menu.label" class="relative group">
        <!-- 1. 부모 메뉴 (하위 메뉴가 있는 경우) -->
        <div
          v-if="menu.children && hasAnyChildPermission(menu)"
          class="menu cursor-pointer"
          :class="{ 'active-menu': isParentActive(menu) }"
          @click.stop="toggle(menu)"
        >
          <i class="fa-solid" :class="menu.icon"></i>
          <span v-if="open" class="flex-1">{{ menu.label }}</span>
          <i
            v-if="menu.children && open"
            class="fa-solid fa-chevron-down text-xs transition-transform duration-200"
            :class="{ 'rotate-180': menu.open }"
          />
        </div>

        <!-- 2. 단일 메뉴 (대시보드, 알림 등) -->
        <RouterLink
          v-else-if="
            menu.to && (!menu.permission || hasPermission(menu.permission))
          "
          :to="menu.to"
          class="menu"
          :class="{ 'active-menu': isActive(menu.to) }"
        >
          <i class="fa-solid" :class="menu.icon"></i>
          <span v-if="open">{{ menu.label }}</span>
        </RouterLink>

        <!-- 사이드바 열림: 서브메뉴 리스트 (Transition 적용) -->
        <transition name="submenu">
          <div
            v-if="
              open && menu.children && menu.open && hasAnyChildPermission(menu)
            "
            class="ml-8 mt-1 space-y-1"
          >
            <!-- v-for와 v-if 분리: template 태그 사용 -->
            <template v-for="sub in menu.children" :key="sub.to">
              <RouterLink
                v-if="!sub?.permission || hasPermission(sub?.permission)"
                :to="sub.to"
                class="submenu"
                :class="{ 'active-submenu': isActive(sub.to) }"
              >
                {{ sub.label }}
              </RouterLink>
            </template>
          </div>
        </transition>

        <!-- 사이드바 닫힘: 호버 팝업 -->
        <div
          v-if="!open && menu.children && hasAnyChildPermission(menu)"
          class="absolute left-10 top-0 z-50 group-hover:block hidden"
        >
          <div class="absolute left-[-16px] top-0 w-4 h-full"></div>
          <div
            class="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-2 min-w-[200px]"
          >
            <div
              class="px-3 py-2 text-xs text-gray-500 border-b border-gray-800 mb-1"
            >
              {{ menu.label }}
            </div>
            <!-- 팝업 내에서도 v-for와 v-if 분리 및 권한 체크 -->
            <template v-for="sub in menu.children" :key="sub.to">
              <RouterLink
                v-if="!sub?.permission || hasPermission(sub?.permission)"
                :to="sub.to"
                class="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md"
                :class="{ 'bg-blue-600 text-white': isActive(sub.to) }"
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
  },
  data() {
    return {
      menus: [
        {
          to: "/",
          icon: "fa-chart-line",
          label: "대시보드",
          permission: "dashboard.view",
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
              permission: "material.print",
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
              permission: "inbound.scan",
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
              permission: "outbound.scan",
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
          ],
        },
        {
          icon: "fa-boxes-stacked",
          label: "재고관리",
          open: false,
          children: [
            { to: "/stock", label: "재고현황", permission: "stock.view" },
            {
              to: "/stock/detail",
              label: "재고 변동 이력",
              permission: "stock.detail.view",
            },
            {
              to: "/stock/warehouse",
              label: "재고 위치 (창고)",
              permission: "stock.warehouse",
            },
            {
              to: "/stock/loctoin",
              label: "재고 위치 (선반)",
              permission: "stock.location",
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
              to: "/warehouse/rack",
              label: "선반관리",
              permission: "warehouse.rack",
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
    toggle(menu: any) {
      if (this.open) menu.open = !menu.open;
    },
    isActive(path: string) {
      return this.$route.path === path;
    },
    isParentActive(menu: any) {
      if (!menu.children) return false;
      return menu.children.some((sub: any) => this.isActive(sub.to));
    },
    updateMenuOpen(path: string) {
      this.menus.forEach((menu: any) => {
        if (menu.children) {
          if (menu.children.some((c: any) => c.to === path)) {
            menu.open = true;
          }
        }
      });
    },
    hasPermission(permission: string) {
      return useAuthStore().hasPermission(permission);
    },
    hasAnyChildPermission(menu: any) {
      if (!menu.children) return false;
      return menu.children.some(
        (sub: any) => !sub.permission || this.hasPermission(sub.permission),
      );
    },
  },
  mounted() {
    this.updateMenuOpen(this.$route.path);
  },
  watch: {
    "$route.path"(newPath) {
      this.updateMenuOpen(newPath);
    },
  },
});
</script>

<style scoped>
.menu {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg
         text-sm text-gray-400 cursor-pointer
         transition-all duration-200
         hover:bg-gray-800 hover:text-white;
}

.active-menu {
  @apply bg-gray-800 text-white font-bold;
  position: relative;
}

.active-menu::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 4px;
  @apply bg-blue-500 rounded-r-md;
}

.submenu {
  @apply block px-4 py-2 text-sm rounded-md
         text-gray-500 transition-colors
         hover:text-white hover:bg-gray-800;
}

.active-submenu {
  @apply text-blue-400 font-bold bg-gray-800/50;
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  max-height: 500px; /* 충분한 높이 확보 */
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
