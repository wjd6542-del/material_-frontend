// 페이지 / 버튼 권한 정의 (초기 셋팅 + 사이드바 메뉴 단일 소스)
// - 라우터 meta.permission, 화면 내 auth.hasPermission(), 사이드바 메뉴가
//   모두 이 파일을 참조해서 동작한다
// - getSeedPermissions() : DB 초기 주입용 평탄 레코드
// - getMenuTree()        : 사이드바 메뉴 트리

export type PermissionAction = "view" | "create" | "update" | "delete" | "print" | "move" | "read"

export type PermissionItem = {
	code: string            // 권한 코드 (auth.hasPermission 에 넘기는 값)
	name: string            // 표시명 (한글) - 메뉴 라벨로도 사용됨
	action: PermissionAction
	path?: string           // 라우트 경로 (있으면 메뉴 항목으로 취급)
}

export type PermissionPage = PermissionItem & {
	// 같은 권한 코드를 공유하는 추가 메뉴 변형 (예: 품목 카테고리 / 품목 카테고리 가로)
	extraMenus?: { path: string; label: string }[]
	// 페이지 내 버튼/동작 권한. action 중 path 가 있으면 메뉴 항목으로도 노출된다
	actions?: PermissionItem[]
}

export type PermissionGroup = {
	group: string           // 그룹 식별자
	label: string           // 그룹 표시명 (사이드바 부모 메뉴명)
	icon: string            // 사이드바 아이콘 (fa-solid 아이콘명)
	pages: PermissionPage[]
}


