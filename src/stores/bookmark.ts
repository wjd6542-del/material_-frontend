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
		init () {
			const data = localStorage.getItem(STORAGE_KEY)
			this.list = data ? JSON.parse(data) : []
		},

		persist () {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
		},

		openPanel () {
			this.panelOpen = true
		},

		closePanel () {
			this.panelOpen = false
		},

		// 🔥 현재 페이지 기반 북마크 생성
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

		remove (id) {
			this.list = this.list.filter(v => v.id !== id)
			this.persist()
		},

		toggleCurrent (route) {
			const id = route.fullPath
			const exists = this.list.find(v => v.id === id)

			if (exists) {
				this.remove(id)
			} else {
				this.addCurrent(route)
			}
		},

		isBookmarked (route) {
			return this.list.some(v => v.id === route.fullPath)
		},
	},
})