// 역할 (Role) 초기 셋팅 시드 데이터
// - setting/Role.vue 의 저장 스키마와 필드를 맞춘다
// - id: 신규 주입이므로 음수 임시값 (서버는 음수 id 를 신규로 취급)
// - name: 역할 코드 (USER, MASTER 등)
// - description: 표시명 (직원, 관리자 등)
// - is_super: 슈퍼 관리자 여부 (권한 체크 시 모든 기능 허용)
// - sort: 정렬 순서

export type RoleSeed = {
	id: number
	name: string
	description: string
	sort: number
	is_super: boolean
}


// 기본 역할 정의
const DEFAULT_ROLES: Array<Omit<RoleSeed, "id" | "sort">> = [
	{ name: "MASTER", description: "관리자", is_super: true },
	{ name: "MANAGER", description: "매니저", is_super: false },
	{ name: "USER", description: "직원", is_super: false },
	{ name: "INOUT", description: "입고,출고", is_super: false },
	{ name: "PICKING", description: "피킹", is_super: false },
]


// 역할 시드 레코드 목록을 반환한다 (bulk insert 용)
export function getSeedRoles (): RoleSeed[] {
	let tempId = -1
	let sort = 1

	return DEFAULT_ROLES.map((r) => ({
		id: tempId--,
		name: r.name,
		description: r.description,
		is_super: r.is_super,
		sort: sort++,
	}))
}
