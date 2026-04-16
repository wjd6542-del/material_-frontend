<template>
  <div class="w-full">
    <!-- 타이틀 수정 -->
    <h2 class="text-lg font-semibold mb-4">반품 전표 처리</h2>

    <!-- 전표 정보 -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="font-medium text-gray-600">반품번호</label>
        <input
          v-model="form.return_no"
          class="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
          readonly
        />
      </div>

      <div>
        <label class="font-medium text-gray-600">메모</label>
        <input
          v-model="form.memo"
          class="mt-1 w-full border rounded px-3 py-2"
          placeholder="메모 입력"
        />
      </div>
    </div>

    <!-- 품목 리스트 -->
    <div class="mb-3 flex justify-between items-center">
      <h3 class="font-medium">반품 품목</h3>
    </div>

    <div class="border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-2 py-2 border">자재</th>
            <th class="px-2 py-2 border w-32">위치</th>
            <th class="px-2 py-2 border w-24">수량</th>
            <th class="px-2 py-2 border w-32">원가</th>
            <th class="px-2 py-2 border w-32">판매가</th>
            <!-- 반품 사유 추가 -->
            <th class="px-2 py-2 border w-32">반품사유</th>
            <th class="px-2 py-2 border w-16">
              <button
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded"
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
            <td class="border px-2">
              <SearchSelect
                v-model="item.material_id"
                :options="materials"
                labelKey="name"
                valueKey="id"
                placeholder="자재 선택"
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

            <!-- 원가 -->
            <td class="border px-2">
              <input
                type="text"
                v-model.number="item.cost_price"
                class="w-full border rounded px-2 py-1 text-right"
              />
            </td>

            <!-- 판매가 -->
            <td class="border px-2">
              <input
                type="text"
                v-model.number="item.sale_price"
                class="w-full border rounded px-2 py-1 text-right"
              />
            </td>

            <!-- 반품 사유 (항목 추가) -->
            <td class="border px-2">
              <select
                v-model="item.reasonType"
                class="w-full border rounded px-2 py-1"
              >
                <option value="단순변심">단순변심</option>
                <option value="오발송">오발송</option>
                <option value="파손">파손</option>
                <option value="불량">불량</option>
              </select>
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

export default {
  name: "ReturnOrderModal", // 컴포넌트명 변경
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
        return_no: "", // outbound_no -> return_no
        memo: "",
        status: "COMPLETED", // 기본 상태를 즉시 완료로 설정
        items: [],
      },
    };
  },

  methods: {
    // 신규 반품 품목 행을 리스트에 추가한다
    addItem() {
      this.form.items.push({
        id: 0,
        material_id: null,
        warehouse_id: null,
        location_id: null,
        quantity: 1,
        sale_price: 0,
        cost_price: 0,
        reasonType: "단순변심", // 기본 사유 추가
      });
    },

    // 지정 인덱스의 품목 행을 제거한다
    removeItem(index) {
      this.form.items.splice(index, 1);
    },

    // 저장 처리 (반품 API로 변경)
    // 반품 전표를 서버에 저장한다
    async save() {
      try {
        await api.post("/api/returnorder/save", this.form);

        this.modal.closeModal();

        this.$toast.success("반품처리가 완료 되었습니다");
        if (this.onSaved) {
          this.onSaved();
        }
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 반품번호 생성
    // 현재 시각 기반의 반품번호 문자열을 생성한다
    mk_ret_no() {
      return "RET-" + Date.now();
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
      const location = this.locations.find(
        (item) => item.id === data.location_id,
      );
      if (location) {
        data.warehouse_id = location.warehouse_id;
      }
    },

    // 데이터 로드
    // 수정 대상 반품 전표의 상세 데이터를 로드한다
    async loadData() {
      const res = await api.post(`/api/returnorder/${this.id}`, {
        id: this.id,
      });
      this.mapping_data(res.data);
    },

    // 자재 옵션을 로드한다
    async loadMaterial() {
      const res = await api.post("/api/material/list");
      this.materials = res.data;
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

  // 마운트 시 반품번호 생성 및 참조 데이터들을 로드한다
  mounted() {
    // 반품번호 자동생성
    this.form.return_no = this.mk_ret_no();
    this.loadWarehouse();
    this.loadMaterial();
    this.loadLocation();

    if (this.id) {
      this.loadData();
    }
  },
};
</script>
