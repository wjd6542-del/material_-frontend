import { defineStore } from "pinia"
import { jwtDecode } from "jwt-decode"

interface AuthState {
	token: string | null
	user: User | null
	isLoaded: boolean
}

interface User {
	id: number
	username: string
	name: string
	email?: string

	role?: {
		id: number
		name: string
	}

	is_super: boolean

	// 🔥 권한 배열
	permissions: string[]
}

interface LoginResponse {
	token: string
	user: User
}

export const useAuthStore = defineStore("auth", {

	state: (): AuthState => ({
		token: null,
		user: null,
		isLoaded: false
	}),

	getters: {

		isLogin: (state): boolean => {
			return !!state.token
		},

		// 🔥 권한 체크 (슈퍼 관리자 포함)
		hasPermission: (state) => {
			return (code?: string) => {
				// ❌ user 없으면 차단
				if (!state.user) return false

				// 🔥 super admin (전체 허용)
				if (state.user.is_super) return true

				// ✅ permission 없는 경우 허용
				if (!code) return true

				const permissions = state.user.permissions || []
				return permissions.includes(code)
			}
		}

	},

	actions: {

		checkToken () {
			const token = this.token
			if (!token) return false

			try {
				const decoded: any = jwtDecode(token)
				const now = Date.now() / 1000

				if (decoded.exp < now) {
					this.logout()
					return false
				}

				return true
			} catch (e) {
				this.logout()
				return false
			}
		},

		login (data: LoginResponse) {
			this.token = data.token
			this.user = data.user
			this.isLoaded = true

			localStorage.setItem("token", data.token)
			localStorage.setItem("user", JSON.stringify(data.user))
		},

		logout () {
			this.token = null
			this.user = null
			this.isLoaded = true

			localStorage.removeItem("token")
			localStorage.removeItem("user")
		},

		restore () {
			const token = localStorage.getItem("token")
			const user = localStorage.getItem("user")

			if (!token || !user) {
				this.isLoaded = true
				return
			}

			this.token = token
			this.user = JSON.parse(user)

			// 🔥 토큰 만료 체크
			try {
				const decoded: any = jwtDecode(token)
				const now = Date.now() / 1000

				if (decoded.exp < now) {
					this.logout()
					return
				}
			} catch (e) {
				this.logout()
				return
			}

			this.isLoaded = true
		}

	},

	persist: true,
})