export const permissions: PermissionGroup[] = [
	{
		group: "dashboard",
		label: "대시보드",
		icon: "fa-chart-line",
		pages: [
			{
				code: "dashboard.view",
				name: "대시보드",
				action: "view",
				path: "/dashboard",
				actions: [
					{ code: "log.view", name: "대시보드 - 로그 영역 보기", action: "view" },
				],
			},
		],
	},

	{
		group: "purchaseorder",
		label: "발주관리",
		icon: "fa-clipboard-list",
		pages: [
			{
				code: "purchaseorder.view",
				name: "발주 목록",
				action: "view",
				path: "/purchaseorder",
				actions: [
					{
						code: "purchaseorder.create",
						name: "발주 등록",
						action: "create",
						path: "/purchaseorder/register",
					},
					{ code: "purchaseorder.update", name: "발주 수정", action: "update" },
					{ code: "purchaseorder.delete", name: "발주 삭제", action: "delete" },
				],
			},
			{
				code: "purchaseorder.detail.view",
				name: "발주 세부내역",
				action: "view",
				path: "/purchaseorder/detail",
			},
		],
	},

	{
		group: "material",
		label: "품목관리",
		icon: "fa-box",
		pages: [
			{
				code: "material.view",
				name: "품목목록",
				action: "view",
				path: "/materials",
				actions: [
					{ code: "material.create", name: "품목 등록", action: "create" },
					{ code: "material.update", name: "품목 수정", action: "update" },
					{ code: "material.delete", name: "품목 삭제", action: "delete" },
				],
			},
			{
				code: "material.print.view",
				name: "품목라벨",
				action: "view",
				path: "/materials/print",
			},
			{
				code: "material.category.view",
				name: "품목 카테고리",
				action: "view",
				path: "/materials/category",
				extraMenus: [
					{ path: "/materials/category/path", label: "카테고리 경로" },
				],
			},
			{
				code: "material.rate.view",
				name: "품목 기본설정",
				action: "view",
				path: "/materials/rate",
				actions: [
					{ code: "material.rate.update", name: "품목 기본설정 저장", action: "update" },
				],
			},
		],
	},

	{
		group: "inbound",
		label: "구매관리",
		icon: "fa-arrow-down",
		pages: [
			{
				code: "inbound.view",
				name: "구매목록",
				action: "view",
				path: "/inbound",
				actions: [
					{
						code: "inbound.create",
						name: "구매 등록",
						action: "create",
						path: "/inbound/register",
					},
					{ code: "inbound.update", name: "구매 수정", action: "update" },
					{ code: "inbound.delete", name: "구매 삭제", action: "delete" },
				],
			},
			{
				code: "inbound.detail.view",
				name: "구매 세부내역",
				action: "view",
				path: "/inbound/detail",
			},
			{
				code: "inbound.scan.view",
				name: "구매 스캔",
				action: "view",
				path: "/inbound/scan",
			},
		],
	},

	{
		group: "outbound",
		label: "판매관리",
		icon: "fa-arrow-up",
		pages: [
			{
				code: "outbound.view",
				name: "판매목록",
				action: "view",
				path: "/outbound",
				actions: [
					{
						code: "outbound.create",
						name: "판매 등록",
						action: "create",
						path: "/outbound/register",
					},
					{ code: "outbound.update", name: "판매 수정", action: "update" },
					{ code: "outbound.delete", name: "판매 삭제", action: "delete" },
				],
			},
			{
				code: "outbound.detail.view",
				name: "판매 세부내역",
				action: "view",
				path: "/outbound/detail",
			},
			{
				code: "outbound.scan.view",
				name: "판매 스캔",
				action: "view",
				path: "/outbound/scan",
			},
		],
	},

	{
		group: "returnorder",
		label: "반품관리",
		icon: "fa-rotate-left",
		pages: [
			{
				code: "returnorder.view",
				name: "반품목록",
				action: "view",
				path: "/returnorder",
				actions: [
					{
						code: "returnorder.create",
						name: "반품 등록",
						action: "create",
						path: "/returnorder/register",
					},
					{ code: "returnorder.update", name: "반품 수정", action: "update" },
					{ code: "returnorder.delete", name: "반품 삭제", action: "delete" },
				],
			},
			{
				code: "returnorder.detail.view",
				name: "반품 세부내역",
				action: "view",
				path: "/returnorder/detail",
			},
			{
				code: "returnorder.scan.view",
				name: "반품 스캔",
				action: "view",
				path: "/returnorder/scan",
			},
		],
	},

	{
		group: "stock",
		label: "재고관리",
		icon: "fa-boxes-stacked",
		pages: [
			{
				code: "stock.view",
				name: "재고현황",
				action: "view",
				path: "/stock",
			},
			{
				code: "stock.move.view",
				name: "재고이동",
				action: "view",
				path: "/stock/move",
				actions: [
					{ code: "stock.move.create", name: "재고이동 실행", action: "move" },
				],
			},
			{
				code: "stock.detail.view",
				name: "재고 변동 이력",
				action: "view",
				path: "/stock/detail",
			},
			{
				code: "stock.change.view",
				name: "재고 흐름",
				action: "view",
				path: "/stock/change",
			},
			{
				code: "stock.warehouse.view",
				name: "재고 위치 (창고)",
				action: "view",
				path: "/stock/warehouse",
			},
			{
				code: "stock.location.view",
				name: "재고 위치 (위치)",
				action: "view",
				path: "/stock/location",
			},
			{
				code: "stock.shelf.view",
				name: "재고 위치 (선반)",
				action: "view",
				path: "/stock/shelf",
			},
			{
				code: "stock.inspection.view",
				name: "재고 검사",
				action: "view",
				path: "/stock/inspection",
			},
		],
	},

	{
		group: "warehouse",
		label: "창고관리",
		icon: "fa-warehouse",
		pages: [
			{
				code: "warehouse.house.view",
				name: "창고관리",
				action: "view",
				path: "/warehouse",
				actions: [
					{ code: "warehouse.house.create", name: "창고 등록", action: "create" },
					{ code: "warehouse.house.update", name: "창고 수정", action: "update" },
					{ code: "warehouse.house.delete", name: "창고 삭제", action: "delete" },
				],
			},
			{
				code: "warehouse.location.view",
				name: "위치관리",
				action: "view",
				path: "/warehouse/location",
				actions: [
					{ code: "warehouse.location.create", name: "위치 등록", action: "create" },
					{ code: "warehouse.location.update", name: "위치 수정", action: "update" },
					{ code: "warehouse.location.delete", name: "위치 삭제", action: "delete" },
				],
			},
			{
				code: "warehouse.shelf.view",
				name: "선반관리",
				action: "view",
				path: "/warehouse/shelf",
				actions: [
					{ code: "warehouse.shelf.create", name: "선반 등록", action: "create" },
					{ code: "warehouse.shelf.update", name: "선반 수정", action: "update" },
					{ code: "warehouse.shelf.delete", name: "선반 삭제", action: "delete" },
				],
			},
		],
	},

	{
		group: "statistics",
		label: "통계",
		icon: "fa-chart-simple",
		pages: [
			{
				code: "statistics.inbound.view",
				name: "구매 통계",
				action: "view",
				path: "/statistics/inbound",
			},
			{
				code: "statistics.outbound.view",
				name: "판매 통계",
				action: "view",
				path: "/statistics/outbound",
			},
			{
				code: "statistics.return.view",
				name: "반품 통계",
				action: "view",
				path: "/statistics/return",
			},
			{
				code: "statistics.stock.view",
				name: "재고 통계",
				action: "view",
				path: "/statistics/stock",
			},
		],
	},

	{
		group: "permission",
		label: "권한관리",
		icon: "fa-user-shield",
		pages: [
			{
				code: "permission.user.view",
				name: "계정권한",
				action: "view",
				path: "/permission/user",
				actions: [
					{ code: "permission.user.update", name: "계정권한 저장", action: "update" },
				],
			},
			{
				code: "permission.menu.view",
				name: "메뉴권한",
				action: "view",
				path: "/permission/menu",
				actions: [
					{ code: "permission.menu.update", name: "메뉴권한 저장", action: "update" },
				],
			},
		],
	},

	{
		group: "usermanager",
		label: "계정관리",
		icon: "fa-user",
		pages: [
			{
				code: "usermanager.view",
				name: "계정목록",
				action: "view",
				path: "/user",
				actions: [
					{ code: "usermanager.create", name: "계정 등록", action: "create" },
					{ code: "usermanager.update", name: "계정 수정", action: "update" },
					{ code: "usermanager.delete", name: "계정 삭제", action: "delete" },
				],
			},
			{
				code: "usermanager.ip.view",
				name: "계정 아이피",
				action: "view",
				path: "/user/ip",
			},
		],
	},

	{
		group: "setting",
		label: "환경설정",
		icon: "fa-gear",
		pages: [
			{
				code: "setting.view",
				name: "환경설정",
				action: "view",
				path: "/setting",
				actions: [
					{ code: "setting.update", name: "환경설정 저장", action: "update" },
				],
			},
			{
				code: "supplier.view",
				name: "거래처",
				action: "view",
				path: "/setting/supplier",
				actions: [
					{ code: "supplier.create", name: "거래처 등록", action: "create" },
					{ code: "supplier.update", name: "거래처 수정", action: "update" },
					{ code: "supplier.delete", name: "거래처 삭제", action: "delete" },
				],
			},
			{
				code: "business.view",
				name: "사업자 정보",
				action: "view",
				path: "/business",
				actions: [
					{ code: "business.update", name: "사업자 정보 수정", action: "update" },
				],
			},
		],
	},

	{
		group: "notification",
		label: "알림",
		icon: "fa-bell",
		pages: [
			{
				code: "notification.view",
				name: "알림",
				action: "view",
				path: "/notification",
				actions: [
					{ code: "notification.read", name: "알림 읽기 처리", action: "read" },
					{ code: "notification.delete", name: "알림 삭제", action: "delete" },
				],
			},
		],
	},

	{
		group: "log",
		label: "로그",
		icon: "fa-clipboard-list",
		pages: [
			{
				code: "logs.view",
				name: "로그",
				action: "view",
				path: "/log",
			},
		],
	},
]


