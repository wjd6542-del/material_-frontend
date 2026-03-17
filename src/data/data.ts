export function StockType () {
	return {
		INBOUND: "입고",
		OUTBOUND: "출고",
		ADJUST: "재고 조정",
	}
}

export function LogAction () {
	return {
		CREATE: "생성",
		UPDATE: "수정",
		DELETE: "삭제",
		VIEW: "화면보기",
		LOGIN: "로그인",
		LOGOUT: "로그아웃",
	}
}
