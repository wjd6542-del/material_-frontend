<template>
  <div class="layout">
    <div class="control-panel no-print">
      <h2 class="panel-title">
        <i class="fa-solid fa-qrcode"></i>
        자재 라벨 설정
      </h2>

      <div class="control-grid">
        <div class="panel-card">
          <div class="label">제품검색</div>
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
        <i class="fa-solid fa-circle-info"></i> 모바일에서는 화면 크기에 맞춰
        미리보기가 축소됩니다.
      </div>

      <div class="print-area" ref="printArea">
        <div
          v-for="(page, pageIndex) in pages"
          :key="pageIndex"
          class="print-page"
        >
          <div class="page-header">
            <div class="title">자재 QR 라벨</div>
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
              :key="item ? item.id : 'empty-' + pageIndex + '-' + idx"
              class="label-item"
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
    pages() {
      const pageSize = this.format.cols * this.format.rows;
      const pages = [];
      for (let i = 0; i < this.materials.length; i += pageSize) {
        const slice = this.materials.slice(i, i + pageSize);
        while (slice.length < pageSize) {
          slice.push(null);
        }
        pages.push(slice);
      }
      return pages.length ? pages : [Array(pageSize).fill(null)];
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
        filename: "material_qr_labels.pdf",
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
/* 기본 레이아웃: 데스크톱 기준 */
.layout {
  display: flex;
  height: 100vh;
  background: #f3f4f6;
  overflow: hidden;
}

.control-panel {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 20;
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
  padding: 14px;
  margin-bottom: 16px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
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
  padding: 8px 16px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 20px;
  font-size: 13px;
}

.print-area {
  display: inline-block;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.print-page {
  width: 210mm;
  height: 297mm;
  background: white;
  padding: 10mm;
  margin-bottom: 30px;
  box-sizing: border-box;
  page-break-after: always;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 5mm;
  margin-bottom: 5mm;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.page-number {
  font-size: 14px;
  color: #999;
}

.grid {
  display: grid;
  height: calc(100% - 20mm);
}

.label-item {
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.qr {
  margin-bottom: 8px;
}
.name {
  font-weight: 700;
  margin-bottom: 2px;
}
.code {
  color: #666;
}

/* --- 모바일/태블릿 대응 --- */
@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }

  .control-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 16px;
  }

  .control-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .buttons {
    flex-direction: row;
    margin-top: 16px;
  }

  .preview-container {
    padding: 20px 10px;
  }

  /* 중요: 화면 너비에 맞게 A4 페이지 축소 */
  .print-area {
    transform: scale(0.4);
    transform-origin: top center;
    margin-bottom: -160mm; /* 축소된만큼 공간 회수 */
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

/* 프린트 최적화 */
@media print {
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
