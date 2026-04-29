// @ts-nocheck
export interface NotiType {
  type: string;
  label: string;
  icon: string;
  bg: string;
  text: string;
  hoverBg: string;
  badge: string;
  rowBg: string;
}

// 알림 타입별 메타데이터 (라벨/아이콘/색상)
// AppHeader 의 타입별 아이콘 + Notification 패널의 행 색상에서 공통 사용
export const NOTI_TYPES: NotiType[] = [
  {
    type: "PURCHASEORDER",
    label: "발주",
    icon: "fa-clipboard-list",
    bg: "bg-teal-50",
    text: "text-teal-600",
    hoverBg: "group-hover:bg-teal-100",
    badge: "bg-teal-500",
    rowBg: "bg-teal-500 shadow-emerald-100",
  },
  {
    type: "MATERIAL",
    label: "품목",
    icon: "fa-box",
    bg: "bg-green-50",
    text: "text-green-600",
    hoverBg: "group-hover:bg-green-100",
    badge: "bg-green-500",
    rowBg: "bg-emerald-500 shadow-emerald-100",
  },
  {
    type: "INBOUND",
    label: "구매",
    icon: "fa-arrow-down",
    bg: "bg-blue-50",
    text: "text-blue-600",
    hoverBg: "group-hover:bg-blue-100",
    badge: "bg-blue-500",
    rowBg: "bg-blue-500 shadow-indigo-100",
  },
  {
    type: "OUTBOUND",
    label: "판매",
    icon: "fa-arrow-up",
    bg: "bg-red-50",
    text: "text-red-600",
    hoverBg: "group-hover:bg-red-100",
    badge: "bg-red-500",
    rowBg: "bg-rose-500 shadow-rose-100",
  },
  {
    type: "RETURNORDER",
    label: "반품",
    icon: "fa-rotate-left",
    bg: "bg-orange-50",
    text: "text-orange-600",
    hoverBg: "group-hover:bg-orange-100",
    badge: "bg-orange-500",
    rowBg: "bg-orange-500 shadow-emerald-100",
  },
  {
    type: "STOCK",
    label: "재고",
    icon: "fa-boxes-stacked",
    bg: "bg-purple-50",
    text: "text-purple-600",
    hoverBg: "group-hover:bg-purple-100",
    badge: "bg-purple-500",
    rowBg: "bg-purple-500 shadow-emerald-100",
  },
];

// type 코드 → 메타 객체 매핑
export const NOTI_TYPE_MAP: Record<string, NotiType> = Object.fromEntries(
  NOTI_TYPES.map((t) => [t.type, t]),
);

// type 코드 → 한글 라벨
export function notiTypeLabel(type: string): string {
  return NOTI_TYPE_MAP[type]?.label || type;
}