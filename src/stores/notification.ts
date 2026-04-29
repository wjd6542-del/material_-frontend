// @ts-nocheck
﻿import { defineStore } from "pinia"
import api from "@/api/api"
import { useAuthStore } from "@/stores/auth"
export const useNotificationStore = defineStore("notification", {
	state: () => ({
		counts: {
			INBOUND: 0,
			OUTBOUND: 0,
			MATERIAL: 0,
			RETURNORDER: 0,
			PURCHASEORDER: 0,
		},
		timer: 0,
		type: "",
		list: [],
		loading: false,
		panelOpen: false,
		currentType: null,
	}),

	actions: {
		// 특정 타입의 알림 패널을 열고 목록을 로드한다
		openPanel (type) {
			this.panelOpen = true
			this.currentType = type
			this.loadList(type)
		},

		// 알림 패널을 닫는다
		closePanel () {
			this.panelOpen = false
		},

		// 타입별 카운트
		// 알림 타입별 미확인 카운트를 서버에서 로드한다
		async loadCounts () {
			const res = await api.post("/api/notification/countByType")
			this.counts = {
				...this.counts,
				...res.data,
			}
		},

		// 알림 리스트
		// 지정 타입의 알림 목록을 서버에서 로드한다
		async loadList (type, limit = 10) {
			this.loading = true

			const res = await api.post("/api/notification/list", {
				type,
				limit,
			})

			this.list = res.data
			this.type = type
			this.loading = false
		},

		// 읽기
		// 단일 알림을 읽음 처리하고 카운트를 동기화한다
		async read (id) {
			try {
				await api.post("/api/notification/read", { id })

				const item = this.list.find((v) => v.id === id)

				// 이미 읽은 상태라면 카운트를 중복으로 뺄 필요 없음
				if (item && !item.is_read) {
					item.is_read = true

					// 서버 응답을 기다리지 않고 화면에서 먼저 숫자 차감 (선택 사항)
					if (this.counts[item.type] > 0) {
						this.counts[item.type]--
					}
				}

				// 그 다음 서버와 동기화
				await this.loadCounts()
			} catch (error) {
				console.error("읽기 처리 실패:", error)
			}
		},

		// 전체 읽기
		// 모든 알림을 일괄 읽음 처리하고 로컬 리스트를 갱신한다
		async readAll () {
			await api.post("/api/notification/readAll")

			this.list = this.list.map((v) => ({
				...v,
				is_read: true,
			}))

			await this.loadCounts()
		},

		// 상단 알림메뉴 1분마다 갱신됨
		// 로그인 상태에서 1분 간격으로 카운트 자동 갱신을 시작한다
		startAutoRefresh () {
			const auth = useAuthStore()
			if (!auth.token) return   // 🔥 로그인 안하면 호출 차단

			const loop = async () => {
				await this.loadCounts()
				this.timer = setTimeout(loop, 60000)
			}
			loop()
		}
	},
})