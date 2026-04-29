import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

import RootLayout from "@/layouts/RootLayout.vue"
import MainLayout from "@/layouts/MainLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"


// 데시보드
import DashboardPage from "@/pages/dashboard/DashboardPage.vue"

// 발주
import PurchaseOrderListPage from "@/pages/purchaseorder/PurchaseOrderListPage.vue"
import PurchaseOrderRegisterPage from "@/pages/purchaseorder/PurchaseOrderRegisterPage.vue"
import PurchaseOrderDetailPage from "@/pages/purchaseorder/PurchaseOrderDetailPage.vue"

// 품목
import MaterialListPage from "@/pages/material/MaterialListPage.vue"
import MaterialPrintPage from "@/pages/material/MaterialPrintPage.vue"
import MaterialCategoryPage from "@/pages/material/MaterialCategoryPage.vue"
import CategoryPathPage from "@/pages/material/CategoryPathPage.vue"

// 구매
import InboundPage from "@/pages/inbound/InboundPage.vue"
import InboundRegisterPage from "@/pages/inbound/InboundRegisterPage.vue"
import InboundDetailPage from "@/pages/inbound/InboundDetailPage.vue"
import InboundScanPage from "@/pages/inbound/InboundScanPage.vue"

// 판매
import OutboundPage from "@/pages/outbound/OutboundPage.vue"
import OutboundRegisterPage from "@/pages/outbound/OutboundRegisterPage.vue"
import OutboundDetailPage from "@/pages/outbound/OutboundDetailPage.vue"
import OutboundScanPage from "@/pages/outbound/OutboundScanPage.vue"

// 반품
import ReturnOrderPage from "@/pages/returnorder/ReturnOrderPage.vue"
import ReturnOrderRegisterPage from "@/pages/returnorder/ReturnOrderRegisterPage.vue"
import ReturnOrderDetailPage from "@/pages/returnorder/ReturnOrderDetailPage.vue"
import ReturnOrderScanPage from "@/pages/returnorder/ReturnOrderScanPage.vue"

// 품목
import StockPage from "@/pages/stock/StockPage.vue"
import StockDetailPage from "@/pages/stock/StockDetailPage.vue"
import StockWarehousePage from "@/pages/stock/StockWarehousePage.vue"
import StockLoctoinPage from "@/pages/stock/StockLoctoinPage.vue"
import StockShelfPage from "@/pages/stock/StockShelfPage.vue"
import StockMovePage from "@/pages/stock/StockMovePage.vue"
import StockChangePage from "@/pages/stock/StockChangePage.vue"
import StockInspectionPage from "@/pages/stock/StockInspectionPage.vue"


// 통계
import SatisticsInboundPage from "@/pages/statistics/SatisticsInboundPage.vue"
import SatisticsOutboundPage from "@/pages/statistics/SatisticsOutboundPage.vue"
import SatisticsStockPage from "@/pages/statistics/SatisticsStockPage.vue"
import SatisticsReturnPage from "@/pages/statistics/SatisticsReturnPage.vue"

// 기타
import SettingPage from "@/pages/setting/SettingPage.vue"
import SupplierPage from "@/pages/setting/SupplierPage.vue"
import SupplierBalancePage from "@/pages/supplier/SupplierBalancePage.vue"
import UserManagerPage from "@/pages/user/UserManagerPage.vue"
import UserManagerIpPage from "@/pages/user/UserManagerIpPage.vue"

import UserManagerPermissionPage from "@/pages/permission/UserManagerPermissionPage.vue"
import MenuPermissionPage from "@/pages/permission/MenuPermissionPage.vue"
import NotificationPage from "@/pages/notification/NotificationPage.vue"

import WarehousePage from "@/pages/warehouse/WarehousePage.vue"
import LocationPage from "@/pages/warehouse/LocationPage.vue"
import ShelfPage from "@/pages/warehouse/ShelfPage.vue"

import LogPage from "@/pages/log/LogPage.vue"
import UserMyPage from "@/pages/user/UserMyPage.vue"

// 사업자
import BusinessPage from "@/pages/business/BusinessPage.vue"

