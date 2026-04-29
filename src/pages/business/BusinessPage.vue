<template>
  <div
    class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
  >
    <DaumPostcodeModal v-model="postcodeOpen" @select="applyAddress" />

    <div class="max-w-4xl mx-auto">
      <!-- 헤더 -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 p-6 md:p-8 mb-6"
      >
        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image: radial-gradient(#fff 1px, transparent 1px);
            background-size: 18px 18px;
          "
        ></div>
        <div
          class="absolute -top-10 -right-10 w-48 h-48 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div class="relative flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
          >
            <i class="fa-solid fa-building text-white text-xl"></i>
          </div>
          <div>
            <div
              class="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-1"
            >
              Company Profile
            </div>
            <h2
              class="text-xl md:text-2xl font-black text-white tracking-tight"
            >
              사업자 정보 관리
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              사업자 정보를 등록하고 연락처 및 주소를 관리합니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 본문 카드 -->
      <form
        @submit.prevent="saveBusiness"
        class="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-200/70 overflow-hidden"
      >
        <!-- 기본 정보 -->
        <section class="p-6 md:p-8 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <i class="fa-solid fa-file-lines text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >01</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                기본 정보
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                사업자 등록증에 기재된 정보를 입력합니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <!-- 사업자등록번호 -->
            <div class="md:col-span-2">
              <label class="form-label">
                사업자등록번호 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <i
                  class="fa-solid fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.registration_no"
                  type="text"
                  maxlength="12"
                  class="form-input pl-10 font-mono tracking-wider"
                  placeholder="000-00-00000"
                  @input="formatRegistrationNo"
                />
              </div>
              <p class="form-hint">
                <i class="fa-solid fa-circle-info me-1"></i>
                하이픈을 포함해 10자리 사업자등록번호를 입력하세요.
              </p>
            </div>

            <!-- 상호 -->
            <div>
              <label class="form-label">
                상호(법인명) <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <i
                  class="fa-solid fa-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.company_name"
                  type="text"
                  class="form-input pl-10"
                  placeholder="예) 주식회사 홍길동"
                />
              </div>
            </div>

            <!-- 대표자명 -->
            <div>
              <label class="form-label">
                대표자명 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <i
                  class="fa-solid fa-user-tie absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.ceo_name"
                  type="text"
                  class="form-input pl-10"
                  placeholder="예) 홍길동"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 사업장 주소 -->
        <section class="p-6 md:p-8 border-b border-slate-100 bg-slate-50/40">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <i class="fa-solid fa-location-dot text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >02</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                사업장 주소
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                사업장 소재지를 우편번호로 검색하여 입력합니다
              </p>
            </div>
          </div>

          <div class="space-y-4 mt-6">
            <div>
              <label class="form-label">우편번호</label>
              <div class="flex gap-2 max-w-sm">
                <div class="relative flex-1">
                  <i
                    class="fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                  ></i>
                  <input
                    v-model="form.zipcode"
                    type="text"
                    class="form-input pl-10 font-mono"
                    placeholder="12345"
                    readonly
                  />
                </div>
                <button
                  type="button"
                  @click="searchAddress"
                  class="shrink-0 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  <i class="fa-solid fa-magnifying-glass"></i>
                  주소검색
                </button>
              </div>
            </div>

            <div>
              <label class="form-label">기본주소</label>
              <div class="relative">
                <i
                  class="fa-solid fa-map-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.address"
                  type="text"
                  class="form-input pl-10"
                  placeholder="주소검색 버튼을 눌러주세요"
                  readonly
                />
              </div>
            </div>

            <div>
              <label class="form-label">상세주소</label>
              <div class="relative">
                <i
                  class="fa-solid fa-door-open absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.address_detail"
                  type="text"
                  class="form-input pl-10"
                  placeholder="건물명, 호수 등 상세주소를 입력하세요"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 연락처 -->
        <section class="p-6 md:p-8">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <i class="fa-solid fa-phone text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >03</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                연락처
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                주요 업무 연락을 위한 정보를 입력합니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
              <label class="form-label">대표 전화</label>
              <div class="relative">
                <i
                  class="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.phone"
                  type="text"
                  class="form-input pl-10"
                  placeholder="02-0000-0000"
                />
              </div>
            </div>
            <div>
              <label class="form-label">휴대폰</label>
              <div class="relative">
                <i
                  class="fa-solid fa-mobile-screen absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.mobile"
                  type="text"
                  class="form-input pl-10"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="form-label">팩스</label>
              <div class="relative">
                <i
                  class="fa-solid fa-fax absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                ></i>
                <input
                  v-model="form.fax"
                  type="text"
                  class="form-input pl-10"
                  placeholder="02-0000-0000"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 하단 액션 -->
        <div
          class="bg-gradient-to-r from-slate-50 to-slate-100/60 px-6 md:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 border-t border-slate-200/70"
        >
          <p class="text-[11px] text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-lock text-[10px]"></i>
            입력된 정보는 암호화되어 안전하게 보관됩니다.
          </p>
          <div class="flex items-center gap-2 justify-end">
            <button
              type="button"
              @click="resetForm"
              class="px-5 py-2.5 text-sm font-bold rounded-xl text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              <i class="fa-solid fa-rotate-left me-1"></i>
              초기화
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white shadow-md shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              {{ saving ? "저장 중" : "저장" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import DaumPostcodeModal from "@/components/base/DaumPostcodeModal.vue";

export default {
  name: "BusinessPage",

  components: { DaumPostcodeModal },

  data() {
    return {
      saving: false,
      postcodeOpen: false,
      form: {
        id: "",
        registration_no: "",
        company_name: "",
        ceo_name: "",
        zipcode: "",
        address: "",
        address_detail: "",
        phone: "",
        mobile: "",
        fax: "",
      },
    };
  },

  methods: {
    // 000-00-00000 형식으로 자동 포맷팅
    formatRegistrationNo() {
      const raw = this.form.registration_no.replace(/\D/g, "").slice(0, 10);
      const parts = [raw.slice(0, 3), raw.slice(3, 5), raw.slice(5, 10)].filter(
        Boolean,
      );
      this.form.registration_no = parts.join("-");
    },

    // 다음 우편번호 모달 오픈
    searchAddress() {
      this.postcodeOpen = true;
    },

    // 모달에서 선택한 주소 값을 폼에 반영
    applyAddress({ zipcode, address, detailAddress }) {
      this.form.zipcode = zipcode || "";
      this.form.address = address || "";
      this.form.address_detail = detailAddress || "";
    },

    // 서버에 사업자 정보 저장
    async saveBusiness() {
      this.saving = true;
      try {
        await api.post("/api/business/save", this.form);
        this.$toast?.success("저장되었습니다.");
      } catch (e) {
        this.$toast?.error("저장 실패");
      } finally {
        this.saving = false;
      }
    },

    // 폼 초기화
    resetForm() {
      Object.keys(this.form).forEach((k) => (this.form[k] = ""));
    },

    // 서버에서 기존 사업자 정보를 불러와 폼을 채운다
    async loadBusiness() {
      try {
        const res = await api.post("/api/business/info");
        if (res.data) Object.assign(this.form, res.data);
      } catch (e) {
        // 신규 등록 화면으로 간주
      }
    },
  },

  mounted() {
    this.loadBusiness();
  },
};
</script>

<style scoped>
.form-label {
  @apply block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2;
}

.form-input {
  @apply w-full pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition-all
         focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500
         placeholder:text-slate-300 text-slate-800 font-medium;
  padding-left: 2.5rem; /* 좌측 아이콘 공간 확보 (pl-10 동일, 특이도 우선 적용) */
}

.form-input[readonly] {
  @apply bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100;
}

.form-hint {
  @apply text-[11px] text-slate-400 mt-2 flex items-center;
}
</style>
