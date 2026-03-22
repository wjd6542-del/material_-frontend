<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">계정 리스트</h2>
      </div>

      <div class="p-4 pb-0 flex items-center gap-1">
        <DateRangePicker
          v-model="dateRange"
          :minuteStep="5"
          :showQuickButtons="true"
          @change="loadList"
        />

        <SearchSelect
          v-model="where.role_id"
          :options="roles"
          labelKey="description"
          valueKey="id"
          placeholder="권한 선택"
          @change="loadList"
        />

        <BaseInput
          v-model="where.keyword"
          placeholder="아이디/ 사용자명 검색"
          @change="loadList"
        />
      </div>

      <div class="p-4">
        <BaseTable
          ref="inboundDetailTable"
          :columns="columns"
          :rows="rows"
          sortable
          selectable
          pagination
          :pageSize="10"
          :pageSizeOptions="[10, 20, 50, 100]"
        />
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";

import api from "@/api/api";

// stock

export default {
  name: "StockPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
    BaseInput,
  },

  data() {
    return {
      columns: [
        {
          key: "username",
          label: "아이디",
          sortable: true,
          width: "200px",
        },

        {
          key: "name",
          label: "사용자명",
          sortable: true,
          width: "200px",
        },
        {
          key: "email",
          label: "이메일",
          sortable: true,
          width: "100px",
        },
        {
          key: "role_name",
          label: "권한",
          type: "string",
          align: "center",
          width: "100px",
        },
        {
          key: "role_description",
          label: "권한확인",
          type: "string",
          align: "center",
          width: "100px",
        },
        {
          key: "created_at",
          label: "생성일",
          type: "date",
          align: "center",
          width: "200px",
          sortable: true,
        },
        {
          key: "updated_at",
          label: "수정일",
          type: "date",
          align: "center",
          width: "200px",
          sortable: true,
        },
      ],

      dateRange: { start: null, end: null },

      // 검색 조건
      where: {
        role_id: "",
        keyword: "",
        startDate: null,
        endDate: null,
      },

      rows: [],
      roles: [],
    };
  },

  methods: {
    // 데이터 로드 처리
    async loadList() {
      this.rows = [];

      const where = {
        ...this.where,
      };

      if (this.dateRange?.start) {
        where.startDate = this.dateRange.start.toISOString();
      }

      if (this.dateRange?.end) {
        where.endDate = this.dateRange.end.toISOString();
      }

      const res = await api.post("/api/user/list", where);
      this.rows = res.data;
      console.log(res.data);
    },

    async loadRole() {
      const res = await api.post("/api/role/list");
      this.roles = res.data;
      console.log(this.roles);
    },
  },
  mounted() {
    this.loadList();
    this.loadRole();
  },
};
</script>
