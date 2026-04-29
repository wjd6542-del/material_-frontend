<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">계정 리스트</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button @click="openModal" class="btn btn-primary shrink-0">
          <i class="fa-solid fa-add"></i>
        </button>
        <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[280px] sm:max-w-[450px]">
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="loadList"
          />
        </div>
        <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[450px]">
          <SearchSelect
            v-model="where.role_id"
            :options="roles"
            labelKey="description"
            valueKey="id"
            placeholder="권한 선택"
            @change="loadList"
          />
        </div>
        <div class="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[450px]">
          <BaseInput
            v-model="where.keyword"
            placeholder="아이디/ 사용자명 검색"
            @change="loadList"
          />
        </div>
      </div>

      <div class="p-4">
        <BaseTable
          ref="userTable"
          :columns="columns"
          :rows="rows"
          sortable
          selectable
          pagination
          :pageSize="10"
          :pageSizeOptions="[10, 20, 50, 100]"
          @cell-click="onCellClick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import UserInfoModal from "@/components/user/UserInfoModal.vue";
import { useModalStore } from "@/stores/modal";
import { createListMixin } from "@/mixins/listPage";
import { createRefDataMixin } from "@/mixins/refData";

export default {
  name: "UserManagerPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
    BaseInput,
    UserInfoModal,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/user/list",
      tableRef: "userTable",
      initialWhere: { role_id: "", keyword: "" },
      initialDateRange: () => ({ start: null, end: null }),
    }),
    createRefDataMixin(["roles"]),
  ],

  data() {
    return {
      modal: useModalStore(),
      roles: [],
      columns: [
        { key: "username", label: "아이디", sortable: true, width: "200px" },
        { key: "name", label: "사용자명", sortable: true, width: "200px" },
        { key: "email", label: "이메일", sortable: true, width: "100px" },
        { key: "role_name", label: "권한", type: "string", align: "center", width: "100px" },
        { key: "role_description", label: "권한확인", type: "string", align: "center", width: "100px" },
        { key: "is_active", label: "활성여부", type: "string", align: "center", width: "100px" },
        { key: "created_at", label: "생성일", type: "date", align: "center", width: "200px", sortable: true },
        { key: "updated_at", label: "수정일", type: "date", align: "center", width: "200px", sortable: true },
      ],
    };
  },

  methods: {
    // username 셀 → 사용자 정보 수정 모달
    onCellClick(data) {
      if (data.key === "username") {
        this.modal.openModal(
          UserInfoModal,
          { id: data.row.id, onSaved: this.loadList },
          "xl",
        );
      }
    },

    // 사용자 등록 모달
    openModal() {
      this.modal.openModal(UserInfoModal, { onSaved: this.loadList }, "xl");
    },
  },

  mounted() {
    this.loadRefData();
  },
};
</script>
