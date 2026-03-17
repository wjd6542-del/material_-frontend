import { defineStore } from "pinia"
import { jwtDecode } from "jwt-decode"

interface AuthState {
	token: string | null
	user: User | null
}

interface User {
	id: number
	login_id: string
	name: string
	email?: string
	role?: string
}

interface LoginResponse {
	token: string
	user: User
}

export const useAuthStore = defineStore("auth", {

	state: (): AuthState => ({
		token: null,
		user: null
	}),

	getters: {

		isLogin: (state): boolean => {
			return !!state.token
		}

	},

	actions: {

		checkToken () {
			const token = this.token

			if (!token) return false

			const decoded = jwtDecode(token)

			const now = Date.now() / 1000

			if (decoded.exp < now) {
				this.logout()
				return false
			}

			return true
		},

		login (data: LoginResponse) {

			this.token = data.token
			this.user = data.user

			localStorage.setItem("token", data.token)
			localStorage.setItem("user", JSON.stringify(data.user))
		},

		logout () {

			this.token = null
			this.user = null

			localStorage.removeItem("token")
			localStorage.removeItem("user")
		},

		restore () {

			const token = localStorage.getItem("token")

			if (!token) return

			this.token = token

			try {

				const decoded = jwtDecode(token)
				const now = Date.now() / 1000

				if (decoded.exp < now) {
					this.logout()
				}

			} catch (e) {
				this.logout()
			}

		}

	},
	persist: true,
})