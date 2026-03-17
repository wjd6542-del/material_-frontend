<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">비밀번호 수정</h2>

    <div class="space-y-3">
      <div>
        <label class="text-sm text-gray-600">아이디</label>
        <input
          v-model="form.username"
          placeholder="아이디 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">비밀번호</label>
        <input
          type="password"
          v-model="form.password"
          placeholder="비밀번호 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">비밀번호 확인</label>
        <input
          type="password"
          v-model="form.passwordConfirm"
          placeholder="비밀번호 확인 입력"
          class="mt-1 w-full border rounded px-3 py-2"
        />
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <button class="px-3 py-1.5 border rounded" @click="modal.closeModal()">
        취소
      </button>

      <button class="px-3 py-1.5 bg-blue-600 text-white rounded" @click="save">
        저장
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/api";

export default {
  data() {
    return {
      modal: useModalStore(),
      form: {
        username: "",
        password: "",
        passwordConfirm: "",
      },
    };
  },

  methods: {
    async save() {
      try {
        await api.post("/api/auth/changePassword", this.form);
        const auth = useAuthStore();
        auth.logout();
        this.modal.closeModal();
        this.$router.push("/login");
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },
};
</script>
