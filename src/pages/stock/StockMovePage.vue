<template>
  <div class="p-6 h-[calc(100vh-80px)] flex gap-6 bg-gray-50/50 font-sans">
    <!-- 📦 좌측: 재고 리스트 -->
    <div
      class="w-[340px] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
    >
      <div
        class="p-5 border-b bg-white font-bold flex items-center justify-between shrink-0"
      >
        <div class="flex items-center gap-2 text-gray-800">
          <i class="fa-solid fa-boxes-stacked text-blue-600"></i>
          <span>재고 목록</span>
        </div>
        <span
          class="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100"
        >
          {{ filteredStocks.length }}건
        </span>
      </div>

      <!-- 검색바 -->
      <div class="p-3 bg-white border-b shrink-0">
        <div class="relative group">
          <i
            class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          ></i>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="자재명 또는 창고 검색..."
            class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
          />
        </div>
      </div>

      <!-- 리스트 영역 -->
      <div class="flex-1 overflow-y-auto relative bg-gray-50/30">
        <!-- 결과가 있을 때 -->
        <transition-group
          v-if="filteredStocks.length > 0"
          name="list"
          tag="div"
          class="p-3 space-y-2"
        >
          <div
            v-for="row in filteredStocks"
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
                selectedStock?.id === row.id
                  ? 'text-blue-600'
                  : 'text-gray-800',
              ]"
            >
              {{ row.material_name }}
            </div>
            <div class="flex justify-between items-end text-[12px]">
              <div class="space-y-1 text-gray-500">
                <div class="flex items-center gap-1.5">
                  <i class="fa-solid fa-warehouse w-3"></i
                  >{{ row.warehouse_name }}
                </div>
                <div class="flex items-center gap-1.5">
                  <i class="fa-solid fa-location-dot w-3 text-red-400"></i
                  >{{ row.location_name }}
                </div>
              </div>
              <div class="text-right font-black text-blue-600 text-lg">
                {{ formatNumber(row.quantity) }}
              </div>
            </div>
          </div>
        </transition-group>

        <!-- 결과가 없을 때 (이쁘게 수정된 버전) -->
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/50"
        >
          <div class="relative mb-4">
            <div
              class="absolute inset-0 bg-blue-50 rounded-full scale-150 blur-xl opacity-60"
            ></div>
            <div
              class="relative w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center"
            >
              <i
                class="fa-solid fa-magnifying-glass text-2xl text-gray-200"
              ></i>
            </div>
          </div>
          <p class="text-gray-900 font-bold mb-1">검색 결과가 없어요</p>
          <p class="text-gray-400 text-xs leading-relaxed mb-4">
            "{{ searchKeyword }}"와 일치하는<br />재고를 찾을 수 없습니다.
          </p>
          <button
            @click="searchKeyword = ''"
            class="px-4 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>
    </div>

    <!-- 🚚 우측: 이동 작업 영역 -->
    <div
      class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col relative overflow-visible"
    >
      <div
        v-if="!selectedStock"
        class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/20"
      >
        <div
          class="w-16 h-16 bg-white shadow-inner rounded-full flex items-center justify-center mb-4 border border-gray-100"
        >
          <i class="fa-solid fa-hand-pointer text-2xl text-gray-200"></i>
        </div>
        <p class="font-bold">재고를 선택하면 이동 설정을 시작합니다</p>
      </div>

      <div v-else class="flex-1 flex flex-col p-8 space-y-8 overflow-visible">
        <div class="flex items-center justify-between">
          <div>
            <div
              class="text-xs font-black text-blue-500 mb-1 tracking-widest uppercase italic italic"
            >
              Transfer Info
            </div>
            <h2 class="text-3xl font-black text-gray-900 leading-none">
              {{ selectedStock.material_name }}
            </h2>
          </div>
          <div class="text-right border-l pl-8">
            <p class="text-[10px] font-bold text-gray-400">CURRENT STOCK</p>
            <p class="text-2xl font-black text-gray-900">
              {{ formatNumber(selectedStock.quantity) }}
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100"
        >
          <div
            class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-center"
          >
            <div class="text-[10px] font-black text-gray-400 uppercase mb-2">
              From
            </div>
            <div class="text-sm text-blue-600 font-bold leading-none">
              {{ selectedStock.warehouse_name }}
            </div>
            <div class="text-xl font-black text-gray-800 mt-1">
              {{ selectedStock.location_name }}
            </div>
          </div>
          <i
            class="fa-solid fa-arrow-right text-blue-500 text-xl animate-pulse"
          ></i>
          <div
            :class="[
              'p-5 rounded-2xl border-2 text-center transition-all',
              selectedLocation
                ? 'bg-white border-blue-500 shadow-md'
                : 'bg-gray-100 border-dashed border-gray-300',
            ]"
          >
            <div class="text-[10px] font-black text-blue-500 uppercase mb-2">
              To
            </div>
            <template v-if="selectedLocation">
              <div class="text-sm text-blue-600 font-bold leading-none">
                {{ selectedLocation.warehouse?.name || "지정 창고" }}
              </div>
              <div class="text-xl font-black text-gray-800 mt-1">
                {{ selectedLocation.name }}
              </div>
            </template>
            <div v-else class="py-3 text-gray-400 italic text-sm font-medium">
              도착지 선택...
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 pt-4 overflow-visible">
          <div class="space-y-3">
            <label
              class="block text-sm font-black text-gray-700 uppercase tracking-tight"
              >1. 도착지 선택</label
            >
            <SearchSelect
              v-model="form.to_location_id"
              :options="locations"
              labelKey="name"
              valueKey="id"
              class="w-full text-2xl font-black border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <div class="space-y-3">
            <label
              class="block text-sm font-black text-gray-700 uppercase tracking-tight"
              >2. 이동 수량 입력</label
            >
            <div class="relative">
              <input
                v-model.number="form.quantity"
                type="number"
                class="w-full text-2xl font-black border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
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

        <div class="mt-auto space-y-4">
          <div
            class="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100"
          >
            <div class="flex-1 text-center">
              <div
                class="text-xs font-bold text-gray-400 uppercase mb-1 font-mono"
              >
                Remain Origin
              </div>
              <div class="text-xl font-black text-red-500 tabular-nums">
                {{ formatNumber(selectedStock.quantity - form.quantity) }}
              </div>
            </div>
            <div class="w-px h-8 bg-blue-200 opacity-30"></div>
            <div class="flex-1 text-center">
              <div
                class="text-xs font-bold text-gray-400 uppercase mb-1 font-mono"
              >
                Total Target
              </div>
              <div class="text-xl font-black text-green-600 tabular-nums">
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
            class="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl"
            :class="[
              !form.to_location_id ||
              form.quantity <= 0 ||
              selectedLocation?.id === selectedStock.location_id
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
            ]"
          >
            <i class="fa-solid fa-paper-plane"></i> 재고 이동 실행
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
      searchKeyword: "",
      form: { to_location_id: null, quantity: 1 },
    };
  },
  computed: {
    filteredStocks() {
      if (!this.searchKeyword) return this.stocks;
      const kw = this.searchKeyword.toLowerCase();
      return this.stocks.filter(
        (s) =>
          s.material_name.toLowerCase().includes(kw) ||
          s.warehouse_name.toLowerCase().includes(kw) ||
          s.location_name.toLowerCase().includes(kw),
      );
    },
    selectedLocation() {
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
      try {
        await api.post("/api/stock/transfer", {
          material_id: this.selectedStock.material_id,
          from_location_id: this.selectedStock.location_id,
          to_location_id: this.form.to_location_id,
          quantity: this.form.quantity,
        });
        this.$toast.success("이동 처리가 완료되었습니다.");
        await this.loadData();
        this.selectedStock = null;
      } catch (e) {
        this.$toast.error(e.message);
      }
    },
  },
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
