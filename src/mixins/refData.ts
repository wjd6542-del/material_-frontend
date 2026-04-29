// @ts-nocheck
import api from "@/api/api";

interface RefSourceConfig {
  endpoint: string;
  state: string;
  transform?: (rows: any[]) => any[];
}

const REF_SOURCES: Record<string, RefSourceConfig> = {
  materials: { endpoint: "/api/material/list", state: "materials" },
  suppliers: { endpoint: "/api/supplier/list", state: "suppliers" },
  warehouses: { endpoint: "/api/warehouse/list", state: "warehouses" },
  // 위치는 라벨에 코드를 결합해 표시
  locations: {
    endpoint: "/api/location/list",
    state: "locations",
    transform: (rows: any[]) =>
      rows.map((row: any) => ({ ...row, name: `${row.code} - ${row.name}` })),
  },
  locationsRaw: {
    endpoint: "/api/location/list",
    state: "locations",
  },
  roles: { endpoint: "/api/role/list", state: "roles" },
  tags: { endpoint: "/api/tag/list", state: "tags" },
  categories: { endpoint: "/api/category/list", state: "categorys" },
};

export type RefDataSource = keyof typeof REF_SOURCES;

/**
 * 참조 옵션 데이터(품목/거래처/창고/위치/태그/...)를 병렬 로드해
 * 컴포넌트 data 의 정해진 키에 채우는 mixin.
 *
 * 사용:
 *   mixins: [createRefDataMixin(["materials", "warehouses", "locations"])]
 *
 *   data() {
 *     return { materials: [], warehouses: [], locations: [] };
 *   }
 *
 *   mounted() {
 *     this.loadRefData();
 *   }
 */
export function createRefDataMixin(sources: RefDataSource[] = []) {
  const configs = sources
    .map((key) => REF_SOURCES[key])
    .filter(Boolean) as RefSourceConfig[];

  return {
    methods: {
      // 지정된 참조 데이터들을 병렬 로드해 각 state 키에 반영
      async loadRefData(this: any) {
        const results = await Promise.allSettled(
          configs.map((c) => api.post(c.endpoint, {})),
        );
        results.forEach((res, idx) => {
          const cfg = configs[idx];
          if (res.status !== "fulfilled") return;
          const raw = Array.isArray(res.value.data) ? res.value.data : [];
          this[cfg.state] = cfg.transform ? cfg.transform(raw) : raw;
        });
      },
    },
  };
}