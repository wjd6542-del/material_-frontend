<template>
  <div>
    <DaumPostcodeModal v-model="postcodeOpen" @select="applyAddress" />

    <!-- 검색 영역 -->
    <div class="mb-3 bg-white border border-slate-200 rounded-xl p-3 space-y-2">
      <!-- 1행: 텍스트 검색 -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mr-1 w-[46px]">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          검색
        </div>
        <select
          v-model="search.type"
          class="cell-input w-[110px]"
          :class="typeColorClass(search.type)"
        >
          <option value="">전체 구분</option>
          <option value="INBOUND">구매</option>
          <option value="OUTBOUND">판매</option>
        </select>
        <input
          v-model="search.name"
          type="text"
          class="cell-input flex-1 min-w-[140px]"
          placeholder="거래처명"
        />
        <input
          v-model="search.registration_no"
          type="text"
          class="cell-input flex-1 min-w-[140px] font-mono"
          placeholder="사업자등록번호"
        />
        <input
          v-model="search.phone"
          type="text"
          class="cell-input flex-1 min-w-[140px]"
          placeholder="핸드폰"
        />
        <input
          v-model="search.email"
          type="text"
          class="cell-input flex-1 min-w-[160px]"
          placeholder="이메일"
        />
      </div>

      <!-- 2행: 금액 필터 + 초기화 + 카운트 -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mr-1 w-[46px]">
          <i class="fa-solid fa-filter text-slate-400"></i>
          필터
        </div>
        <select v-model="search.receivable" class="cell-input w-[140px]">
          <option value="">미수금 전체</option>
          <option value="has">미수금 있음</option>
          <option value="none">미수금 없음</option>
        </select>
        <select v-model="search.payable" class="cell-input w-[140px]">
          <option value="">미지급금 전체</option>
          <option value="has">미지급금 있음</option>
          <option value="none">미지급금 없음</option>
        </select>
        <button
          type="button"
          @click="resetSearch"
          :disabled="!hasSearchInput"
          class="h-[28px] px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-[11px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
        >
          <i class="fa-solid fa-rotate-left text-[10px]"></i>
          초기화
        </button>
        <span class="ml-auto text-[11px] text-slate-400">
          {{ filteredRows.length }} / {{ rows.length }}건
        </span>
      </div>
    </div>

    <!-- 상단 액션 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="relative shrink-0">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
          >
            <i class="fa-solid fa-building text-white text-sm"></i>
          </div>
        </div>
        <div>
          <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
            거래처 목록
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            행을 선택해서 수정 · 저장 · 삭제할 수 있습니다 · 총 {{ rows.length }}건
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="deleteRows"
          :disabled="!selectedCount"
          class="px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-trash-can"></i>
          삭제 ({{ selectedCount }})
        </button>
        <button
          type="button"
          @click="saveRows"
          :disabled="!selectedCount"
          class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          저장
        </button>
        <button
          type="button"
          @click="addRow"
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <i class="fa-solid fa-plus"></i>
          추가
        </button>
      </div>
    </div>

    <!-- 테이블 -->
    <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div class="overflow-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="th text-center w-10">
                <input
                  type="checkbox"
                  class="align-middle cursor-pointer"
                  :checked="allSelected"
                  :indeterminate.prop="someSelected && !allSelected"
                  @change="toggleAll"
                />
              </th>
              <th class="th text-center w-10">#</th>
              <th class="th text-center" style="min-width: 90px">구분</th>
              <th class="th text-left" style="min-width: 160px">거래처명</th>
              <th class="th text-left" style="min-width: 140px">사업자등록번호</th>
              <th class="th text-left" style="min-width: 120px">핸드폰</th>
              <th class="th text-left" style="min-width: 120px">모바일</th>
              <th class="th text-left" style="min-width: 120px">팩스</th>
              <th class="th text-left" style="min-width: 160px">이메일</th>
              <th class="th text-left" style="min-width: 160px">계좌번호</th>
              <th class="th text-left" style="min-width: 110px">우편번호</th>
              <th class="th text-left" style="min-width: 220px">기본주소</th>
              <th class="th text-left" style="min-width: 160px">상세주소</th>
              <th class="th text-right" style="min-width: 120px">
                <span class="inline-flex items-center justify-end gap-1">
                  미수금
                  <span
                    v-tip="'판매 상대로부터 받을 금액 · 고객사에게 청구해서 아직 받지 못한 매출채권'"
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black cursor-help"
                  >
                    i
                  </span>
                </span>
              </th>
              <th class="th text-right" style="min-width: 120px">
                <span class="inline-flex items-center justify-end gap-1">
                  미지급금
                  <span
                    v-tip="'구매 상대에게 지급할 금액 · 공급업체로부터 받은 매입 중 아직 결제하지 않은 매입채무'"
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black cursor-help"
                  >
                    i
                  </span>
                </span>
              </th>
              <th class="th text-left" style="min-width: 140px">메모</th>
              <th class="th text-right w-16">정렬</th>
              <th class="th text-center w-24">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in filteredRows"
              :key="row.id"
              class="border-t border-slate-100"
              :class="selectedIds.has(row.id) ? 'bg-blue-50/40' : ''"
            >
              <td class="td text-center">
                <input
                  type="checkbox"
                  class="align-middle cursor-pointer"
                  :checked="selectedIds.has(row.id)"
                  @change="toggleRow(row.id)"
                />
              </td>
              <td class="td text-center text-slate-400 font-mono">
                {{ i + 1 }}
              </td>
              <td class="td">
                <select
                  v-model="row.type"
                  @change="markSelected(row.id)"
                  class="cell-input"
                  :class="typeColorClass(row.type)"
                >
                  <option value="INBOUND">구매</option>
                  <option value="OUTBOUND">판매</option>
                </select>
              </td>
              <td class="td">
                <input
                  v-model="row.name"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input"
                  placeholder="거래처명"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.registration_no"
                  @input="onRegistrationInput(row)"
                  type="text"
                  maxlength="12"
                  class="cell-input font-mono"
                  placeholder="000-00-00000"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.phone"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input"
                  placeholder="02-0000-0000"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.mobile"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input"
                  placeholder="010-0000-0000"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.fax"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input"
                  placeholder="02-0000-0000"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.email"
                  @input="markSelected(row.id)"
                  type="email"
                  class="cell-input"
                  placeholder="name@example.com"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.account_no"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input font-mono"
                  placeholder="000-0000-0000"
                />
              </td>
              <td class="td">
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="openPostcode(row.id)"
                    v-tip="'우편번호 찾기'"
                    class="shrink-0 h-[28px] w-[28px] rounded-md bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition flex items-center justify-center"
                  >
                    <i class="fa-solid fa-magnifying-glass text-[10px]"></i>
                  </button>
                  <input
                    v-model="row.zipcode"
                    type="text"
                    class="cell-input font-mono bg-slate-50 cursor-not-allowed"
                    placeholder="00000"
                    readonly
                    @click="openPostcode(row.id)"
                  />
                </div>
              </td>
              <td class="td">
                <input
                  v-model="row.address"
                  type="text"
                  class="cell-input bg-slate-50 cursor-not-allowed"
                  placeholder="우편번호 검색"
                  readonly
                />
              </td>
              <td class="td">
                <input
                  v-model="row.address_detail"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input"
                  placeholder="상세주소"
                />
              </td>
              <td class="td">
                <input
                  v-model.number="row.receivable"
                  @input="markSelected(row.id)"
                  type="number"
                  min="0"
                  class="cell-input text-right"
                  placeholder="0"
                />
              </td>
              <td class="td">
                <input
                  v-model.number="row.payable"
                  @input="markSelected(row.id)"
                  type="number"
                  min="0"
                  class="cell-input text-right"
                  placeholder="0"
                />
              </td>
              <td class="td">
                <input
                  v-model="row.memo"
                  @input="markSelected(row.id)"
                  type="text"
                  class="cell-input"
                  placeholder="메모"
                />
              </td>
              <td class="td">
                <input
                  v-model.number="row.sort"
                  @input="markSelected(row.id)"
                  type="number"
                  class="cell-input text-right"
                  placeholder="0"
                />
              </td>
              <td class="td text-center">
                <div class="inline-flex items-center gap-1">
                  <button
                    type="button"
                    @click="openHistory(row)"
                    :disabled="row.id < 0"
                    v-tip="row.id < 0 ? '저장 후 이력 조회 가능' : '변경 이력 보기'"
                    class="text-amber-500 hover:text-amber-700 w-7 h-7 rounded-lg hover:bg-amber-50 transition-all disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <i class="fa-solid fa-clock-rotate-left text-[11px]"></i>
                  </button>
                  <button
                    type="button"
                    @click="removeRow(row.id)"
                    v-tip="row.id < 0 ? '행 제거' : '삭제 선택'"
                    class="text-red-400 hover:text-red-600 w-7 h-7 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="18" class="p-0">
                <div
                  class="flex flex-col items-center justify-center py-14 px-6 text-center bg-gradient-to-b from-white to-slate-50/60"
                >
                  <div
                    class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60 flex items-center justify-center mb-4 shadow-sm"
                  >
                    <i class="fa-solid fa-building text-2xl text-blue-400"></i>
                    <span
                      class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                    >
                      <i class="fa-solid fa-plus text-[11px] text-blue-500"></i>
                    </span>
                  </div>
                  <p class="text-sm font-bold text-slate-700 tracking-tight mb-1">
                    등록된 거래처가 없습니다
                  </p>
                  <p class="text-xs text-slate-400 mb-4">
                    추가 버튼으로 신규 거래처를 등록하세요.
                  </p>
                  <button
                    type="button"
                    @click="addRow"
                    class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <i class="fa-solid fa-plus"></i>
                    거래처 추가
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import DaumPostcodeModal from "@/components/base/DaumPostcodeModal.vue";
import SupplierHistoryModal from "@/components/setting/SupplierHistoryModal.vue";
import { useModalStore } from "@/stores/modal";

