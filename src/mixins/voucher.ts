// @ts-nocheck
/**
 * 전표(발주/구매/판매/반품) 등록 페이지의 공용 로직.
 *
 * 전제: 컴포넌트 data 에 다음 형태의 form 객체가 있음
 *   form: {
 *     items: VoucherItem[],
 *     vat_applied: boolean,
 *   }
 */
export interface VoucherItem {
  id?: number;
  material_id?: number | null;
  material_code?: string;
  material_name?: string;
  spec?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  supply_amount?: number;
  vat?: number;
  [key: string]: any;
}

export const voucherMixin = {
  computed: {
    // 공급가액 합계
    totalSupply(this: any): number {
      return (this.form?.items || []).reduce(
        (sum: number, it: VoucherItem) => sum + (Number(it.supply_amount) || 0),
        0,
      );
    },
    // 부가세 합계
    totalVat(this: any): number {
      return (this.form?.items || []).reduce(
        (sum: number, it: VoucherItem) => sum + (Number(it.vat) || 0),
        0,
      );
    },
    // 총액 (공급가액 + 부가세)
    totalAmount(this: any): number {
      return this.totalSupply + this.totalVat;
    },
    // 수정 모드 여부 (쿼리에 id 존재)
    isEdit(this: any): boolean {
      return !!this.$route?.query?.id;
    },
  },

  methods: {
    // 수량/단가 변경 시 공급가액 = qty*price 로 재계산 + 부가세 동기화
    recalcItem(this: any, it: VoucherItem) {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      it.supply_amount = Math.round(qty * price);
      it.vat = this.form?.vat_applied ? Math.round(it.supply_amount * 0.1) : 0;
    },

    // 공급가액만 직접 수정된 경우 부가세만 재계산
    recalcVatOnly(this: any, it: VoucherItem) {
      const supply = Number(it.supply_amount) || 0;
      it.vat = this.form?.vat_applied ? Math.round(supply * 0.1) : 0;
    },

    // 부가세 적용 토글 시 전체 라인 부가세 재계산
    onVatAppliedChange(this: any) {
      (this.form?.items || []).forEach((it: VoucherItem) =>
        this.recalcVatOnly(it),
      );
    },

    // 행 금액 (qty*price)
    rowAmount(it: VoucherItem): number {
      return (Number(it.quantity) || 0) * (Number(it.price) || 0);
    },

    // 지정 인덱스 행 제거
    removeItem(this: any, i: number) {
      this.form.items.splice(i, 1);
    },

    // 전체 삭제 (사용자 confirm)
    async clearAllItems(this: any, message = "품목을 전체 삭제하시겠습니까?") {
      if (!this.form.items.length) return;
      const ok = await this.$confirm?.(message, "전체 삭제 확인", "danger");
      if (ok === false) return;
      this.form.items = [];
    },

    // 품목 데이터를 라인 아이템 형태로 변환 (페이지에서 추가 필드 머지 가능)
    buildItemFromMaterial(
      this: any,
      m: any,
      extraDefaults: Record<string, any> = {},
    ): VoucherItem {
      const qty = 1;
      const price = Number(m.price) || 0;
      const supply = Math.round(qty * price);
      return {
        id: 0,
        material_id: m.id,
        material_code: m.code || "",
        material_name: m.name || "",
        spec: m.spec || "",
        unit: m.unit || "",
        quantity: qty,
        price: price,
        supply_amount: supply,
        vat: this.form?.vat_applied ? Math.round(supply * 0.1) : 0,
        ...extraDefaults,
      };
    },
  },
};