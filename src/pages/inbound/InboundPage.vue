<template>
  <div>
    <!-- 테이블 -->
    <div
      class="lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-base font-semibold text-gray-800">구매 목록</h2>
      </div>

      <div class="p-4 pb-0 flex flex-wrap items-center gap-2">
        <button
          v-if="auth.hasPermission('inbound.create')"
          @click="goRegister"
          class="btn btn-primary shrink-0"
        >
          <i class="fa-solid fa-add"></i>
        </button>

        <button
          v-if="auth.hasPermission('inbound.delete')"
          @click="batchDelete"
          class="btn btn-danger flex items-center gap-1 shrink-0"
        >
          <i class="fa-solid fa-trash"></i>
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
          <BaseInput
            v-model="where.inbound_no"
            placeholder="구매번호 입력"
            @change="loadList"
          />
        </div>
        <div class="w-full sm:w-[160px] shrink-0">
          <SearchSelect
            v-model="where.is_unpaid"
            :options="paymentFilterOptions"
            labelKey="text"
            valueKey="value"
            placeholder="지급 여부"
            @change="loadList"
          />
        </div>
      </div>

      <div class="p-4">
        <BaseTable
          ref="inboundTable"
          :columns="columns"
          :rows="rows"
          sortable
          selectable
          pagination
          :pageSize="10"
          :pageSizeOptions="[10, 20, 50, 100]"
          @cell-click="onCellClick"
        >
          <template #is_unpaid="{ row }">
            <Badge
              v-if="row.is_unpaid"
              variant="error"
              icon="fa-solid fa-circle-exclamation"
            >
              미지급
            </Badge>
            <Badge
              v-else
              variant="success"
              icon="fa-solid fa-circle-check"
            >
              지급 완료
            </Badge>
          </template>

          <template #elapsed_days="{ row }">
            <span v-if="!row.is_unpaid" class="badge-muted">-</span>
            <Badge
              v-else-if="elapsedDays(row.created_at) >= 30"
              variant="error"
              icon="fa-solid fa-triangle-exclamation"
            >
              {{ elapsedDays(row.created_at) }}일 경과
            </Badge>
            <Badge
              v-else-if="elapsedDays(row.created_at) >= 8"
              variant="warning"
            >
              {{ elapsedDays(row.created_at) }}일 경과
            </Badge>
            <Badge v-else variant="info">
              {{ elapsedDays(row.created_at) }}일 경과
            </Badge>
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import BaseTable from "@/components/base/BaseTable.vue";
import DateRangePicker from "@/components/base/DateRangePicker.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import Badge from "@/components/ui/Badge.vue";
import { useModalStore } from "@/stores/modal";
import InboundVoucherPrintModal from "@/components/inbound/InboundVoucherPrintModal.vue";
import { useAuthStore } from "@/stores/auth";
import { createListMixin } from "@/mixins/listPage";
import { startOfDay } from "@/utils/date";

export default {
  name: "InboundPage",

  components: {
    BaseTable,
    DateRangePicker,
    BaseInput,
    SearchSelect,
    Badge,
  },

  // 공용 리스트 페이지 패턴 (rows / where / dateRange / loadList / batchDelete)
  mixins: [
    createListMixin({
      endpoint: "/api/inbound/list",
      deleteEndpoint: "/api/inbound/batchDelete",
      tableRef: "inboundTable",
      initialWhere: { inbound_no: "", is_unpaid: "" },
      // is_unpaid select 값(문자열 "true"/"false"/"")을 boolean 으로 정규화
      transformWhere: (w) => {
        if (w.is_unpaid === "true") w.is_unpaid = true;
        else if (w.is_unpaid === "false") w.is_unpaid = false;
        else delete w.is_unpaid;
        return w;
      },
      mapRow: (r) => ({
        ...r,
        supplier_name: r.supplier?.name || "-",
      }),
    }),
  ],

  data() {
    return {
      auth: useAuthStore(),
      modal: useModalStore(),
      columns: [
        { key: "id", label: "전표", type: "button", width: "80px", align: "center" },
        { key: "qrcode", label: "QR", type: "img", width: "80px", align: "center", sortable: true },
        { key: "inbound_no", label: "구매번호", width: "200px", align: "center", sortable: true },
        { key: "supplier_name", label: "거래처", sortable: true, width: "160px" },
        { key: "username", label: "작성자", sortable: true, width: "100px" },
        { key: "is_unpaid", label: "지급 여부", align: "center", width: "110px", sortable: true },
        { key: "memo", label: "메모", type: "text", width: "250px" },
        { key: "created_at", label: "등록일", type: "date", align: "center", width: "200px", sortable: true },
        { key: "elapsed_days", label: "경과일", align: "center", width: "120px" },
      ],
      paymentFilterOptions: [
        { text: "전체", value: "" },
        { text: "미지급", value: "true" },
        { text: "지급 완료", value: "false" },
      ],
    };
  },

  methods: {
    // 구매 등록 페이지로 이동한다
    goRegister() {
      this.$router.push("/inbound/register");
    },

    // 등록일 ~ 오늘 사이 경과 일수 (음수 차단)
    elapsedDays(createdAt) {
      if (!createdAt) return 0;
      const today = startOfDay(new Date());
      const d = startOfDay(createdAt);
      return Math.max(
        0,
        Math.round((today.getTime() - d.getTime()) / 86400000),
      );
    },

    // 셀 클릭: 구매번호 → 수정, 전표 → 프린트 모달
    onCellClick(data) {
      if (data.key === "inbound_no") {
        if (!this.auth.hasPermission("inbound.update")) return;
        this.$router.push({
          path: "/inbound/register",
          query: { id: data.row.id },
        });
      } else if (data.key === "id") {
        this.modal.openModal(
          InboundVoucherPrintModal,
          { id: data.row.id },
          "xl",
        );
      }
    },
  },
};
</script>
