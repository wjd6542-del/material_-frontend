<template>
  <div class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
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
          class="absolute -top-10 -right-10 w-48 h-48 bg-rose-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
            >
              <i class="fa-solid fa-truck-fast text-white text-xl"></i>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-widest text-rose-300 mb-1">
                Outbound Voucher
              </div>
              <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">
                {{ isEdit ? "판매 수정" : "판매 등록" }}
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                판매할 자재·거래처·창고 위치·수량·단가를 입력하여 전표를 생성합니다.
              </p>
            </div>
          </div>

          <div class="self-start md:self-center flex items-center gap-2">
            <button
              type="button"
              @click="goList"
              class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 backdrop-blur-sm transition-all"
            >
              <i class="fa-solid fa-list"></i>
              목록으로
            </button>
          </div>
        </div>
      </div>

      <!-- 본문 카드 -->
      <form
        @submit.prevent="save"
        class="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-200/70"
      >
        <!-- 기본 정보 -->
        <section class="p-6 md:p-8 border-b border-slate-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20"
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
                판매 기본 정보
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                판매번호와 메모를 입력합니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <label class="form-label">메모</label>
              <input
                v-model="form.memo"
                type="text"
                class="field"
                placeholder="특이사항이 있으면 입력하세요"
              />
            </div>
          </div>
        </section>

        <!-- 판매 품목 -->
        <section class="p-6 md:p-8 bg-slate-50/40">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20"
                >
                  <i class="fa-solid fa-boxes-stacked text-white text-sm"></i>
                </div>
                <span
                  class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
                  >02</span
                >
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                  판매 품목
                </h3>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  판매할 자재와 거래처·창고위치·수량·단가를 입력합니다
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
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <i class="fa-solid fa-plus"></i>
                자재 선택
              </button>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="th w-10">#</th>
                  <th class="th text-left" style="min-width: 200px">자재</th>
                  <th class="th text-left" style="min-width: 160px">
                    거래처 <span class="text-red-500">*</span>
                  </th>
                  <th class="th text-left" style="min-width: 220px">창고 &gt; 위치 &gt; 선반</th>
                  <th class="th text-right w-24">수량</th>
                  <th class="th text-right w-28">원가</th>
                  <th class="th text-right w-28">판매가</th>
                  <th class="th text-right w-28">금액</th>
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

                  <!-- 자재 -->
                  <td class="td">
                    <button
                      type="button"
                      @click="openMaterialSelect(it)"
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-rose-400"
                      :class="it.material_name ? 'text-slate-700' : 'text-slate-400'"
                    >
                      <span class="truncate">
                        {{
                          it.material_name
                            ? `${it.material_code || ""} ${it.material_name}`.trim()
                            : "자재 선택"
                        }}
                      </span>
                      <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"></i>
                    </button>
                  </td>

                  <!-- 거래처 -->
                  <td class="td">
                    <SearchSelect
                      v-model="it.supplier_id"
                      :options="suppliers"
                      labelKey="name"
                      valueKey="id"
                      placeholder="거래처 선택"
                    />
                  </td>

                  <!-- 창고>위치>선반 -->
                  <td class="td">
                    <button
                      type="button"
                      @click="openShelfSelect(it)"
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-rose-400"
                      :class="it.shelf_label ? 'text-slate-700' : 'text-slate-400'"
                    >
                      <span class="truncate">
                        {{ it.shelf_label || "위치 선택" }}
                      </span>
                      <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"></i>
                    </button>
                  </td>

                  <!-- 수량 -->
                  <td class="td">
                    <input
                      v-model.number="it.quantity"
                      type="number"
                      min="0"
                      class="cell-input text-right"
                      placeholder="0"
                    />
                  </td>

                  <!-- 원가 -->
                  <td class="td">
                    <input
                      v-model.number="it.cost_price"
                      type="number"
                      min="0"
                      class="cell-input text-right"
                      placeholder="0"
                    />
                  </td>

                  <!-- 판매가 -->
                  <td class="td">
                    <input
                      v-model.number="it.sale_price"
                      type="number"
                      min="0"
                      class="cell-input text-right"
                      placeholder="0"
                    />
                  </td>

                  <!-- 금액 -->
                  <td class="td text-right font-mono">
                    {{ rowAmount(it).toLocaleString() }}
                  </td>

                  <!-- 관리 -->
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
                        class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/60 flex items-center justify-center mb-4 shadow-sm"
                      >
                        <i class="fa-solid fa-boxes-stacked text-2xl text-rose-400"></i>
                        <span
                          class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                        >
                          <i class="fa-solid fa-plus text-[11px] text-rose-500"></i>
                        </span>
                      </div>
                      <p class="text-sm font-bold text-slate-700 tracking-tight mb-1">
                        등록된 품목이 없습니다
                      </p>
                      <p class="text-xs text-slate-400 mb-4">
                        판매할 자재를 추가해 주세요.
                      </p>
                      <button
                        type="button"
                        @click="openMaterialSelect()"
                        class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <i class="fa-solid fa-plus"></i>
                        자재 선택
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="form.items.length">
                <tr class="border-t-2 border-slate-200 bg-slate-50">
                  <td colspan="7" class="td text-right font-bold text-slate-600">
                    합계
                  </td>
                  <td class="td text-right font-black text-slate-900 font-mono">
                    {{ totalAmount.toLocaleString() }}
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
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-md shadow-rose-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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
import MaterialSelectModal from "@/components/material/MaterialSelectModal.vue";
import ShelfSelectModal from "@/components/warehouse/ShelfSelectModal.vue";
import { useModalStore } from "@/stores/modal";

