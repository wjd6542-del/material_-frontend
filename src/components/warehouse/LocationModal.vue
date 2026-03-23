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
          창고 내 구역별 선반(Rack) 정보를 등록합니다.
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

    <!-- 메인 테이블 카드 (드롭다운을 위해 overflow 제거) -->
    <div
      class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50"
    >
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th
              class="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider w-48"
            >
              소속 창고
            </th>
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
            <th
              class="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider"
            >
              상세 메모
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
            <!-- 창고 선택 (SearchSelect) -->
            <td class="px-4 py-3">
              <div class="search-select-wrapper">
                <SearchSelect
                  v-model="row.warehouse_id"
                  :options="warehouses"
                  labelKey="name"
                  valueKey="id"
                  class="modern-select"
                />
              </div>
            </td>

            <!-- 선반 코드 -->
            <td class="px-4 py-3">
              <input
                v-model="row.code"
                placeholder="RACK-01"
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

            <!-- 상세 메모 -->
            <td class="px-4 py-3 text-gray-500">
              <input
                v-model="row.memo"
                placeholder="비고 입력"
                class="modern-input text-gray-400 focus:text-gray-700"
              />
            </td>

            <!-- 삭제 버튼 (상시 출력) -->
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

      <!-- 빈 상태 디자인 -->
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
      if (Array.isArray(data)) {
        this.rows = data;
      }
    },

    async loadWarehouse() {
      try {
        const res = await api.post("/api/warehouse/list");
        this.warehouses = res.data;
      } catch (e) {
        console.error("창고 목록 로드 실패", e);
      }
    },

    async loadData() {
      try {
        const res = await api.post(`/api/warehouse/${this.id}`, {
          id: this.id,
        });
        this.mappingData(res.data);
      } catch (e) {
        this.$toast.error("데이터를 불러오지 못했습니다.");
      }
    },

    async save() {
      try {
        if (this.rows.some((r) => !r.warehouse_id || !r.name)) {
          this.$toast.warning("소속 창고와 선반 이름을 확인해 주세요.");
          return;
        }

        this.modal.closeModal();

        if (this.onSaved) {
          this.onSaved(this.rows);
        }
      } catch (e: any) {
        this.$toast.error(e.message);
      }
    },
  },

  mounted() {
    this.loadWarehouse();

    if (this.id) {
      this.loadData();
    } else {
      this.addRow();
    }
  },
};
</script>

<style scoped>
/* 현대적인 입력창 공통 스타일 */
.modern-input {
  @apply w-full h-10 px-4 bg-gray-50/50 border border-transparent rounded-xl text-[14px] text-gray-700
  placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 
  outline-none transition-all duration-300;
}

/* SearchSelect 내부 스타일 강제 적용 */
.search-select-wrapper :deep(input) {
  @apply w-full h-10 px-4 bg-gray-50/50 border border-transparent rounded-xl text-[14px]
  focus:bg-white focus:border-blue-500 outline-none transition-all duration-300 !important;
}

/* 삭제 버튼 스타일 (상시 노출형) */
.delete-btn-always {
  @apply w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 
  hover:bg-red-50 rounded-xl transition-all;
}

/* 테이블 컨테이너에 overflow를 주지 않아 드롭다운이 뚫고 나오게 함 */
table {
  position: relative;
  z-index: 1;
}
</style>
