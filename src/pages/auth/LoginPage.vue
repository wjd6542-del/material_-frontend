<template>
  <div class="min-h-screen flex">
    <!-- 좌측 브랜드 -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center"
    >
      <div class="max-w-md text-center px-8">
        <h1 class="text-4xl font-bold mb-4">자재관리 시스템</h1>

        <p class="text-blue-100 leading-relaxed">
          재고, 입고, 출고를 효율적으로 관리하는 통합 자재 관리 플랫폼
        </p>

        <div class="mt-10 text-sm text-blue-200">
          Material Management System
        </div>
      </div>
    </div>

    <!-- 로그인 영역 -->
    <div class="flex flex-1 items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <!-- title -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800">관리자 로그인</h2>
        </div>

        <!-- form -->
        <form @submit.prevent="login" class="space-y-5">
          <!-- 아이디 -->
          <div>
            <label class="text-sm text-gray-600">아이디</label>
            <input
              v-model="username"
              type="text"
              @keyup.enter="login"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="아이디 입력"
            />
          </div>

          <!-- 비밀번호 -->
          <div>
            <label class="text-sm text-gray-600">비밀번호</label>
            <input
              v-model="password"
              type="password"
              @keyup.enter="login"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="비밀번호 입력"
            />
          </div>

          <!-- 로그인 버튼 -->
          <button
            :disabled="loading"
            @click="login"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                stroke-width="4"
                fill="none"
              />
            </svg>

            {{ loading ? "로그인 중..." : "로그인" }}
          </button>
        </form>

        <!-- 링크 -->
        <div class="flex justify-between text-sm text-gray-500 mt-5">
          <router-link to="/forgotPassword" class="hover:text-blue-600">
            비밀번호 찾기
          </router-link>

          <router-link to="/signup" class="hover:text-blue-600">
            회원가입
          </router-link>
        </div>

        <!-- footer -->
        <div class="text-center text-xs text-gray-400 mt-6">
          © 2026 Material Management
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
      username: "test1",
      password: "1q1q2w2w",
      loading: false,
    };
  },

  methods: {
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
        this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
