import { defineStore } from "pinia"
import { jwtDecode } from "jwt-decode"

interface AuthState {
	token: string | null
	user: User | null
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
		user: null
	}),

	getters: {
		isLogin: (state) => !!state.token,

		hasPermission: (state) => (code?: string) => {
			if (!state.user) return false;
			if (state.user.is_super) return true;
			if (!code) return true;
			return state.user.permissions?.includes(code) ?? false;
		}
	},

	actions: {
		// ✅ 공통 만료 체크 로직 (내부용)
		_isExpired (token: string) {
			try {
				const decoded: any = jwtDecode(token);
				return decoded.exp < (Date.now() / 1000) + 10; // 10초 여유
			} catch {
				return true;
			}
		},

		// ✅ 기존 이름 유지: 외부에서 유효성 검사할 때 호출
		checkToken () {
			if (!this.token || this._isExpired(this.token)) {
				this.logout();
				return false;
			}
			return true;
		},

		login (data: LoginResponse) {
			this.token = data.token;
			this.user = data.user;
			// persist: true 설정 시 localStorage.setItem은 플러그인이 처리합니다.
		},

		logout () {
			this.token = null;
			this.user = null;
			// 저장소 초기화는 플러그인이 감지하여 처리
		},

		// ✅ 기존 이름 유지: 앱 시작 시(App.vue 등) 호출
		restore () {
			// persist 플러그인이 이미 값을 복구했으므로, 여기선 '유효성'만 체크합니다.
			if (this.token && this._isExpired(this.token)) {
				this.logout();
			}
		}
	},
	persist: true
})