import { defineStore } from "pinia";

export const useBookmarkStore = defineStore("bookmark", {
	state: () => ({
		gyms: JSON.parse(localStorage.getItem("gymBookmarks") || "[]"),
		panelOpen: false, // 🔥 패널 상태
	}),

	getters: {
		count: (state) => state.gyms.length,

		isBookmarked: (state) => (id) => state.gyms.some((gym) => gym.id === id),

		list: (state) => state.gyms,
	},

	actions: {
		save () {
			localStorage.setItem("gymBookmarks", JSON.stringify(this.gyms));
		},

		add (gym) {
			if (!this.gyms.some((v) => v.key === gym.key)) {
				this.gyms.push(gym);
				this.save();
			}
		},

		remove (key) {
			this.gyms = this.gyms.filter((v) => v.key !== key);
			this.save();
		},

		toggle (gym) {
			if (this.isBookmarked(gym.key)) {
				this.remove(gym.key);
			} else {
				this.add(gym);
			}
		},

		clear () {
			this.gyms = [];
			this.save();
		},

		// 🔥 패널 제어
		openPanel () {
			this.panelOpen = true;
			document.body.style.overflow = "hidden";
		},

		closePanel () {
			this.panelOpen = false;
			document.body.style.overflow = "";
		},

		togglePanel () {
			this.panelOpen ? this.closePanel() : this.openPanel();
		},
	},
});
