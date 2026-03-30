<template>
  <div class="layout">
    <div class="control-panel no-print">
      <h2 class="panel-title">
        <i class="fa-solid fa-qrcode"></i>
        자재 라벨 설정
      </h2>

      <div class="control-grid">
        <div class="panel-card">
          <div class="label">제품 검색</div>
          <MultiCheck
            v-model="search.material_ids"
            :items="searchArr"
            idKey="id"
            textKey="name"
            @change="loadData"
          />
        </div>

        <div class="panel-card">
          <div class="label">라벨 포맷</div>
          <select v-model="labelFormat" class="select">
            <option v-for="(row, key) in labelFormats" :key="key" :value="key">
              {{ row.name }}
            </option>
          </select>
        </div>

        <div class="panel-card">
          <div class="label">출력 옵션</div>
          <div class="option-item">
            <span>시작 위치 (1부터)</span>
            <input
              type="number"
              v-model.number="printOptions.startPos"
              min="1"
              :max="format.cols * format.rows"
              class="input-mini"
            />
          </div>
          <div class="option-item">
            <span>항목당 출력 개수</span>
            <input
              type="number"
              v-model.number="printOptions.copyCount"
              min="1"
              class="input-mini"
            />
          </div>
          <div class="option-tip">
            * 이미 사용한 라벨지의 경우 시작 위치를 조절하세요.
          </div>
        </div>
      </div>

      <div class="buttons">
        <button class="btn print" @click="printPage">
          <i class="fa-solid fa-print"></i>
          프린트
        </button>
        <button class="btn pdf" @click="downloadPDF">
          <i class="fa-solid fa-file-pdf"></i>
          PDF 저장
        </button>
      </div>
    </div>

    <div class="preview-container">
      <div class="preview-info no-print">
        <i class="fa-solid fa-circle-info"></i>
        총 {{ totalLabelsCount }}개의 라벨이 {{ pages.length }}페이지에
        출력됩니다.
      </div>

      <div class="print-area" ref="printArea">
        <div
          v-for="(page, pageIndex) in pages"
          :key="pageIndex"
          class="print-page"
        >
          <div class="page-header">
            <div class="title">자재 QR 라벨 ({{ format.name }})</div>
            <div class="page-number">
              Page {{ pageIndex + 1 }} / {{ pages.length }}
            </div>
          </div>

          <div
            class="grid"
            :style="{
              gridTemplateColumns: `repeat(${format.cols}, 1fr)`,
              gridTemplateRows: `repeat(${format.rows}, 1fr)`,
              gap: format.gap + 'mm',
            }"
          >
            <div
              v-for="(item, idx) in page"
              :key="
                item ? item.id + '-' + idx : 'empty-' + pageIndex + '-' + idx
              "
              class="label-item"
              :class="{ 'is-empty': !item }"
              :style="{ padding: format.padding + 'px' }"
            >
              <template v-if="item">
                <img
                  :src="item.qrcode"
                  class="qr"
                  :style="{
                    width: format.qr + 'px',
                    height: format.qr + 'px',
                  }"
                />
                <div class="name" :style="{ fontSize: format.fontName + 'px' }">
                  {{ item.name }}
                </div>
                <div class="code" :style="{ fontSize: format.fontCode + 'px' }">
                  {{ item.code }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import html2pdf from "html2pdf.js";
import MultiCheck from "@/components/base/MultiCheck.vue";

export default {
  name: "MaterialQrPrint",
  components: { MultiCheck },
  data() {
    return {
      materials: [],
      searchArr: [],
      search: { material_ids: [] },
      labelFormat: "A4_20",
      printOptions: {
        startPos: 1, // 시작 위치 (첫 번째 칸부터)
        copyCount: 1, // 각 항목당 출력 매수
      },
      labelFormats: {
        A4_9: {
          name: "A4 9칸 (3x3)",
          cols: 3,
          rows: 3,
          qr: 75,
          fontName: 12,
          fontCode: 11,
          gap: 6,
          padding: 6,
        },
        A4_12: {
          name: "A4 12칸 (4x3)",
          cols: 4,
          rows: 3,
          qr: 75,
          fontName: 12,
          fontCode: 11,
          gap: 6,
          padding: 6,
        },
        A4_20: {
          name: "A4 20칸 (4x5)",
          cols: 4,
          rows: 5,
          qr: 75,
          fontName: 12,
          fontCode: 11,
          gap: 6,
          padding: 6,
        },
        A4_24: {
          name: "A4 24칸 (4x6)",
          cols: 4,
          rows: 6,
          qr: 65,
          fontName: 11,
          fontCode: 10,
          gap: 5,
          padding: 5,
        },
        A4_40: {
          name: "A4 40칸 (5x8)",
          cols: 5,
          rows: 8,
          qr: 45,
          fontName: 10,
          fontCode: 9,
          gap: 4,
          padding: 3,
        },
      },
    };
  },
  computed: {
    format() {
      return this.labelFormats[this.labelFormat];
    },
    // 옵션에 따라 실제로 그려질 데이터 배열 생성
    displayItems() {
      if (this.materials.length === 0) return [];

      // 1. 반복 횟수 적용된 리스트 생성
      let repeated = [];
      this.materials.forEach((m) => {
        for (let i = 0; i < Math.max(1, this.printOptions.copyCount); i++) {
          repeated.push({ ...m });
        }
      });

      // 2. 시작 위치 이전을 null로 채움 (빈 칸 처리)
      const startOffset = Math.max(0, this.printOptions.startPos - 1);
      const blanks = Array(startOffset).fill(null);

      return [...blanks, ...repeated];
    },
    // 페이지 단위로 슬라이싱
    pages() {
      const pageSize = this.format.cols * this.format.rows;
      const pages = [];
      const allItems = this.displayItems;

      for (let i = 0; i < allItems.length; i += pageSize) {
        const slice = allItems.slice(i, i + pageSize);
        // 마지막 페이지 빈 칸 채우기 (그리드 형태 유지용)
        while (slice.length < pageSize) {
          slice.push(null);
        }
        pages.push(slice);
      }
      return pages.length ? pages : [Array(pageSize).fill(null)];
    },
    totalLabelsCount() {
      return this.materials.length * this.printOptions.copyCount;
    },
  },
  methods: {
    async loadData() {
      try {
        const res = await api.post("/api/material/list", this.search);
        this.materials = res.data;
      } catch (e) {
        console.error(e);
      }
    },
    async loadMaterial() {
      try {
        const res = await api.post("/api/material/list");
        this.searchArr = res.data;
      } catch (e) {
        console.error(e);
      }
    },
    printPage() {
      window.print();
    },
    downloadPDF() {
      const element = this.$refs.printArea;
      const opt = {
        margin: 0,
        filename: `material_labels_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      html2pdf().set(opt).from(element).save();
    },
  },
  created() {
    this.loadData();
    this.loadMaterial();
  },
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: #f3f4f6;
  overflow: hidden;
}

.control-panel {
  width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 20;
  overflow-y: auto;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.option-tip {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 5px;
}

.input-mini {
  width: 70px;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
}

.select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.buttons {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
}

.btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn:active {
  transform: scale(0.98);
}
.print {
  background: #2563eb;
  color: white;
}
.pdf {
  background: #dc2626;
  color: white;
}

/* 프리뷰 영역 */
.preview-container {
  flex: 1;
  overflow: auto;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-info {
  margin-bottom: 20px;
  padding: 8px 20px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #dbeafe;
}

.print-area {
  display: inline-block;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.print-page {
  width: 210mm;
  height: 297mm;
  background: white;
  padding: 10mm;
  margin-bottom: 40px;
  box-sizing: border-box;
  page-break-after: always;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 4mm;
  margin-bottom: 6mm;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #6b7280;
}
.page-number {
  font-size: 14px;
  color: #9ca3af;
}

.grid {
  display: grid;
  height: calc(100% - 25mm);
}

.label-item {
  border: 0.1mm solid #f3f4f6; /* 출력시 가이드 라인 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.label-item.is-empty {
  background-color: #fafafa;
}

.qr {
  margin-bottom: 8px;
}
.name {
  font-weight: 700;
  margin-bottom: 2px;
  line-height: 1.2;
}
.code {
  color: #6b7280;
}

/* 모바일 대응 스케일링 */
@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }
  .control-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  .control-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .preview-container {
    padding: 20px 0;
  }
  .print-area {
    transform: scale(0.4);
    transform-origin: top center;
    margin-bottom: -160mm;
  }
}

@media (max-width: 640px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
  .print-area {
    transform: scale(0.3);
    margin-bottom: -200mm;
  }
  .buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    margin: 0;
  }
  .no-print {
    display: none !important;
  }
  .layout {
    display: block;
    height: auto;
  }
  .preview-container {
    padding: 0;
    overflow: visible;
  }
  .print-area {
    transform: none !important;
    margin: 0 !important;
    box-shadow: none;
  }
  .print-page {
    margin: 0;
    border: none;
  }
}
</style>
