<template>
  <div class="w-full h-full min-h-[350px]">
    <!-- v-chart에 :option을 연결하고 autoresize로 반응형 대응 -->
    <v-chart class="w-full h-full" :option="chartOption" autoresize />
  </div>
</template>

<script>
import { computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
import VChart from "vue-echarts";

// ECharts 필수 구성 요소 등록 (에러 방지)
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
]);

export default {
  name: "StockChart",
  components: {
    "v-chart": VChart,
  },

  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "line", // 기본값을 line으로 변경
    },
    smooth: {
      type: Boolean,
      default: true, // 부드러운 곡선 여부
    },
    start: Date,
    end: Date,
    name: String,
    column: String,
  },

  setup(props) {
    // 날짜 포맷 함수 (YYYY-MM-DD)
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // 시작~종료 날짜 배열 생성
    const makeDateRange = (start, end) => {
      const result = [];
      const cur = new Date(start);
      while (cur <= end) {
        result.push(formatDate(cur));
        cur.setDate(cur.getDate() + 1);
      }
      return result;
    };

    const chartOption = computed(() => {
      if (!props.start || !props.end) return {};

      const dates = makeDateRange(props.start, props.end);
      const dataMap = {};

      // 전달받은 rows 데이터를 날짜별로 매핑
      props.rows.forEach((r) => {
        dataMap[r.date] = r[props.column];
      });

      // 날짜 배열에 맞춰 데이터 매칭 (데이터 없으면 0)
      const seriesData = dates.map((d) => dataMap[d] || 0);

      return {
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderWidth: 0,
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.1)",
          textStyle: { color: "#334155" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: dates,
          axisLine: { lineStyle: { color: "#e2e8f0" } },
          axisLabel: { color: "#94a3b8", fontSize: 11 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: { color: "#94a3b8" },
        },
        series: [
          {
            name: props.name,
            type: props.type, // ★ 핵심: this.type 대신 props.type 사용
            data: seriesData,
            smooth: props.smooth, // 부드러운 라인 설정
            showSymbol: false, // 호버 시에만 점 표시 (깔끔함)
            lineStyle: {
              width: 3,
              color: "#6366f1", // Indigo-500
            },
            // 라인 차트일 때 아래 영역 채우기 (그라데이션)
            areaStyle:
              props.type === "line"
                ? {
                    color: {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(99, 102, 241, 0.2)" },
                        { offset: 1, color: "rgba(99, 102, 241, 0)" },
                      ],
                    },
                  }
                : null,
            itemStyle: {
              color: "#6366f1",
            },
          },
        ],
      };
    });

    return { chartOption };
  },
};
</script>
