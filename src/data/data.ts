// @ts-nocheck
﻿
// 재고 변동 타입 라벨 맵을 반환한다
export function StockType () {
	return {
		INBOUND: "구매",
		OUTBOUND: "판매",
		ADJUST: "재고 조정",
	}
}


// 감사 로그 액션 라벨 맵을 반환한다
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


// 알림 페이지 데이터
// 알림 페이지에서 사용하는 액션 라벨 맵을 반환한다
export function notiData () {
	return {
		CREATE: "생성",
		UPDATE: "수정",
		DELETE: "삭제",
		MOVE: "이동",
	}
}