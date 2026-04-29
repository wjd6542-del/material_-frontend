// @ts-nocheck
interface NamedRef {
  name?: string;
}

interface LocationLabelSource {
  warehouse_name?: string;
  location_name?: string;
  shelf_name?: string;
  warehouse?: NamedRef;
  location?: NamedRef;
  shelf?: NamedRef;
}

// 창고 > 위치 > 선반 형태의 라벨 조립
// 평탄(`warehouse_name`) / 중첩 relation (`source.warehouse?.name`) 양쪽 모두 지원
// 빈 부분은 자동 제외하고 ' > ' 로 join 한다
export function buildLocationLabel(source: LocationLabelSource | null | undefined): string {
  if (!source) return "";
  const w = source.warehouse_name ?? source.warehouse?.name;
  const l = source.location_name ?? source.location?.name;
  const s = source.shelf_name ?? source.shelf?.name;
  const parts = [w, l, s].filter(Boolean) as string[];
  return parts.length ? parts.join(" > ") : "";
}