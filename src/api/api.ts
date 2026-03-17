import axios from "axios";
import { useAuthStore } from "@/stores/auth";


const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
	headers: {
		"X-Client-Type": "web",
		"x-api-key": import.meta.env.VITE_API_KEY,
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 응답 인터셉터 (공통 에러)
api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err.response?.status === 401) {
			useAuthStore().logout()
		}

		console.error("API ERROR", err.response || err);
		return Promise.reject(err.response.data);
	},
);

export default api;
