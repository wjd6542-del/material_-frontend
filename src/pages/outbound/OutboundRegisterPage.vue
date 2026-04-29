<template>
  <div class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-red-50/30">
    <div class="w-full">
      <!-- 헤더 -->
      <RegisterHeader
        accent="red"
        icon="fa-solid fa-truck-fast"
        subtitle="Outbound Voucher"
        :title="isEdit ? '판매 수정' : '판매 등록'"
        description="판매할 품목·거래처·창고 위치·수량·단가를 입력하여 전표를 생성합니다."
      >
        <template #actions>
          <button
            type="button"
            @click="openInboundSelect"
            class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all shadow-sm"
          >
            <i class="fa-solid fa-file-import"></i>
            구매 정보 불러오기
          </button>
          <button
            type="button"
            @click="goList"
            class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 backdrop-blur-sm transition-all"
          >
            <i class="fa-solid fa-list"></i>
            목록으로
          </button>
        </template>
      </RegisterHeader>

      <!-- 본문 카드 -->
      <form
        @submit.prevent="save"
        class="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-200/70"
      >
        <!-- 기본 정보 -->
        <section class="p-6 md:p-8 border-b border-slate-100">
          <SectionHeader
            number="01"
            icon="fa-solid fa-file-lines"
            title="판매 기본 정보"
            description="판매번호와 메모를 입력합니다"
            accent="red"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <div>
              <label class="form-label">
                판매번호 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.outbound_no"
                type="text"
                class="field bg-slate-50 text-slate-500 cursor-not-allowed"
                readonly
                placeholder="자동 발급"
              />
            </div>
            <div>
              <label class="form-label">거래처 (고객사)</label>
              <SearchSelect
                v-model="form.supplier_id"
                :options="outboundSuppliers"
                labelKey="name"
                valueKey="id"
                placeholder="거래처 선택"
                @change="onSupplierChange"
              />
            </div>

            <div>
              <label class="form-label">판매일자</label>
              <DatePicker v-model="form.outbound_date" placeholder="판매일자" />
            </div>

            <div>
              <label class="form-label">부가세</label>
              <select
                v-model="form.vat_applied"
                @change="onVatAppliedChange"
                class="field"
              >
                <option :value="true">부가세 적용</option>
                <option :value="false">미적용</option>
              </select>
            </div>

            <div>
              <label class="form-label">미수금 여부</label>
              <select v-model="form.is_unpaid" class="field">
                <option :value="true">미수 (미수금 발생)</option>
                <option :value="false">수금 완료</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="form-label">메모</label>
              <textarea
                v-model="form.memo"
                rows="3"
                class="field-auto resize-none"
                placeholder="특이사항이 있으면 입력하세요"
              ></textarea>
            </div>

            <!-- 선택된 거래처 정보 카드 -->
            <div v-if="selectedSupplier" class="md:col-span-2">
              <SupplierInfoCard :supplier="selectedSupplier" type="outbound" />
            </div>
          </div>
        </section>

        <!-- 판매 품목 -->
        <section class="p-6 md:p-8 bg-slate-50/40">
          <SectionHeader
            number="02"
            icon="fa-solid fa-boxes-stacked"
            title="판매 품목"
            description="판매할 품목와 거래처·창고위치·수량·단가를 입력합니다"
            accent="red"
          >
            <template #actions>
              <button
                type="button"
                @click="clearAllItems('판매 품목을 전체 삭제하시겠습니까?')"
                :disabled="!form.items.length"
                class="px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i class="fa-solid fa-trash-can"></i>
                전체 삭제
              </button>
              <button
                type="button"
                @click="openMaterialSelect()"
                class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <i class="fa-solid fa-plus"></i>
                품목 선택
              </button>
            </template>
          </SectionHeader>

          <div class="rounded-2xl border border-slate-200 bg-white mt-4">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="th w-10">#</th>
                  <th class="th text-left" style="min-width: 200px">품목</th>
                  <th class="th text-left" style="min-width: 220px">창고 &gt; 위치 &gt; 선반</th>
                  <th class="th text-right w-24">수량</th>
                  <th class="th text-right w-28">원가</th>
                  <th class="th text-right w-28">판매가</th>
                  <th class="th text-right w-28">공급가액</th>
                  <th class="th text-right w-28">부가세</th>
                  <th class="th text-center w-16">관리</th>
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
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-red-400"
                      :class="it.material_name ? 'text-slate-700' : 'text-slate-400'"
                    >
                      <span class="truncate">
                        {{
                          it.material_name
                            ? `${it.material_code || ""} ${it.material_name}`.trim()
                            : "품목 선택"
                        }}
                      </span>
                      <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"></i>
                    </button>
                  </td>

                  <td class="td">
                    <button
                      type="button"
                      @click="openShelfSelect(it)"
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-red-400"
                      :class="it.shelf_label ? 'text-slate-700' : 'text-slate-400'"
                    >
                      <span class="truncate">
                        {{ it.shelf_label || "위치 선택" }}
                      </span>
                      <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"></i>
                    </button>
                  </td>

                  <td class="td">
                    <input
                      v-model.number="it.quantity"
                      @input="recalcItem(it)"
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
                        @click="openPriceHistory(it, 'cost_price')"
                        :disabled="!it.material_id"
                        class="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed text-[11px]"
                        title="가격 이력에서 선택"
                      >
                        <i class="fa-solid fa-clock-rotate-left"></i>
                      </button>
                      <input
                        v-model.number="it.cost_price"
                        type="number"
                        min="0"
                        class="cell-input text-right pl-7"
                        placeholder="0"
                      />
                    </div>
                  </td>

                  <td class="td">
                    <div class="relative">
                      <button
                        type="button"
                        @click="openPriceHistory(it, 'sale_price')"
                        :disabled="!it.material_id"
                        class="absolute left-1.5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed text-[11px]"
                        title="가격 이력에서 선택"
                      >
                        <i class="fa-solid fa-clock-rotate-left"></i>
                      </button>
                      <input
                        v-model.number="it.sale_price"
                        @input="recalcItem(it)"
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
                      @input="recalcVatOnly(it)"
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
                    <div v-else class="text-right font-mono text-slate-300">-</div>
                  </td>

                  <td class="td text-center">
                    <button
                      type="button"
                      @click="removeItem(i)"
                      class="text-red-400 hover:text-red-600 w-7 h-7 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="!form.items.length">
                  <td colspan="9" class="p-0">
                    <div
                      class="flex flex-col items-center justify-center py-14 px-6 text-center bg-gradient-to-b from-white to-slate-50/60"
                    >
                      <div
                        class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-red-50 to-red-50 border border-red-100/60 flex items-center justify-center mb-4 shadow-sm"
                      >
                        <i class="fa-solid fa-boxes-stacked text-2xl text-red-400"></i>
                        <span
                          class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                        >
                          <i class="fa-solid fa-plus text-[11px] text-red-500"></i>
                        </span>
                      </div>
                      <p class="text-sm font-bold text-slate-700 tracking-tight mb-1">
                        등록된 품목이 없습니다
                      </p>
                      <p class="text-xs text-slate-400 mb-4">
                        판매할 품목을 추가해 주세요.
                      </p>
                      <button
                        type="button"
                        @click="openMaterialSelect()"
                        class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
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
                  <td colspan="6" class="td text-right font-bold text-slate-600">
                    합계
                  </td>
                  <td class="td text-right font-black text-slate-900 font-mono">
                    {{ totalSupply.toLocaleString() }}
                  </td>
                  <td class="td text-right font-black text-slate-900 font-mono">
                    {{ totalVat.toLocaleString() }}
                  </td>
                  <td></td>
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
              {{ totalAmount.toLocaleString() }}
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
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DatePicker from "@/components/base/DatePicker.vue";
import RegisterHeader from "@/components/voucher/RegisterHeader.vue";
import SectionHeader from "@/components/voucher/SectionHeader.vue";
import SupplierInfoCard from "@/components/voucher/SupplierInfoCard.vue";
import MaterialSelectModal from "@/components/material/MaterialSelectModal.vue";
import MaterialPriceHistoryModal from "@/components/material/MaterialPriceHistoryModal.vue";
import ShelfSelectModal from "@/components/warehouse/ShelfSelectModal.vue";
import InboundSelectModal from "@/components/inbound/InboundSelectModal.vue";
import { useModalStore } from "@/stores/modal";
import { voucherMixin } from "@/mixins/voucher";
import { createRefDataMixin } from "@/mixins/refData";
import { formatDateOnly } from "@/utils/date";

