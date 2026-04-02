<template>
  <div class="p-1 space-y-6">
    <!-- 상단 헤더 섹션 -->
    <div class="flex items-end justify-between border-b border-gray-50 pb-6">
      <div>
        <h2
          class="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"
        >
          <span class="w-2 h-7 bg-blue-600 rounded-full"></span>
          선반 추가
        </h2>
        <p class="text-[13px] text-gray-400 mt-1 font-medium ml-4">
          위치 내 선반(Shelf) 정보를 등록합니다.
        </p>
      </div>

      <button
        @click="addRow"
        class="flex items-center gap-2 px-4 h-10 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm"
      >
        <i class="fa-solid fa-plus text-xs"></i>
        선반 추가하기
      </button>
    </div>

    <!-- 메인 테이블 카드 -->
    <div
      class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50"
    >
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th
              class="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider w-40"
            >
              코드
            </th>
            <th
              class="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider"
            >
              선반 이름
            </th>
            <th class="px-6 py-4 w-16 text-center"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="(row, i) in rows"
            :key="i"
            class="group transition-colors hover:bg-gray-50/30"
          >
            <!-- 선반 코드 -->
            <td class="px-4 py-3">
              <input
                v-model="row.code"
                placeholder="SHELF-01"
                class="modern-input"
              />
            </td>

            <!-- 선반 이름 -->
            <td class="px-4 py-3">
              <input
                v-model="row.name"
                placeholder="A구역 1번 선반"
                class="modern-input font-medium text-blue-600"
              />
            </td>

            <!-- 삭제 버튼 -->
            <td class="px-4 py-3 text-center">
              <button
                @click="removeRow(i)"
                class="delete-btn-always group/del"
                title="삭제"
              >
                <i
                  class="fa-solid fa-trash-can group-hover/del:scale-110 transition-transform"
                ></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 빈 상태 -->
      <div
        v-if="rows.length === 0"
        class="py-20 flex flex-col items-center justify-center bg-gray-50/30 rounded-b-3xl"
      >
        <div
          class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-200 border border-gray-100"
        >
          <i class="fa-solid fa-table-cells text-3xl"></i>
        </div>
        <p class="text-gray-400 font-medium">현재 추가된 선반이 없습니다.</p>
        <button
          @click="addRow"
          class="mt-4 text-blue-600 text-sm font-bold hover:underline underline-offset-4"
        >
          새로운 선반 추가
        </button>
      </div>
    </div>

    <!-- 푸터 액션 영역 -->
    <div class="flex items-center justify-between pt-4">
      <div class="text-[13px] text-gray-400 italic font-medium ml-2">
        <i class="fa-solid fa-circle-info mr-1"></i>
        총 {{ rows.length }}개의 항목이 등록 대기 중입니다.
      </div>
      <div class="flex gap-3">
        <button
          class="px-6 h-11 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          @click="modal.closeModal()"
        >
          취소
        </button>

        <button
          class="px-10 h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
          @click="save"
        >
          저장 완료
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";

export default {
  name: "LocationModal",

  props: {
    location_id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),
      rows: [] as any[],
    };
  },

  methods: {
    newRow() {
      return {
        id: 0,
        location_id: this.location_id,
        code: "",
        name: "",
        x: 15,
        y: 15,
        width: 3,
        height: 3,
        sort: 0,
      };
    },

    addRow() {
      this.rows.push(this.newRow());
    },

    removeRow(i: number) {
      this.rows.splice(i, 1);
    },

    async save() {
      if (this.rows.some((r) => !r.code)) {
        (this as any).$toast.warning("선반 코드를 입력해 주세요.");
        return;
      }

      this.modal.closeModal();

      if (this.onSaved) {
        this.onSaved(this.rows);
      }
    },
  },

  mounted() {
    this.addRow();
  },
};
</script>

<style scoped>
.modern-input {
  @apply w-full h-10 px-4 bg-gray-50/50 border border-transparent rounded-xl text-[14px] text-gray-700
  placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5
  outline-none transition-all duration-300;
}

.delete-btn-always {
  @apply w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500
  hover:bg-red-50 rounded-xl transition-all;
}
</style>
