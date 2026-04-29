// @ts-nocheck
/**
 * 양도(transfer) 리스트 mixin.
 *
 * 두 개의 리스트 (`assigned` / `unassigned`) 사이에서 항목을 이동하는
 * 공용 패턴을 제공. id 키 비교로 동일 항목을 식별.
 *
 * 컴포넌트 data 에 다음 state 가 있어야 함:
 *  - assigned: any[]
 *  - unassigned: any[]
 */
export interface TransferListOptions {
  /** 항목 식별 키 (기본 "id") */
  idKey?: string;
}

export function createTransferListMixin(options: TransferListOptions = {}) {
  const { idKey = "id" } = options;

  return {
    methods: {
      // 미할당 → 할당으로 단일 항목 이동
      addPermission(this: any, item: any) {
        this.assigned.push(item);
        this.unassigned = this.unassigned.filter(
          (p: any) => p[idKey] !== item[idKey],
        );
      },

      // 할당 → 미할당으로 단일 항목 이동
      removePermission(this: any, item: any) {
        this.unassigned.push(item);
        this.assigned = this.assigned.filter(
          (p: any) => p[idKey] !== item[idKey],
        );
      },

      // 미할당 전체를 할당으로 이동
      addAll(this: any) {
        this.assigned.push(...this.unassigned);
        this.unassigned = [];
      },

      // 할당 전체를 미할당으로 이동
      removeAll(this: any) {
        this.unassigned.push(...this.assigned);
        this.assigned = [];
      },
    },
  };
}