// ===== 시드 주입용 =====
// setting/Permission.vue 의 저장 스키마와 필드를 맞춘다
// - id: 신규 주입이므로 음수 임시값 (서버는 음수 id 를 신규로 취급)
// - name / code / group / action / sort 가 실제 DB 필드
// - groupLabel / page / path 는 모달 UI 렌더링 편의를 위한 부가 필드

export type PermissionSeed = {
	id: number
	name: string
	code: string
	group: string
	action: PermissionAction
	sort: number
	// 부가 필드 (UI 전용)
	groupLabel: string
	page: string
	path?: string
}


// 초기 셋팅 시 서버에 bulk insert 할 수 있는 평탄 레코드 목록을 반환한다
// - 페이지 권한 + 해당 페이지의 버튼/동작 권한을 모두 평탄화
// - sort 는 그룹/페이지 정의 순서대로 1 부터 증가
// - id 는 -1, -2, ... 의 임시 음수값
export function getSeedPermissions (): PermissionSeed[] {
	const list: PermissionSeed[] = []
	let sort = 1
	let tempId = -1

	for (const g of permissions) {
		for (const p of g.pages) {
			list.push({
				id: tempId--,
				name: p.name,
				code: p.code,
				group: g.group,
				action: p.action,
				sort: sort++,
				groupLabel: g.label,
				page: p.code,
				path: p.path,
			})

			if (p.actions) {
				for (const a of p.actions) {
					list.push({
						id: tempId--,
						name: a.name,
						code: a.code,
						group: g.group,
						action: a.action,
						sort: sort++,
						groupLabel: g.label,
						page: p.code,
						path: a.path,
					})
				}
			}
		}
	}

	return list
}


