<template>
  <div class="flex flex-col gap-4" style="height: 75vh">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <i class="fa-solid fa-truck-ramp-box text-blue-500"></i>
        구매 정보 불러오기
      </h2>
      </div>

    <!-- 상단 통합 필터 (거래처 · 검색) -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 flex-nowrap">
      <span class="text-[11px] font-bold text-slate-500 inline-flex items-center gap-1 mr-1 shrink-0">
        <i class="fa-solid fa-building text-slate-400"></i>
        거래처
      </span>
      <div class="flex-1 min-w-[180px]">
        <SearchSelect
          v-model="supplierFilter"
          :options="inboundSuppliers"
          labelKey="name"
          valueKey="id"
          placeholder="전체 거래처 (검색 가능)"
        />
      </div>
      <div class="relative flex-1 min-w-[180px]">
        <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
        <input
          v-model="keyword"
          type="text"
          placeholder="구매번호/거래처 검색"
          class="w-full h-[30px] pl-7 pr-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="button"
        @click="resetFilters"
        :disabled="!hasFilter"
        class="shrink-0 h-[30px] px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-[11px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
      >
        <i class="fa-solid fa-rotate-left text-[10px]"></i>
        초기화
      </button>
      <span class="shrink-0 text-[11px] text-slate-400">
        {{ filteredOrders.length }} / {{ orders.length }}건
      </span>
    </div>

    <!-- 본체: 좌 리스트 / 우 아이템 프리뷰 -->
    <div class="flex-1 flex gap-3 overflow-hidden border rounded-xl bg-white">
      <!-- 좌: 구매 리스트 -->
      <section class="w-1/2 flex flex-col overflow-hidden border-r">
        <header class="px-3 py-2 border-b bg-slate-50/80 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
            <span class="text-sm font-semibold text-slate-700">구매 목록</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-500">
              선택 <span class="font-bold text-blue-600">{{ checkedIds.size }}</span>개
            </span>
          </div>
        </header>

        <div class="flex-1 overflow-auto">
          <div v-if="loadingList" class="text-center text-slate-400 text-xs py-6">
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>불러오는 중...
          </div>
          <div v-else-if="!filteredOrders.length" class="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10">
            <i class="fa-regular fa-folder-open text-2xl mb-2 text-slate-300"></i>
            조회된 구매가 없습니다
          </div>
          <table v-else class="w-full text-xs">
            <thead class="bg-slate-50/60 text-slate-500 sticky top-0">
              <tr>
                <th class="w-8 text-center py-2">
                  <input
                    type="checkbox"
                    :checked="allChecked"
                    @change="toggleAll"
                  />
                </th>
                <th class="text-left px-2 py-2 font-semibold">구매번호</th>
                <th class="text-left px-2 py-2 font-semibold">거래처</th>
                <th class="text-center px-2 py-2 font-semibold w-24">구매일자</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="po in filteredOrders"
                :key="po.id"
                @click="onSelectPo(po)"
                class="border-t border-slate-100 cursor-pointer transition-colors"
                :class="
                  selectedPo?.id === po.id
                    ? 'bg-blue-50/80 hover:bg-blue-100/60'
                    : 'hover:bg-slate-50'
                "
              >
                <td class="text-center py-1.5" @click.stop>
                  <input
                    type="checkbox"
                    :checked="checkedIds.has(po.id)"
                    @change="toggleCheck(po)"
                  />
                </td>
                <td class="px-2 py-1.5 font-mono text-slate-700">
                  {{ po.inbound_no }}
                </td>
                <td class="px-2 py-1.5 text-slate-700 truncate">
                  {{ po.supplier_name || po.supplier?.name || "-" }}
                </td>
                <td class="px-2 py-1.5 text-center text-slate-500 text-[11px]">
                  {{ fmtDate(po.inbound_date || po.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 우: 선택한 구매의 품목 미리보기 -->
      <section class="w-1/2 flex flex-col overflow-hidden">
        <header class="px-3 py-2 border-b bg-slate-50/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              :class="selectedPo ? 'bg-blue-600' : 'bg-slate-300'"
            >2</span>
            <span class="text-sm font-semibold text-slate-700">구매 품목</span>
          </div>
          <span v-if="selectedPo" class="text-[11px] text-slate-500 font-mono truncate">
            {{ selectedPo.inbound_no }}
          </span>
        </header>

        <div class="flex-1 overflow-auto">
          <div v-if="!selectedPo" class="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10 px-4 text-center">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-2">
              <i class="fa-regular fa-hand-pointer text-blue-400 text-xl"></i>
            </div>
            <p class="font-semibold text-slate-500">구매를 선택하면 품목이 표시됩니다</p>
            <p class="mt-0.5 text-[11px] text-slate-400">좌측에서 구매를 클릭하세요</p>
          </div>
          <div v-else-if="loadingDetail" class="text-center text-slate-400 text-xs py-10">
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>불러오는 중...
          </div>
          <div v-else-if="!detailItems.length" class="text-center text-slate-400 text-xs py-10">
            품목이 없습니다
          </div>
          <table v-else class="w-full text-xs">
            <thead class="bg-slate-50/60 text-slate-500 sticky top-0">
              <tr>
                <th class="text-left px-2 py-2 font-semibold">품목</th>
                <th class="text-right px-2 py-2 font-semibold w-16">수량</th>
                <th class="text-right px-2 py-2 font-semibold w-20">단가</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in detailItems" :key="it.id" class="border-t border-slate-100">
                <td class="px-2 py-1.5 text-slate-700">
                  <div class="truncate font-mono text-[10px] text-slate-400">
                    {{ it.material_code || it.material?.code || "-" }}
                  </div>
                  <div class="truncate">{{ it.material_name || it.material?.name || "-" }}</div>
                </td>
                <td class="px-2 py-1.5 text-right font-mono">
                  {{ Number(it.quantity || 0).toLocaleString() }}
                </td>
                <td class="px-2 py-1.5 text-right font-mono">
                  {{ Number(it.price || 0).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- 하단 액션 -->
    <div class="flex items-center justify-between pt-2 border-t">
      <p class="text-xs text-slate-500">
        체크한 구매 <span class="font-bold text-blue-600">{{ checkedIds.size }}</span>개의
        품목을 반품 품목에 추가합니다
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="modal.closeModal()"
          class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          취소
        </button>
        <button
          type="button"
          @click="confirm"
          :disabled="!checkedIds.size || applying"
          class="px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <i v-if="applying" class="fa-solid fa-spinner fa-spin text-xs"></i>
          <i v-else class="fa-solid fa-check text-xs"></i>
          적용
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";
import SearchSelect from "@/components/base/SearchSelect.vue";
import { formatDateOnly } from "@/utils/date";
import { buildLocationLabel } from "@/utils/location";
import { createRefDataMixin } from "@/mixins/refData";

export default {
  name: "InboundSelectModal",

  components: { SearchSelect },

  mixins: [createRefDataMixin(["suppliers"])],

  props: {
    // 적용 시 호출되는 콜백. 인자로 병합된 item 배열 전달
    onConfirm: { type: Function, default: null },
  },

  data() {
    return {
      modal: useModalStore(),
      orders: [],
      suppliers: [],
      supplierFilter: null,
      keyword: "",

      // 체크된 구매 ID 집합
      checkedIds: new Set(),
      // 체크된 구매의 아이템 캐시 { [id]: { header, items } }
      detailCache: {},

      // 우측 미리보기용 현재 선택된 구매
      selectedPo: null,
      detailItems: [],
      loadingList: false,
      loadingDetail: false,
      applying: false,
    };
  },

  computed: {
    // 구매(INBOUND) 거래처만 필터 후보로 노출
    inboundSuppliers() {
      return (this.suppliers || []).filter(
        (s) => !s.type || s.type === "INBOUND",
      );
    },

    // 거래처 + 구매번호/거래처명 키워드로 필터링된 목록
    filteredOrders() {
      const kw = this.keyword.trim().toLowerCase();
      const sid = this.supplierFilter;
      return this.orders.filter((o) => {
        if (sid != null && o.supplier_id !== sid) return false;
        if (!kw) return true;
        const supplier = (o.supplier_name || o.supplier?.name || "").toLowerCase();
        const no = (o.inbound_no || "").toLowerCase();
        return supplier.includes(kw) || no.includes(kw);
      });
    },

    // 하나 이상의 필터가 적용됐는지
    hasFilter() {
      return !!(this.supplierFilter != null || this.keyword);
    },

    // 필터된 구매가 모두 체크됐는지 여부
    allChecked() {
      return (
        this.filteredOrders.length > 0 &&
        this.filteredOrders.every((o) => this.checkedIds.has(o.id))
      );
    },
  },

  methods: {
    // 날짜 포맷 (YYYY-MM-DD)
    fmtDate: formatDateOnly,

    // 구매 목록 조회
    async loadOrders() {
      this.loadingList = true;
      try {
        const res = await api.post("/api/inbound/list", {});
        this.orders = Array.isArray(res.data) ? res.data : [];
      } catch {
        this.orders = [];
      } finally {
        this.loadingList = false;
      }
    },

    // 필터 전체 초기화
    resetFilters() {
      this.supplierFilter = null;
      this.keyword = "";
    },

    // 구매 상세(아이템) 조회 및 캐싱
    async loadDetail(po) {
      if (this.detailCache[po.id]) return this.detailCache[po.id];
      try {
        const res = await api.post(`/api/inbound/${po.id}`, { id: po.id });
        const data = res.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        this.detailCache[po.id] = { header: data, items };
        return this.detailCache[po.id];
      } catch {
        this.detailCache[po.id] = { header: {}, items: [] };
        return this.detailCache[po.id];
      }
    },

    // 구매 마스터 클릭 시 우측 미리보기를 로드한다
    async onSelectPo(po) {
      this.selectedPo = po;
      this.loadingDetail = true;
      this.detailItems = [];
      try {
        const { items } = await this.loadDetail(po);
        this.detailItems = items;
      } finally {
        this.loadingDetail = false;
      }
    },

    // 체크 토글
    toggleCheck(po) {
      const next = new Set(this.checkedIds);
      if (next.has(po.id)) next.delete(po.id);
      else next.add(po.id);
      this.checkedIds = next;
    },

    // 필터된 전체 체크/해제
    toggleAll() {
      const next = new Set(this.checkedIds);
      if (this.allChecked) {
        this.filteredOrders.forEach((o) => next.delete(o.id));
      } else {
        this.filteredOrders.forEach((o) => next.add(o.id));
      }
      this.checkedIds = next;
    },

    // 체크된 모든 구매의 품목을 모아 반품 아이템 형식으로 변환 후 콜백 호출
    async confirm() {
      if (!this.checkedIds.size) return;
      this.applying = true;
      try {
        const merged = [];
        for (const id of this.checkedIds) {
          const po = this.orders.find((o) => o.id === id);
          if (!po) continue;
          const { items } = await this.loadDetail(po);
          for (const it of items) {
            const m = it.material || {};
            const w = it.warehouse || {};
            const l = it.location || {};
            const s = it.shelf || {};
            merged.push({
              id: 0,
              material_id: it.material_id ?? m.id ?? null,
              material_code: it.material_code || m.code || "",
              material_name: it.material_name || m.name || "",
              spec: it.spec || m.spec || "",
              unit: it.unit || m.unit || "",
              warehouse_id: it.warehouse_id ?? w.id ?? null,
              location_id: it.location_id ?? l.id ?? null,
              shelf_id: it.shelf_id ?? s.id ?? null,
              shelf_label: it.shelf_label || buildLocationLabel(it),
              quantity: Number(it.quantity) || 0,
              cost_price: Number(it.price) || 0,
              sale_price: 0,
              reasonType: "단순변심",
              // 원본 참조용
              inbound_id: po.id,
              inbound_item_id: it.id,
            });
          }
        }

        if (typeof this.onConfirm === "function") {
          this.onConfirm(merged);
        }
        this.modal.closeModal();
      } finally {
        this.applying = false;
      }
    },
  },

  mounted() {
    this.loadOrders();
    this.loadRefData();
  },
};
</script>
