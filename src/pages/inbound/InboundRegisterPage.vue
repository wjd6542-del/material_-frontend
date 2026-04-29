<template>
  <div
    class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
  >
    <div class="w-full">
      <!-- 헤더 -->
      <RegisterHeader
        accent="blue"
        icon="fa-solid fa-truck-ramp-box"
        subtitle="Inbound Voucher"
        :title="isEdit ? '구매 수정' : '구매 등록'"
        description="구매할 품목·창고 위치·수량·단가를 입력하여 전표를 생성합니다."
      >
        <template #actions>
          <button
            type="button"
            @click="openPurchaseOrderSelect"
            class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all shadow-sm"
          >
            <i class="fa-solid fa-file-import"></i>
            발주 정보 불러오기
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
            title="구매 기본 정보"
            description="구매번호와 메모를 입력합니다"
            accent="blue"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <div>
              <label class="form-label">
                구매번호 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.inbound_no"
                type="text"
                class="field bg-slate-50 text-slate-500 cursor-not-allowed"
                readonly
                placeholder="자동 발급"
              />
            </div>
            <div>
              <label class="form-label">거래처</label>
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
              <label class="form-label">구매일자</label>
              <DatePicker v-model="form.purchase_date" placeholder="구매일자" />
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
              <label class="form-label">지급 여부</label>
              <select v-model="form.is_unpaid" class="field">
                <option :value="true">미지급 (미수금 발생)</option>
                <option :value="false">지급 완료</option>
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
              <SupplierInfoCard :supplier="selectedSupplier" type="inbound" />
            </div>
          </div>
        </section>

        <!-- 구매 품목 -->
        <section class="p-6 md:p-8 bg-slate-50/40">
          <SectionHeader
            number="02"
            icon="fa-solid fa-boxes-stacked"
            title="구매 품목"
            description="구매할 품목와 거래처·창고위치·수량·단가를 입력합니다"
            accent="blue"
          >
            <template #actions>
              <button
                type="button"
                @click="clearAllItems('구매 품목을 전체 삭제하시겠습니까?')"
                :disabled="!form.items.length"
                class="px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i class="fa-solid fa-trash-can"></i>
                전체 삭제
              </button>
              <button
                type="button"
                @click="openMaterialSelect()"
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
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
                  <th class="th text-left" style="min-width: 160px">거래처</th>
                  <th class="th text-left" style="min-width: 220px">
                    창고 &gt; 위치 &gt; 선반
                  </th>
                  <th class="th text-right w-24">수량</th>
                  <th class="th text-right w-28">단가</th>
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
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-blue-400"
                      :class="
                        it.material_name ? 'text-slate-700' : 'text-slate-400'
                      "
                    >
                      <span class="truncate">
                        {{
                          it.material_name
                            ? `${it.material_code || ""} ${it.material_name}`.trim()
                            : "품목 선택"
                        }}
                      </span>
                      <i
                        class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"
                      ></i>
                    </button>
                  </td>

                  <td class="td">
                    <SearchSelect
                      v-model="it.supplier_id"
                      :options="suppliers"
                      labelKey="name"
                      valueKey="id"
                      placeholder="거래처 선택"
                    />
                  </td>

                  <td class="td">
                    <button
                      type="button"
                      @click="openShelfSelect(it)"
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-blue-400"
                      :class="
                        it.shelf_label ? 'text-slate-700' : 'text-slate-400'
                      "
                    >
                      <span class="truncate">
                        {{ it.shelf_label || "위치 선택" }}
                      </span>
                      <i
                        class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"
                      ></i>
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
                        @click="openPriceHistory(it, 'price')"
                        :disabled="!it.material_id"
                        class="absolute left-1.5 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed text-[11px]"
                        title="가격 이력에서 선택"
                      >
                        <i class="fa-solid fa-clock-rotate-left"></i>
                      </button>
                      <input
                        v-model.number="it.price"
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
                    <div v-else class="text-right font-mono text-slate-300">
                      -
                    </div>
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
                        class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100/60 flex items-center justify-center mb-4 shadow-sm"
                      >
                        <i class="fa-solid fa-boxes-stacked text-2xl text-blue-400"></i>
                        <span
                          class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                        >
                          <i class="fa-solid fa-plus text-[11px] text-blue-500"></i>
                        </span>
                      </div>
                      <p class="text-sm font-bold text-slate-700 tracking-tight mb-1">
                        등록된 품목이 없습니다
                      </p>
                      <p class="text-xs text-slate-400 mb-4">
                        구매할 품목을 추가해 주세요.
                      </p>
                      <button
                        type="button"
                        @click="openMaterialSelect()"
                        class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
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
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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
import PurchaseOrderSelectModal from "@/components/purchaseorder/PurchaseOrderSelectModal.vue";
import { useModalStore } from "@/stores/modal";
import { voucherMixin } from "@/mixins/voucher";
import { createRefDataMixin } from "@/mixins/refData";
import { formatDateOnly } from "@/utils/date";
import { buildLocationLabel } from "@/utils/location";

