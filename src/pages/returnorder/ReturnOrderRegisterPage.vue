<template>
  <div class="min-h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
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
          class="absolute -top-10 -right-10 w-48 h-48 bg-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
        ></div>

        <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl"
            >
              <i class="fa-solid fa-rotate-left text-white text-xl"></i>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-widest text-orange-300 mb-1">
                Return Order
              </div>
              <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">
                {{ isEdit ? "반품 수정" : "반품 등록" }}
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                반품 자재·위치·수량·반품사유를 입력하여 전표를 생성합니다.
              </p>
            </div>
          </div>

          <div class="self-start md:self-center flex items-center gap-2">
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
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20"
              >
                <i class="fa-solid fa-file-lines text-white text-sm"></i>
              </div>
              <span
                class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
              >01</span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                반품 기본 정보
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                반품번호와 메모를 입력합니다
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="form-label">
                반품번호 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.return_no"
                type="text"
                class="field bg-slate-50 text-slate-500 cursor-not-allowed"
                readonly
                placeholder="자동 발급"
              />
            </div>
            <div>
              <label class="form-label">반품일자</label>
              <DatePicker v-model="form.return_date" placeholder="반품일자" />
            </div>

            <div class="md:col-span-2">
              <label class="form-label">메모</label>
              <textarea
                v-model="form.memo"
                rows="3"
                class="field resize-none"
                placeholder="특이사항이 있으면 입력하세요"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- 반품 품목 -->
        <section class="p-6 md:p-8 bg-slate-50/40">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20"
                >
                  <i class="fa-solid fa-boxes-stacked text-white text-sm"></i>
                </div>
                <span
                  class="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-black text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm"
                >02</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-800 tracking-tight">
                  반품 품목
                </h3>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  반품할 자재·위치·수량·반품사유를 입력합니다
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
                class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
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
                  <th class="th text-left" style="min-width: 220px">창고 &gt; 위치 &gt; 선반</th>
                  <th class="th text-right w-24">수량</th>
                  <th class="th text-right w-28">원가</th>
                  <th class="th text-right w-28">판매가</th>
                  <th class="th text-left w-32">반품사유</th>
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
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-orange-400"
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

                  <!-- 창고>위치>선반 -->
                  <td class="td">
                    <button
                      type="button"
                      @click="openShelfSelect(it)"
                      class="cell-input text-left flex items-center justify-between gap-2 hover:border-orange-400"
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

                  <!-- 반품사유 -->
                  <td class="td">
                    <select v-model="it.reasonType" class="cell-input">
                      <option value="단순변심">단순변심</option>
                      <option value="오발송">오발송</option>
                      <option value="파손">파손</option>
                      <option value="불량">불량</option>
                    </select>
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
                  <td colspan="8" class="p-0">
                    <div
                      class="flex flex-col items-center justify-center py-14 px-6 text-center bg-gradient-to-b from-white to-slate-50/60"
                    >
                      <div
                        class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/60 flex items-center justify-center mb-4 shadow-sm"
                      >
                        <i class="fa-solid fa-rotate-left text-2xl text-orange-400"></i>
                        <span
                          class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                        >
                          <i class="fa-solid fa-plus text-[11px] text-orange-500"></i>
                        </span>
                      </div>
                      <p class="text-sm font-bold text-slate-700 tracking-tight mb-1">
                        등록된 품목이 없습니다
                      </p>
                      <p class="text-xs text-slate-400 mb-4">
                        반품할 자재를 추가해 주세요.
                      </p>
                      <button
                        type="button"
                        @click="openMaterialSelect()"
                        class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <i class="fa-solid fa-plus"></i>
                        자재 선택
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 액션 -->
        <div
          class="bg-gradient-to-r from-slate-50 to-slate-100/60 px-6 md:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 border-t border-slate-200/70"
        >
          <p class="text-[11px] text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-info text-[10px]"></i>
            총 {{ form.items.length }}개 품목
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
              class="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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
import DatePicker from "@/components/base/DatePicker.vue";
import MaterialSelectModal from "@/components/material/MaterialSelectModal.vue";
import ShelfSelectModal from "@/components/warehouse/ShelfSelectModal.vue";
import InboundSelectModal from "@/components/inbound/InboundSelectModal.vue";
import { useModalStore } from "@/stores/modal";

