<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden"
  >
    <!-- 배경 장식 요소 (생동감 부여) -->
    <div
      class="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
    ></div>
    <div
      class="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
    ></div>

    <div
      class="w-full max-w-[1000px] flex shadow-2xl rounded-3xl overflow-hidden bg-white border border-gray-100 z-10"
    >
      <!-- 좌측: 브랜드 섹션 (그래디언트 + 일러스트 느낌) -->
      <div
        class="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-[#1e293b] via-[#334155] to-[#1e293b] text-white p-12 flex-col justify-between relative"
      >
        <div class="relative z-10">
          <div
            class="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-6 shadow-lg shadow-blue-500/20"
          >
            <svg
              class="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight mb-4">
            WMS <span class="text-blue-400">Pro</span>
          </h1>
          <p class="text-gray-400 text-lg leading-relaxed font-light">
            복잡한 재고 관리를 한눈에.<br />
            더 스마트하고 빠른 통합 자재 솔루션.
          </p>
        </div>

        <!-- 배경 패턴 (추가 디자인) -->
        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image: radial-gradient(#fff 1px, transparent 1px);
            background-size: 20px 20px;
          "
        ></div>
      </div>

      <!-- 우측: 로그인 폼 섹션 -->
      <div
        class="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white"
      >
        <div class="mb-10 text-center lg:text-left">
          <p class="text-gray-500">로그인하여 자재 현황을 확인하세요.</p>
        </div>

        <form @submit.prevent="login" class="space-y-6">
          <!-- 아이디 -->
          <div class="group">
            <label
              class="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors"
              >아이디</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                v-model="username"
                type="text"
                class="w-full pl-10 pr-4 py-3 border-gray-200 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="ID를 입력하세요"
              />
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="group">
            <div class="flex justify-between items-center mb-2">
              <label
                class="text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
                >비밀번호</label
              >
              <router-link
                to="/forgotPassword"
                class="text-xs font-medium text-blue-600 hover:underline"
                >비밀번호 찾기</router-link
              >
            </div>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 border-gray-200 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  v-if="!showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2" />
                  <path
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    stroke-width="2"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    stroke-width="2"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- 로그인 버튼 -->
          <button
            :disabled="loading"
            class="w-full bg-[#1e293b] hover:bg-black text-white py-3.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div
              v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span>{{ loading ? "인증 중..." : "시스템 접속" }}</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            아직 계정이 없으신가요?
            <router-link
              to="/signup"
              class="text-blue-600 font-bold hover:underline ml-1"
              >회원가입</router-link
            >
          </p>
        </div>

        <div
          class="mt-auto pt-10 text-center text-[10px] text-gray-300 uppercase tracking-widest font-semibold"
        >
          2026 - WMS pro system
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import api from "@/api/api";

export default {
  name: "LoginPage",
  data() {
    return {
      username: "master",
      password: "1q1q2w2w",
      loading: false,
      showPassword: false, // 비밀번호 토글 상태 추가
    };
  },
  methods: {
    // 아이디/비밀번호로 로그인 API를 호출하고 성공 시 메인으로 이동한다
    async login() {
      if (!this.username || !this.password) return;
      this.loading = true;
      try {
        const res = await api.post("/api/auth/login", {
          username: this.username,
          password: this.password,
        });
        const authStore = useAuthStore();
        authStore.login(res.data);
        this.$router.push("/");
      } catch (e) {
        // 기존 $toast 사용 유지
        if (this.$toast) this.$toast.error(e.message);
        else alert(e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* 애니메이션용 커스텀 스타일 */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
