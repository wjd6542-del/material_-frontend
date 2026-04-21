<template>
  <div class="w-full">
    <h2 class="text-base font-semibold mb-3">출고 전표 처리</h2>

    <!-- 전표 정보 -->

    <div class="grid grid-cols-2 gap-3 mb-4">
      <div>
        <label class="form-label">출고번호</label>
        <input
          v-model="form.outbound_no"
          class="field mt-1 bg-slate-50"
          readonly
        />
      </div>

      <div>
        <label class="form-label">메모</label>
        <input
          v-model="form.memo"
          class="field mt-1"
          placeholder="메모 입력"
        />
      </div>
    </div>

    <!-- 품목 리스트 -->

    <div class="mb-3 flex justify-between items-center">
      <h3 class="text-xs font-semibold text-slate-700">출고 품목</h3>
    </div>

    <div class="border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="th">자재</th>
            <th class="th">
              거래처 <span class="text-red-500">*</span>
            </th>
            <th class="th w-32">위치</th>
            <th class="th w-24">수량</th>
            <th class="th w-32">원가</th>
            <th class="th w-32">판매가</th>
            <th class="th w-16">
              <button
                class="btn btn-primary"
                @click="addItem"
              >
                +
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, i) in form.items" :key="i">
            <!-- 자재 -->
            <td class="td">
              <SearchSelect
                v-model="item.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
                placeholder="자재 선택"
              />
            </td>

            <!-- 거래처 -->
            <td class="td">
              <SearchSelect
                v-model="item.supplier_id"
                :options="suppliers"
                labelKey="name"
                valueKey="id"
                placeholder="거래처 선택"
              />
            </td>

            <!-- 위치 -->
            <td class="td">
              <SearchSelect
                v-model="item.location_id"
                :options="locations"
                labelKey="code"
                valueKey="id"
                placeholder="위치 선택"
                @change="setData(item)"
              />
            </td>
            <!-- 수량 -->
            <td class="td">
              <input
                type="number"
                v-model.number="item.quantity"
                class="cell-input text-right"
              />
            </td>

            <!-- 원가 -->
            <td class="td">
              <input
                type="text"
                v-model.number="item.cost_price"
                class="cell-input text-right"
              />
            </td>

            <!-- 판매가 -->
            <td class="td">
              <input
                type="text"
                v-model.number="item.sale_price"
                class="cell-input text-right"
              />
            </td>

            <!-- 삭제 -->
            <td class="td text-center">
              <button class="text-red-500 text-sm" @click="removeItem(i)">
                삭제
              </button>
            </td>
          </tr>

          <tr v-if="!form.items.length">
            <td colspan="8" class="text-center py-4 text-gray-400">
              품목을 추가하세요
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 버튼 -->

    <div class="flex justify-end gap-2 mt-4">
      <button class="btn" @click="modal.closeModal()">
        취소
      </button>

      <button class="btn btn-primary" @click="save">
        저장
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";

export default {
  name: "OutboundModal",
  components: { SearchSelect },

  props: {
    id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),

      materials: [],
      suppliers: [],
      warehouses: [],
      locations: [],

      form: {
        id: 0,
        outbound_no: "",
        memo: "",
        items: [],
      },
    };
  },

  methods: {
    // 신규 출고 품목 행을 리스트에 추가한다
    addItem() {
      this.form.items.push({
        id: 0,
        material_id: null,
        supplier_id: null,
        warehouse_id: null,
        location_id: null,
        // 판매 갯수
        quantity: 1,
        // 판매가
        sale_price: 0,
        // 원가
        cost_price: 0,
      });
    },

    // 지정 인덱스의 품목 행을 제거한다
    removeItem(index) {
      this.form.items.splice(index, 1);
    },

    // 저장 처리
    async save() {
      if (!this.form.items.length) {
        this.$toast.error("품목을 추가하세요");
        return;
      }

      const missing = this.form.items.findIndex((it) => !it.supplier_id);
      if (missing !== -1) {
        this.$toast.error(`${missing + 1}번 품목의 거래처를 선택하세요`);
        return;
      }

      try {
        await api.post("/api/outbound/save", this.form);

        this.modal.closeModal();

        this.$toast.success("입고처리가 완료 되었습니다");
        if (this.onSaved) {
          this.onSaved();
        }
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 현재 시각 기반의 출고번호를 생성한다
    mk_in_no() {
      return "OUT-" + Date.now();
    },

    // 서버 데이터를 폼 필드에 매핑한다
    mapping_data(data) {
      for (const key in this.form) {
        const val = data[key];
        this.form[key] = val;
      }
    },

    // 선택된 위치에 따라 창고 ID를 연동 설정한다
    setData(data) {
      const location = this.locations.find((item) => item.id);
      data.warehouse_id = location.warehouse_id;
    },

    // 데이터 로드
    // 수정 대상 출고 전표의 상세 데이터를 로드한다
    async loadData() {
      const res = await api.post(`/api/outbound/${this.id}`, { id: this.id });
      this.mapping_data(res.data);
    },

    // 자재 옵션을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    // 거래처 옵션을 로드한다
    async loadSupplier() {
      const res = await api.post("/api/supplier/list");
      this.suppliers = res.data;
    },

    // 창고 옵션을 로드한다
    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },

    // 위치 옵션을 로드한다
    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data;
    },
  },

  // 마운트 시 출고번호 생성 및 참조 데이터들을 로드한다
  mounted() {
    // 입고번호 자동생성
    this.form.outbound_no = this.mk_in_no();
    this.loadWarehouse();
    this.loadMaterial();
    this.loadLocation();
    this.loadSupplier();

    if (this.id) {
      this.loadData();
    }
  },
};
</script>