export default {
  name: "OutboundRegisterPage",

  components: {
    SearchSelect,
    DatePicker,
    RegisterHeader,
    SectionHeader,
    SupplierInfoCard,
  },

  mixins: [voucherMixin, createRefDataMixin(["suppliers"])],

  data() {
    return {
      saving: false,
      modalStore: useModalStore(),
      suppliers: [],
      form: {
        id: 0,
        outbound_no: "",
        supplier_id: null,
        outbound_date: "",
        vat_applied: true,
        is_unpaid: true,
        memo: "",
        items: [],
      },
    };
  },

  computed: {
    // 판매는 OUTBOUND(고객사) 거래처만 선택 대상
    outboundSuppliers() {
      return (this.suppliers || []).filter(
        (s) => !s.type || s.type === "OUTBOUND",
      );
    },

    // 현재 선택된 거래처 객체
    selectedSupplier() {
      if (!this.form.supplier_id) return null;
      return (
        this.suppliers.find((s) => s.id === this.form.supplier_id) || null
      );
    },
  },

  methods: {
    // 수량/판매가 변경 시 공급가액 = qty*sale_price (mixin 의 price 대신 sale_price 사용)
    recalcItem(it) {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.sale_price) || 0;
      it.supply_amount = Math.round(qty * price);
      it.vat = this.form.vat_applied ? Math.round(it.supply_amount * 0.1) : 0;
    },

    // 행 금액 (qty * sale_price)
    rowAmount(it) {
      return (Number(it.quantity) || 0) * (Number(it.sale_price) || 0);
    },

    openInboundSelect() {
      this.modalStore.openModal(
        InboundSelectModal,
        { onConfirm: (list) => this.applyInboundItems(list) },
        "xl",
      );
    },

    // 구매 품목을 판매 품목 스키마로 변환해 push
    applyInboundItems(list) {
      if (!Array.isArray(list) || !list.length) return;
      list.forEach((raw) => {
        const qty = Number(raw.quantity) || 0;
        const salePrice = Number(raw.sale_price) || 0;
        const supply = Math.round(qty * salePrice);
        this.form.items.push({
          id: 0,
          material_id: raw.material_id,
          material_code: raw.material_code || "",
          material_name: raw.material_name || "",
          spec: raw.spec || "",
          unit: raw.unit || "",
          supplier_id: this.form.supplier_id || null,
          warehouse_id: raw.warehouse_id ?? null,
          location_id: raw.location_id ?? null,
          shelf_id: raw.shelf_id ?? null,
          shelf_label: raw.shelf_label || "",
          quantity: qty,
          cost_price: Number(raw.cost_price) || 0,
          sale_price: salePrice,
          supply_amount: supply,
          vat: this.form.vat_applied ? Math.round(supply * 0.1) : 0,
          inbound_id: raw.inbound_id ?? null,
          inbound_item_id: raw.inbound_item_id ?? null,
        });
      });
      this.$toast?.success(`${list.length}개 품목이 추가되었습니다. 판매가를 입력하세요.`);
    },

    // 헤더 거래처 변경 시 메모 주입 + 모든 행의 supplier_id 동기화
    onSupplierChange() {
      const s = this.selectedSupplier;
      if (s && s.memo) this.form.memo = s.memo;
      const sid = this.form.supplier_id || null;
      this.form.items.forEach((it) => {
        it.supplier_id = sid;
      });
    },

    openMaterialSelect(target = null) {
      this.modalStore.openModal(
        MaterialSelectModal,
        {
          priceField: "outbound_price1",
          onConfirm: (list) => this.applyMaterials(list, target),
        },
        "full",
      );
    },

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
          },
        },
        "full",
      );
    },

    openShelfSelect(target) {
      this.modalStore.openModal(
        ShelfSelectModal,
        { onConfirm: (payload) => this.applyShelf(payload, target) },
        "xl",
      );
    },

    // 판매: 원가=구매가, 판매가=판매1 기준으로 라인 아이템 생성
    buildOutboundItem(m) {
      const qty = 1;
      const salePrice = Number(m.price) || Number(m.outbound_price1) || 0;
      const supply = Math.round(qty * salePrice);
      return {
        id: 0,
        material_id: m.id,
        material_code: m.code || "",
        material_name: m.name || "",
        spec: m.spec || "",
        unit: m.unit || "",
        supplier_id: this.form.supplier_id || null,
        shelf_id: null,
        location_id: null,
        warehouse_id: null,
        shelf_label: "",
        quantity: qty,
        cost_price: Number(m.inbound_price) || 0,
        sale_price: salePrice,
        supply_amount: supply,
        vat: this.form.vat_applied ? Math.round(supply * 0.1) : 0,
      };
    },

    applyMaterials(list, target = null) {
      if (!Array.isArray(list) || !list.length) return;
      if (target) {
        const [first, ...rest] = list;
        target.material_id = first.id;
        target.material_code = first.code || "";
        target.material_name = first.name || "";
        target.spec = first.spec || "";
        target.unit = first.unit || "";
        if ((!target.cost_price || target.cost_price === 0) && first.inbound_price) {
          target.cost_price = Number(first.inbound_price) || 0;
        }
        if ((!target.sale_price || target.sale_price === 0) && first.price) {
          target.sale_price = Number(first.price) || 0;
        }
        if (rest.length) {
          const idx = this.form.items.indexOf(target);
          const newRows = rest.map((m) => this.buildOutboundItem(m));
          this.form.items.splice(idx + 1, 0, ...newRows);
        }
      } else {
        list.forEach((m) => this.form.items.push(this.buildOutboundItem(m)));
      }
    },

    applyShelf(payload, target) {
      const { shelf, location, warehouse } = payload || {};
      if (!shelf || !target) return;
      target.shelf_id = shelf.id;
      target.location_id = location?.id ?? null;
      target.warehouse_id = warehouse?.id ?? null;
      target.shelf_label = shelf.name;
    },

    goList() {
      this.$router.push("/outbound");
    },

    mkOutboundNo() {
      return "OUT-" + Date.now();
    },

    async loadData() {
      const id = this.$route.query.id;
      if (!id) return;
      try {
        const res = await api.post(`/api/outbound/${id}`, { id });
        if (res.data) {
          Object.assign(this.form, res.data);
          if (!Array.isArray(this.form.items)) this.form.items = [];
        }
      } catch (e) {
        this.$toast?.error("판매 전표를 불러오지 못했습니다.");
      }
    },

    async save() {
      if (!this.form.supplier_id) {
        this.$toast?.error("거래처(고객사)를 선택하세요.");
        return;
      }
      if (!this.form.items.length) {
        this.$toast?.error("판매 품목을 최소 1개 이상 등록하세요.");
        return;
      }

      const count = this.form.items.length;
      const total = this.totalAmount.toLocaleString();
      const msg = this.isEdit
        ? `판매 전표를 수정하시겠습니까?\n\n품목 ${count}건 · 합계 ${total}원`
        : `판매 등록을 진행하시겠습니까?\n\n품목 ${count}건 · 합계 ${total}원`;
      const ok = await this.$confirm?.(
        msg,
        this.isEdit ? "수정 확인" : "등록 확인",
        "info",
      );
      if (ok === false) return;

      this.saving = true;
      try {
        await api.post("/api/outbound/save", this.form);
        this.$toast?.success(
          this.isEdit ? "수정되었습니다." : "판매처리가 완료되었습니다",
        );
        this.goList();
      } catch (e) {
        this.$toast?.error(e.response?.data?.message || "저장 실패");
      } finally {
        this.saving = false;
      }
    },
  },

  mounted() {
    this.loadRefData();
    if (this.isEdit) {
      this.loadData();
    } else {
      this.form.outbound_no = this.mkOutboundNo();
      this.form.outbound_date = formatDateOnly(new Date());
    }
  },
};
</script>
