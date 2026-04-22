<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 p-4 relative overflow-hidden"
  >
    <!-- 배경 장식 요소 (로그인 페이지와 동일한 아이덴티티) -->
    <div
      class="absolute -top-24 -left-24 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"
    ></div>
    <div
      class="absolute -bottom-24 -right-24 w-96 h-96 bg-gray-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"
    ></div>

    <div
      class="w-full max-w-[1000px] flex shadow-2xl rounded-3xl overflow-hidden bg-white border border-gray-100 z-10"
    >
      <!-- 좌측: 브랜드 섹션 -->
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight mb-4">
            Join <span class="text-blue-400">WMS</span>
          </h1>
          <p class="text-gray-400 text-lg leading-relaxed font-light">
            통합 자재 관리 시스템의 일원이 되어<br />
            업무 효율을 극대화하세요.
          </p>
        </div>

        <div class="relative z-10">
          <div
            class="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
          >
            <h4 class="text-sm font-semibold text-blue-400 mb-2">
              보안 가이드라인
            </h4>
            <ul class="text-xs text-gray-300 space-y-2 font-light">
              <li class="flex items-center gap-2">
                <svg
                  class="w-3 h-3 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  />
                </svg>
                최소 8자 이상의 비밀번호 권장
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="w-3 h-3 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  />
                </svg>
                승인된 관리자 이메일 사용
              </li>
            </ul>
          </div>
        </div>

        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image: radial-gradient(#fff 1px, transparent 1px);
            background-size: 20px 20px;
          "
        ></div>
      </div>

      <!-- 우측: 회원가입 폼 섹션 -->
      <div
        class="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto max-h-[90vh]"
      >
        <div class="mb-8 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">계정 생성</h2>
          <p class="text-gray-500">시스템 이용을 위한 정보를 입력해주세요.</p>
        </div>

        <form @submit.prevent="signup" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 이름 -->
            <div class="group">
              <label
                class="form-label group-focus-within:text-blue-600 transition-colors"
                >이름</label
              >
              <input
                v-model="name"
                type="text"
                class="field w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="홍길동"
              />
            </div>
            <!-- 아이디 -->
            <div class="group">
              <label
                class="form-label group-focus-within:text-blue-600 transition-colors"
                >아이디</label
              >
              <input
                v-model="username"
                type="text"
                class="field w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="admin01"
              />
            </div>
          </div>

          <!-- 이메일 -->
          <div class="group">
            <label
              class="form-label group-focus-within:text-blue-600 transition-colors"
              >이메일</label
            >
            <input
              v-model="email"
              type="email"
              class="field w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="example@email.com"
            />
          </div>

          <!-- 비밀번호 -->
          <div class="group">
            <label
              class="form-label group-focus-within:text-blue-600 transition-colors"
              >비밀번호</label
            >
            <input
              v-model="password"
              type="password"
              class="field w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- 비밀번호 확인 -->
          <div class="group">
            <label
              class="form-label group-focus-within:text-blue-600 transition-colors"
              >비밀번호 확인</label
            >
            <input
              v-model="passwordConfirm"
              type="password"
              @keyup.enter="signup"
              class="field w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- 가입 버튼 -->
          <button
            :disabled="loading"
            class="btn btn-primary w-full !bg-[#1e293b] hover:!bg-black !text-white font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6 disabled:opacity-70"
          >
            <div
              v-if="loading"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span>{{ loading ? "처리 중..." : "회원가입 완료" }}</span>
          </button>
        </form>

        <div class="mt-8 text-center text-sm">
          <p class="text-gray-500">
            이미 계정이 있으신가요?
            <router-link
              to="/login"
              class="text-blue-600 font-bold hover:underline ml-1"
              >로그인하기</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  name: "SignupPage",
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
    // 입력값 검증 후 회원가입 API를 호출하고 로그인으로 이동한다
    async signup() {
      if (!this.name || !this.username || !this.email) return;

      // 간단한 비밀번호 확인 로직 추가
      if (this.password !== this.passwordConfirm) {
        this.$toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      this.loading = true;
      try {
        await api.post("/api/auth/signup", {
          name: this.name,
          username: this.username,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });

        this.$toast.success("회원가입 되었습니다. 로그인 하시기 바랍니다.");
        this.$router.push("/login");
      } catch (e) {
        if (this.$toast) this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
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

/* 스크롤바 커스텀 (폼이 길어질 경우 대비) */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
