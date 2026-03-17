<template>
  <div class="p-4 flex-1">
    <v-chart class="w-full h-[350px]" :option="option" autoresize />
  </div>
</template>

<script>
import { computed } from "vue";
import VueECharts from "vue-echarts";

export default {
  name: "InboundChart",
  components: {
    "v-chart": VueECharts,
  },

  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    start: Date,
    end: Date,
    name: String,
    column: String,
  },

  setup(props) {
    const formatDate = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const makeDateRange = (start, end) => {
      const result = [];
      const cur = new Date(start);

      while (cur <= end) {
        result.push(formatDate(cur));
        cur.setDate(cur.getDate() + 1);
      }

      return result;
    };

    const option = computed(() => {
      if (!props.start || !props.end) return {};

      const dates = makeDateRange(props.start, props.end);

      const map = {};

      props.rows.forEach((r) => {
        map[r.date] = r[props.column];
      });

      const data = dates.map((d) => map[d] || 0);

      return {
        tooltip: {
          trigger: "axis",
        },

        grid: {
          left: 40,
          right: 20,
          bottom: 30,
          top: 20,
        },

        xAxis: {
          type: "category",
          data: dates,
        },

        yAxis: {
          type: "value",
        },

        series: [
          {
            name: props.name,
            type: "bar",
            data,
            itemStyle: {
              color: "#3b82f6",
            },
          },
        ],
      };
    });

    return { option };
  },
};
</script>
