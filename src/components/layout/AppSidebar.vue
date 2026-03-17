<template>
  <aside
    :class="[
      'bg-gray-900 text-gray-200 flex flex-col transition-all duration-300',
      open ? 'w-64' : 'w-16',
    ]"
  >
    <!-- Logo -->
    <div
      class="h-16 flex items-center justify-center border-b border-gray-800"
      :class="open ? 'px-6 justify-start' : ''"
    >
      <span class="text-lg font-semibold tracking-wide">
        <span v-if="open">자재관리</span>
        <span v-else>M</span>
      </span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-3 space-y-1">
      <div v-for="menu in menus" :key="menu.label">
        <!-- 부모 메뉴 -->
        <div
          v-if="!menu.to"
          class="menu cursor-pointer"
          @click.stop="toggle(menu)"
        >
          <i class="fa-solid" :class="menu.icon"></i>

          <span v-if="open" class="flex-1">
            {{ menu.label }}
          </span>

          <i
            v-if="menu.children && open"
            class="fa-solid fa-chevron-down text-xs transition-transform duration-200"
            :class="{ 'rotate-180': menu.open }"
          />
        </div>

        <!-- 일반 메뉴 -->
        <RouterLink v-if="menu.to" :to="menu.to" class="menu">
          <i class="fa-solid" :class="menu.icon"></i>
          <span v-if="open">{{ menu.label }}</span>
        </RouterLink>

        <!-- 하위 메뉴 -->
        <transition name="submenu">
          <div
            v-if="menu.children && menu.open && open"
            class="ml-8 mt-1 space-y-1"
          >
            <RouterLink
              v-for="sub in menu.children"
              :key="sub.to"
              :to="sub.to"
              class="submenu"
            >
              {{ sub.label }}
            </RouterLink>
          </div>
        </transition>
      </div>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    open: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      menus: [
        { to: "/", icon: "fa-chart-line", label: "대시보드" },
        {
          icon: "fa-box",
          label: "자재관리",
          open: false,
          children: [
            { to: "/materials", label: "자재목록" },
            { to: "/materials/print", label: "자재라벨" },
          ],
        },
        {
          icon: "fa-arrow-down",
          label: "입고관리",
          open: false,
          children: [
            { to: "/inbound", label: "입고목록" },
            { to: "/inbound/detail", label: "입고 세부내역" },
            { to: "/inbound/scan", label: "입고 스캔" },
          ],
        },
        {
          icon: "fa-arrow-up",
          label: "출고관리",
          open: false,
          children: [
            { to: "/outbound", label: "출고목록" },
            { to: "/outbound/detail", label: "출고 세부내역" },
            { to: "/outbound/scan", label: "출고 스캔" },
          ],
        },
        {
          icon: "fa-boxes-stacked",
          label: "재고관리",
          open: false,
          children: [
            { to: "/stock", label: "재고현황" },
            { to: "/stock/detail", label: "재고 변동 이력" },
            { to: "/stock/warehouse", label: "재고 위치 (창고)" },
            { to: "/stock/loctoin", label: "재고 위치 (선반)" },
          ],
        },
        {
          icon: "fa-warehouse",
          label: "창고관리",
          open: false,
          children: [
            { to: "/warehouse", label: "창고관리" },
            { to: "/warehouse/rack", label: "선반관리" },
          ],
        },
        {
          icon: "fa-chart-line",
          label: "통계",
          open: false,
          children: [
            { to: "/statistics/inbound", label: "입고 통계" },
            { to: "/statistics/outbound", label: "출고 통계" },
            { to: "/statistics/stock", label: "재고 통계" },
          ],
        },

        { to: "/notification", icon: "fa-bell", label: "알림" },
        { to: "/setting", icon: "fa-gear", label: "환경설정" },
        { to: "/user", icon: "fa-user", label: "계정관리" },
        { to: "/log", icon: "fa-clipboard-list", label: "로그" },
      ],
    };
  },

  methods: {
    toggle(menu: any) {
      if (menu.children) {
        menu.open = !menu.open;
      }
    },

    updateMenuOpen(path: string) {
      this.menus.forEach((menu: any) => {
        if (menu.children) {
          menu.open = menu.children.some((c: any) => path.startsWith(c.to));
        }
      });
    },
  },

  mounted() {
    this.updateMenuOpen(this.$route.path);
  },

  watch: {
    $route(to) {
      this.updateMenuOpen(to.path);
    },
  },
});
</script>

<style scoped>
.menu {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg
         text-sm text-gray-300
         transition-all duration-200 ease-out
         hover:bg-gray-800 hover:text-white;
}

.menu i {
  @apply w-5 text-center text-gray-400 transition-all duration-200;
}

.menu:hover i {
  @apply text-white scale-110;
}

.router-link-exact-active {
  @apply bg-gray-800 text-white font-semibold;
  position: relative;
  transition: all 0.25s ease;
}

.router-link-exact-active i {
  transform: scale(1.1);
}

.router-link-exact-active::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 6px;
  bottom: 6px;
  width: 4px;
  background: #3b82f6;
  border-radius: 4px;
}

.menu:active {
  transform: scale(0.97);
}

.menu:hover {
  transform: translateX(3px);
}

/* 하위 메뉴 */
.submenu {
  @apply block px-3 py-1.5 text-sm rounded-md
         text-gray-400
         hover:text-white hover:bg-gray-800
         transition-all duration-200;
}

.submenu.router-link-exact-active {
  @apply text-white bg-gray-800;
}

/* submenu 애니메이션 */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.25s ease;
}

.submenu-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.submenu-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.submenu-leave-from {
  opacity: 1;
}

.submenu-leave-to {
  opacity: 0;
}
</style>
