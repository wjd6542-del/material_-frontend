<template>
  <div class="layout">
    <!-- 좌측 컨트롤 -->
    <div class="control-panel no-print">
      <h2 class="panel-title">
        <i class="fa-solid fa-qrcode"></i>
        자재 라벨
      </h2>

      <!-- 제품 검색 -->
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

      <!-- 라벨 포맷 -->
      <div class="panel-card">
        <div class="label">라벨 포맷</div>

        <select v-model="labelFormat" class="select">
          <option v-for="(row, key) in labelFormats" :key="key" :value="key">
            {{ row.name }}
          </option>
        </select>
      </div>

      <!-- 버튼 -->
      <div class="buttons">
        <button class="btn print" @click="printPage">
          <i class="fa-solid fa-print"></i>
          프린트
        </button>

        <button class="btn pdf" @click="downloadPDF">
          <i class="fa-solid fa-file-pdf"></i>
          PDF 다운로드
        </button>
      </div>
    </div>

    <!-- 프리뷰 -->
    <div class="preview">
      <div class="print-area" ref="printArea">
        <div
          v-for="(page, pageIndex) in pages"
          :key="pageIndex"
          class="print-page"
        >
          <!-- 페이지 헤더 -->
          <div class="page-header">
            <div class="title">자재 QR 라벨</div>

            <div class="page-number">
              페이지 {{ pageIndex + 1 }} / {{ pages.length }}
            </div>
          </div>

          <!-- 라벨 GRID -->
          <div
            class="grid"
            :style="{
              gridTemplateColumns: `repeat(${format.cols},1fr)`,
              gridTemplateRows: `repeat(${format.rows},1fr)`,
              gap: format.gap + 'mm',
            }"
          >
            <div
              v-for="item in page"
              :key="item ? item.id : Math.random()"
              class="label"
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

  components: {
    MultiCheck,
  },

  data() {
    return {
      materials: [],
      searchArr: [],

      search: {
        material_ids: [],
      },

      labelFormat: "A4_20",

      labelFormats: {
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

      return pages;
    },
  },

  methods: {
    async loadData() {
      this.materials = [];

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

        image: {
          type: "jpeg",
          quality: 1,
        },

        html2canvas: {
          scale: 2,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
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
}

.control-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.panel-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.select {
  width: 100%;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.buttons {
  margin-top: 20px;
}

.btn {
  width: 100%;
  border: none;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
}

.print {
  background: #2563eb;
  color: white;
}

.pdf {
  background: #dc2626;
  color: white;
}

.preview {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.print-page {
  width: 210mm;
  height: 297mm;
  background: white;
  padding: 10mm;
  margin: auto;
  margin-bottom: 20px;
  page-break-after: always;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10mm;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.page-number {
  font-size: 13px;
  color: #6b7280;
}

.grid {
  display: grid;
  height: calc(100% - 20mm);
}

.label {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.qr {
  margin-bottom: 6px;
}

.name {
  font-weight: 600;
}

.code {
  color: #6b7280;
}

@page {
  size: A4;
  margin: 0;
}

@media print {
  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    position: absolute;
    left: 0;
    top: 0;
  }

  .no-print {
    display: none;
  }
}
</style>