export default {
  name: "InboundRegisterPage",

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
        inbound_no: "",
        supplier_id: null,
        purchase_date: "",
        vat_applied: true,
        is_unpaid: true,
        memo: "",
        items: [],
      },
    };
  },

  computed: {
    // 구매는 INBOUND 거래처만 노출
    inboundSuppliers() {
      return (this.suppliers || []).filter(
        (s) => !s.type || s.type === "INBOUND",
      );
    },

    // 현재 선택된 거래처 객체
    selectedSupplier() {
      if (!this.form.supplier_id) return null;
      return this.suppliers.find((s) => s.id === this.form.supplier_id) || null;
    },
  },

  methods: {
    // 헤더 거래처 변경 시 → 거래처 메모를 폼 메모에 기본 주입
    onSupplierChange() {
      const s = this.selectedSupplier;
      if (s && s.memo) this.form.memo = s.memo;
    },

    // 발주 선택 모달 (헤더 거래처가 있으면 초기 필터로 전달)
    openPurchaseOrderSelect() {
      this.modalStore.openModal(
        PurchaseOrderSelectModal,
        {
          supplier_id: this.form.supplier_id || null,
          onConfirm: (list) => this.applyPurchaseOrderItems(list),
        },
        "xl",
      );
    },

    // 발주에서 가져온 품목 리스트를 구매 품목에 주입
    applyPurchaseOrderItems(list) {
      if (!Array.isArray(list) || !list.length) return;
      list.forEach((it) => {
        const qty = Number(it.quantity) || 0;
        const price = Number(it.price) || 0;
        if (it.supply_amount == null) it.supply_amount = Math.round(qty * price);
        if (it.vat == null) {
          it.vat = this.form.vat_applied ? Math.round(it.supply_amount * 0.1) : 0;
        }
        this.form.items.push(it);
      });
      this.$toast?.success(`${list.length}개 품목이 추가되었습니다.`);
    },

    // 품목 선택 모달 (target 있으면 행 교체, 없으면 신규 추가)
    openMaterialSelect(target = null) {
      this.modalStore.openModal(
        MaterialSelectModal,
        {
          priceField: "inbound_price",
          onConfirm: (list) => this.applyMaterials(list, target),
        },
        "full",
      );
    },

    // 단가 이력에서 금액 선택 모달
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

    // 창고>위치>선반 선택 모달
    openShelfSelect(target) {
      this.modalStore.openModal(
        ShelfSelectModal,
        { onConfirm: (payload) => this.applyShelf(payload, target) },
        "xl",
      );
    },

    // 선택된 품목을 라인 아이템에 반영 (구매: supplier_id/shelf 등 추가 필드)
    applyMaterials(list, target = null) {
      if (!Array.isArray(list) || !list.length) return;
      const inboundDefaults = {
        supplier_id: null,
        shelf_id: null,
        location_id: null,
        warehouse_id: null,
      };
      if (target) {
        const [first, ...rest] = list;
        target.material_id = first.id;
        target.material_code = first.code || "";
        target.material_name = first.name || "";
        target.spec = first.spec || "";
        target.unit = first.unit || "";
        if ((!target.price || target.price === 0) && first.price) {
          target.price = Number(first.price) || 0;
        }
        if (rest.length) {
          const idx = this.form.items.indexOf(target);
          const newRows = rest.map((m) =>
            this.buildItemFromMaterial(m, inboundDefaults),
          );
          this.form.items.splice(idx + 1, 0, ...newRows);
        }
      } else {
        list.forEach((m) =>
          this.form.items.push(this.buildItemFromMaterial(m, inboundDefaults)),
        );
      }
    },

    // 선반 선택 결과를 행에 반영
    applyShelf(payload, target) {
      const { shelf, location, warehouse } = payload || {};
      if (!shelf || !target) return;
      target.shelf_id = shelf.id;
      target.location_id = location?.id ?? null;
      target.warehouse_id = warehouse?.id ?? null;
      target.shelf_label = shelf.name;
    },

    goList() {
      this.$router.push("/inbound");
    },

    mkInboundNo() {
      return "IN-" + Date.now();
    },

    async loadData() {
      const id = this.$route.query.id;
      if (!id) return;
      try {
        const res = await api.post(`/api/inbound/${id}`, { id });
        const data = res?.data || {};
        Object.assign(this.form, data);

        // 중첩 relation(material/warehouse/location/shelf) 평탄화
        const items = Array.isArray(data.items) ? data.items : [];
        this.form.items = items.map((it) => {
          const m = it.material || {};
          const w = it.warehouse || {};
          const l = it.location || {};
          const s = it.shelf || {};
          return {
            ...it,
            material_code: it.material_code || m.code || "",
            material_name: it.material_name || m.name || "",
            spec: it.spec || m.spec || "",
            unit: it.unit || m.unit || "",
            warehouse_id: it.warehouse_id ?? w.id ?? null,
            location_id: it.location_id ?? l.id ?? null,
            shelf_id: it.shelf_id ?? s.id ?? null,
            shelf_label: it.shelf_label || buildLocationLabel(it),
            quantity: Number(it.quantity) || 0,
            price: Number(it.price) || 0,
            supply_amount: Number(it.supply_amount) || 0,
            vat: Number(it.vat) || 0,
          };
        });
      } catch (e) {
        this.$toast?.error("구매 전표를 불러오지 못했습니다.");
      }
    },

    async save() {
      if (!this.form.items.length) {
        this.$toast?.error("구매 품목을 최소 1개 이상 등록하세요.");
        return;
      }
      const count = this.form.items.length;
      const total = this.totalAmount.toLocaleString();
      const msg = this.isEdit
        ? `구매 전표를 수정하시겠습니까?\n\n품목 ${count}건 · 합계 ${total}원`
        : `구매 등록을 진행하시겠습니까?\n\n품목 ${count}건 · 합계 ${total}원`;
      const ok = await this.$confirm?.(
        msg,
        this.isEdit ? "수정 확인" : "등록 확인",
      );
      if (ok === false) return;

      this.saving = true;
      try {
        await api.post("/api/inbound/save", this.form);
        this.$toast?.success(
          this.isEdit ? "수정되었습니다." : "구매처리가 완료되었습니다",
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
      this.form.inbound_no = this.mkInboundNo();
      this.form.purchase_date = formatDateOnly(new Date());
    }
  },
};
</script>
