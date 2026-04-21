<template>
  <span>{{ formatted }}</span>
</template>

<script lang="ts">
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

      const d = new Date(this.value);
      if (isNaN(d.getTime())) return this.empty;

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      if (!this.showTime) {
        return `${yyyy}-${mm}-${dd}`;
      }

      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    },
  },
};
</script>