export default {
  name: "Supplier",
  components: { DaumPostcodeModal },

  data() {
    return {
      modal: useModalStore(),
      rows: [],
      selectedIds: new Set(),
      tempId: -1,
      postcodeOpen: false,
      targetRowId: null,
      search: {
        type: "",
        name: "",
        registration_no: "",
        phone: "",
        email: "",
        receivable: "", // "" | "has" | "none"
        payable: "",    // "" | "has" | "none"
      },
    };
  },

  computed: {
    // 검색 조건으로 필터링된 행 (LIKE, 대소문자 무시)
    filteredRows() {
      const s = this.search;
      const like = (v, q) =>
        String(v ?? "").toLowerCase().includes(String(q ?? "").toLowerCase().trim());
      return this.rows.filter((r) => {
        if (s.type && r.type !== s.type) return false;
        if (s.name && !like(r.name, s.name)) return false;
        if (s.registration_no && !like(r.registration_no, s.registration_no)) return false;
        // 핸드폰 검색은 phone / mobile 필드를 모두 대상으로
        if (s.phone) {
          const match =
            like(r.phone, s.phone) || like(r.mobile, s.phone);
          if (!match) return false;
        }
        if (s.email && !like(r.email, s.email)) return false;
        // 미수금/미지급금: "has"(>0) / "none"(=0)
        if (s.receivable === "has" && !(Number(r.receivable) > 0)) return false;
        if (s.receivable === "none" && Number(r.receivable) > 0) return false;
        if (s.payable === "has" && !(Number(r.payable) > 0)) return false;
        if (s.payable === "none" && Number(r.payable) > 0) return false;
        return true;
      });
    },
    // 검색 입력이 하나라도 있는지
    hasSearchInput() {
      const s = this.search;
      return !!(
        s.type ||
        s.name ||
        s.registration_no ||
        s.phone ||
        s.email ||
        s.receivable ||
        s.payable
      );
    },
    // 체크된 행 개수
    selectedCount() {
      return this.selectedIds.size;
    },
    // 현재 보이는 행 기준 전체 선택 상태
    allSelected() {
      const visible = this.filteredRows;
      return (
        visible.length > 0 && visible.every((r) => this.selectedIds.has(r.id))
      );
    },
    // 일부 선택 상태
    someSelected() {
      return this.selectedIds.size > 0;
    },
  },

  methods: {
    // 거래처 목록 로드
    async loadList() {
      try {
        const res = await api.post("/api/supplier/list", {});
        this.rows = (Array.isArray(res.data) ? res.data : []).map((r) => ({
          ...r,
          type: r.type || "INBOUND",
          registration_no: r.registration_no || "",
          mobile: r.mobile || "",
          fax: r.fax || "",
          account_no: r.account_no || "",
          receivable: Number(r.receivable) || 0,
          payable: Number(r.payable) || 0,
        }));
        this.selectedIds = new Set();
      } catch (e) {
        this.rows = [];
      }
    },

    // 사업자등록번호 000-00-00000 자동 포맷
    onRegistrationInput(row) {
      const raw = String(row.registration_no || "").replace(/\D/g, "").slice(0, 10);
      const parts = [raw.slice(0, 3), raw.slice(3, 5), raw.slice(5, 10)].filter(
        Boolean,
      );
      row.registration_no = parts.join("-");
      this.markSelected(row.id);
    },

    // 구분 색상 (select 셀 내부 텍스트)
    typeColorClass(type) {
      if (type === "INBOUND") return "text-amber-700 font-semibold";
      if (type === "OUTBOUND") return "text-indigo-700 font-semibold";
      return "text-slate-600";
    },

    // 검색 조건 초기화
    resetSearch() {
      this.search = {
        type: "",
        name: "",
        registration_no: "",
        phone: "",
        email: "",
        receivable: "",
        payable: "",
      };
    },

    toggleRow(id) {
      const next = new Set(this.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      this.selectedIds = next;
    },
    toggleAll() {
      if (this.allSelected) {
        this.selectedIds = new Set();
      } else {
        this.selectedIds = new Set(this.rows.map((r) => r.id));
      }
    },
    // 셀 편집 시 해당 행을 저장 대상으로 자동 선택
    markSelected(id) {
      if (!this.selectedIds.has(id)) {
        const next = new Set(this.selectedIds);
        next.add(id);
        this.selectedIds = next;
      }
    },

    // 신규 거래처 행 추가
    addRow() {
      const maxSort = this.rows.reduce(
        (m, r) => (Number(r.sort) > m ? Number(r.sort) : m),
        0,
      );
      const id = this.tempId--;
      this.rows.unshift({
        id,
        name: "",
        type: "INBOUND",
        registration_no: "",
        phone: "",
        mobile: "",
        fax: "",
        email: "",
        account_no: "",
        zipcode: "",
        address: "",
        address_detail: "",
        memo: "",
        sort: maxSort + 1,
        receivable: 0,
        payable: 0,
      });
      this.markSelected(id);
    },

    // 행 제거 (신규 행은 즉시 로컬 삭제, 기존 행은 선택 토글로만 처리)
    removeRow(id) {
      if (id < 0) {
        this.rows = this.rows.filter((r) => r.id !== id);
        const next = new Set(this.selectedIds);
        next.delete(id);
        this.selectedIds = next;
      } else {
        const next = new Set(this.selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        this.selectedIds = next;
      }
    },

    // 우편번호 모달 오픈
    openPostcode(rowId) {
      this.targetRowId = rowId;
      this.postcodeOpen = true;
    },
    applyAddress({ zipcode, address, detailAddress }) {
      if (this.targetRowId == null) return;
      const row = this.rows.find((r) => r.id === this.targetRowId);
      if (row) {
        row.zipcode = zipcode || "";
        row.address = address || "";
        row.address_detail = detailAddress || "";
        this.markSelected(row.id);
      }
      this.targetRowId = null;
    },

    // 변경 이력 모달 오픈 (저장된 행만)
    openHistory(row) {
      if (!row || row.id < 0) return;
      this.modal.openModal(
        SupplierHistoryModal,
        {
          supplier_id: row.id,
          supplier_name: row.name,
        },
        "full",
      );
    },

    // 선택된 행 일괄 저장
    async saveRows() {
      if (!this.selectedCount) {
        this.$toast?.error("선택된 정보가 없습니다");
        return;
      }
      const targets = this.rows.filter((r) => this.selectedIds.has(r.id));
      try {
        await api.post("/api/supplier/batchSave", targets);
        this.$toast?.success("저장 완료");
        this.loadList();
      } catch (e) {
        this.$toast?.error("저장 실패");
      }
    },

    // 선택 행 일괄 삭제
    async deleteRows() {
      if (!this.selectedCount) {
        this.$toast?.error("선택된 정보가 없습니다");
        return;
      }
      const targets = this.rows.filter((r) => this.selectedIds.has(r.id));
      const ok = await this.$confirm?.(
        `선택된 ${targets.length}개 거래처를 삭제하시겠습니까?`,
        "삭제 확인", "danger",
      );
      if (ok === false) return;
      try {
        const toServer = targets.filter((r) => r.id >= 0);
        if (toServer.length) {
          await api.post("/api/supplier/batchDelete", toServer);
        }
        this.$toast?.success("삭제 완료");
        this.loadList();
      } catch (e) {
        this.$toast?.error("삭제 중 오류가 발생했습니다");
      }
    },
  },

  mounted() {
    this.loadList();
  },
};
</script>

<style scoped>
.th {
  @apply px-2 py-1.5 text-[10px] font-black uppercase tracking-wider;
}

.td {
  @apply px-2 py-1 align-middle;
}

.cell-input {
  @apply w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md outline-none transition-all
         focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500
         placeholder:text-slate-300;
}
</style>
