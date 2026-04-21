<template>
  <div class="w-full">
    <h2 class="text-base font-semibold mb-3">입고 전표 등록</h2>

    <!-- 전표 정보 -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div>
        <label class="form-label">입고번호</label>
        <input v-model="form.inbound_no" class="field bg-slate-50" readonly />
      </div>

      <div>
        <label class="form-label">메모</label>
        <input v-model="form.memo" class="field" placeholder="메모 입력" />
      </div>
    </div>

    <!-- 품목 리스트 -->
    <div class="mb-2 flex justify-between items-center">
      <h3 class="text-xs font-semibold text-slate-700">입고 품목</h3>
      <button type="button" class="btn btn-primary" @click="openMaterialSelect()">
        <i class="fa-solid fa-plus text-[10px]"></i>
        자재 선택
      </button>
    </div>

    <div class="border rounded-md">
      <table class="w-full text-xs">
        <thead class="bg-slate-50">
          <tr>
            <th class="th">자재</th>
            <th class="th">거래처</th>
            <th class="th w-32">창고 위치</th>
            <th class="th w-20">수량</th>
            <th class="th w-24">단가</th>
            <th class="th w-24">금액</th>
            <th class="th w-14">관리</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, i) in form.items" :key="i">
            <!-- 자재 -->
            <td class="td">
              <button
                type="button"
                @click="openMaterialSelect(item)"
                class="cell-input text-left flex items-center justify-between gap-2 hover:border-blue-400"
                :class="item.material_name ? 'text-slate-700' : 'text-slate-400'"
              >
                <span class="truncate">
                  {{
                    item.material_name
                      ? `${item.material_code || ""} ${item.material_name}`.trim()
                      : "자재 선택"
                  }}
                </span>
                <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"></i>
              </button>
            </td>

            <!-- 거래처 -->
            <td class="td">
              <SearchSelect
                v-model="item.supplier_id"
                :options="suppliers"
                labelKey="name"
                valueKey="id"
              />
            </td>

            <!-- 위치 (창고>위치>선반) -->
            <td class="td">
              <button
                type="button"
                @click="openShelfSelect(item)"
                class="cell-input text-left flex items-center justify-between gap-2 hover:border-blue-400"
                :class="item.shelf_label ? 'text-slate-700' : 'text-slate-400'"
              >
                <span class="truncate">
                  {{ item.shelf_label || "위치 선택" }}
                </span>
                <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-400"></i>
              </button>
            </td>

            <!-- 수량 -->
            <td class="td">
              <input
                type="number"
                v-model.number="item.quantity"
                class="cell-input text-right"
              />
            </td>

            <!-- 단가 -->
            <td class="td">
              <input
                type="number"
                v-model.number="item.unit_price"
                class="cell-input text-right"
              />
            </td>

            <!-- 금액 -->
            <td class="td text-right tabular-nums">
              {{ (item.quantity * item.unit_price).toLocaleString() }}
            </td>

            <!-- 삭제 -->
            <td class="td text-center">
              <button
                class="text-red-500 hover:text-red-700 text-[11px]"
                @click="removeItem(i)"
              >
                삭제
              </button>
            </td>
          </tr>

          <tr v-if="!form.items.length">
            <td colspan="7" class="text-center py-4 text-slate-400 text-xs">
              품목을 추가하세요
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 버튼 -->
    <div class="flex justify-end gap-2 mt-4">
      <button class="btn" @click="modal.closeModal()">취소</button>
      <button class="btn btn-primary" @click="save">저장</button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";
import MaterialSelectModal from "@/components/material/MaterialSelectModal.vue";
import ShelfSelectModal from "@/components/warehouse/ShelfSelectModal.vue";

export default {
  components: { SearchSelect },

  props: {
    id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),

      suppliers: [] as any[],

      form: {
        id: 0,
        inbound_no: "",
        memo: "",
        items: [] as any[],
      },
    };
  },

  methods: {
    // 자재 선택 모달을 열어 선택한 자재들을 품목에 반영한다
    // target 이 전달되면 해당 행을 첫 자재로 교체하고 나머지는 새 행으로 추가한다
    openMaterialSelect(target: any = null) {
      this.modal.openModal(
        MaterialSelectModal,
        {
          onConfirm: (list: any[]) => this.applyMaterials(list, target),
        },
        "full",
      );
    },

    // 자재 정보를 신규 입고 품목 행 객체로 변환한다
    buildItemFromMaterial(m: any) {
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
        unit_price: Number(m.price) || 0,
      };
    },

    // 창고>위치>선반 선택 모달을 연다
    openShelfSelect(target: any) {
      this.modal.openModal(
        ShelfSelectModal,
        {
          onConfirm: (payload: any) => this.applyShelf(payload, target),
        },
        "xl",
      );
    },

    // 선반 선택 결과를 대상 품목 행에 적용한다
    applyShelf(payload: any, target: any) {
      const { shelf, location, warehouse } = payload || {};
      if (!shelf || !target) return;
      target.shelf_id = shelf.id;
      target.location_id = location?.id ?? null;
      target.warehouse_id = warehouse?.id ?? null;
      target.shelf_label = shelf.name;
    },

    // 선택된 자재 목록을 품목 리스트에 반영한다
    applyMaterials(list: any[], target: any = null) {
      if (!Array.isArray(list) || !list.length) return;
      if (target) {
        const [first, ...rest] = list;
        target.material_id = first.id;
        target.material_code = first.code || "";
        target.material_name = first.name || "";
        target.spec = first.spec || "";
        target.unit = first.unit || "";
        if ((!target.unit_price || target.unit_price === 0) && first.price) {
          target.unit_price = Number(first.price) || 0;
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

    // 지정 인덱스의 품목 행을 제거한다
    removeItem(index: number) {
      this.form.items.splice(index, 1);
    },

    // 저장 처리
    async save() {
      try {
        await api.post("/api/inbound/save", this.form);
        this.modal.closeModal();
        this.$toast.success("입고처리가 완료 되었습니다");
        if (this.onSaved) {
          this.onSaved();
        }
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 현재 시각 기반의 입고번호 문자열을 생성한다
    mk_in_no() {
      return "IN-" + Date.now();
    },

    // 서버에서 받은 데이터를 폼 필드에 매핑한다
    mapping_data(data: any) {
      const form = this.form as any;
      for (const key in this.form) {
        form[key] = data[key];
      }
    },

    // 데이터 로드
    // 수정 대상 입고 전표의 상세 데이터를 로드한다
    async loadData() {
      const res = await api.post(`/api/inbound/${this.id}`, { id: this.id });
      this.mapping_data(res.data);
    },

    // 거래처 선택 옵션을 로드한다
    async loadSupplier() {
      const res = await api.post("/api/supplier/list");
      this.suppliers = res.data;
    },
  },

  // 마운트 시 입고번호 생성 및 참조 데이터들을 로드한다
  mounted() {
    // 입고번호 자동생성
    this.form.inbound_no = this.mk_in_no();
    this.loadSupplier();

    if (this.id) {
      this.loadData();
    }
  },
};
</script>
