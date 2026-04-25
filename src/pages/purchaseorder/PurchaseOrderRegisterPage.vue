<template>
  <div
    class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-teal-50/30"
  >
    <div class="w-full">
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
          class="absolute -top-10 -right-10 w-48 h-48 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div
          class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
            >
              <i class="fa-solid fa-clipboard-list text-white text-xl"></i>
            </div>
            <div>
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-teal-300 mb-1"
              >
                Purchase Order
              </div>
              <h2
                class="text-xl md:text-2xl font-black text-white tracking-tight"
              >
                {{ isEdit ? "발주 수정" : "발주 등록" }}
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                거래처·품목·수량을 입력하여 발주 전표를 생성합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="goList"
            class="self-start md:self-center px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 backdrop-blur-sm transition-all"
          >
            <i class="fa-solid fa-list"></i>
            목록으로
          </button>
        </div>
      </div>

      <!-- 본문 카드 -->
      <form
        @submit.prevent="saveOrder"
        class="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-200/70 overflow-hidden"
      >
        <!-- 발주 기본 정보 -->
        <section class="p-6 md:p-8 border-b border-slate-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20"
              >
                <i class="fa-solid fa-file-lines text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
                >01</span
              >
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                발주 기본 정보
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                발주처와 발주 일정을 입력합니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="form-label">
                발주번호 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.order_no"
                type="text"
                class="form-input bg-slate-50 text-slate-500 cursor-not-allowed"
                readonly
                placeholder="자동 발급"
              />
            </div>
            <div>
              <label class="form-label">
                거래처 <span class="text-red-500">*</span>
              </label>
              <SearchSelect
                v-model="form.supplier_id"
                :options="inboundSuppliers"
                labelKey="name"
                valueKey="id"
                placeholder="거래처 선택"
                @change="onSupplierChange"
              />
            </div>
            <div>
              <label class="form-label">발주일자</label>
              <DatePicker v-model="form.order_date" placeholder="발주일자" />
            </div>
            <div>
              <label class="form-label">납기일자</label>
              <DatePicker v-model="form.delivery_date" placeholder="납기일자" />
            </div>
            <div>
              <label class="form-label">상태</label>
              <select v-model="form.status" class="form-input">
                <option value="draft">임시저장</option>
                <option value="ordered">발주완료</option>
                <option value="received">구매완료</option>
                <option value="canceled">취소</option>
              </select>
            </div>
            <div>
              <label class="form-label">부가세</label>
              <select
                v-model="form.vat_applied"
                @change="onVatAppliedChange"
                class="form-input"
              >
                <option :value="true">부가세 적용</option>
                <option :value="false">미적용</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="form-label">메모</label>
              <textarea
                v-model="form.memo"
                rows="3"
                class="form-input resize-none"
                placeholder="특이사항이 있으면 입력하세요"
              ></textarea>
            </div>

            <!-- 선택된 거래처 정보 카드 -->
            <div v-if="selectedSupplier" class="md:col-span-2">
              <div
                class="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 to-white p-4"
              >
                <div class="flex items-start justify-between gap-4 flex-wrap">
                  <div class="flex items-start gap-3 min-w-0">
                    <div
                      class="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center shadow-sm shrink-0"
                    >
                      <i class="fa-solid fa-building text-sm"></i>
                    </div>
                    <div class="min-w-0">
                      <div
                        class="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-0.5"
                      >
                        Supplier
                      </div>
                      <div class="text-sm font-black text-slate-800 truncate">
                        {{ selectedSupplier.name }}
                        <span
                          v-if="selectedSupplier.registration_no"
                          class="ml-1 text-[11px] text-slate-400 font-mono font-medium"
                        >
                          {{ selectedSupplier.registration_no }}
                        </span>
                      </div>
                      <div
                        class="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap"
                      >
                        <span v-if="selectedSupplier.phone" class="inline-flex items-center gap-1">
                          <i class="fa-solid fa-phone text-[10px] text-slate-400"></i>
                          {{ selectedSupplier.phone }}
                        </span>
                        <span v-if="selectedSupplier.mobile" class="inline-flex items-center gap-1">
                          <i class="fa-solid fa-mobile-screen text-[10px] text-slate-400"></i>
                          {{ selectedSupplier.mobile }}
                        </span>
                        <span v-if="selectedSupplier.email" class="inline-flex items-center gap-1">
                          <i class="fa-solid fa-envelope text-[10px] text-slate-400"></i>
                          {{ selectedSupplier.email }}
                        </span>
                        <span
                          v-if="selectedSupplier.address"
                          class="inline-flex items-center gap-1 truncate"
                        >
                          <i class="fa-solid fa-location-dot text-[10px] text-slate-400"></i>
                          {{ selectedSupplier.address }}
                          {{ selectedSupplier.address_detail || "" }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 미지급금 -->
                  <div
                    class="shrink-0 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-right"
                  >
                    <div
                      class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5 inline-flex items-center gap-1"
                    >
                      <i class="fa-solid fa-circle-exclamation text-[9px]"></i>
                      미지급금
                    </div>
                    <div
                      class="text-base font-black font-mono tabular-nums"
                      :class="
                        Number(selectedSupplier.payable) > 0
                          ? 'text-indigo-700'
                          : 'text-slate-400'
                      "
                    >
                      {{ Number(selectedSupplier.payable || 0).toLocaleString() }}
                      <span class="text-[10px] text-slate-400 font-sans font-medium">원</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 발주 품목 -->
        <section class="p-6 md:p-8 bg-slate-50/40">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20"
                >
                  <i class="fa-solid fa-boxes-stacked text-white text-sm"></i>
                </div>
                <span
                  class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
                  >02</span
                >
              </div>
              <div>
                <h3
                  class="text-[15px] font-black text-slate-800 tracking-tight"
                >
                  발주 품목
                </h3>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  발주할 품목와 수량·단가를 입력합니다
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                @click="clearAllItems"
                :disabled="!form.items.length"
                class="px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i class="fa-solid fa-trash-can"></i>
                전체 삭제
              </button>
              <button
                type="button"
                @click="openMaterialSelect()"
                class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <i class="fa-solid fa-plus"></i>
                품목 선택
              </button>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="th">#</th>
                  <th class="th text-left" style="min-width: 180px">
                    품목번호
                  </th>
                  <th class="th text-left">품목명</th>
                  <th class="th text-left">규격</th>
                  <th class="th text-right">수량</th>
                  <th class="th text-right">단가</th>
                  <th class="th text-right">공급가액</th>
                  <th class="th text-right">부가세</th>
                  <th class="th text-left">적요</th>
                  <th class="th text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(it, i) in form.items"
                  :key="i"
                  class="border-t border-slate-100"
                >
                  <td class="td text-center text-slate-400 font-mono">
                    {{ i + 1 }}
                  </td>
                  <td class="td">
                    <button
                      type="button"
                      @click="openMaterialSelect(it)"
                      class="cell-input text-left flex items-center justify-between hover:border-teal-400"
                      :class="
                        it.material_code
                          ? 'text-slate-700 font-mono'
                          : 'text-slate-400'
                      "
                    >
                      <span class="truncate">
                        {{ it.material_code || "품목 선택" }}
                      </span>
                      <i
                        class="fa-solid fa-magnifying-glass text-[10px] text-slate-400 ml-2"
                      ></i>
                    </button>
                  </td>
                  <td class="td text-slate-700">
                    {{ it.material_name || "-" }}
                  </td>
                  <td class="td text-slate-700">
                    {{ it.spec || "-" }}
                  </td>
                  <td class="td">
                    <input
                      v-model.number="it.quantity"
                      type="number"
                      min="0"
                      class="cell-input text-right"
                      placeholder="0"
                    />
                  </td>
                  <td class="td">
                    <div class="relative">
                      <button
                        type="button"
                        @click="openPriceHistory(it, 'price')"
                        :disabled="!it.material_id"
                        class="absolute left-1.5 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-700 disabled:text-slate-300 disabled:cursor-not-allowed text-[11px]"
                        title="가격 이력에서 선택"
                      >
                        <i class="fa-solid fa-clock-rotate-left"></i>
                      </button>
                      <input
                        v-model.number="it.price"
                        type="number"
                        min="0"
                        class="cell-input text-right pl-7"
                        placeholder="0"
                      />
                    </div>
                  </td>
                  <td class="td">
                    <input
                      v-model.number="it.supply_amount"
                      @input="recalcItem(it)"
                      type="number"
                      min="0"
                      class="cell-input text-right"
                      placeholder="0"
                    />
                  </td>
                  <td class="td">
                    <input
                      v-if="form.vat_applied"
                      v-model.number="it.vat"
                      type="number"
                      min="0"
                      class="cell-input text-right"
                      placeholder="0"
                    />
                    <div v-else class="text-right font-mono text-slate-300">
                      -
                    </div>
                  </td>
                  <td class="td">
                    <input
                      v-model="it.memo"
                      type="text"
                      class="cell-input"
                      placeholder="적요"
                    />
                  </td>
                  <td class="td text-center">
                    <button
                      type="button"
                      @click="removeItem(i)"
                      class="text-red-400 hover:text-red-600 w-7 h-7 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <i class="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!form.items.length">
                  <td colspan="10" class="p-0">
                    <div
                      class="flex flex-col items-center justify-center py-14 px-6 text-center bg-gradient-to-b from-white to-slate-50/60"
                    >
                      <div
                        class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100/60 flex items-center justify-center mb-4 shadow-sm"
                      >
                        <i
                          class="fa-solid fa-boxes-stacked text-2xl text-teal-400"
                        ></i>
                        <span
                          class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                        >
                          <i
                            class="fa-solid fa-plus text-[11px] text-teal-500"
                          ></i>
                        </span>
                      </div>
                      <p
                        class="text-sm font-bold text-slate-700 tracking-tight mb-1"
                      >
                        등록된 품목이 없습니다
                      </p>
                      <p class="text-xs text-slate-400 mb-4">
                        발주할 품목·수량·단가를 추가해 주세요.
                      </p>
                      <button
                        type="button"
                        @click="openMaterialSelect()"
                        class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <i class="fa-solid fa-plus"></i>
                        품목 선택
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="form.items.length">
                <tr class="border-t-2 border-slate-200 bg-slate-50">
                  <td
                    colspan="6"
                    class="td text-right font-bold text-slate-600"
                  >
                    합계
                  </td>
                  <td class="td text-right font-black text-slate-900 font-mono">
                    {{ formatMoney(totalSupply) }}
                  </td>
                  <td class="td text-right font-black text-slate-900 font-mono">
                    {{ formatMoney(totalVat) }}
                  </td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <!-- 액션 -->
        <div
          class="bg-gradient-to-r from-slate-50 to-slate-100/60 px-6 md:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 border-t border-slate-200/70"
        >
          <p class="text-[11px] text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-info text-[10px]"></i>
            총 {{ form.items.length }}개 품목 · 합계
            <span class="text-slate-700 font-bold font-mono">
              {{ formatMoney(totalAmount) }}
            </span>
            원
          </p>
          <div class="flex items-center gap-2 justify-end">
            <button
              type="button"
              @click="goList"
              class="px-5 py-2.5 text-sm font-bold rounded-xl text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white shadow-md shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              {{ saving ? "저장 중" : isEdit ? "수정" : "저장" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DatePicker from "@/components/base/DatePicker.vue";
import MaterialSelectModal from "@/components/material/MaterialSelectModal.vue";
import MaterialPriceHistoryModal from "@/components/material/MaterialPriceHistoryModal.vue";
import { useModalStore } from "@/stores/modal";

export default {
  name: "PurchaseOrderRegisterPage",

  components: {
    SearchSelect,
    DatePicker,
  },

  data() {
    return {
      saving: false,
      modalStore: useModalStore(),
      suppliers: [],
      form: {
        id: null,
        order_no: "",
        supplier_id: "",
        order_date: "",
        delivery_date: "",
        status: "draft",
        vat_applied: true,
        memo: "",
        items: [],
      },
    };
  },

  computed: {
    // 수정 모드 여부 (쿼리에 id 존재)
    isEdit() {
      return !!this.$route.query.id;
    },

    // 발주는 INBOUND(구매) 거래처만 선택 대상
    inboundSuppliers() {
      return (this.suppliers || []).filter(
        (s) => !s.type || s.type === "INBOUND",
      );
    },

    // 현재 선택된 거래처 객체
    selectedSupplier() {
      if (!this.form.supplier_id) return null;
      return (
        this.suppliers.find((s) => s.id === this.form.supplier_id) || null
      );
    },

    // 공급가액 합계
    totalSupply() {
      return this.form.items.reduce(
        (sum, it) => sum + (Number(it.supply_amount) || 0),
        0,
      );
    },

    // 부가세 합계
    totalVat() {
      return this.form.items.reduce(
        (sum, it) => sum + (Number(it.vat) || 0),
        0,
      );
    },

    // 총액 (공급가액 + 부가세)
    totalAmount() {
      return this.totalSupply + this.totalVat;
    },
  },

  methods: {
    // 헤더 거래처 변경 시 → 거래처에 등록된 메모를 폼 메모에 기본 주입
    onSupplierChange() {
      const s = this.selectedSupplier;
      if (s && s.memo) {
        this.form.memo = s.memo;
      }
    },

    // 공급가액 기준으로 부가세를 재계산해 행에 반영한다
    recalcItem(it) {
      const supply = Number(it.supply_amount) || 0;
      it.vat = this.form.vat_applied ? Math.round(supply * 0.1) : 0;
    },

    // 부가세 적용 여부 변경 시 전체 품목의 부가세를 재계산한다
    onVatAppliedChange() {
      this.form.items.forEach((it) => this.recalcItem(it));
    },

    // 금액 포맷터 (천단위 콤마)
    formatMoney(n) {
      return (Number(n) || 0).toLocaleString("ko-KR");
    },

    // 빈 품목 행을 추가한다
    addItem() {
      this.form.items.push({
        material_id: null,
        material_code: "",
        material_name: "",
        spec: "",
        quantity: 0,
        price: 0,
        supply_amount: 0,
        vat: 0,
        memo: "",
      });
    },

    // 단가 이력에서 금액 선택 모달을 연다
    openPriceHistory(target, field) {
      if (!target?.material_id) {
        this.$toast?.error("먼저 품목을 선택해 주세요.");
        return;
      }
      this.modalStore.openModal(
        MaterialPriceHistoryModal,
        {
          material_id: target.material_id,
          material_code: target.material_code,
          material_name: target.material_name,
          selectable: true,
          onSelect: (value) => {
            target[field] = Number(value) || 0;
            // 부가세 재계산 (supply_amount/vat)
            if (typeof this.recalcItem === "function") this.recalcItem(target);
          },
        },
        "full",
      );
    },

    // 품목 선택 모달을 열어 선택한 품목들을 목록에 반영한다
    // target 이 전달되면 첫 항목으로 해당 행을 교체하고 나머지는 새 행으로 추가한다
    openMaterialSelect(target = null) {
      this.modalStore.openModal(
        MaterialSelectModal,
        {
          // 발주: 품목 단가 매핑을 구매가 기준으로
          priceField: "inbound_price",
          onConfirm: (list) => this.applyMaterials(list, target),
        },
        "full",
      );
    },

    // 품목 정보를 새 품목 행 객체로 변환한다
    buildItemFromMaterial(m) {
      const it = {
        material_id: m.id,
        material_code: m.code || "",
        material_name: m.name || "",
        spec: m.spec || "",
        quantity: 0,
        price: Number(m.price) || 0,
        supply_amount: 0,
        vat: 0,
        memo: "",
      };
      this.recalcItem(it);
      return it;
    },

    // 선택된 품목 목록을 품목 리스트에 반영한다
    applyMaterials(list, target = null) {
      if (!Array.isArray(list) || !list.length) return;
      if (target) {
        const [first, ...rest] = list;
        target.material_id = first.id;
        target.material_code = first.code || "";
        target.material_name = first.name || "";
        target.spec = first.spec || "";
        if ((!target.price || target.price === 0) && first.price) {
          target.price = Number(first.price) || 0;
        }
        this.recalcItem(target);
        if (rest.length) {
          const idx = this.form.items.indexOf(target);
          const newRows = rest.map((m) => this.buildItemFromMaterial(m));
          this.form.items.splice(idx + 1, 0, ...newRows);
        }
      } else {
        list.forEach((m) =>
          this.form.items.push(this.buildItemFromMaterial(m)),
        );
      }
    },

    // 지정 인덱스의 품목을 제거한다
    removeItem(i) {
      this.form.items.splice(i, 1);
    },

    // 품목 전체를 일괄 삭제한다
    async clearAllItems() {
      if (!this.form.items.length) return;
      const ok = await this.$confirm?.(
        "발주 품목을 전체 삭제하시겠습니까?",
        "전체 삭제 확인", "danger",
      );
      if (ok === false) return;
      this.form.items = [];
    },

    // 목록 페이지로 이동한다
    goList() {
      this.$router.push("/purchaseorder");
    },

    // 거래처 목록을 로드한다
    async loadSuppliers() {
      try {
        const res = await api.post("/api/supplier/list", {});
        this.suppliers = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        this.$toast?.error("거래처 목록을 불러오지 못했습니다.");
      }
    },

    // 신규 발주번호를 생성한다
    mkOrderNo() {
      return "PO-" + Date.now();
    },

    // 발주 정보를 서버에 저장한다
    async saveOrder() {
      if (!this.form.supplier_id) {
        this.$toast?.error("거래처를 선택하세요.");
        return;
      }
      if (!this.form.items.length) {
        this.$toast?.error("발주 품목을 최소 1개 이상 등록하세요.");
        return;
      }

      this.saving = true;
      try {
        const payload = {
          ...this.form,
        };
        if (!this.isEdit) payload.order_no = this.mkOrderNo();
        await api.post("/api/purchaseOrder/save", payload);
        this.$toast?.success("저장되었습니다.");
        this.goList();
      } catch (e) {
        this.$toast?.error("저장 실패");
      } finally {
        this.saving = false;
      }
    },

    // id 가 있으면 기존 발주를 로드한다
    async loadOrder() {
      const id = this.$route.query.id;
      if (!id) return;
      try {
        const res = await api.post("/api/purchaseOrder/info", { id });
        if (res.data) {
          Object.assign(this.form, res.data);
          if (!Array.isArray(this.form.items)) this.form.items = [];
          this.form.items.forEach((it) => this.recalcItem(it));
        }
      } catch (e) {
        this.$toast?.error("발주 정보를 불러오지 못했습니다.");
      }
    },
  },

  mounted() {
    this.loadSuppliers();
    if (this.isEdit) {
      this.loadOrder();
    } else {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      this.form.order_date = `${yyyy}-${mm}-${dd}`;
      this.form.order_no = this.mkOrderNo();
    }
  },
};
</script>

<style scoped>
.form-label {
  @apply block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2;
}

.form-input {
  @apply w-full h-[30px] px-2.5 text-xs bg-white border border-slate-200 rounded-md outline-none transition-all
         focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500
         placeholder:text-slate-300 text-slate-800 font-medium;
}
textarea.form-input {
  @apply h-auto min-h-[30px] py-1.5;
}

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