// 품목 요율
import MaterialRatePage from "@/pages/materialRate/MaterialRatePage.vue"







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
				redirect: () => {
					const auth = useAuthStore();
					return auth.user ? "/dashboard" : "/login";
				},
			},
			{
				path: "",
				component: MainLayout,
				children: [
					{
						path: "dashboard",
						component: DashboardPage,
						meta: { title: "대시보드", auth: true, permission: "dashboard.view" },
					},

					// 품목
					{
						path: "materials",
						component: MaterialListPage,
						meta: { title: "품목목록", auth: true, permission: "material.view" },
					},
					{
						path: "materials/print",
						component: MaterialPrintPage,
						meta: { title: "품목라벨", auth: true, permission: "material.print.view" },
					},
					{
						path: "materials/category",
						component: MaterialCategoryPage,
						meta: { title: "품목 카테고리", auth: true, permission: "material.category.view" },
					},
					{
						path: "materials/category/path",
						component: CategoryPathPage,
						meta: { title: "카테고리 경로", auth: true, permission: "material.category.view" },
					},
					{
						path: "materials/rate",
						component: MaterialRatePage,
						meta: { title: "품목 기본설정", auth: true, permission: "material.rate.view" },
					},

					// 구매
					{
						path: "inbound",
						component: InboundPage,
						meta: { title: "구매관리", auth: true, permission: "inbound.view" },
					},
					{
						path: "inbound/register",
						component: InboundRegisterPage,
						meta: { title: "구매 등록", auth: true, permission: "inbound.create" },
					},
					{
						path: "inbound/detail",
						component: InboundDetailPage,
						meta: { title: "구매 세부내역", auth: true, permission: "inbound.detail.view" },
					},
					{
						path: "inbound/scan",
						component: InboundScanPage,
						meta: { title: "구매 스캔", auth: true, permission: "inbound.scan.view" },
					},

					// 판매
					{
						path: "outbound",
						component: OutboundPage,
						meta: { title: "판매목록", auth: true, permission: "outbound.view" },
					},
					{
						path: "outbound/register",
						component: OutboundRegisterPage,
						meta: { title: "판매 등록", auth: true, permission: "outbound.create" },
					},
					{
						path: "outbound/detail",
						component: OutboundDetailPage,
						meta: { title: "판매 세부내역", auth: true, permission: "outbound.detail.view" },
					},
					{
						path: "outbound/scan",
						component: OutboundScanPage,
						meta: { title: "판매 스캔", auth: true, permission: "outbound.scan.view" },
					},

					// 반품
					{
						path: "returnorder",
						component: ReturnOrderPage,
						meta: { title: "반품목록", auth: true, permission: "returnorder.view" },
					},
					{
						path: "returnorder/register",
						component: ReturnOrderRegisterPage,
						meta: { title: "반품 등록", auth: true, permission: "returnorder.create" },
					},
					{
						path: "returnorder/detail",
						component: ReturnOrderDetailPage,
						meta: { title: "반품 세부내역", auth: true, permission: "returnorder.detail.view" },
					},
					{
						path: "returnorder/scan",
						component: ReturnOrderScanPage,
						meta: { title: "반품 스캔", auth: true, permission: "returnorder.scan.view" },
					},
					// 재고
					{
						path: "stock",
						component: StockPage,
						meta: { title: "재고현황", auth: true, permission: "stock.view" },
					},
					{
						path: "stock/move",
						component: StockMovePage,
						meta: { title: "재고이동", auth: true, permission: "stock.move.view" },
					},
					{
						path: "stock/detail",
						component: StockDetailPage,
						meta: { title: "재고 변동 이력", auth: true, permission: "stock.detail.view" },
					},
					{
						path: "/stock/warehouse",
						component: StockWarehousePage,
						meta: { title: "재고 위치 (창고)", auth: true, permission: "stock.warehouse.view" },
					},
					{
						path: "/stock/location",
						component: StockLoctoinPage,
						meta: { title: "재고 위치 (위치)", auth: true, permission: "stock.location.view" },
					},
					{
						path: "/stock/shelf",
						component: StockShelfPage,
						meta: { title: "재고 위치 (선반)", auth: true, permission: "stock.shelf.view" },
					},
					{
						path: "/stock/change",
						component: StockChangePage,
						meta: { title: "재고 흐름", auth: true, permission: "stock.change.view" },
					},
					{
						path: "/stock/inspection",
						component: StockInspectionPage,
						meta: { title: "재고 검사", auth: true, permission: "stock.inspection.view" },
					},

					// 통계
					{
						path: "statistics/inbound",
						component: SatisticsInboundPage,
						meta: { title: "구매통계", auth: true, permission: "statistics.inbound.view" },
					},
					{
						path: "statistics/outbound",
						component: SatisticsOutboundPage,
						meta: { title: "판매통계", auth: true, permission: "statistics.outbound.view" },
					},
					{
						path: "statistics/stock",
						component: SatisticsStockPage,
						meta: { title: "재고통계", auth: true, permission: "statistics.stock.view" },
					},
					{
						path: "statistics/return",
						component: SatisticsReturnPage,
						meta: { title: "반품통계", auth: true, permission: "statistics.return.view" },
					},


					// 설정
					{
						path: "setting",
						component: SettingPage,
						meta: { title: "환경설정", auth: true, permission: "setting.view" },
					},
					// 거래처 (별도 그룹으로 분리)
					{
						path: "supplier",
						component: SupplierPage,
						meta: { title: "거래처 관리", auth: true, permission: "supplier.view" },
					},
					{
						path: "supplier/balance",
						component: SupplierBalancePage,
						meta: { title: "거래처 금액 정보", auth: true, permission: "supplier.balance.view" },
					},

					// 사업자 정보
					{
						path: "business",
						component: BusinessPage,
						meta: { title: "사업자 정보", auth: true, permission: "business.view" },
					},

					// 발주 관리
					{
						path: "purchaseorder",
						component: PurchaseOrderListPage,
						meta: { title: "발주 목록", auth: true, permission: "purchaseorder.view" },
					},
					{
						path: "purchaseorder/register",
						component: PurchaseOrderRegisterPage,
						meta: { title: "발주 등록", auth: true, permission: "purchaseorder.create" },
					},
					{
						path: "purchaseorder/detail",
						component: PurchaseOrderDetailPage,
						meta: { title: "발주 세부내역", auth: true, permission: "purchaseorder.detail.view" },
					},

					// 계정
					{
						path: "user",
						component: UserManagerPage,
						meta: { title: "계정관리", auth: true, permission: "usermanager.view" },
					},
					{
						path: "user/ip",
						component: UserManagerIpPage,
						meta: { title: "계정 아이피", auth: true, permission: "usermanager.ip.view" },
					},
					{
						path: "/permission/user",
						component: UserManagerPermissionPage,
						meta: { title: "계정권한", auth: true, permission: "permission.user.view" },
					},
					{
						path: "/permission/menu",
						component: MenuPermissionPage,
						meta: { title: "메뉴권한", auth: true, permission: "permission.menu.view" },
					},

					// 창고
					{
						path: "warehouse",
						component: WarehousePage,
						meta: { title: "창고관리", auth: true, permission: "warehouse.house.view" },
					},
					{
						path: "warehouse/location",
						component: LocationPage,
						meta: { title: "위치관리", auth: true, permission: "warehouse.location.view" },
					},
					{
						path: "warehouse/shelf",
						component: ShelfPage,
						meta: { title: "선반관리", auth: true, permission: "warehouse.shelf.view" },
					},

					// 로그
					{
						path: "log",
						component: LogPage,
						meta: { title: "로그", auth: true, permission: "logs.view" },
					},

					// 알림
					{
						path: "notification",
						component: NotificationPage,
						meta: { title: "알림", auth: true, permission: "notification.view" },
					},

					{
						path: "mypage",
						component: UserMyPage,
						meta: { title: "마이페이지" },
					},
				],
			},


			// 인증 필요없는 페이지
			{
				path: "",
				component: AuthLayout,
				children: [
					{
						path: "login",
						component: LoginPage,
						meta: { title: "로그인" },
					},
					{
						path: "signup",
						component: SignupPage,
						meta: { title: "회원가입" },
					},
					{
						path: "forgotPassword",
						component: ForgotPassword,
						meta: { title: "비밀번호 찾기" },
					},
				],
			},
		],
	},
];


export const router = createRouter({
	history: createWebHistory(),
	routes
})

// 라우트 진입 전 로그인/권한을 확인하는 네비게이션 가드
router.beforeEach((to, from) => {
	const auth = useAuthStore();

	// 🔥 아직 유저 로딩 안됐으면 대기
	if (!auth.isLoaded) {
		return true;
	}

	// 🔥 로그인 페이지는 항상 통과
	if (to.path === "/login") {
		return true;
	}

	// 1. 로그인 체크
	if (to.meta.auth && !auth.user) {
		return "/login";
	}

	// 2. 권한 체크 (로그인 된 경우만)
	if (to.meta.permission && auth.user) {
		const has = auth.hasPermission(to.meta.permission);

		if (!has) {
			return "/dashboard";
		}
	}

	return true;
});

// 라우트 전환 후 메타 타이틀로 document.title을 갱신한다
router.afterEach((to) => {
	const baseTitle = "품목관리 시스템";

	if (to.meta?.title) {
		document.title = `${baseTitle} | ${to.meta.title}`;
	} else {
		document.title = baseTitle;
	}
});