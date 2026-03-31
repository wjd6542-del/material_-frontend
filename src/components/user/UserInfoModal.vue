<template>
  <div class="p-1">
    <div class="flex items-center justify-between mb-6 border-b pb-4">
      <h2 class="text-xl font-bold text-gray-800">
        {{ id ? "사용자 정보 수정" : "신규 사용자 등록" }}
      </h2>
      <button
        @click="modal.closeModal()"
        class="text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >아이디</label
          >
          <input
            v-model="form.username"
            type="text"
            placeholder="example_user"
            :disabled="id > 0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >이름</label
          >
          <input
            v-model="form.name"
            type="text"
            placeholder="홍길동"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >이메일 주소</label
        >
        <input
          v-model="form.email"
          type="email"
          placeholder="user@example.com"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div
        v-if="!is_edit"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >비밀번호</label
          >
          <input
            type="password"
            v-model="form.password"
            placeholder="••••••••"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >비밀번호 확인</label
          >
          <input
            type="password"
            v-model="form.passwordConfirm"
            placeholder="••••••••"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >권한(Role)</label
          >
          <SearchSelect
            v-model="form.role_id"
            :options="roles"
            labelKey="description"
            valueKey="id"
            placeholder="권한을 선택하세요"
            class="w-full shadow-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >계정 활성 상태</label
          >
          <select
            v-model="form.is_active"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
          >
            <option :value="true">✅ 활성 (사용 가능)</option>
            <option :value="false">🚫 비활성 (접근 제한)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-8 pt-5 border-t">
      <button
        class="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        @click="modal.closeModal()"
      >
        취소
      </button>

      <button
        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold shadow-md shadow-blue-100 transition-all"
        @click="save"
      >
        {{ id ? "정보 업데이트" : "사용자 등록 완료" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";

export default {
  name: "UserFormModal",
  components: {
    SearchSelect,
  },

  props: {
    id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),
      roles: [],
      is_edit: false,
      form: {
        username: "",
        password: "",
        passwordConfirm: "",
        name: "",
        email: "",
        role_id: "",
        is_active: true,
      },
    };
  },

  methods: {
    mapping_data(data: any) {
      for (const key in this.form) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          (this.form as any)[key] = data[key];
        }
      }
    },

    async loadData() {
      try {
        const res = await api.post(`/api/user/${this.id}`, { id: this.id });
        this.mapping_data(res.data);
      } catch (e: any) {
        this.$toast.error("데이터를 불러오는데 실패했습니다.");
      }
    },

    async loadRoles() {
      try {
        const res = await api.post("/api/role/list");
        this.roles = res.data;
      } catch (e: any) {
        console.error("Roles Load Error:", e);
      }
    },

    async save() {
      try {
        if (this.id) {
          this.form.id = this.id;
        }

        const url = this.id ? `/api/user/update` : "/api/user/create";
        await api.post(url, this.form);

        this.$toast.success(this.id ? "수정되었습니다." : "등록되었습니다.");
        this.modal.closeModal();

        this.$emit("reload");
        if (this.onSaved) this.onSaved();
      } catch (e: any) {
        this.$toast.error(e.response?.data?.message || e.message);
      }
    },
  },

  async mounted() {
    await this.loadRoles();
    if (this.id) {
      this.is_edit = true;
      await this.loadData();
    }
  },
};
</script>

<style scoped>
/* Chrome, Safari, Edge에서 input[type="password"]의 가독성을 위한 폰트 설정 */
input[type="password"] {
  font-family: "Inter", "Arial", sans-serif;
}
</style>
