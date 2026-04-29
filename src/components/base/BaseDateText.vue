<template>
  <span>{{ formatted }}</span>
</template>

<script lang="ts">
// @ts-nocheck
import { formatDateOnly, formatDateTime } from "@/utils/date";

export default {
  name: "BaseDateText",

  props: {
    value: {
      type: [String, Number, Date],
      default: null,
    },
    showTime: {
      type: Boolean,
      default: false,
    },
    empty: {
      type: String,
      default: "-",
    },
  },

  computed: {
    formatted() {
      if (this.value === null || this.value === undefined || this.value === "") {
        return this.empty;
      }
      const fmt = this.showTime ? formatDateTime : formatDateOnly;
      const result = fmt(this.value);
      return result === "-" ? this.empty : result;
    },
  },
};
</script>
