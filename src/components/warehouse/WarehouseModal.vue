<template>
  <div class="p-1 space-y-4">
    <!-- 상단 헤더 섹션 -->
    <div class="flex items-end justify-between border-b border-gray-50 pb-4">
      <div>
        <h2 class="text-base font-semibold mb-3 flex items-center gap-2">
          <span class="w-2 h-7 bg-blue-600 rounded-full"></span>
          창고 등록
        </h2>
        <p class="text-[13px] text-gray-400 mt-1 font-medium ml-4">
          시스템에 새로운 보관 구역 정보를 설정합니다.
        </p>
      </div>

      <button
        @click="addRow"
        class="btn btn-primary"
      >
        <i class="fa-solid fa-plus text-[10px]"></i>
        행 추가하기
      </button>
    </div>

    <!-- 메인 테이블 카드 -->
    <div
      class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden"
    >
      <div class="overflow-x-auto">
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
                창고명
              </th>
              <th
                class="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider"
              >
                상세 메모
              </th>
              <th class="px-6 py-4 w-16"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="(row, i) in rows"
              :key="i"
              class="group transition-colors hover:bg-gray-50/50"
            >
              <!-- 코드 입력 -->
              <td class="px-4 py-3">
                <div
                  class="relative group-focus-within:scale-[1.02] transition-transform duration-200"
                >
                  <input
                    v-model="row.code"
                    placeholder="예: WH-01"
                    class="modern-input"
                  />
                </div>
              </td>

              <!-- 창고명 입력 -->
              <td class="px-4 py-3">
                <input
                  v-model="row.name"
                  placeholder="창고 이름을 입력하세요"
                  class="modern-input font-medium"
                />
              </td>

              <!-- 메모 입력 -->
              <td class="px-4 py-3 text-gray-500">
                <input
                  v-model="row.memo"
                  placeholder="추가 설명"
                  class="modern-input text-gray-400 focus:text-gray-700"
                />
              </td>

              <!-- 삭제 버튼 -->
              <td class="px-4 py-3 text-center">
                <button
                  @click="removeRow(i)"
                  class="delete-btn group/del"
                  title="삭제"
                >
                  <i
                    class="fa-solid fa-trash-can group-hover/del:rotate-12 transition-transform"
                  ></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 빈 상태 디자인 -->
      <div
        v-if="rows.length === 0"
        class="py-20 flex flex-col items-center justify-center bg-gray-50/30"
      >
        <div
          class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-200 border border-gray-100"
        >
          <i class="fa-solid fa-layer-group text-3xl"></i>
        </div>
        <p class="text-gray-400 font-medium">
          현재 등록된 창고 데이터가 없습니다.
        </p>
        <button
          @click="addRow"
          class="mt-4 text-blue-600 text-sm font-bold hover:underline underline-offset-4"
        >
          첫 번째 행 추가
        </button>
      </div>
    </div>

    <!-- 푸터 액션 영역 -->
    <div class="flex items-center justify-between pt-4">
      <div class="text-[13px] text-gray-400 italic">
        * 총 {{ rows.length }}개의 창고 정보가 입력되었습니다.
      </div>
      <div class="flex gap-2">
        <button
          class="btn"
          @click="modal.closeModal()"
        >
          취소
        </button>

        <button
          class="btn btn-primary"
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
    // 기본값이 설정된 신규 창고 행 객체를 반환한다
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

    // 신규 행을 리스트에 추가한다
    addRow() {
      this.rows.push(this.newRow());
    },

    // 지정 인덱스의 행을 제거한다
    removeRow(i) {
      this.rows.splice(i, 1);
    },

    // 서버 데이터를 단일 행 리스트로 설정한다
    mappingData(data) {
      this.rows = [data];
    },

    // 수정 대상 창고 상세 데이터를 로드한다
    async loadData() {
      try {
        const res = await api.post(`/api/warehouse/${this.id}`, {
          id: this.id,
        });
        this.mappingData(res.data);
      } catch (e: any) {
        this.$toast.error("데이터 로드에 실패했습니다.");
      }
    },

    // 유효성 검사 후 onSaved 콜백에 현재 행들을 전달한다
    async save() {
      try {
        // 유효성 체크 예시
        if (this.rows.some((r) => !r.code || !r.name)) {
          return this.$toast.warning("코드와 창고명은 필수 입력입니다.");
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

  // 마운트 시 id가 있으면 상세를 로드하고, 없으면 빈 행 하나를 추가한다
  mounted() {
    if (this.id) {
      this.loadData();
    } else {
      this.addRow();
    }
  },
};
</script>

<style scoped>
/* 입력 필드: 더 부드러운 배경색과 포커스 효과 */
.modern-input {
  @apply w-full h-10 px-4 bg-gray-50/50 border border-transparent rounded-xl text-[14px] text-gray-700
  placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 
  outline-none transition-all duration-300;
}

/* 삭제 버튼: 호버 시에만 나타나고 빨간색으로 강조 */
.delete-btn {
  @apply w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 
  hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100;
}

/* 스크롤바 커스텀 (필요 시) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full hover:bg-gray-300;
}
</style>
