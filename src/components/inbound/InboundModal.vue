<template>
  <div class="w-full">
    <h2 class="text-lg font-semibold mb-4">입고 전표 등록</h2>

    <!-- 전표 정보 -->

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="text-sm text-gray-600">입고번호</label>
        <input
          v-model="form.inbound_no"
          class="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
          readonly
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">메모</label>
        <input
          v-model="form.memo"
          class="mt-1 w-full border rounded px-3 py-2"
          placeholder="메모 입력"
        />
      </div>
    </div>

    <!-- 품목 리스트 -->

    <div class="mb-3 flex justify-between items-center">
      <h3 class="font-medium">입고 품목</h3>
    </div>

    <div class="border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-2 py-2 border">자재</th>
            <th class="px-2 py-2 border">거래처</th>
            <th class="px-2 py-2 border w-32">창고 위치</th>
            <th class="px-2 py-2 border w-24">수량</th>
            <th class="px-2 py-2 border w-28">단가</th>
            <th class="px-2 py-2 border w-28">금액</th>
            <th class="px-2 py-2 border w-16">
              <button
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                @click="addItem"
              >
                +
              </button>
            </th>
          </tr>
          <tr>
            <td class="px-2 py-2 border text-center">일괄처리</td>
            <td class="px-2 py-2 border">
              <SearchSelect
                v-model="batch.supplier_id"
                :options="suppliers"
                labelKey="name"
                valueKey="id"
                @change="batchValue"
              />
            </td>
            <td class="px-2 py-2 border">
              <SearchSelect
                v-model="batch.location_id"
                :options="locations"
                labelKey="code"
                valueKey="id"
                placeholder="위치 선택"
                @change="batchValue"
              />
            </td>
            <td class="px-2 py-2 border">
              <BaseInput
                type="number"
                v-model="batch.quantity"
                placeholder="수량"
                @change="batchValue"
              />
            </td>
            <td colspan="3" class="px-2 py-2 border"></td>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, i) in form.items" :key="i">
            <!-- 자재 -->

            <td class="border px-2">
              <SearchSelect
                v-model="item.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
              />
            </td>

            <!-- 거래처 -->

            <td class="border px-2">
              <SearchSelect
                v-model="item.supplier_id"
                :options="suppliers"
                labelKey="name"
                valueKey="id"
              />
            </td>

            <!-- 위치 -->
            <td class="border px-2">
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
            <td class="border px-2">
              <input
                type="number"
                v-model.number="item.quantity"
                class="w-full border rounded px-2 py-1 text-right"
              />
            </td>

            <!-- 단가 -->

            <td class="border px-2">
              <input
                type="number"
                v-model.number="item.unit_price"
                placeholder="수량 입력"
                class="w-full border rounded px-2 py-1 text-right"
              />
            </td>

            <!-- 금액 -->

            <td class="border px-2 text-right">
              {{ (item.quantity * item.unit_price).toLocaleString() }}
            </td>

            <!-- 삭제 -->

            <td class="border text-center">
              <button class="text-red-500 text-sm" @click="removeItem(i)">
                삭제
              </button>
            </td>
          </tr>

          <tr v-if="!form.items.length">
            <td colspan="7" class="text-center py-4 text-gray-400">
              품목을 추가하세요
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 버튼 -->

    <div class="flex justify-end gap-2 mt-6">
      <button class="px-3 py-1.5 border rounded" @click="modal.closeModal()">
        취소
      </button>

      <button class="px-3 py-1.5 bg-blue-600 text-white rounded" @click="save">
        저장
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";
import BaseInput from "@/components/base/BaseInput.vue";

export default {
  components: { SearchSelect, BaseInput },

  props: {
    id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),
      batch: {
        location_id: "",
        supplier_id: "",
        quantity: "",
      },

      materials: [],
      suppliers: [],
      locations: [],
      warehouses: [],

      form: {
        id: 0,
        inbound_no: "",
        memo: "",
        items: [],
      },
    };
  },

  methods: {
    // 신규 입고 품목 행을 리스트에 추가한다
    addItem() {
      this.form.items.push({
        id: 0,
        material_id: null,
        supplier_id: null,
        location_id: null,
        warehouse_id: null,
        // 갯수
        quantity: 1,
        // 개당 금액
        unit_price: 0,
      });
    },

    // 일괄 처리
    // 상단 일괄 입력값을 모든 품목 행에 적용한다
    batchValue() {
      const list = this.form.items;

      if (!list.length) return;

      const location = this.locations.find(
        (item) => item.id == this.batch.location_id,
      );

      this.form.items = list.map((row) => ({
        ...row,
        location_id: this.batch.location_id,
        warehouse_id: location?.warehouse_id ?? null,
        supplier_id: this.batch.supplier_id,
        quantity: this.batch.quantity,
      }));
    },

    // 데이터 변경
    // 선택된 위치에 따라 창고 ID를 연동 설정한다
    setData(data) {
      const location = this.locations.find(
        (item) => item.id == data.location_id,
      );
      data.warehouse_id = location.warehouse_id;
    },

    // 지정 인덱스의 품목 행을 제거한다
    removeItem(index) {
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
    mapping_data(data) {
      for (const key in this.form) {
        const val = data[key];
        this.form[key] = val;
      }
    },

    // 데이터 로드
    // 수정 대상 입고 전표의 상세 데이터를 로드한다
    async loadData() {
      const res = await api.post(`/api/inbound/${this.id}`, { id: this.id });
      this.mapping_data(res.data);
    },

    // 자재 선택 옵션을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
    },

    // 거래처 선택 옵션을 로드한다
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

  // 마운트 시 입고번호 생성 및 참조 데이터들을 로드한다
  mounted() {
    // 입고번호 자동생성
    this.form.inbound_no = this.mk_in_no();
    this.loadSupplier();
    this.loadMaterial();
    this.loadWarehouse();
    this.loadLocation();

    if (this.id) {
      this.loadData();
    }
  },
};
</script>