// 전체 권한 코드 배열을 반환한다 (검증/필터링용)
export function getAllPermissionCodes (): string[] {
	return getSeedPermissions().map((p) => p.code)
}


// 권한 코드 → 표시명 매핑을 반환한다
export function getPermissionLabelMap (): Record<string, string> {
	const map: Record<string, string> = {}
	for (const s of getSeedPermissions()) {
		map[s.code] = s.name
	}
	return map
}


// ===== 사이드바 메뉴 트리 =====

export type MenuNode = {
	label: string
	icon?: string
	path?: string          // 단일 링크 항목
	permission?: string    // 라우트 권한 코드
	children?: MenuNode[]  // 부모 메뉴 항목
}


// 사이드바용 메뉴 트리를 반환한다
// - 페이지의 path, action 중 path 가 있는 항목, extraMenus 를 메뉴 항목으로 취급
// - 그룹이 메뉴 항목 1개만 가지면 상위로 평탄화 (예: 대시보드, 사업자 정보, 알림, 설정, 로그)
// - action 에서 나온 메뉴(예: 발주 등록/구매 등록/판매 등록)는 그룹 맨 뒤로 모이도록 2-pass 로 조립
export function getMenuTree (): MenuNode[] {
	const tree: MenuNode[] = []

	for (const g of permissions) {
		const children: MenuNode[] = []
		const actionChildren: MenuNode[] = []

		for (const p of g.pages) {
			if (p.path) {
				children.push({
					label: p.name,
					path: p.path,
					permission: p.code,
				})
			}

			if (p.extraMenus) {
				for (const em of p.extraMenus) {
					children.push({
						label: em.label,
						path: em.path,
						permission: p.code,
					})
				}
			}

			if (p.actions) {
				for (const a of p.actions) {
					if (a.path) {
						actionChildren.push({
							label: a.name,
							path: a.path,
							permission: a.code,
						})
					}
				}
			}
		}

		// action 기반 메뉴(등록 등)는 그룹 맨 뒤로 이어붙인다
		children.push(...actionChildren)

		if (children.length === 1) {
			// 단일 메뉴는 상위로 평탄화
			const only = children[0]!
			tree.push({
				icon: g.icon,
				label: only.label,
				path: only.path,
				permission: only.permission,
			})
		} else if (children.length > 1) {
			tree.push({
				icon: g.icon,
				label: g.label,
				children,
			})
		}
	}

	return tree
}
