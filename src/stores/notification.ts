import { defineStore } from "pinia"
import api from "@/api/api"
import { useAuthStore } from "@/stores/auth"
export const useNotificationStore = defineStore("notification", {
	state: () => ({
		counts: {
			INBOUND: 0,
			OUTBOUND: 0,
			MATERIAL: 0,
			RETURNORDER: 0,
		},
		timer: 0,
		type: "",
		list: [],
		loading: false,
		panelOpen: false,
		currentType: null,
	}),

	actions: {
		openPanel (type) {
			this.panelOpen = true
			this.currentType = type
			this.loadList(type)
		},

		closePanel () {
			this.panelOpen = false
		},

		// 타입별 카운트
		async loadCounts () {
			const res = await api.post("/api/notification/countByType")
			this.counts = {
				...this.counts,
				...res.data,
			}
		},

		// 알림 리스트
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
		async read (id) {
			await api.post("/api/notification/read", { id })

			const item = this.list.find((v) => v.id === id)

			if (item) {
				item.is_read = true
			}

			await this.loadCounts()
		},

		// 전체 읽기
		async readAll () {
			await api.post("/api/notification/readAll")

			this.list = this.list.map((v) => ({
				...v,
				is_read: true,
			}))

			await this.loadCounts()
		},

		// 상단 알림메뉴 1분마다 갱신됨
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