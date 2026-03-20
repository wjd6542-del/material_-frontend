<template>
  <div class="min-h-screen flex">
    <!-- 좌측 브랜드 -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center"
    >
      <div class="max-w-md text-center px-8">
        <h1 class="text-4xl font-bold mb-4">자재관리 시스템</h1>

        <p class="text-blue-100 leading-relaxed">
          계정을 생성하고 자재 관리 시스템을 바로 이용해보세요.
        </p>
      </div>
    </div>

    <!-- 회원가입 영역 -->
    <div class="flex flex-1 items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <!-- title -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">회원가입</h2>

          <p class="text-sm text-gray-500 mt-2">관리자 계정을 생성합니다</p>
        </div>

        <!-- form -->
        <form @submit.prevent="signup" class="space-y-4">
          <!-- 이름 -->
          <div>
            <label class="text-sm text-gray-600">이름</label>
            <input
              v-model="name"
              type="text"
              placeholder="홍길동"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 아이디 -->
          <div>
            <label class="text-sm text-gray-600">아이디</label>
            <input
              v-model="username"
              type="text"
              placeholder="admin01"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 이메일 -->
          <div>
            <label class="text-sm text-gray-600">이메일</label>
            <input
              v-model="email"
              type="email"
              placeholder="example@email.com"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 비밀번호 -->
          <div>
            <label class="text-sm text-gray-600">비밀번호</label>
            <input
              v-model="password"
              type="password"
              @keyup.enter="signup"
              placeholder="비밀번호 입력"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 비밀번호 확인 -->
          <div>
            <label class="text-sm text-gray-600">비밀번호 확인</label>
            <input
              v-model="passwordConfirm"
              type="password"
              @keyup.enter="signup"
              placeholder="비밀번호 확인"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 회원가입 버튼 -->
          <button
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                stroke-width="4"
                fill="none"
                class="opacity-25"
              />
            </svg>

            {{ loading ? "가입 중..." : "회원가입" }}
          </button>
        </form>

        <!-- 로그인 링크 -->
        <div class="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?

          <router-link to="/login" class="text-blue-600 hover:underline ml-1">
            로그인
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import { useAuthStore } from "@/stores/auth";

export default {
  data() {
    return {
      name: "테스트1",
      username: "test1",
      email: "test1@naver.com",
      password: "1q1q2w2w",
      passwordConfirm: "1q1q2w2w",
      loading: false,
    };
  },

  methods: {
    async signup() {
      if (!this.name || !this.username || !this.email) return;
      this.loading = true;
      try {
        const res = await api.post("/api/auth/signup", {
          name: this.name,
          username: this.username,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });

        this.$toast.success("회원가입 되었습니다 로그인 하시기 바랍니다");

        this.$router.push("/login");
      } catch (e) {
        this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
