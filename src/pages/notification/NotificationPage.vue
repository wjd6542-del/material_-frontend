<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">알림 리스트</h2>
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
        <button @click="readRows" class="btn btn-primary">
          <i class="fa-solid fa-save text-[10px]"></i>
          읽기 처리
        </button>

        <button @click="batchDelete" class="btn btn-danger">
          <i class="fa-solid fa-trash text-[10px]"></i>
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

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import { useNotificationStore } from "@/stores/notification";
import { createListMixin } from "@/mixins/listPage";
import api from "@/api/api";

export default {
  name: "NotificationPage",

  components: {
    BaseTable,
    SearchSelect,
    DateRangePicker,
  },

  mixins: [
    createListMixin({
      endpoint: "/api/notification/list",
      deleteEndpoint: "/api/notification/batchDelete",
      tableRef: "notificationTable",
      initialWhere: { id: "", action: "", type: "" },
      initialDateRange: () => ({ start: null, end: null }),
      mapRow: (r) => ({
        ...r,
        username: r.user?.name || r.user?.username || "-",
      }),
      // 삭제 후 미읽음 카운트 갱신
      afterDelete: (vm) => vm.noti.loadCounts?.(),
      // 쿼리스트링 id 반영 후 한번 로드 (mounted 에서 직접 처리)
      autoLoad: false,
    }),
  ],

  data() {
    return {
      noti: useNotificationStore(),
      actionArr: [
        { text: "생성", value: "CREATE" },
        { text: "수정", value: "UPDATE" },
        { text: "삭제", value: "DELETE" },
      ],
      typeArr: [
        { text: "발주", value: "PURCHASEORDER" },
        { text: "구매", value: "INBOUND" },
        { text: "판매", value: "OUTBOUND" },
        { text: "반품", value: "RETURNORDER" },
        { text: "품목", value: "MATERIAL" },
      ],
      columns: [
        { key: "title", label: "제목", sortable: true, width: "200px" },
        { key: "username", label: "작성자", sortable: true, align: "center", width: "120px" },
        { key: "message", label: "메시지", sortable: true, width: "350px" },
        { key: "type", label: "구분", sortable: true, width: "100px" },
        { key: "action", label: "액션", type: "string", align: "right", width: "100px" },
        { key: "is_read", label: "읽음 표시", type: "string", align: "center", width: "200px", sortable: true },
        { key: "read_at", label: "읽은 날짜", type: "date", align: "center", width: "150px", sortable: true },
        { key: "created_at", label: "생성일", type: "date", align: "center", width: "150px", sortable: true },
      ],
    };
  },

  methods: {
    // 선택된 알림을 일괄 읽음 처리 (delete 와 별도의 batch action)
    async readRows() {
      const rows = this.$refs.notificationTable?.getSelectedRows?.() || [];
      if (!rows.length) {
        this.$toast.error("테이블에서 데이터를 선택하세요");
        return;
      }
      const ok = await this.$confirm(
        "선택된 정보를 읽음 처리 하시겠습니까?",
        "일괄 처리 확인",
      );
      if (!ok) return;
      try {
        await api.post(
          "/api/notification/batchRead",
          rows.map((r) => ({ id: r.id })),
        );
        this.$toast.success("선택 항목 읽음 처리되었습니다");
        this.loadList();
        this.noti.loadCounts();
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },

  // 쿼리 id 반영 후 첫 로드. 삭제 후에는 알림 카운트도 갱신한다.
  mounted() {
    const id = this.$route.query.id;
    if (id) this.where.id = id;
    this.loadList().then(() => this.noti.loadCounts?.());
  },
};
</script>
