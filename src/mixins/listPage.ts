// @ts-nocheck
import api from "@/api/api";
import { todayRange, type DateRange } from "@/utils/date";

export interface ListMixinConfig<TWhere = Record<string, any>, TRow = any> {
  /** 목록 조회 API */
  endpoint: string;
  /** 일괄 삭제 API (사용 시 tableRef 도 필수) */
  deleteEndpoint?: string | null;
  /** where 초기값 */
  initialWhere?: TWhere;
  /** dateRange 초기값. null 반환 시 dateRange 비활성 */
  initialDateRange?: (() => DateRange | null) | null;
  /** 서버 전송 직전 where 가공. 두번째 인자로 컴포넌트 인스턴스 전달 */
  transformWhere?: (where: Record<string, any>, vm: any) => Record<string, any>;
  /** 응답 row 가공 */
  mapRow?: (row: TRow, vm: any) => TRow;
  /** $refs 키. batchDelete 사용 시 필수 */
  tableRef?: string | null;
  /** mounted 시 자동 로드 */
  autoLoad?: boolean;
  /** batchDelete 성공 후 후속 처리 */
  afterDelete?: ((vm: any) => void) | null;
}

/**
 * 리스트 페이지 공용 mixin 팩토리.
 *
 * 표준 리스트 페이지 패턴을 추출:
 *  - rows / where / dateRange / loading state
 *  - loadList(): where + dateRange 직렬화 후 endpoint POST, 응답 매핑
 *  - batchDelete(): 선택 행 confirm 후 일괄 삭제
 *  - mounted 자동 로드 (autoLoad)
 */
export function createListMixin<TWhere = Record<string, any>, TRow = any>(
  config: ListMixinConfig<TWhere, TRow>,
) {
  const {
    endpoint,
    deleteEndpoint = null,
    initialWhere = {} as TWhere,
    initialDateRange = todayRange,
    transformWhere = (w) => w,
    mapRow = (r) => r,
    tableRef = null,
    autoLoad = true,
    afterDelete = null,
  } = config;

  if (!endpoint) {
    throw new Error("[createListMixin] endpoint 가 필요합니다.");
  }

  return {
    data() {
      const dr = initialDateRange ? initialDateRange() : null;
      return {
        rows: [] as TRow[],
        where: { ...(initialWhere as Record<string, any>) },
        dateRange: dr,
        loading: false,
      };
    },

    methods: {
      // 검색 조건을 반영해 목록을 로드한다.
      async loadList(this: any) {
        this.loading = true;
        this.rows = [];
        try {
          let where: Record<string, any> = { ...this.where };
          if (this.dateRange?.start) {
            where.startDate = this.dateRange.start.toISOString();
          }
          if (this.dateRange?.end) {
            where.endDate = this.dateRange.end.toISOString();
          }
          where = transformWhere(where, this);
          const res = await api.post(endpoint, where);
          const list = Array.isArray(res.data) ? res.data : [];
          this.rows = list.map((r: TRow) => mapRow(r, this));
        } catch (e: any) {
          this.$toast?.error?.(
            e?.response?.data?.message || e?.message || "목록 로드 실패",
          );
        } finally {
          this.loading = false;
        }
      },

      // 선택된 행을 사용자 확인 후 일괄 삭제한다.
      async batchDelete(this: any) {
        if (!deleteEndpoint) {
          console.warn("[createListMixin] deleteEndpoint 가 설정되지 않았습니다.");
          return;
        }
        if (!tableRef) {
          console.warn("[createListMixin] tableRef 가 설정되지 않았습니다.");
          return;
        }
        const tbl = this.$refs[tableRef];
        const selected: any[] = tbl?.getSelectedRows?.() || [];
        if (!selected.length) {
          this.$toast?.error?.("테이블에서 데이터를 선택하세요");
          return;
        }
        const ok = await this.$confirm(
          "선택된 정보를 삭제하시겠습니까?",
          "삭제 확인",
          "danger",
        );
        if (!ok) return;
        try {
          await api.post(
            deleteEndpoint,
            selected.map((r) => ({ id: r.id })),
          );
          this.$toast?.success?.("선택 항목이 삭제되었습니다");
          this.loadList();
          if (typeof afterDelete === "function") afterDelete(this);
        } catch (e: any) {
          this.$toast?.error?.(
            e?.response?.data?.message || e?.message || "삭제 실패",
          );
        }
      },
    },

    mounted(this: any) {
      if (autoLoad) this.loadList();
    },
  };
}