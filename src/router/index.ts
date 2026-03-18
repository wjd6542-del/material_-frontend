import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

import RootLayout from "@/layouts/RootLayout.vue"
import MainLayout from "@/layouts/MainLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"



import DashboardPage from "@/pages/dashboard/DashboardPage.vue"
import MaterialListPage from "@/pages/material/MaterialListPage.vue"
import MaterialPrintPage from "@/pages/material/MaterialPrintPage.vue"


import InboundPage from "@/pages/inbound/InboundPage.vue"
import InboundDetailPage from "@/pages/inbound/InboundDetailPage.vue"
import InboundScanPage from "@/pages/inbound/InboundScanPage.vue"


import OutboundPage from "@/pages/outbound/OutboundPage.vue"
import OutboundDetailPage from "@/pages/outbound/OutboundDetailPage.vue"
import OutboundScanPage from "@/pages/outbound/OutboundScanPage.vue"


import StockPage from "@/pages/stock/StockPage.vue"
import StockDetailPage from "@/pages/stock/StockDetailPage.vue"
import StockWarehousePage from "@/pages/stock/StockWarehousePage.vue"
import StockLoctoinPage from "@/pages/stock/StockLoctoinPage.vue"



import SatisticsInboundPage from "@/pages/statistics/SatisticsInboundPage.vue"
import SatisticsOutboundPage from "@/pages/statistics/SatisticsOutboundPage.vue"
import SatisticsStockPage from "@/pages/statistics/SatisticsStockPage.vue"


import SettingPage from "@/pages/setting/SettingPage.vue"
import UserManagerPage from "@/pages/user/UserManagerPage.vue"
import UserManagerPermissionPage from "@/pages/user/UserManagerPermissionPage.vue"


import NotificationPage from "@/pages/notification/NotificationPage.vue"


import WarehousePage from "@/pages/warehouse/WarehousePage.vue"
import WarehouseDetailPage from "@/pages/warehouse/WarehouseDetailPage.vue"

import LogPage from "@/pages/log/LogPage.vue"



// 접속 미인증
import LoginPage from "@/pages/auth/LoginPage.vue"
import SignupPage from "@/pages/auth/SignupPage.vue"
import ForgotPassword from "@/pages/auth/ForgotPassword.vue"

const routes = [
	{
		path: "/",
		component: RootLayout,
		children: [
			{
				path: "",
				redirect: "/dashboard"
			},
			{
				path: "",
				component: MainLayout,
				children: [
					{
						path: "dashboard",
						component: DashboardPage,
						meta: { title: "대시보드", auth: true }
					},
					{
						path: "materials",
						component: MaterialListPage,
						meta: { title: "자재목록", auth: true }
					},

					{
						path: "materials/print",
						component: MaterialPrintPage,
						meta: { title: "자재라벨", auth: true }
					},


					{
						path: "inbound",
						component: InboundPage,
						meta: { title: "입고관리", auth: true }
					},
					{
						path: "inbound/detail",
						component: InboundDetailPage,
						meta: { title: "입고 세부내역", auth: true }
					},
					{
						path: "inbound/scan",
						component: InboundScanPage,
						meta: { title: "입고 스캔", auth: true }
					},
					{
						path: "outbound",
						component: OutboundPage,
						meta: { title: "출고목록", auth: true }
					},

					{
						path: "outbound/detail",
						component: OutboundDetailPage,
						meta: { title: "출고 세부내역", auth: true }
					},
					{
						path: "outbound/scan",
						component: OutboundScanPage,
						meta: { title: "출고 스캔", auth: true }
					},

					{
						path: "stock",
						component: StockPage,
						meta: { title: "재고현황", auth: true }
					},
					{
						path: "stock/detail",
						component: StockDetailPage,
						meta: { title: "재고 변동 이력", auth: true }
					},
					{
						path: "/stock/warehouse",
						component: StockWarehousePage,
						meta: { title: "재고 위치 (창고)", auth: true }
					},
					{
						path: "/stock/loctoin",
						component: StockLoctoinPage,
						meta: { title: "재고 위치 (선반)", auth: true }
					},
					{
						path: "statistics/inbound",
						component: SatisticsInboundPage,
						meta: { title: "입고통계", auth: true }
					},
					{
						path: "statistics/outbound",
						component: SatisticsOutboundPage,
						meta: { title: "출고통계", auth: true }
					},
					{
						path: "statistics/stock",
						component: SatisticsStockPage,
						meta: { title: "재고통계", auth: true }
					},


					{
						path: "setting",
						component: SettingPage,
						meta: { title: "환경설정", auth: true }
					},
					{
						path: "user",
						component: UserManagerPage,
						meta: { title: "계정관리", auth: true }
					},
					{
						path: "user/permission",
						component: UserManagerPermissionPage,
						meta: { title: "계정권한", auth: true }
					},
					{
						path: "warehouse",
						component: WarehousePage,
						meta: { title: "창고관리", auth: true }
					},
					{
						path: "warehouse/rack",
						component: WarehouseDetailPage,
						meta: { title: "선반관리", auth: true }
					},

					{
						path: "log",
						component: LogPage,
						meta: { title: "로그", auth: true }
					},

					{
						path: "notification",
						component: NotificationPage,
						meta: { title: "알림", auth: true }
					}
				]
			},
			{
				path: "",
				component: AuthLayout,
				children: [
					{
						path: "login",
						component: LoginPage
					},
					{
						path: "signup",
						component: SignupPage,
						meta: { title: "재고 관리" }
					},
					{
						path: "forgotPassword",
						component: ForgotPassword,
						meta: { title: "재고 관리" }
					}
				]
			}
		]
	}
]

export const router = createRouter({
	history: createWebHistory(),
	routes
})

router.beforeEach((to) => {

	const auth = useAuthStore()

	const token = auth.token || localStorage.getItem("token")

	// 로그인 필요한 페이지
	if (to.meta.auth && !token) {
		return "/login"
	}

	// 로그인 페이지 접근 차단
	if (token && to.path === "/login") {
		return "/dashboard"
	}

})

router.afterEach((to) => {
	const baseTitle = "자재관리 시스템";

	if (to.meta?.title) {
		document.title = `${baseTitle} | ${to.meta.title}`;
	} else {
		document.title = baseTitle;
	}
});