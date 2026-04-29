<template>
  <div class="flex flex-col gap-3" style="min-height: 60vh">
    <!-- 헤더 -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-box text-blue-500"></i>
          품목 상세 정보
        </h2>
        <p class="text-[11px] text-slate-400 mt-0.5">
          <span v-if="loading" class="italic">불러오는 중...</span>
          <span v-else-if="!data.id" class="italic text-red-400">품목 정보가 없습니다</span>
          <span v-else class="font-mono">
            #{{ data.id }} · {{ data.code }} · {{ data.name }}
          </span>
        </p>
      </div>
      </div>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="flex-1 flex items-center justify-center text-slate-400 text-xs py-10"
    >
      <i class="fa-solid fa-spinner fa-spin mr-1.5"></i>불러오는 중...
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="!data.id"
      class="flex-1 flex flex-col items-center justify-center text-slate-400 py-10"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2"
      >
        <i class="fa-regular fa-file-lines text-xl text-slate-300"></i>
      </div>
      <p class="text-xs font-semibold text-slate-500">품목 정보를 찾을 수 없습니다</p>
    </div>

    <!-- 상세 -->
    <div v-else class="flex-1 overflow-auto">
      <div class="grid grid-cols-12 gap-4">
        <!-- 이미지 -->
        <div class="col-span-12 md:col-span-4">
          <div
            class="aspect-square w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center"
          >
            <img
              v-if="mainImage"
              :src="mainImage"
              class="w-full h-full object-cover"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <div v-else class="text-slate-300 text-center">
              <i class="fa-regular fa-image text-3xl mb-1"></i>
              <p class="text-[11px]">이미지 없음</p>
            </div>
          </div>

          <!-- 썸네일 -->
          <div
            v-if="data.images && data.images.length > 1"
            class="mt-2 flex gap-1.5 flex-wrap"
          >
            <button
              v-for="(img, i) in data.images"
              :key="img.id || i"
              type="button"
              @click="activeImageIdx = i"
              class="w-12 h-12 rounded-md border overflow-hidden shrink-0 transition"
              :class="
                activeImageIdx === i
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-blue-300'
              "
            >
              <img :src="url + img.file_url" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- 기본 정보 -->
        <div class="col-span-12 md:col-span-8 space-y-4">
          <section class="bg-slate-50/60 border border-slate-200 rounded-xl p-4">
            <h3 class="section-title">
              <i class="fa-solid fa-file-lines text-blue-500"></i>
              기본 정보
            </h3>
            <dl class="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
              <div>
                <dt class="dt">품목명</dt>
                <dd class="dd font-semibold text-slate-800">
                  {{ data.name || "-" }}
                </dd>
              </div>
              <div>
                <dt class="dt">품목코드</dt>
                <dd class="dd font-mono">{{ data.code || "-" }}</dd>
              </div>
              <div>
                <dt class="dt">카테고리</dt>
                <dd class="dd">{{ categoryPath || "-" }}</dd>
              </div>
              <div>
                <dt class="dt">규격</dt>
                <dd class="dd">{{ data.spec || "-" }}</dd>
              </div>
              <div>
                <dt class="dt">단위</dt>
                <dd class="dd">{{ data.unit || "-" }}</dd>
              </div>
              <div>
                <dt class="dt">안전재고</dt>
                <dd class="dd tabular-nums">
                  {{ fmt(data.safety_stock) }}
                  <span class="text-slate-400 text-[11px] ml-0.5">{{ data.unit || "" }}</span>
                </dd>
              </div>
              <div class="col-span-2" v-if="tagLabels.length">
                <dt class="dt">태그</dt>
                <dd class="dd flex flex-wrap gap-1 mt-0.5">
                  <span
                    v-for="(t, i) in tagLabels"
                    :key="i"
                    class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                  >
                    {{ t }}
                  </span>
                </dd>
              </div>
              <div class="col-span-2" v-if="data.memo">
                <dt class="dt">메모</dt>
                <dd class="dd text-slate-600 whitespace-pre-wrap">{{ data.memo }}</dd>
              </div>
              <div>
                <dt class="dt">등록일</dt>
                <dd class="dd text-slate-500 text-[11px]">
                  {{ fmtDate(data.created_at) }}
                </dd>
              </div>
              <div v-if="data.updated_at">
                <dt class="dt">수정일</dt>
                <dd class="dd text-slate-500 text-[11px]">
                  {{ fmtDate(data.updated_at) }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- 금액 정보 -->
          <section class="bg-white border border-slate-200 rounded-xl p-4">
            <h3 class="section-title">
              <i class="fa-solid fa-won-sign text-blue-500"></i>
              금액 정보
            </h3>
            <table class="w-full text-[12px]">
              <thead class="text-slate-500">
                <tr class="border-b border-slate-200">
                  <th class="text-left py-1.5 font-semibold w-32">구분</th>
                  <th class="text-right py-1.5 font-semibold">단가</th>
                  <th class="text-right py-1.5 font-semibold w-24">요율</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in priceRows" :key="row.key">
                  <td class="py-1.5 text-slate-600 flex items-center gap-1.5">
                    {{ row.label }}
                    <span
                      v-if="row.tag"
                      class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      :class="row.tagClass"
                    >
                      {{ row.tag }}
                    </span>
                  </td>
                  <td class="py-1.5 text-right font-mono tabular-nums font-semibold text-slate-800">
                    {{ fmt(data[row.price]) }}
                  </td>
                  <td class="py-1.5 text-right font-mono tabular-nums text-slate-500">
                    {{ row.rate ? pctText(data[row.rate]) : "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>

    <!-- 풋터 -->
    <div class="flex justify-end pt-2 border-t border-slate-100">
      <button type="button" @click="modal.closeModal()" class="btn">
        닫기
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import api from "@/api/api";
import { useModalStore } from "@/stores/modal";

export default {
  name: "MaterialDetailModal",

  props: {
    material_id: { type: Number, required: true },
  },

  data() {
    return {
      modal: useModalStore(),
      loading: false,
      data: {},
      activeImageIdx: 0,
      url: import.meta.env.VITE_API_URL,

      priceRows: [
        {
          key: "inbound",
          label: "구매 단가",
          price: "inbound_price",
          rate: null,
        },
        {
          key: "outbound1",
          label: "판매 단가 1",
          price: "outbound_price1",
          rate: "outbound_rate1",
          tag: "BASE",
          tagClass: "bg-blue-100 text-blue-700",
        },
        {
          key: "outbound2",
          label: "판매 단가 2",
          price: "outbound_price2",
          rate: "outbound_rate2",
        },
        {
          key: "wholesale1",
          label: "도매 단가 1",
          price: "wholesale_price1",
          rate: "wholesale_rate1",
        },
        {
          key: "wholesale2",
          label: "도매 단가 2",
          price: "wholesale_price2",
          rate: "wholesale_rate2",
        },
        {
          key: "online",
          label: "온라인 단가",
          price: "online_price",
          rate: "online_rate",
        },
      ],
    };
  },

  computed: {
    // 대표 이미지 URL
    mainImage() {
      const imgs = this.data?.images || [];
      if (!imgs.length) return "";
      const img = imgs[this.activeImageIdx] || imgs[0];
      return img?.file_url ? this.url + img.file_url : "";
    },

    // 카테고리 경로 문자열
    categoryPath() {
      const c = this.data?.category;
      if (!c) return "";
      // 서버가 카테고리 경로를 fullName 으로 주거나 path 배열로 주는 경우 모두 지원
      if (c.fullName) return c.fullName;
      if (Array.isArray(c.path) && c.path.length) return c.path.join(" > ");
      return c.name || "";
    },

    // 태그명 배열
    tagLabels() {
      const tags = this.data?.tags || this.data?.material_tags || [];
      return tags
        .map((t) => (typeof t === "object" ? t.name || t.tag?.name : t))
        .filter(Boolean);
    },
  },

  methods: {
    // 숫자 포맷 (천단위 콤마)
    fmt(v) {
      return (Number(v) || 0).toLocaleString();
    },

    // 비율(소수) → 퍼센트 표기
    pctText(v) {
      const p = (Number(v) || 0) * 100;
      if (!p) return "-";
      return `${Math.round(p * 100) / 100}%`;
    },

    // 날짜 포맷 (YYYY-MM-DD HH:mm)
    fmtDate(s) {
      if (!s) return "-";
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return String(s);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${mo}-${da} ${h}:${m}`;
    },

    // 품목 상세 로드
    async loadData() {
      this.loading = true;
      try {
        const res = await api.post(`/api/material/${this.material_id}`, {
          id: this.material_id,
        });
        this.data = res?.data || {};
      } catch (e) {
        this.data = {};
        this.$toast?.error("품목 정보를 불러오지 못했습니다.");
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    if (this.material_id) this.loadData();
  },
};
</script>

<style scoped>
.section-title {
  @apply text-[13px] font-black text-slate-700 mb-3 flex items-center gap-1.5;
}
.dt {
  @apply text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5;
}
.dd {
  @apply text-slate-700;
}
</style>
