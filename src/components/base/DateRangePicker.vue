<template>
  <div class="relative w-full flex items-start gap-1">
    <!-- 빠른 버튼 -->
    <div v-if="showQuickButtons" class="relative">
      <button
        @click.stop="toggleQuick"
        class="h-[40px] w-[40px] flex items-center justify-center border rounded hover:bg-gray-100 text-gray-600"
      >
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>

      <div
        v-show="openQuick"
        class="absolute left-0 mt-2 w-36 bg-white border rounded shadow-md z-50"
      >
        <button
          class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('yesterday')"
        >
          <i class="fa-regular fa-clock text-gray-400"></i>
          어제
        </button>

        <button
          class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('today')"
        >
          <i class="fa-regular fa-calendar-check text-blue-500"></i>
          오늘
        </button>

        <button
          class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('week')"
        >
          <i class="fa-solid fa-calendar-week text-green-500"></i>
          일주일
        </button>

        <!-- ✅ 이번달 추가 -->
        <button
          class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('month')"
        >
          <i class="fa-solid fa-calendar-days text-purple-500"></i>
          이번달
        </button>
      </div>
    </div>

    <!-- 날짜 입력 -->
    <div class="relative flex-1">
      <div class="flex h-[40px] border rounded-lg overflow-hidden bg-white">
        <input
          :value="formattedRange"
          @click="toggleCalendar"
          readonly
          :placeholder="placeholder"
          class="flex-1 px-3 py-2 text-sm outline-none cursor-pointer"
        />

        <button
          v-if="innerValue.start || innerValue.end"
          @click.stop="clearRange"
          class="px-3 h-[40px] border-l hover:bg-gray-100 text-red-500"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <button
          @click.stop="toggleCalendar"
          class="px-3 h-[40px] border-l hover:bg-gray-100 text-gray-600"
        >
          <i class="fa-regular fa-calendar"></i>
        </button>
      </div>

      <!-- 달력 -->
      <div
        v-show="openCalendar"
        class="absolute left-0 mt-2 z-50 bg-white border rounded-lg shadow-lg"
      >
        <DatePicker
          v-model.range="innerValue"
          :mode="mode"
          :is24hr="true"
          :time-picker="{ minutesIncrement: minuteStep }"
          @update:modelValue="handleSelect"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DatePicker } from "v-calendar";

export default {
  name: "DateRangePicker",
  components: { DatePicker },

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        start: null,
        end: null,
      }),
    },

    placeholder: {
      type: String,
      default: "기간 선택",
    },

    minuteStep: {
      type: Number,
      default: 10,
    },

    showQuickButtons: {
      type: Boolean,
      default: false,
    },

    showTime: {
      type: Boolean,
      default: true,
    },

    mode: {
      type: String,
      default: "dateTime",
    },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      openCalendar: false,
      openQuick: false,
      innerValue: {
        start: undefined as Date | undefined,
        end: undefined as Date | undefined,
      },
    };
  },

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(val) {
        if (!val) {
          this.innerValue.start = undefined;
          this.innerValue.end = undefined;
          return;
        }

        this.innerValue.start = val.start || undefined;
        this.innerValue.end = val.end || undefined;
      },
    },
  },

  computed: {
    formattedRange(): string {
      if (!this.innerValue?.start || !this.innerValue?.end) return "";

      const formatDate = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");

        if (this.mode === "date") {
          return `${yyyy}-${mm}-${dd}`;
        }

        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      };

      return `${formatDate(this.innerValue.start)} ~ ${formatDate(
        this.innerValue.end,
      )}`;
    },
  },

  mounted() {
    document.addEventListener("click", this.handleOutside, true);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleOutside, true);
  },

  methods: {
    clearRange() {
      this.innerValue.start = undefined;
      this.innerValue.end = undefined;

      this.$emit("update:modelValue", {
        start: undefined,
        end: undefined,
      });

      this.$emit("change");
      this.openCalendar = false;
      this.openQuick = false;
    },

    toggleCalendar() {
      this.openCalendar = !this.openCalendar;
      this.openQuick = false;
    },

    toggleQuick() {
      this.openQuick = !this.openQuick;
      this.openCalendar = false;
    },

    handleSelect(val: any) {
      if (this.mode === "date") {
        if (val.start) val.start.setHours(0, 0, 0, 0);
        if (val.end) val.end.setHours(23, 59, 59, 999);
      }
      if (val.end) val.end.setHours(23, 59, 59, 999);
      this.innerValue = val;

      this.$emit("update:modelValue", val);
      this.$emit("change");
    },

    setQuick(type: string) {
      const now = new Date();
      let start = new Date(now);
      let end = new Date(now);

      if (type === "today") {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }

      if (type === "yesterday") {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
      }

      if (type === "week") {
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }

      // ✅ 이번달
      if (type === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);

        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      }

      if (this.mode === "date") {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
      }

      this.innerValue = { start, end };

      this.$emit("update:modelValue", this.innerValue);
      this.$emit("change");

      this.openQuick = false;
      this.openCalendar = false;
    },

    handleOutside(event: any) {
      if (!this.$el.contains(event.target)) {
        this.openCalendar = false;
        this.openQuick = false;
      }
    },
  },
};
</script>
