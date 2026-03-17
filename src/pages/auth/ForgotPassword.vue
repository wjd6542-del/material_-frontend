<template>
  <div class="min-h-screen flex">
    <!-- 좌측 브랜드 -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center"
    >
      <div class="max-w-md text-center px-8">
        <h1 class="text-4xl font-bold mb-4">자재관리 시스템</h1>

        <p class="text-blue-100 leading-relaxed">
          계정에 등록된 이메일을 입력하면 비밀번호 재설정 코드가 <br />전송되니
          전송된 코드를 기준으로 비밀번호 변경 바랍니다
        </p>
      </div>
    </div>

    <!-- 비밀번호 찾기 -->
    <div class="flex flex-1 items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <!-- title -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">비밀번호 찾기</h2>

          <p class="text-sm text-gray-500 mt-2">
            가입된 이메일 주소를 입력하세요
          </p>
        </div>

        <!-- success message -->
        <div
          v-if="sent"
          class="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4"
        >
          인증코드를 메일로 발송했습니다.
        </div>

        <!-- form -->
        <div class="space-y-5">
          <div>
            <label class="text-sm text-gray-600"> 이메일 </label>

            <input
              v-model="email"
              type="email"
              @keyup.enter="find"
              placeholder="example@email.com"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <template v-if="sent">
            <div>
              <label class="text-sm text-gray-600"> 코드 </label>

              <input
                v-model="code"
                type="text"
                placeholder="이메일 전송된 인증코드"
                class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label class="text-sm text-gray-600">비밀번호 </label>

              <input
                v-model="password"
                type="password"
                placeholder="비밀번호 입력"
                class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label class="text-sm text-gray-600"> 비밀번호 확인 </label>

              <input
                v-model="passwordConfirm"
                type="password"
                placeholder="비밀번호 확인 입력"
                class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </template>

          <!-- button -->
          <template v-if="!sent">
            <button
              :disabled="loading"
              @click="find"
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

              {{ loading ? "메일 전송 중..." : "재설정 메일 보내기" }}
            </button>
          </template>
          <template v-if="sent">
            <button
              @click="chagePassword"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              비밀번호 변경
            </button>
          </template>
        </div>

        <!-- link -->
        <div class="text-center text-sm text-gray-500 mt-6">
          <router-link to="/login" class="hover:text-blue-600">
            로그인으로 돌아가기
          </router-link>
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
      email: "wjd6542@gmail.com",
      loading: false,
      sent: false,
      code: "",
      password: "",
      passwordConfirm: "",
    };
  },

  methods: {
    // 인증코드 발송 처리
    async find() {
      if (!this.email) return;
      this.sent = false;
      this.loading = true;
      try {
        const res = await api.post("/api/auth/sendCode", {
          email: this.email,
        });
        this.sent = true;
      } catch (e) {
        this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },

    // 인증코드로 비밀번호 변경처리
    async chagePassword() {
      try {
        this.loading = true;
        const res = await api.post("/api/auth/codePasswordChange", {
          email: this.email,
          code: this.code,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });
        this.$toast.success("비밀번호가 변경되었습니다");
      } catch (e) {
        this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
