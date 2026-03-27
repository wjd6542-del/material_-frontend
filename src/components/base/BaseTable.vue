<template>
  <div class="bg-white border border-gray-200 rounded-lg">
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <!-- HEADER -->

        <thead class="bg-gray-100">
          <tr>
            <th
              v-if="selectable"
              class="border border-gray-300 w-10 text-center"
            >
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleAll"
              />
            </th>

            <th
              v-for="col in columns"
              :key="col.key"
              class="border text-center border-gray-300 px-3 py-2 font-medium select-none"
              :class="[
                col.thClass,
                {
                  'cursor-pointer': sortable && col.sortable,
                  'text-right': col.align === 'right',
                  'text-center': col.align === 'center',
                },
              ]"
              :style="{
                width: col.width,
                minWidth: col.minWidth,
              }"
              @click="changeSort(col)"
            >
              <div class="flex justify-center items-center gap-1">
                {{ col.label }}

                <span v-if="sortable && col.sortable">
                  <span v-if="sortKey === col.key">
                    {{ sortOrder === "asc" ? "▲" : "▼" }}
                  </span>

                  <span v-else class="text-gray-300"> ⇅ </span>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- BODY -->

        <tbody>
          <tr v-if="loading">
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="text-center py-8"
            >
              Loading...
            </td>
          </tr>

          <tr v-else-if="!displayRows.length">
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="text-center py-8 text-gray-400"
            >
              데이터가 없습니다
            </td>
          </tr>

          <tr
            v-for="row in displayRows"
            :key="row[rowKey]"
            class="hover:bg-gray-50"
            @click="rowClick(row)"
          >
            <td
              v-if="selectable"
              class="border border-gray-200 text-center"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="selectedRows.includes(row[rowKey])"
                @change="toggleRow(row[rowKey])"
              />
            </td>

            <td
              v-for="col in columns"
              :key="col.key"
              class="border border-gray-200 px-3 py-2"
              :class="[
                col.tdClass,
                {
                  'text-right': col.align === 'right',
                  'text-center': col.align === 'center',
                },
              ]"
              :style="{
                width: col.width,
                minWidth: col.minWidth,
              }"
              @click.stop="cellClick(row, col)"
            >
              <!-- 이미지 타입 -->
              <template v-if="col.type === 'img'">
                <img
                  v-if="row[col.key]"
                  :src="row[col.key]"
                  class="h-10 mx-auto object-contain"
                />
                <span v-else>-</span>
              </template>

              <template v-else-if="col.type === 'button'">
                <button
                  class="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                >
                  {{ col.label }}
                </button>
              </template>
              <!-- 기본 slot -->
              <template v-else>
                <slot :name="col.key" :row="row" :value="row[col.key]">
                  {{ formatValue(row[col.key], col) }}
                </slot>
              </template>
            </td>
          </tr>
        </tbody>

        <!-- PAGINATION -->

        <tfoot v-if="pagination">
          <tr>
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="border-t px-4 py-3 bg-gray-50"
            >
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <!-- page size -->
                <div class="flex items-center gap-2 text-sm">
                  <span class="whitespace-nowrap">페이지당</span>
                  <select
                    v-model.number="localPageSize"
                    @change="changePageSize"
                    class="border rounded px-2 py-1"
                  >
                    <option
                      v-for="size in pageSizeOptions"
                      :key="size"
                      :value="size"
                    >
                      {{ size }}
                    </option>
                  </select>
                </div>

                <!-- pagination -->
                <div class="flex items-center gap-2 flex-wrap">
                  <div class="flex border rounded overflow-hidden text-sm">
                    <button
                      class="px-2 py-1 border-r bg-white hover:bg-gray-100 disabled:opacity-40"
                      :disabled="page === 1"
                      @click="changePage(1)"
                    >
                      처음
                    </button>
                    <button
                      class="px-2 py-1 border-r bg-white hover:bg-gray-100 disabled:opacity-40"
                      :disabled="page === 1"
                      @click="changePage(page - 1)"
                    >
                      이전
                    </button>
                    <button
                      class="px-2 py-1 border-r bg-white hover:bg-gray-100 disabled:opacity-40"
                      :disabled="page >= totalPages"
                      @click="changePage(page + 1)"
                    >
                      다음
                    </button>
                    <button
                      class="px-2 py-1 bg-white hover:bg-gray-100 disabled:opacity-40"
                      :disabled="page >= totalPages"
                      @click="changePage(totalPages)"
                    >
                      마지막
                    </button>
                  </div>

                  <div class="flex items-center gap-1 text-sm">
                    <input
                      type="number"
                      v-model.number="inputPage"
                      class="w-14 text-center border rounded px-2 py-1"
                      :min="1"
                      :max="totalPages"
                      @keyup.enter="applyPage"
                      @blur="applyPage"
                    />
                    <span class="text-gray-500 whitespace-nowrap">
                      / {{ totalPages }}
                    </span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseTable",

  props: {
    columns: { type: Array, default: () => [] },

    rows: { type: Array, default: () => [] },

    sortable: { type: Boolean, default: true },

    selectable: { type: Boolean, default: false },

    pagination: { type: Boolean, default: false },

    pageSize: { type: Number, default: 10 },

    pageSizeOptions: {
      type: Array,
      default: () => [10, 20, 50, 100],
    },

    loading: { type: Boolean, default: false },

    rowKey: { type: String, default: "id" },
  },

  data() {
    return {
      selectedRows: [],

      sortKey: null,
      sortOrder: "asc",

      page: 1,
      inputPage: 1,

      localPageSize: this.pageSize,
    };
  },

  computed: {
    isAllSelected() {
      return this.rows.length && this.selectedRows.length === this.rows.length;
    },

    isIndeterminate() {
      return (
        this.selectedRows.length &&
        this.selectedRows.length !== this.rows.length
      );
    },

    sortedRows() {
      if (!this.sortKey) return this.rows;

      const sorted = [...this.rows].sort((a, b) => {
        let v1 = a[this.sortKey];
        let v2 = b[this.sortKey];

        if (typeof v1 === "number") {
          return this.sortOrder === "asc" ? v1 - v2 : v2 - v1;
        }

        return this.sortOrder === "asc"
          ? String(v1).localeCompare(String(v2))
          : String(v2).localeCompare(String(v1));
      });

      return sorted;
    },

    totalPages() {
      return Math.ceil(this.sortedRows.length / this.localPageSize);
    },

    displayRows() {
      if (!this.pagination) return this.sortedRows;

      const start = (this.page - 1) * this.localPageSize;
      const end = start + this.localPageSize;

      return this.sortedRows.slice(start, end);
    },
  },

  watch: {
    page(v) {
      this.inputPage = v;
    },
  },

  methods: {
    // 선택한 로우 아이디 정보
    getSelectedIds() {
      return this.selectedRows;
    },
    // 선택된 데이터 정보
    getSelectedRows() {
      return this.rows.filter((row) =>
        this.selectedRows.includes(row[this.rowKey]),
      );
    },

    formatDate(value) {
      const d = new Date(value);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    },

    formatValue(value, column) {
      if (value === null || value === undefined) return "-";

      if (column.formatter) return column.formatter(value);

      switch (column.type) {
        case "number":
          return Number(value || 0).toLocaleString();

        case "currency":
          return Number(value).toLocaleString() + "원";

        case "date":
          return this.formatDate(value);

        case "datetime":
          return this.formatDate(value);

        case "img":
          return `<img src="${value}">`;
        default:
          return value;
      }
    },

    toggleAll(e) {
      if (e.target.checked) {
        this.selectedRows = this.rows.map((r) => r[this.rowKey]);
      } else {
        this.selectedRows = [];
      }

      this.$emit("update:selected", this.selectedRows);
    },

    toggleRow(id) {
      if (this.selectedRows.includes(id)) {
        this.selectedRows = this.selectedRows.filter((i) => i !== id);
      } else {
        this.selectedRows.push(id);
      }

      this.$emit("update:selected", this.selectedRows);
    },

    changeSort(col) {
      if (!this.sortable) return;
      if (!col.sortable) return;

      if (this.sortKey === col.key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = col.key;
        this.sortOrder = "asc";
      }

      this.$emit("sort", {
        key: this.sortKey,
        order: this.sortOrder,
      });
    },

    changePage(p) {
      this.page = p;
      this.$emit("update:page", p);
    },

    applyPage() {
      if (this.inputPage < 1) this.inputPage = 1;

      if (this.inputPage > this.totalPages) this.inputPage = this.totalPages;

      this.changePage(this.inputPage);
    },

    changePageSize() {
      this.page = 1;
      this.inputPage = 1;

      this.$emit("update:pageSize", this.localPageSize);
    },

    rowClick(row) {
      this.$emit("row-click", row);
    },

    cellClick(row, col) {
      this.$emit("cell-click", {
        row,
        column: col,
        key: col.key,
        value: row[col.key],
      });
    },
  },
};
</script>
