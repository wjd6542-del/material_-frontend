// stores/bookmark.ts
import { defineStore } from "pinia"
import { useRouter, useRoute } from "vue-router"

const STORAGE_KEY = "bookmark"

export const useBookmarkStore = defineStore("bookmark", {
	state: () => ({
		panelOpen: false,
		list: [],
	}),

	actions: {
		// 로컬스토리지에서 북마크 목록을 로드한다
		init () {
			const data = localStorage.getItem(STORAGE_KEY)
			this.list = data ? JSON.parse(data) : []
		},

		// 현재 북마크 목록을 로컬스토리지에 저장한다
		persist () {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
		},

		// 북마크 패널을 연다
		openPanel () {
			this.panelOpen = true
		},

		// 북마크 패널을 닫는다
		closePanel () {
			this.panelOpen = false
		},

		// 🔥 현재 페이지 기반 북마크 생성
		// 현재 라우트 기반으로 북마크 항목을 추가한다 (중복 방지)
		addCurrent (route) {
			const item = {
				id: route.fullPath,
				title: route.meta?.title || "제목없음",
				path: route.fullPath,
			}

			const exists = this.list.find(v => v.id === item.id)
			if (exists) return

			this.list.unshift(item)
			this.persist()
		},

		// 지정 id의 북마크를 제거한다
		remove (id) {
			this.list = this.list.filter(v => v.id !== id)
			this.persist()
		},

		// 현재 라우트의 북마크 상태를 토글한다
		toggleCurrent (route) {
			const id = route.fullPath
			const exists = this.list.find(v => v.id === id)

			if (exists) {
				this.remove(id)
			} else {
				this.addCurrent(route)
			}
		},

		// 현재 라우트가 북마크되어 있는지 확인한다
		isBookmarked (route) {
			return this.list.some(v => v.id === route.fullPath)
		},
	},
})