export default {
  name: "ReturnOrderRegisterPage",

  components: { DatePicker },

  data() {
    return {
      saving: false,
      modalStore: useModalStore(),
      form: {
        id: 0,
        return_no: "",
        return_date: "",
        status: "COMPLETED",
        memo: "",
        items: [],
      },
    };
  },

  computed: {
    isEdit() {
      return !!this.$route.query.id;
    },
  },

  methods: {
    // 구매 정보 불러오기 모달 오픈
    openInboundSelect() {
      this.modalStore.openModal(
        InboundSelectModal,
        {
          onConfirm: (list) => this.applyInboundItems(list),
        },
        "xl",
      );
    },

    // 구매에서 가져온 품목 리스트를 반품 품목에 주입한다
    applyInboundItems(list) {
      if (!Array.isArray(list) || !list.length) return;
      list.forEach((it) => this.form.items.push(it));
      this.$toast?.success(`${list.length}개 품목이 추가되었습니다.`);
    },

    // 자재 선택 모달 오픈 (target 있으면 행 교체, 없으면 신규 추가)
    openMaterialSelect(target = null) {
      this.modalStore.openModal(
        MaterialSelectModal,
        {
          // 반품: 판매가 필드를 기본으로 매핑
          priceField: "outbound_price1",
          onConfirm: (list) => this.applyMaterials(list, target),
        },
        "full",
      );
    },

    // 창고>위치>선반 선택 모달 오픈
    openShelfSelect(target) {
      this.modalStore.openModal(
        ShelfSelectModal,
        {
          onConfirm: (payload) => this.applyShelf(payload, target),
        },
        "xl",
      );
    },

    // 자재 정보를 신규 반품 품목 행 객체로 변환한다
    buildItemFromMaterial(m) {
      return {
        id: 0,
        material_id: m.id,
        material_code: m.code || "",
        material_name: m.name || "",
        spec: m.spec || "",
        unit: m.unit || "",
        warehouse_id: null,
        location_id: null,
        shelf_id: null,
        shelf_label: "",
        quantity: 1,
        cost_price: Number(m.inbound_price) || 0,
        sale_price: Number(m.outbound_price1) || Number(m.price) || 0,
        reasonType: "단순변심",
      };
    },

    // 선택된 자재 목록을 품목에 반영한다
    applyMaterials(list, target = null) {
      if (!Array.isArray(list) || !list.length) return;
      if (target) {
        const [first, ...rest] = list;
        target.material_id = first.id;
        target.material_code = first.code || "";
        target.material_name = first.name || "";
        target.spec = first.spec || "";
        target.unit = first.unit || "";
        if (!target.sale_price) target.sale_price = Number(first.outbound_price1) || Number(first.price) || 0;
        if (!target.cost_price) target.cost_price = Number(first.inbound_price) || 0;
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

    // 선반 선택 결과를 행에 반영한다
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
        "반품 품목을 전체 삭제하시겠습니까?",
        "전체 삭제 확인",
      );
      if (ok === false) return;
      this.form.items = [];
    },

    // 목록 페이지로 이동
    goList() {
      this.$router.push("/returnorder");
    },

    // 반품번호 생성
    mkReturnNo() {
      return "RET-" + Date.now();
    },

    // 수정 모드일 때 기존 전표 로드
    async loadData() {
      const id = this.$route.query.id;
      if (!id) return;
      try {
        const res = await api.post(`/api/returnorder/${id}`, { id });
        if (res.data) {
          Object.assign(this.form, res.data);
          if (!Array.isArray(this.form.items)) this.form.items = [];
        }
      } catch (e) {
        this.$toast?.error("반품 전표를 불러오지 못했습니다.");
      }
    },

    // 반품 전표 저장
    async save() {
      if (!this.form.items.length) {
        this.$toast?.error("반품 품목을 최소 1개 이상 등록하세요.");
        return;
      }

      this.saving = true;
      try {
        await api.post("/api/returnorder/save", this.form);
        this.$toast?.success(
          this.isEdit ? "수정되었습니다." : "반품처리가 완료되었습니다",
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
    if (this.isEdit) {
      this.loadData();
    } else {
      this.form.return_no = this.mkReturnNo();
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      this.form.return_date = `${yyyy}-${mm}-${dd}`;
    }
  },
};
</script>

<style scoped>
.form-label {
  @apply block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2;
}
.field {
  @apply w-full h-[30px] px-2.5 text-xs bg-white border border-slate-200 rounded-md outline-none transition-all
         focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500
         placeholder:text-slate-300 text-slate-800 font-medium;
}
textarea.field {
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
         focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500
         placeholder:text-slate-300;
}
</style>
