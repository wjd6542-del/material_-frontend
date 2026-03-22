<template>
  <div class="p-6 h-[calc(100vh-80px)] flex gap-6 bg-gray-50/50">
    <!-- 📦 좌측: 재고 리스트 -->
    <div
      class="w-[340px] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
    >
      <div
        class="p-5 border-b bg-white font-bold flex items-center justify-between"
      >
        <div class="flex items-center gap-2 text-gray-800">
          <i class="fa-solid fa-boxes-stacked text-blue-600"></i>
          <span>재고 목록</span>
        </div>
        <span
          class="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100"
        >
          {{ stocks.length }}건
        </span>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
        <div
          v-for="row in stocks"
          :key="row.id"
          @click="selectStock(row)"
          :class="[
            'p-4 cursor-pointer transition-all duration-200 rounded-xl border-2 relative bg-white shadow-sm',
            selectedStock?.id === row.id
              ? 'border-blue-500 ring-4 ring-blue-500/5 z-10'
              : 'border-transparent hover:border-gray-200',
          ]"
        >
          <div
            :class="[
              'font-bold mb-2',
              selectedStock?.id === row.id ? 'text-blue-600' : 'text-gray-800',
            ]"
          >
            {{ row.material_name }}
          </div>
          <div class="flex justify-between items-end text-[12px]">
            <div class="space-y-1 text-gray-500">
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-warehouse w-3 text-gray-400"></i
                >{{ row.warehouse_name }}
              </div>
              <div class="flex items-center gap-1.5 font-medium text-gray-600">
                <i class="fa-solid fa-location-dot w-3 text-red-400"></i
                >{{ row.location_name }}
              </div>
            </div>
            <div class="text-right">
              <span class="text-xl font-black text-blue-600 tabular-nums">{{
                formatNumber(row.quantity)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🚚 우측: 이동 작업 영역 -->
    <div
      class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col relative"
    >
      <!-- 미선택 시 가이드 -->
      <div
        v-if="!selectedStock"
        class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/20"
      >
        <div
          class="w-20 h-20 bg-white shadow-inner rounded-full flex items-center justify-center mb-4 border border-gray-100"
        >
          <i class="fa-solid fa-hand-pointer text-3xl text-gray-200"></i>
        </div>
        <p class="text-lg font-bold">재고를 선택하면 이동 설정을 시작합니다</p>
      </div>

      <!-- 작업 영역 (드롭다운 잘림 방지를 위해 overflow-y-auto 제거 또는 패딩 확보) -->
      <div v-else class="flex-1 flex flex-col p-8 space-y-8 overflow-visible">
        <!-- 1. 상단 정보 헤더 -->
        <div class="flex items-center justify-between">
          <div>
            <div
              class="text-xs font-black text-blue-500 mb-1 tracking-widest uppercase italic"
            >
              In-Warehouse Transfer
            </div>
            <h2 class="text-3xl font-black text-gray-900 leading-none">
              {{ selectedStock.material_name }}
            </h2>
          </div>
          <div class="flex gap-8 border-l pl-8">
            <div class="text-right">
              <p
                class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter"
              >
                Current Stock
              </p>
              <p class="text-2xl font-black text-gray-900">
                {{ formatNumber(selectedStock.quantity) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 2. 시각적 위치 카드 (출발지 -> 도착지) -->
        <div
          class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100"
        >
          <!-- 출발지 카드 -->
          <div
            class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200"
          >
            <div
              class="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full bg-gray-300"></span> From Origin
            </div>
            <div class="text-sm text-blue-600 font-bold mb-0.5">
              {{ selectedStock.warehouse_name }}
            </div>
            <div class="text-xl font-black text-gray-800">
              {{ selectedStock.location_name }}
            </div>
          </div>

          <div
            class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
          >
            <i class="fa-solid fa-arrow-right text-blue-500"></i>
          </div>

          <!-- 도착지 카드 (선택 시 정보 매핑) -->
          <div
            :class="[
              'p-5 rounded-2xl transition-all duration-300 border-2',
              selectedLocation
                ? 'bg-white border-blue-500 shadow-md'
                : 'bg-gray-100/50 border-dashed border-gray-300',
            ]"
          >
            <div
              class="text-[10px] font-black text-blue-500 uppercase mb-3 flex items-center gap-1.5"
            >
              <span
                class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
              ></span>
              To Destination
            </div>
            <template v-if="selectedLocation">
              <div class="text-sm text-blue-600 font-bold mb-0.5">
                {{ selectedLocation.warehouse.name || "선택된 창고" }}
              </div>
              <div class="text-xl font-black text-gray-800">
                {{ selectedLocation.name }}
              </div>
            </template>
            <div v-else class="text-gray-400 font-medium py-3 italic text-sm">
              도착지를 선택해 주세요...
            </div>
          </div>
        </div>

        <!-- 3. 입력 섹션 (도착지 선택 & 수량) -->
        <div class="grid grid-cols-2 gap-8 pt-4">
          <!-- 도착지 선택 창 -->
          <div class="space-y-3">
            <label
              class="block text-sm font-black text-gray-700 uppercase tracking-wide"
              >1. 도착지 선택</label
            >
            <div class="relative">
              <SearchSelect
                v-model="form.to_location_id"
                :options="locations"
                labelKey="name"
                valueKey="id"
                class="text-2xl"
              />
              <p
                v-if="selectedLocation?.id === selectedStock.location_id"
                class="absolute -bottom-6 text-[11px] text-red-500 font-bold"
              >
                <i class="fa-solid fa-circle-exclamation"></i> 현재 위치와
                동일합니다.
              </p>
            </div>
          </div>

          <!-- 수량 입력 창 -->
          <div class="space-y-3">
            <label
              class="block text-sm font-black text-gray-700 uppercase tracking-wide"
              >2. 이동 수량 입력</label
            >
            <div class="relative">
              <input
                v-model.number="form.quantity"
                type="number"
                class="w-full text-2xl font-black border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
              />
              <button
                @click="form.quantity = selectedStock.quantity"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-gray-900 text-white px-2 py-1.5 rounded-lg font-bold hover:bg-blue-600"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        <!-- 4. 하단 결과 미리보기 및 실행 -->
        <div class="mt-auto space-y-4">
          <div
            class="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100"
          >
            <div class="flex-1 text-center">
              <div class="text-[20px] font-bold text-gray-400 uppercase">
                출발지 남음
              </div>
              <div class="text-lg font-black text-red-500 tabular-nums">
                {{ formatNumber(selectedStock.quantity - form.quantity) }}
              </div>
            </div>
            <div class="w-px h-8 bg-blue-200 opacity-50"></div>
            <div class="flex-1 text-center">
              <div class="text-[20px] font-bold text-gray-400 uppercase">
                도착지 합계
              </div>
              <div class="text-lg font-black text-green-600 tabular-nums">
                {{ formatNumber(toPreviewQty) }}
              </div>
            </div>
          </div>

          <button
            @click="submit"
            :disabled="
              !form.to_location_id ||
              form.quantity <= 0 ||
              selectedLocation?.id === selectedStock.location_id
            "
            class="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-xl shadow-blue-500/10"
            :class="[
              !form.to_location_id ||
              form.quantity <= 0 ||
              selectedLocation?.id === selectedStock.location_id
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
            ]"
          >
            <i class="fa-solid fa-paper-plane"></i>
            재고 이동 실행하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import SearchSelect from "@/components/base/SearchSelect.vue";

export default {
  components: { SearchSelect },
  data() {
    return {
      stocks: [],
      locations: [],
      selectedStock: null,
      form: { to_location_id: null, quantity: 1 },
    };
  },
  computed: {
    // 선택된 창고 정보
    selectedLocation() {
      if (!this.form.to_location_id) return null;
      return (
        this.locations.find((l) => l.id === this.form.to_location_id) || null
      );
    },
    toPreviewQty() {
      if (!this.selectedStock) return 0;
      const target = this.stocks.find(
        (s) =>
          s.material_id === this.selectedStock.material_id &&
          s.location_id === this.form.to_location_id,
      );
      return (target?.quantity || 0) + (this.form.quantity || 0);
    },
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      const [s, l] = await Promise.all([
        api.post("/api/stock/list"),
        api.post("/api/location/list"),
      ]);
      this.stocks = s.data || [];
      this.locations = l.data || [];
    },
    selectStock(row) {
      this.selectedStock = row;
      this.form.to_location_id = null;
      this.form.quantity = 1;
    },
    formatNumber(num) {
      return (num || 0).toLocaleString();
    },
    async submit() {
      // (기존 제출 로직과 동일)
      try {
        await api.post("/api/stock/transfer", {
          material_id: this.selectedStock.material_id,
          from_location_id: this.selectedStock.location_id,
          to_location_id: this.form.to_location_id,
          quantity: this.form.quantity,
        });
        alert("이동 완료");
        await this.loadData();
        this.selectedStock = null;
      } catch (e) {
        alert("오류 발생");
      }
    },
  },
};
</script>