export default {
  name: "OutboundRegisterPage",

  components: { SearchSelect },

  data() {
    return {
      saving: false,
      modalStore: useModalStore(),
      suppliers: [],
      form: {
        id: 0,
        outbound_no: "",
        memo: "",
        items: [],
      },
    };
  },

  computed: {
    // 수정 모드 여부
    isEdit() {
      return !!this.$route.query.id;
    },

    // 금액 합계 (판매가 기준)
    totalAmount() {
      return this.form.items.reduce(
        (sum, it) => sum + this.rowAmount(it),
        0,
      );
    },
  },

  methods: {
    // 행 금액 계산 (수량 * 판매가)
    rowAmount(it) {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.sale_price) || 0;
      return qty * price;
    },

    // 자재 선택 모달
    openMaterialSelect(target = null) {
      this.modalStore.openModal(
        MaterialSelectModal,
        {
          onConfirm: (list) => this.applyMaterials(list, target),
        },
        "full",
      );
    },

    // 창고>위치>선반 선택 모달
    openShelfSelect(target) {
      this.modalStore.openModal(
        ShelfSelectModal,
        {
          onConfirm: (payload) => this.applyShelf(payload, target),
        },
        "xl",
      );
    },

    // 자재 → 품목 행 변환
    buildItemFromMaterial(m) {
      return {
        id: 0,
        material_id: m.id,
        material_code: m.code || "",
        material_name: m.name || "",
        spec: m.spec || "",
        unit: m.unit || "",
        supplier_id: null,
        shelf_id: null,
        location_id: null,
        warehouse_id: null,
        shelf_label: "",
        quantity: 1,
        cost_price: Number(m.cost_price) || Number(m.price) || 0,
        sale_price: Number(m.sale_price) || Number(m.price) || 0,
      };
    },

    // 자재 선택 결과 반영
    applyMaterials(list, target = null) {
      if (!Array.isArray(list) || !list.length) return;
      if (target) {
        const [first, ...rest] = list;
        target.material_id = first.id;
        target.material_code = first.code || "";
        target.material_name = first.name || "";
        target.spec = first.spec || "";
        target.unit = first.unit || "";
        if (
          (!target.cost_price || target.cost_price === 0) &&
          first.price
        ) {
          target.cost_price = Number(first.price) || 0;
        }
        if (
          (!target.sale_price || target.sale_price === 0) &&
          first.price
        ) {
          target.sale_price = Number(first.price) || 0;
        }
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

    // 선반 선택 결과 반영
    applyShelf(payload, target) {
      const { shelf, location, warehouse } = payload || {};
      if (!shelf || !target) return;
      target.shelf_id = shelf.id;
      target.location_id = location?.id ?? null;
      target.warehouse_id = warehouse?.id ?? null;
      target.shelf_label = shelf.name;
    },

    // 지정 인덱스의 품목 행을 제거한다
    removeItem(i) {
      this.form.items.splice(i, 1);
    },

    // 품목 전체를 일괄 삭제한다
    async clearAllItems() {
      if (!this.form.items.length) return;
      const ok = await this.$confirm?.(
        "판매 품목을 전체 삭제하시겠습니까?",
        "전체 삭제 확인",
      );
      if (ok === false) return;
      this.form.items = [];
    },

    // 목록으로 이동
    goList() {
      this.$router.push("/outbound");
    },

    // 판매번호 생성
    mkOutboundNo() {
      return "OUT-" + Date.now();
    },

    // 거래처 목록 로드
    async loadSuppliers() {
      try {
        const res = await api.post("/api/supplier/list", {});
        this.suppliers = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        this.$toast?.error("거래처 목록을 불러오지 못했습니다.");
      }
    },

    // 수정 모드 기존 전표 로드
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

    // 저장
    async save() {
      if (!this.form.items.length) {
        this.$toast?.error("판매 품목을 최소 1개 이상 등록하세요.");
        return;
      }
      const missing = this.form.items.findIndex((it) => !it.supplier_id);
      if (missing !== -1) {
        this.$toast?.error(`${missing + 1}번 품목의 거래처를 선택하세요.`);
        return;
      }

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
    this.loadSuppliers();
    if (this.isEdit) {
      this.loadData();
    } else {
      this.form.outbound_no = this.mkOutboundNo();
    }
  },
};
</script>
