<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">창고 등록</h2>

    <!-- 테이블 -->
    <div class="border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border w-32">코드</th>
            <th class="p-2 border">창고명</th>
            <th class="p-2 border">메모</th>
            <th class="p-2 border w-16">
              <button
                class="px-3 py-1.5 bg-green-500 text-white rounded"
                @click="addRow"
              >
                +
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td class="border p-1">
              <input
                v-model="row.code"
                placeholder="코드"
                class="w-full border rounded px-2 py-1"
              />
            </td>

            <td class="border p-1">
              <input
                v-model="row.name"
                placeholder="창고명"
                class="w-full border rounded px-2 py-1"
              />
            </td>

            <td class="border p-1">
              <input
                v-model="row.memo"
                placeholder="메모"
                class="w-full border rounded px-2 py-1"
              />
            </td>

            <td class="border text-center">
              <button class="text-red-500 text-sm" @click="removeRow(i)">
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
import api from "@/api/api";

export default {
  name: "WarehouseModal",

  props: {
    id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),

      rows: [],
    };
  },

  methods: {
    // 신규 row 생성
    newRow() {
      return {
        id: 0,
        code: "",
        name: "",
        memo: "",
        x: 15,
        y: 15,
        width: 3,
        height: 3,
      };
    },

    // 행 추가
    addRow() {
      this.rows.push(this.newRow());
    },

    // 행 삭제
    removeRow(i) {
      this.rows.splice(i, 1);
    },

    // 데이터 매핑
    mappingData(data) {
      this.rows = [data];
    },

    // 로드시 데이터 셋팅
    async loadData() {
      const res = await api.post(`/api/warehouse/${this.id}`, { id: this.id });
      this.mappingData(res.data);
    },

    // 저장
    async save() {
      try {
        this.modal.closeModal();

        if (this.onSaved) {
          this.onSaved(this.rows);
        }
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },

  mounted() {
    if (this.id) {
      this.loadData();
    } else {
      this.addRow();
    }
  },
};
</script>
