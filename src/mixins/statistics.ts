// @ts-nocheck
import api from "@/api/api";
import { currentMonthRange } from "@/utils/date";

export interface StatisticsMixinConfig {
  /** 목록 조회 API */
  listEndpoint: string;
  /** 차트 조회 API */
  chartEndpoint: string;
  /** 일별 통계 갱신 API */
  setEndpoint?: string | null;
  /** 요약 합산 필드 (rows 의 키들) */
  summaryFields?: string[];
  /** where 초기값 */
  initialWhere?: Record<string, any>;
  /** mounted 시 품목 옵션 자동 로드 */
  loadMaterials?: boolean;
}

/**
 * 통계 페이지 공용 mixin 팩토리.
 *
 * 표준 통계 페이지 패턴:
 *  - rows / chartRows / summary / dateRange / where state
 *  - searchData(): list + chart 병렬 로드
 *  - loadList(): list endpoint 조회 + summary 계산
 *  - loadChartData(): chart endpoint 조회
 *  - setData(): 일별 통계 갱신 (set.date 사용)
 *  - mounted: 이번 달 dateRange 기본값 설정 후 searchData
 */
export function createStatisticsMixin(config: StatisticsMixinConfig) {
  const {
    listEndpoint,
    chartEndpoint,
    setEndpoint = null,
    summaryFields = ["total_qty", "total_cost"],
    initialWhere = { material_id: "" },
    loadMaterials = true,
  } = config;

  if (!listEndpoint || !chartEndpoint) {
    throw new Error(
      "[createStatisticsMixin] listEndpoint, chartEndpoint 가 필요합니다.",
    );
  }

  const buildInitialSummary = (): Record<string, number> => {
    const s: Record<string, number> = { count: 0 };
    summaryFields.forEach((f) => (s[f] = 0));
    return s;
  };

  return {
    data() {
      return {
        rows: [] as any[],
        chartRows: [] as any[],
        materials: [] as any[],
        summary: buildInitialSummary(),
        dateRange: { start: null as Date | null, end: null as Date | null },
        where: { ...initialWhere },
        set: { date: new Date().toISOString().substr(0, 10) },
      };
    },

    methods: {
      // 천단위 구분자 포맷
      formatNumber(v: number | string | null | undefined): string {
        return Number(v || 0).toLocaleString();
      },

      // 검색/기간을 결합해 API 파라미터를 생성
      buildParams(this: any): Record<string, any> {
        const where: Record<string, any> = { ...this.where };
        if (this.dateRange?.start) {
          where.startDate = this.dateRange.start.toISOString();
        }
        if (this.dateRange?.end) {
          where.endDate = this.dateRange.end.toISOString();
        }
        return where;
      },

      // 행 데이터로부터 summaryFields 합계와 count 를 계산
      setSummary(this: any, rows: any[] = []) {
        const acc: Record<string, number> = { count: rows.length };
        summaryFields.forEach((f) => (acc[f] = 0));
        rows.forEach((row) => {
          summaryFields.forEach((f) => {
            acc[f] += Number(row[f] || 0);
          });
        });
        this.summary = acc;
      },

      // 통계 목록 조회 + summary 갱신
      async loadList(this: any) {
        try {
          const res = await api.post(listEndpoint, this.buildParams());
          this.rows = Array.isArray(res.data) ? res.data : [];
          this.setSummary(this.rows);
        } catch (e) {
          this.rows = [];
          this.setSummary([]);
        }
      },

      // 차트 데이터 조회
      async loadChartData(this: any) {
        try {
          const res = await api.post(chartEndpoint, this.buildParams());
          this.chartRows = Array.isArray(res.data) ? res.data : [];
        } catch (e) {
          this.chartRows = [];
        }
      },

      // 목록 + 차트 병렬 조회
      async searchData(this: any) {
        await Promise.all([this.loadList(), this.loadChartData()]);
      },

      // 일별 통계 데이터 갱신
      async setData(this: any) {
        if (!setEndpoint) return;
        if (!this.set.date) {
          this.$toast?.error?.("통계 저장할 날짜를 입력하세요");
          return;
        }
        try {
          const res = await api.post(setEndpoint, { date: this.set.date });
          if (res.data?.count) {
            this.$toast?.success?.(
              `[${this.set.date}] 통계 데이터가 갱신되었습니다.`,
            );
            this.searchData();
          } else {
            this.$toast?.error?.(
              `[${this.set.date}] 동계 데이터가 존재하지 않습니다`,
            );
          }
        } catch (e: any) {
          this.$toast?.error?.(e.message);
        }
      },

      // 품목 옵션 로드
      async loadMaterial(this: any) {
        try {
          const res = await api.post("/api/material/list");
          this.materials = Array.isArray(res.data) ? res.data : [];
        } catch (e) {
          this.materials = [];
        }
      },
    },

    // 이번 달 첫날~마지막날을 기본 기간으로 세팅 후 조회
    mounted(this: any) {
      this.dateRange = currentMonthRange();
      if (loadMaterials) this.loadMaterial();
      this.searchData();
    },
  };
}