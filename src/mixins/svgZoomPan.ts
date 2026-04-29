// @ts-nocheck
/**
 * SVG viewBox 기반 줌/팬 mixin 팩토리.
 *
 * 컴포넌트에서 사용:
 *   <svg ref="svg"
 *        :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
 *        @wheel.prevent="handleWheel"
 *        @mousedown="handlePanStart"
 *        @mousemove="handlePanMove"
 *        @mouseup="handlePanEnd"
 *        @mouseleave="handlePanEnd">
 */
export interface SvgZoomPanOptions {
  /** 초기 viewBox 크기 (정사각) */
  size?: number;
  /** 최소 viewBox 폭 (확대 한계) */
  minZoom?: number;
  /** 최대 viewBox 폭 (축소 한계) */
  maxZoom?: number;
  /** SVG element ref 키 */
  svgRef?: string;
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PanStart {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function createSvgZoomPanMixin(options: SvgZoomPanOptions = {}) {
  const {
    size = 1000,
    minZoom = 200,
    maxZoom = 3000,
    svgRef = "svg",
  } = options;

  const initialViewBox = (): ViewBox => ({ x: 0, y: 0, w: size, h: size });

  return {
    data() {
      return {
        viewBox: initialViewBox(),
        minZoom,
        maxZoom,
        isPanning: false,
        panStart: { x: 0, y: 0, vx: 0, vy: 0 } as PanStart,
      };
    },

    methods: {
      // 화면 좌표를 SVG viewBox 좌표로 변환
      svgPoint(this: any, e: MouseEvent) {
        const svg = this.$refs[svgRef] as SVGSVGElement;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const p = pt.matrixTransform(ctm.inverse());
        return { x: p.x, y: p.y };
      },

      // 휠로 마우스 포인터 기준 확대/축소
      handleWheel(this: any, e: WheelEvent) {
        const scale = e.deltaY > 0 ? 1.15 : 1 / 1.15;
        const newW = Math.min(
          Math.max(this.viewBox.w * scale, this.minZoom),
          this.maxZoom,
        );
        const p = this.svgPoint(e);
        const ratio = newW / this.viewBox.w;
        this.viewBox = {
          x: p.x - (p.x - this.viewBox.x) * ratio,
          y: p.y - (p.y - this.viewBox.y) * ratio,
          w: newW,
          h: newW,
        };
      },

      // 버튼 확대 (현재 중심 기준)
      zoomIn(this: any) {
        this.zoomBy(1 / 1.25);
      },

      // 버튼 축소 (현재 중심 기준)
      zoomOut(this: any) {
        this.zoomBy(1.25);
      },

      // 현재 중심을 기준으로 배율만큼 확대/축소
      zoomBy(this: any, scale: number) {
        const newW = Math.min(
          Math.max(this.viewBox.w * scale, this.minZoom),
          this.maxZoom,
        );
        const cx = this.viewBox.x + this.viewBox.w / 2;
        const cy = this.viewBox.y + this.viewBox.h / 2;
        this.viewBox = {
          x: cx - newW / 2,
          y: cy - newW / 2,
          w: newW,
          h: newW,
        };
      },

      // viewBox 초기 상태로 리셋
      resetZoom(this: any) {
        this.viewBox = initialViewBox();
      },

      // 배경 드래그 시작 (g 요소 클릭은 무시)
      handlePanStart(this: any, e: MouseEvent) {
        const target = e.target as Element | null;
        if (target?.closest("g")) return;
        this.isPanning = true;
        this.panStart = {
          x: e.clientX,
          y: e.clientY,
          vx: this.viewBox.x,
          vy: this.viewBox.y,
        };
      },

      // 팬 이동
      handlePanMove(this: any, e: MouseEvent) {
        if (!this.isPanning) return;
        const svg = this.$refs[svgRef] as SVGSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const scale = this.viewBox.w / rect.width;
        this.viewBox = {
          ...this.viewBox,
          x: this.panStart.vx - (e.clientX - this.panStart.x) * scale,
          y: this.panStart.vy - (e.clientY - this.panStart.y) * scale,
        };
      },

      // 팬 종료
      handlePanEnd(this: any) {
        this.isPanning = false;
      },
    },
  };
}