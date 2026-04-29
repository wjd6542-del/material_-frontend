// @ts-nocheck
/**
 * Stock 도면 페이지에서 rack(창고/위치 셀) 시각화에 쓰이는
 * 상태별 색상/투명도/라벨 색상 헬퍼를 통합한 mixin.
 *
 * 전제: 컴포넌트가 다음 메서드를 가짐
 *  - rackState(rack): "selected" | "matched" | "dimmed" | "hasStock" | "empty"
 *
 * 페이지에서 rackState 를 정의하면 그 결과에 따라 다른 헬퍼들이 동작.
 */
interface Point {
  x: number;
  y: number;
}

interface Rack {
  id?: number | string;
  color?: string;
  stocks?: { qty?: number }[];
  [key: string]: any;
}

export const rackVisualsMixin = {
  methods: {
    // 다각형 포인트 배열 → SVG points 문자열
    pointsToString(p: Point[] | undefined | null): string {
      if (!p || !p.length) return "";
      return p.map((v) => `${v.x},${v.y}`).join(" ");
    },

    // 다각형 중심 좌표
    getCenter(p: Point[] | undefined | null): Point {
      if (!p || !p.length) return { x: 0, y: 0 };
      return {
        x: p.reduce((a, b) => a + b.x, 0) / p.length,
        y: p.reduce((a, b) => a + b.y, 0) / p.length,
      };
    },

    // 특정 rack 의 총 재고 수량
    totalQty(rack: Rack): number {
      return (rack.stocks || []).reduce(
        (sum: number, v) => sum + (v.qty || 0),
        0,
      );
    },

    // 상태별 채움 색상
    rackFill(this: any, rack: Rack): string {
      const state = this.rackState(rack);
      if (state === "selected") return "#2563eb";
      if (state === "matched") return "#10b981";
      if (state === "dimmed") return "#f8fafc";
      if (state === "hasStock") return rack.color || "#1e293b";
      return "#f1f5f9";
    },

    // 상태별 테두리 색상
    rackStroke(this: any, rack: Rack): string {
      const state = this.rackState(rack);
      if (state === "selected") return "#ffffff";
      if (state === "matched") return "#a7f3d0";
      if (state === "dimmed") return "#e2e8f0";
      if (state === "hasStock") return "#0f172a";
      return "#e2e8f0";
    },

    // dimmed 일 때 투명도 감소
    rackOpacity(this: any, rack: Rack): number {
      return this.rackState(rack) === "dimmed" ? 0.25 : 1;
    },

    // 상태별 라벨 색상
    rackTextColor(this: any, rack: Rack): string {
      const state = this.rackState(rack);
      if (state === "empty" || state === "dimmed") return "#94a3b8";
      return "#ffffff";
    },
  },
};