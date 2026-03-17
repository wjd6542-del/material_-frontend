<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">선반 등록</h2>

    <div class="border rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">창고</th>
            <th class="p-2 border">코드</th>
            <th class="p-2 border">이름</th>
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
              <SearchSelect
                v-model="row.warehouse_id"
                :options="warehouses"
                labelKey="name"
                valueKey="id"
              />
            </td>

            <td class="border p-1">
              <input
                v-model="row.code"
                class="w-full border rounded px-2 py-1"
                placeholder="선반 코드 입력"
              />
            </td>

            <td class="border p-1">
              <input
                v-model="row.name"
                class="w-full border rounded px-2 py-1"
                placeholder="선반 이름 입력"
              />
            </td>

            <td class="border p-1">
              <input
                v-model="row.memo"
                class="w-full border rounded px-2 py-1"
                placeholder="메모 입력"
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
import BaseImage from "@/components/base/BaseImage.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";

import api from "@/api/api";

export default {
  name: "MaterialModal",

  components: {
    BaseImage,
    SearchSelect,
  },

  props: {
    id: { type: Number, default: 0 },
    warehouse_id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),

      warehouses: [],

      rows: [],
    };
  },

  methods: {
    newRow() {
      return {
        id: 0,
        warehouse_id: this.warehouse_id,
        code: "",
        name: "",
        memo: "",
        x: 15,
        y: 15,
        width: 3,
        height: 3,
      };
    },

    addRow() {
      this.rows.push(this.newRow());
    },

    removeRow(i) {
      this.rows.splice(i, 1);
    },

    mappingData(data) {
      for (const key in this.form) {
        const value = data[key];
        this.form[key] = value;
      }
    },

    async loadWarehouse() {
      const res = await api.post("/api/warehouse/list");
      this.warehouses = res.data;
    },

    // 로드시 데이터 셋팅
    async loadData() {
      const res = await api.post(`/api/warehouse/${this.id}`, { id: this.id });
      this.mappingData(res.data);
    },

    // 저장처리
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

  // 로드시 셋팅
  mounted() {
    if (this.id) {
      this.loadData();
      this.isEdit = true;
      this.editId = this.id;
    }
    this.loadWarehouse();

    this.addRow();
  },
};
</script>
