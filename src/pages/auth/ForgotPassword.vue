<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden"
  >
    <!-- 배경 장식 요소 (통일성 유지) -->
    <div
      class="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
    ></div>
    <div
      class="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight mb-4">
            Security <span class="text-blue-400">Center</span>
          </h1>
          <p class="text-gray-400 text-lg leading-relaxed font-light">
            안전한 계정 관리를 위해<br />
            비밀번호 재설정 절차를 진행합니다.
          </p>
        </div>

        <div class="relative z-10">
          <div
            class="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span class="text-sm font-semibold text-blue-400">진행 단계</span>
            </div>
            <div class="space-y-3">
              <div
                :class="[
                  'flex items-center gap-3 transition-opacity',
                  !sent ? 'opacity-100' : 'opacity-40',
                ]"
              >
                <div
                  class="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-[10px]"
                >
                  1
                </div>
                <span class="text-xs text-gray-300">이메일 인증 요청</span>
              </div>
              <div
                :class="[
                  'flex items-center gap-3 transition-opacity',
                  sent ? 'opacity-100' : 'opacity-40',
                ]"
              >
                <div
                  class="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-[10px]"
                >
                  2
                </div>
                <span class="text-xs text-gray-300"
                  >코드 확인 및 새 비밀번호 설정</span
                >
              </div>
            </div>
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

      <!-- 우측: 비밀번호 찾기 폼 섹션 -->
      <div
        class="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white"
      >
        <div class="mb-10 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">비밀번호 찾기</h2>
          <p class="text-gray-500">
            계정에 등록된 이메일로 인증 코드를 보내드립니다.
          </p>
        </div>

        <!-- Success Message Toast-like -->
        <transition name="fade">
          <div
            v-if="sent"
            class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 text-sm"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            인증코드를 메일로 발송했습니다. <br />메일함을 확인해주세요.
          </div>
        </transition>

        <div class="space-y-6">
          <!-- 이메일 입력 (sent 후에도 유지하거나 readonly 처리 가능) -->
          <div class="group">
            <label
              class="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors"
              >이메일 주소</label
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                v-model="email"
                type="email"
                :disabled="sent"
                @keyup.enter="!sent ? find() : null"
                class="w-full pl-10 pr-4 py-3 border-gray-200 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <!-- 코드 및 새 비밀번호 입력 (sent가 true일 때만 표시) -->
          <transition-group name="list" tag="div" class="space-y-5">
            <div v-if="sent" key="code-field" class="group">
              <label
                class="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors"
                >인증 코드</label
              >
              <input
                v-model="code"
                type="text"
                class="w-full px-4 py-3 border-gray-200 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all tracking-widest text-center font-bold text-lg"
                placeholder="000000 (6자리)"
              />
            </div>

            <div v-if="sent" key="pw-field" class="group">
              <label
                class="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors"
                >새 비밀번호</label
              >
              <input
                v-model="password"
                type="password"
                class="w-full px-4 py-3 border-gray-200 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="새로운 비밀번호"
              />
            </div>

            <div v-if="sent" key="pw-conf-field" class="group">
              <label
                class="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors"
                >새 비밀번호 확인</label
              >
              <input
                v-model="passwordConfirm"
                type="password"
                class="w-full px-4 py-3 border-gray-200 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="비밀번호 다시 입력"
              />
            </div>
          </transition-group>

          <!-- Action Buttons -->
          <button
            v-if="!sent"
            :disabled="loading"
            @click="find"
            class="w-full bg-[#1e293b] hover:bg-black text-white py-3.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <div
              v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span>{{ loading ? "전송 중..." : "인증코드 발송" }}</span>
          </button>

          <button
            v-else
            :disabled="loading"
            @click="chagePassword"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <div
              v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span>비밀번호 변경 완료</span>
          </button>
        </div>

        <div class="mt-10 text-center">
          <router-link
            to="/login"
            class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            로그인 페이지로 돌아가기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  name: "ForgotPasswordPage",
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
    async find() {
      if (!this.email) return;
      this.loading = true;
      try {
        await api.post("/api/auth/sendCode", { email: this.email });
        this.sent = true;
      } catch (e) {
        if (this.$toast) this.$toast.error(e.message);
      } finally {
        this.loading = false;
      }
    },
    async chagePassword() {
      if (!this.code || !this.password) return;
      this.loading = true;
      try {
        await api.post("/api/auth/codePasswordChange", {
          email: this.email,
          code: this.code,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });
        this.$toast.success(
          "비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.",
        );
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
/* 이전 페이지들과 동일한 애니메이션 */
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

/* 리스트 애니메이션 (입력 필드가 나타날 때 부드럽게) */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-enter-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from {
  opacity: 0;
}
</style>
