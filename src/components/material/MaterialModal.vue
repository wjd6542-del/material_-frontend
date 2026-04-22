<template>
  <div>
    <h2 class="text-base font-semibold mb-3">
      자재 {{ isEdit ? "수정" : "등록" }}
    </h2>

    <div class="space-y-3">
      <div>
        <label class="form-label">자재명</label>
        <input
          v-model="form.name"
          placeholder="자재명 입력"
          class="field mt-1"
        />
      </div>

      <div>
        <label class="form-label">카테고리</label>
        <CategoryTreeSelect v-model="form.category_id" />
      </div>

      <div>
        <label class="form-label">자재코드</label>
        <input
          v-model="form.code"
          class="field mt-1"
          :disabled="isEdit"
        />
      </div>

      <div>
        <label class="form-label">규격</label>
        <input
          v-model="form.spec"
          class="field mt-1"
        />
      </div>

      <div>
        <label class="form-label">단위</label>
        <SearchSelect
          v-model="form.unit"
          :options="selects"
          labelKey="text"
          valueKey="value"
        />
      </div>

      <div>
        <label class="form-label">안전재고</label>
        <input
          v-model="form.safety_stock"
          type="number"
          class="field mt-1"
        />
      </div>

      <!-- 금액 정보 -->
      <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <i class="fa-solid fa-won-sign text-blue-500"></i>
            금액 정보
          </div>
          <span class="text-[10px] text-slate-400">
            판매 단가 1 변경 시 비율로 나머지 단가 자동계산
          </span>
        </div>

        <!-- 구매 단가 -->
        <div class="grid grid-cols-[1fr_auto] gap-2 items-end mb-2">
          <div>
            <label class="form-label">구매 단가 (원가)</label>
            <input
              :value="form.inbound_price"
              @input="onPriceInput('inbound_price', $event)"
              type="number"
              min="0"
              class="field mt-1 text-right"
              placeholder="0"
            />
          </div>
          <div class="w-[90px] shrink-0 invisible">
            <!-- 레이아웃 정렬용 -->
          </div>
        </div>

        <!-- 판매 단가 1 (기준) + 원가 대비 비율 -->
        <div class="grid grid-cols-[1fr_auto] gap-2 items-end mb-2">
          <div>
            <label class="form-label">
              판매 단가 1
              <span class="ml-1 text-[9px] font-bold text-blue-500">BASE</span>
            </label>
            <input
              :value="form.outbound_price1"
              @input="onPriceInput('outbound_price1', $event)"
              type="number"
              min="0"
              class="field mt-1 text-right"
              placeholder="0"
            />
          </div>
          <div class="w-[90px] shrink-0">
            <label class="form-label">원가 대비</label>
            <div class="relative mt-1">
              <input
                :value="pct('outbound_rate1')"
                @input="onRateInput('outbound_rate1', $event)"
                type="number"
                min="0"
                step="0.01"
                class="field text-right pr-6"
                placeholder="0"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
            </div>
          </div>
        </div>

        <!-- 판매 2, 도매 1/2, 온라인 (판매1 대비 비율) -->
        <div
          v-for="row in dependentPriceRows"
          :key="row.price"
          class="grid grid-cols-[1fr_auto] gap-2 items-end mb-2"
        >
          <div>
            <label class="form-label">{{ row.label }}</label>
            <input
              :value="form[row.price]"
              @input="onPriceInput(row.price, $event)"
              type="number"
              min="0"
              class="field mt-1 text-right"
              placeholder="0"
            />
          </div>
          <div class="w-[90px] shrink-0">
            <label class="form-label">BASE 대비</label>
            <div class="relative mt-1">
              <input
                :value="pct(row.rate)"
                @input="onRateInput(row.rate, $event)"
                type="number"
                min="0"
                step="0.01"
                class="field text-right pr-6"
                placeholder="0"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <MultiCheck
          v-model="form.tags"
          :items="tagItems"
          label="태그"
          placeholder="태그를 선택하세요"
          search-placeholder="태그명/코드 검색..."
          :search-keys="['code']"
          sub-text-key="code"
          creatable
          @create="createTag"
        />
      </div>

      <div>
        <label class="form-label">메모</label>
        <textarea
          v-model="form.memo"
          class="field mt-1"
        ></textarea>
      </div>

      <div>
        <label class="form-label">이미지</label>
        <BaseImage :multiple="false" @change="handleFiles" />

        <div class="flex gap-2 flex-wrap mt-2">
          <div
            v-for="img in form.images"
            :key="img.id"
            class="relative w-24 h-24 border rounded overflow-hidden bg-gray-50"
          >
            <img
              :src="img.isNew ? img.preview : url + img.file_url"
              class="w-full h-full object-cover"
              @error="(e) => (e.target.src = '/img/no-image.png')"
            />

            <button
              @click="removeImage(img)"
              class="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
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
        {{ isEdit ? "수정하기" : "저장하기" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from "@/stores/modal";
import BaseImage from "@/components/base/BaseImage.vue";
import CategoryTreeSelect from "@/components/base/CategoryTreeSelect.vue";
import MultiCheck from "@/components/base/MultiCheck.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import api from "@/api/api";

export default {
  name: "MaterialModal",

  components: {
    BaseImage,
    CategoryTreeSelect,
    MultiCheck,
    SearchSelect,
  },

  props: {
    id: { type: Number, default: 0 },
    category_id: { type: Number, default: 0 },
    onSaved: Function,
  },

  data() {
    return {
      modal: useModalStore(),

      selects: [
        { text: "갯수(EA)", value: "EA" },
        { text: "박스(BOX)", value: "BOX" },
        { text: "킬로(KG)", value: "KG" },
        { text: "미터(M)", value: "M" },
        { text: "톤(T)", value: "T" },
      ],

      form: {
        id: 0,
        name: "",
        code: "MAT-" + Date.now(),
        category_id: 0,
        spec: "",
        unit: "EA",
        safety_stock: 0,
        memo: "",
        is_active: true,
        // 가격 정보
        inbound_price: 0,
        outbound_price1: 0,
        outbound_price2: 0,
        wholesale_price1: 0,
        wholesale_price2: 0,
        online_price: 0,
        // 비율 정보 (decimal)
        // outbound_rate1: 원가 대비, 나머지: outbound_price1(BASE) 대비
        outbound_rate1: 0,
        outbound_rate2: 0,
        wholesale_rate1: 0,
        wholesale_rate2: 0,
        online_rate: 0,
        images: [] as any[],
        tags: [] as any[],
      } as any,

      // 템플릿 반복용 (output2/도매1/2/온라인)
      dependentPriceRows: [
        { label: "판매 단가 2", price: "outbound_price2", rate: "outbound_rate2" },
        { label: "도매 단가 1", price: "wholesale_price1", rate: "wholesale_rate1" },
        { label: "도매 단가 2", price: "wholesale_price2", rate: "wholesale_rate2" },
        { label: "온라인 단가", price: "online_price", rate: "online_rate" },
      ],

      categorys: [] as any[],
      tagItems: [] as any[],
      isEdit: false,
      editId: 0,

      deleteImageIds: [],
      newFiles: [],
      url: import.meta.env.VITE_API_URL,
    };
  },

  methods: {
    // 숫자 반올림 (단가: 정수, 비율: 소수 4자리까지)
    roundPrice(v) {
      return Math.round(Number(v) || 0);
    },
    roundRate(v) {
      return Math.round((Number(v) || 0) * 10000) / 10000;
    },

    // 비율을 퍼센트(0~)로 표시 (9999.99 최대)
    pct(key) {
      const v = Number(this.form[key]) || 0;
      if (!v) return 0;
      // 소수 2자리까지 반올림해서 편집 친화적으로 노출
      return Math.round(v * 10000) / 100;
    },

    // 단가 입력 핸들러 - 연관 비율과 종속 단가를 자동 계산한다
    onPriceInput(key, e) {
      const val = this.roundPrice(e?.target?.value);
      (this.form as any)[key] = val;
      this.recalcFromPrice(key);
    },

    // 비율 입력 핸들러 - 연관 단가를 자동 계산한다
    onRateInput(key, e) {
      const pctVal = Number(e?.target?.value) || 0;
      const decimal = this.roundRate(pctVal / 100);
      (this.form as any)[key] = decimal;
      this.recalcFromRate(key);
    },

    // 단가 변경 시 관련 비율/종속 단가 재계산
    recalcFromPrice(key) {
      const f: any = this.form;
      const base = Number(f.outbound_price1) || 0;
      const cost = Number(f.inbound_price) || 0;

      if (key === "inbound_price") {
        // 원가 변경 → 원가 대비 비율만 재계산 (base 유지)
        f.outbound_rate1 = cost > 0 ? this.roundRate(base / cost) : 0;
      } else if (key === "outbound_price1") {
        // BASE 변경 → 원가 대비 비율 재계산 + 종속 단가 4종 재계산
        f.outbound_rate1 = cost > 0 ? this.roundRate(base / cost) : 0;
        this.dependentPriceRows.forEach((row) => {
          const r = Number(f[row.rate]) || 0;
          f[row.price] = this.roundPrice(base * r);
        });
      } else {
        // 종속 단가 변경 → 해당 비율만 재계산 (base 유지)
        const row = this.dependentPriceRows.find((r) => r.price === key);
        if (row) {
          const price = Number(f[row.price]) || 0;
          f[row.rate] = base > 0 ? this.roundRate(price / base) : 0;
        }
      }
    },

    // 비율 변경 시 관련 단가 재계산
    recalcFromRate(key) {
      const f: any = this.form;
      const cost = Number(f.inbound_price) || 0;

      if (key === "outbound_rate1") {
        // 원가 대비 비율 변경 → BASE 재계산 + 종속 단가 재계산
        const rate = Number(f.outbound_rate1) || 0;
        const newBase = this.roundPrice(cost * rate);
        f.outbound_price1 = newBase;
        this.dependentPriceRows.forEach((row) => {
          const r = Number(f[row.rate]) || 0;
          f[row.price] = this.roundPrice(newBase * r);
        });
      } else {
        // 종속 비율 변경 → 해당 단가만 재계산
        const base = Number(f.outbound_price1) || 0;
        const row = this.dependentPriceRows.find((r) => r.rate === key);
        if (row) {
          const r = Number(f[row.rate]) || 0;
          f[row.price] = this.roundPrice(base * r);
        }
      }
    },

    // 서버 데이터(이미지/태그 포함)를 폼 필드에 매핑한다
    mappingData(data) {
      for (const key in this.form) {
        if (key === "images" || key === "tags") continue; // 별도 처리
        this.form[key] = data[key];
      }

      // 🔥 기존 서버 이미지 매핑
      this.form.images = (data.images || []).map((img) => ({
        id: img.id,
        file_url: img.file_url,
        isNew: false, // 서버에서 가져온 데이터임을 명시
      }));

      // 태그 매핑 (배열 또는 객체배열 모두 허용)
      const rawTags = data.tags || data.tag_ids || [];
      this.form.tags = rawTags.map((t: any) =>
        typeof t === "object" ? (t.id ?? t.tag_id) : t,
      );
    },

    // 수정 대상 자재 상세 데이터를 로드한다
    async loadData() {
      const res = await api.post(`/api/material/${this.id}`, { id: this.id });
      this.mappingData(res.data);
    },

    // 카테고리 옵션을 로드한다
    async loadCategory() {
      const res = await api.post("/api/category/list");
      this.categorys = res.data;
    },

    // 신규 태그를 서버에 생성하고 선택 상태로 반영한다
    async createTag({
      name,
      select,
    }: {
      name: string;
      select: (id: any) => void;
    }) {
      try {
        const payload = {
          id: -1,
          name,
          code: "",
          memo: "",
          sort: (this.tagItems[this.tagItems.length - 1]?.sort || 0) + 1,
        };
        const res = await api.post("/api/tag/save", payload);
        const created = Array.isArray(res.data) ? res.data[0] : res.data;
        const item = created?.id ? created : { ...payload, id: Date.now() };
        this.tagItems = [...this.tagItems, item];
        select(item.id);
        this.$toast.success(`태그 "${name}" 등록되었습니다`);
      } catch (e) {
        this.$toast.error(e.response?.data?.message || e.message);
      }
    },

    // 태그 옵션 목록을 로드한다
    async loadTags() {
      try {
        const res = await api.post("/api/tag/list");
        this.tagItems = res.data || [];
      } catch (e) {
        this.tagItems = [];
      }
    },

    /* =========================
     이미지 선택 (핵심 수정)
    ========================== */
    // 파일 선택 시 프리뷰 URL을 생성하고 한 장만 유지한다
    handleFiles(e) {
      if (!e?.target?.files || e.target.files.length === 0) return;

      const file = e.target.files[0];

      // 1장 정책: 기존에 새로 추가하려던 파일이 있었다면 메모리 해제
      this.form.images.forEach((img) => {
        if (img.isNew) URL.revokeObjectURL(img.preview);
      });

      // 프리뷰 리스트 초기화 (1장만 허용할 경우)
      // 만약 기존 서버 이미지는 유지하고 새로 선택한 것만 교체하고 싶다면 필터링 로직 조정 필요
      this.form.images = this.form.images.filter((img) => !img.isNew);

      const previewUrl = URL.createObjectURL(file);

      this.form.images.push({
        id: Date.now(),
        preview: previewUrl,
        isNew: true, // 신규 파일임을 명시
      });

      this.newFiles = [file];
      e.target.value = ""; // 동일 파일 재선택 가능하도록 초기화
    },

    // 이미지를 제거한다 (기존 이미지는 삭제 ID 리스트에 저장)
    removeImage(img) {
      if (!img.isNew) {
        this.deleteImageIds.push(img.id);
      } else {
        // 메모리 해제
        URL.revokeObjectURL(img.preview);
        this.newFiles = [];
      }
      this.form.images = this.form.images.filter((item) => item.id !== img.id);
    },

    // 자재를 FormData로 저장한다 (이미지/태그 포함, 신규/수정 분기)
    async save() {
      try {
        const formData = new FormData();
        // 기본 필드 추가
        const fields = [
          "name",
          "code",
          "spec",
          "unit",
          "memo",
          "category_id",
          "is_active",
          "safety_stock",
          "inbound_price",
          "outbound_price1",
          "outbound_price2",
          "wholesale_price1",
          "wholesale_price2",
          "online_price",
          "outbound_rate1",
          "outbound_rate2",
          "wholesale_rate1",
          "wholesale_rate2",
          "online_rate",
        ];
        fields.forEach((field) => {
          formData.append(field, String(this.form[field]));
        });

        const tagIds = (this.form.tags || []).map((t: any) =>
          typeof t === "object" ? (t.id ?? t.tag_id) : t,
        );
        formData.append("tag_ids", JSON.stringify(tagIds));

        if (this.isEdit) {
          formData.append("id", String(this.editId));
          formData.append(
            "deleteImageIds",
            JSON.stringify(this.deleteImageIds),
          );
        }

        // 신규 파일 추가
        this.newFiles.forEach((file) => {
          formData.append("images", file);
        });

        const endpoint = this.isEdit
          ? "/api/material/update"
          : "/api/material/save";
        await api.post(endpoint, formData);

        this.$toast.success(this.isEdit ? "수정 완료" : "등록 완료");
        this.modal.closeModal();
        if (this.onSaved) this.onSaved();
      } catch (e) {
        this.$toast.error(e.response?.data?.message || e.message);
      }
    },
  },

  // 마운트 시 카테고리/태그 로드 및 수정 대상 자재 로드
  mounted() {
    this.loadCategory();
    this.loadTags();
    if (this.id) {
      this.isEdit = true;
      this.editId = this.id;
      this.loadData();
    } else if (this.category_id) {
      this.form.category_id = this.category_id;
    }
  },

  // 컴포넌트 파괴 시 메모리 누수 방지
  // 언마운트 직전 프리뷰 objectURL을 해제한다
  beforeUnmount() {
    this.form.images.forEach((img) => {
      if (img.isNew && img.preview) URL.revokeObjectURL(img.preview);
    });
  },
};
</script>
