<template>
  <div class="layout">
    <div class="control-panel no-print">
      <h2 class="panel-title">
        <i class="fa-solid fa-qrcode"></i>
        라벨 출력 설정
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
          <div class="label">출력 레이아웃</div>
          <div class="layout-selector">
            <label class="layout-option">
              <input type="radio" v-model="labelLayout" value="v" />
              <div class="opt-box">
                <i class="fa-solid fa-grip-lines-vertical"></i>
                <span>세로형</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" v-model="labelLayout" value="h" />
              <div class="opt-box">
                <i class="fa-solid fa-grip-lines"></i>
                <span>가로형</span>
              </div>
            </label>
          </div>
        </div>

        <div class="panel-card">
          <div class="label">라벨지 규격</div>
          <select v-model="labelFormat" class="select">
            <option v-for="(row, key) in labelFormats" :key="key" :value="key">
              {{ row.name }}
            </option>
          </select>
        </div>

        <div class="panel-card">
          <div class="label">출력 세부 설정</div>
          <div class="option-item">
            <span>라벨별 수량</span>
            <input
              type="number"
              v-model.number="printOptions.copyCount"
              min="1"
              class="input-mini"
            />
          </div>
          <div class="option-tip">* 라벨별 출력갯수를 설정하세요</div>
        </div>
      </div>

      <div class="buttons">
        <button class="btn print" @click="printPage">
          <i class="fa-solid fa-print"></i> 프린트 출력
        </button>
        <button class="btn pdf" @click="downloadPDF">
          <i class="fa-solid fa-file-pdf"></i> PDF로 저장
        </button>
      </div>
    </div>

    <div class="preview-container">
      <div class="preview-info no-print">
        <i class="fa-solid fa-circle-info"></i>
        총 <strong>{{ totalLabelsCount }}</strong
        >개의 라벨이 <strong>{{ pages.length }}</strong
        >페이지에 생성되었습니다.
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
              :class="[
                { 'is-empty': !item },
                labelLayout === 'h' ? 'layout-h' : 'layout-v',
              ]"
              :style="{ padding: format.padding + 'px' }"
            >
              <template v-if="item">
                <img
                  :src="item.qrcode"
                  class="qr-image"
                  :style="{ width: format.qr + 'px', height: format.qr + 'px' }"
                />
                <div class="info-group">
                  <div
                    class="item-name"
                    :style="{ fontSize: format.fontName + 'px' }"
                  >
                    {{ item.name }}
                  </div>
                  <div
                    class="item-code"
                    :style="{ fontSize: format.fontCode + 'px' }"
                  >
                    {{ item.code }}
                  </div>
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
      labelLayout: "v", // 'v': 세로형(Default), 'h': 가로형
      printOptions: {
        startPos: 1,
        copyCount: 1,
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
        A4_15: {
          name: "A4 9칸 (3x5)",
          cols: 3,
          rows: 5,
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
    displayItems() {
      if (this.materials.length === 0) return [];
      let repeated = [];
      this.materials.forEach((m) => {
        for (let i = 0; i < Math.max(1, this.printOptions.copyCount); i++) {
          repeated.push({ ...m });
        }
      });
      const startOffset = Math.max(0, this.printOptions.startPos - 1);
      const blanks = Array(startOffset).fill(null);
      return [...blanks, ...repeated];
    },
    pages() {
      const pageSize = this.format.cols * this.format.rows;
      const pages = [];
      const allItems = this.displayItems;
      for (let i = 0; i < allItems.length; i += pageSize) {
        const slice = allItems.slice(i, i + pageSize);
        while (slice.length < pageSize) slice.push(null);
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
/* 기본 레이아웃 */
.layout {
  display: flex;
  height: 100vh;
  background: #f3f4f6;
  overflow: hidden;
}

/* 컨트롤 패널 */
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

/* 레이아웃 선택기 스타일 */
.layout-selector {
  display: flex;
  gap: 8px;
}
.layout-option {
  flex: 1;
  cursor: pointer;
}
.layout-option input {
  display: none;
}
.opt-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 12px;
  transition: all 0.2s;
}
.layout-option input:checked + .opt-box {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
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
}

/* 라벨 디자인 */
.label-item {
  border: 0.1mm solid #eee;
  display: flex;
  box-sizing: border-box;
  background: white;
}

/* --- 가로형 레이아웃 (H) --- */
.label-item.layout-h {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
}
.label-item.layout-h .qr-image {
  margin-right: 12px;
}
.label-item.layout-h .info-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
}

/* --- 세로형 레이아웃 (V) --- */
.label-item.layout-v {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.label-item.layout-v .qr-image {
  margin-bottom: 8px;
}

.item-name {
  font-weight: 700;
  line-height: 1.2;
  word-break: break-all;
}
.item-code {
  color: #6b7280;
  word-break: break-all;
}

/* 버튼 및 공통 */
.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
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
}
.print {
  background: #2563eb;
  color: white;
}
.pdf {
  background: #dc2626;
  color: white;
}

/* 프리뷰 컨테이너 */
.preview-container {
  flex: 1;
  overflow: auto;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
}
.page-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 4mm;
  margin-bottom: 6mm;
}
.grid {
  display: grid;
  height: calc(100% - 25mm);
}

@media print {
  @page {
    size: A4;
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
  }
  .print-area {
    box-shadow: none;
  }
  .print-page {
    margin: 0;
    border: none;
  }
}
</style>
