<template>
  <div class="p-1">
    <div class="mb-4 border-b pb-4">
      <h2 class="text-base font-semibold">
        {{ id ? "사용자 정보 수정" : "신규 사용자 등록" }}
      </h2>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">아이디</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="example_user"
            :disabled="id > 0"
            class="field"
          />
        </div>
        <div>
          <label class="form-label">이름</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="홍길동"
            class="field"
          />
        </div>
      </div>

      <div>
        <label class="form-label">이메일 주소</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="user@example.com"
          class="field"
        />
      </div>

      <div
        v-if="!is_edit"
        class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100"
      >
        <div>
          <label class="form-label">비밀번호</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="••••••••"
            class="field"
          />
        </div>
        <div>
          <label class="form-label">비밀번호 확인</label>
          <input
            type="password"
            v-model="form.passwordConfirm"
            placeholder="••••••••"
            class="field"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">권한(Role)</label>
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
          <label class="form-label">계정 활성 상태</label>
          <select
            v-model="form.is_active"
            class="field"
          >
            <option :value="true">✅ 활성 (사용 가능)</option>
            <option :value="false">🚫 비활성 (접근 제한)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4 pt-5 border-t">
      <button
        class="btn"
        @click="modal.closeModal()"
      >
        취소
      </button>

      <button
        class="btn btn-primary"
        @click="save"
      >
        {{ id ? "정보 업데이트" : "사용자 등록 완료" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
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
    // 서버 데이터를 폼 필드에 매핑한다
    mapping_data(data: any) {
      for (const key in this.form) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          (this.form as any)[key] = data[key];
        }
      }
    },

    // 수정 대상 사용자 상세 정보를 로드한다
    async loadData() {
      try {
        const res = await api.post(`/api/user/${this.id}`, { id: this.id });
        this.mapping_data(res.data);
      } catch (e: any) {
        this.$toast.error("데이터를 불러오는데 실패했습니다.");
      }
    },

    // 권한(역할) 선택 옵션 목록을 로드한다
    async loadRoles() {
      try {
        const res = await api.post("/api/role/list");
        this.roles = res.data;
      } catch (e: any) {
        console.error("Roles Load Error:", e);
      }
    },

    // 사용자 정보를 등록 또는 수정한다
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

  // 마운트 시 역할 목록을 로드하고 수정 모드라면 사용자 데이터도 로드한다
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
