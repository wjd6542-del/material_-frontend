<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">알림 리스트</h2>
      </div>

      <div class="p-4 pb-0 flex items-center gap-1">
        <DateRangePicker
          v-model="dateRange"
          :minuteStep="5"
          :showQuickButtons="true"
          @change="loadList"
        />
        <SearchSelect
          v-model="where.type"
          :options="typeArr"
          labelKey="text"
          valueKey="value"
          placeholder="타입 선택"
          @change="loadList"
        />
        <SearchSelect
          v-model="where.action"
          :options="actionArr"
          labelKey="text"
          valueKey="value"
          placeholder="액션 선택"
          @change="loadList"
        />
      </div>

      <!-- 버튼 영역 -->
      <div class="px-5 py-3 border-b flex gap-2 bg-white">
        <button
          @click="readRows"
          class="px-4 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-sm transition flex items-center gap-2"
        >
          <i class="fa-solid fa-save"></i>
          읽기 처리
        </button>

        <button
          @click="deleteRows"
          class="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-sm transition flex items-center gap-2"
        >
          <i class="fa-solid fa-trash"></i>
          삭제
        </button>
      </div>

      <div class="p-4">
        <BaseTable
          ref="notificationTable"
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

import { useNotificationStore } from "@/stores/notification";

import api from "@/api/api";

// 알람 최신화 처리적용

export default {
  name: "StockPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

  data() {
    return {
      noti: useNotificationStore(),

      actionArr: [
        { text: "생성", value: "CREATE" },
        { text: "수정", value: "UPDATE" },
        { text: "삭제", value: "DELETE" },
      ],

      typeArr: [
        { text: "입고", value: "INBOUND" },
        { text: "출고", value: "OUTBOUND" },
        { text: "반품", value: "RETURNORDER" },
        { text: "자재", value: "MATERIAL" },
      ],

      columns: [
        {
          key: "title",
          label: "제목",
          sortable: true,
          width: "200px",
        },

        {
          key: "message",
          label: "메시지",
          sortable: true,
          width: "350px",
        },
        {
          key: "type",
          label: "구분",
          sortable: true,
          width: "100px",
        },
        {
          key: "action",
          label: "액션",
          type: "string",
          align: "right",
          width: "100px",
        },
        {
          key: "is_read",
          label: "읽음 표시",
          type: "string",
          align: "center",
          width: "200px",
          sortable: true,
        },

        {
          key: "read_at",
          label: "읽은 날짜",
          type: "date",
          align: "center",
          width: "150px",
          sortable: true,
        },
        {
          key: "created_at",
          label: "생성일",
          type: "date",
          align: "center",
          width: "150px",
          sortable: true,
        },
      ],

      dateRange: { start: null, end: null },

      // 검색 조건
      where: {
        id: "",
        action: "",
        type: "",
        startDate: null,
        endDate: null,
      },

      rows: [],
      materials: [],
      warehouses: [],
      locations: [],
    };
  },

  methods: {
    // 데이터 로드 처리
    // 검색 조건으로 알림 목록을 로드한다
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

      const res = await api.post("/api/notification/list", where);
      this.rows = res.data;
    },

    // 선택된 알림들을 일괄 읽음 처리한다
    async readRows() {
      const rows = this.$refs.notificationTable.getSelectedRows();
      if (!rows.length) {
        this.$toast.error("테이블에서 데이터를 선택하세요");
        return;
      }

      const ok = await this.$confirm(
        `선택된 정보를 읽음 처리 하시겠습니까?`,
        "일괄 처리 확인",
      );
      if (!ok) return;

      let ids = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        ids.push({ id: row.id });
      }

      try {
        await api.post("/api/notification/batchRead", ids);
        this.$toast.success("선택 항목 읽음 처리되었습니다");
        this.loadList();
        this.noti.loadCounts();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 선택된 알림들을 사용자 확인 후 일괄 삭제한다
    async deleteRows() {
      const rows = this.$refs.notificationTable.getSelectedRows();
      if (!rows.length) {
        this.$toast.error("테이블에서 데이터를 선택하세요");
        return;
      }

      let ids = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        ids.push({ id: row.id });
      }

      const ok = await this.$confirm(
        `선택된 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      try {
        await api.post("/api/notification/batchDelete", ids);
        this.$toast.success("선택 항목이 삭제되었습니다");
        this.loadList();
        this.noti.loadCounts();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },

    // 위치 옵션을 로드한다
    async loadLocation() {
      const res = await api.post("/api/location/list");
      this.locations = res.data;
    },
  },
  // 마운트 시 쿼리 id가 있으면 반영 후 목록을 로드한다
  mounted() {
    const id = this.$route.query.id;
    if (id) {
      this.where.id = id;
    }
    this.loadList();
  },
};
</script>
