// @ts-nocheck
/**
 * 다각형 shape 편집기(창고/위치 도면) 공용 mixin 팩토리.
 *
 * 제공:
 *  - state: shapes / selected / dragState / selectionBox / isEditMode / isSaving / gridSize
 *  - computed: selectedShape (다중 선택 중 마지막)
 *  - 좌표 유틸: getSVGPoint, snap, pointsToString, getCenter, getMidPoints, getRotateHandle
 *  - 선택 검사: isSelected
 *  - 마우스 핸들러: handleCanvasMouseDown / handleShapeMouseDown / handleVertexMouseDown / handleRotateMouseDown / handleMouseMove / handleMouseUp
 *  - 정점 편집: insertPoint, removePoint
 *
 * 페이지에서 정의해야 할 것:
 *  - addShape (도형 타입별 초기 좌표/필드 차이)
 *  - loadData / saveAll / deleteShape (엔드포인트와 payload 차이)
 */
export interface ShapeEditorOptions {
  /** SVG element ref 키 */
  svgRef?: string;
  /** 스냅 그리드 단위 */
  gridSize?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Shape {
  points: Point[];
  shapeType?: string;
  [key: string]: any;
}

export function createShapeEditorMixin(options: ShapeEditorOptions = {}) {
  const { svgRef = "svgCanvas", gridSize = 20 } = options;

  return {
    data() {
      return {
        shapes: [] as Shape[],
        selected: [] as Shape[],
        isEditMode: false,
        isSaving: false,
        gridSize,
        dragState: {
          active: false,
          type: null as string | null,
          startX: 0,
          startY: 0,
          target: null as Shape | null,
          subIdx: null as number | null,
          originPoints: [] as Point[][],
        },
        selectionBox: null as
          | { x: number; y: number; w: number; h: number }
          | null,
        selectionStart: { x: 0, y: 0 } as Point,
      };
    },

    computed: {
      // 다중 선택 중 가장 최근에 선택된 shape
      selectedShape(this: any): Shape | null {
        return this.selected[this.selected.length - 1] || null;
      },
    },

    methods: {
      // 화면 픽셀 좌표 → SVG viewBox 좌표
      getSVGPoint(this: any, e: MouseEvent): Point {
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

      // 그리드 단위로 좌표 스냅
      snap(this: any, v: number): number {
        return Math.round(v / this.gridSize) * this.gridSize;
      },

      // 포인트 배열 → SVG points 문자열
      pointsToString(p: Point[] | undefined | null): string {
        return (p || []).map((v) => `${v.x},${v.y}`).join(" ");
      },

      // 다각형 중심 좌표
      getCenter(p: Point[] | undefined | null): Point {
        if (!p || !p.length) return { x: 0, y: 0 };
        return {
          x: p.reduce((a, b) => a + b.x, 0) / p.length,
          y: p.reduce((a, b) => a + b.y, 0) / p.length,
        };
      },

      // 각 변의 중점 좌표 (정점 추가용)
      getMidPoints(p: Point[] | undefined | null): Point[] {
        if (!p || !p.length) return [];
        return p.map((v, i) => {
          const next = p[(i + 1) % p.length];
          return { x: (v.x + next.x) / 2, y: (v.y + next.y) / 2 };
        });
      },

      // 회전 핸들 위치 (중심에서 오른쪽 80px)
      getRotateHandle(this: any, s: Shape): Point {
        const c = this.getCenter(s.points);
        return { x: c.x + 80, y: c.y };
      },

      // shape 가 현재 선택되어 있는지
      isSelected(this: any, s: Shape): boolean {
        return this.selected.includes(s);
      },

      // 빈 캔버스 클릭 → 선택 해제 + 드래그 선택 박스 시작
      handleCanvasMouseDown(this: any, e: MouseEvent) {
        if (e.target !== this.$refs[svgRef]) return;
        const pt = this.getSVGPoint(e);
        this.selected = [];
        this.dragState = { active: true, type: "select" };
        this.selectionStart = pt;
        this.selectionBox = { ...pt, w: 0, h: 0 };
      },

      // shape 클릭 → 선택/이동 드래그 시작 (Ctrl 다중 선택)
      handleShapeMouseDown(this: any, e: MouseEvent, shape: Shape) {
        const isCtrl = e.ctrlKey || e.metaKey;
        if (isCtrl) {
          if (this.isSelected(shape)) {
            this.selected = this.selected.filter((s: Shape) => s !== shape);
          } else {
            this.selected.push(shape);
          }
        } else if (!this.isSelected(shape)) {
          this.selected = [shape];
        }

        if (this.selected.length > 0) {
          const pt = this.getSVGPoint(e);
          this.dragState = {
            active: true,
            type: "move",
            startX: pt.x,
            startY: pt.y,
            originPoints: this.selected.map((s: Shape) =>
              s.points.map((p: Point) => ({ ...p })),
            ),
          };
        }
      },

      // 정점 클릭 → 정점 이동 드래그 시작
      handleVertexMouseDown(this: any, shape: Shape, idx: number) {
        this.dragState = {
          active: true,
          type: "vertex",
          target: shape,
          subIdx: idx,
        };
      },

      // 회전 핸들 클릭 → 회전 드래그 시작
      handleRotateMouseDown(this: any, shape: Shape, e: MouseEvent) {
        const pt = this.getSVGPoint(e);
        this.dragState = {
          active: true,
          type: "rotate",
          target: shape,
          startX: pt.x,
          startY: pt.y,
        };
      },

      // 드래그 중 마우스 이동 처리
      handleMouseMove(this: any, e: MouseEvent) {
        if (!this.dragState.active) return;
        const pt = this.getSVGPoint(e);

        if (this.dragState.type === "move") {
          const dx = this.snap(pt.x - this.dragState.startX);
          const dy = this.snap(pt.y - this.dragState.startY);
          this.selected.forEach((shape: Shape, i: number) => {
            shape.points = this.dragState.originPoints[i].map((p: Point) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
          });
        } else if (this.dragState.type === "vertex") {
          this.dragState.target.points[this.dragState.subIdx] = {
            x: this.snap(pt.x),
            y: this.snap(pt.y),
          };
        } else if (this.dragState.type === "rotate") {
          const shape = this.dragState.target;
          const c = this.getCenter(shape.points);
          const angle =
            Math.atan2(pt.y - c.y, pt.x - c.x) -
            Math.atan2(
              this.dragState.startY - c.y,
              this.dragState.startX - c.x,
            );
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          shape.points = shape.points.map((p: Point) => ({
            x: cos * (p.x - c.x) - sin * (p.y - c.y) + c.x,
            y: sin * (p.x - c.x) + cos * (p.y - c.y) + c.y,
          }));
          this.dragState.startX = pt.x;
          this.dragState.startY = pt.y;
        } else if (this.dragState.type === "select") {
          this.selectionBox = {
            x: Math.min(this.selectionStart.x, pt.x),
            y: Math.min(this.selectionStart.y, pt.y),
            w: Math.abs(pt.x - this.selectionStart.x),
            h: Math.abs(pt.y - this.selectionStart.y),
          };
        }
      },

      // 드래그 종료: 선택 박스 내 shape 선택 + 스냅 보정 (원형은 1px 단위 반올림)
      handleMouseUp(this: any) {
        if (this.dragState.type === "select" && this.selectionBox) {
          const b = this.selectionBox;
          this.selected = this.shapes.filter((s: Shape) => {
            const c = this.getCenter(s.points);
            return c.x > b.x && c.x < b.x + b.w && c.y > b.y && c.y < b.y + b.h;
          });
        }
        if (
          ["move", "rotate", "vertex"].includes(this.dragState.type) &&
          this.selectedShape
        ) {
          this.selected.forEach((s: Shape) => {
            if (s.shapeType === "circle") {
              s.points = s.points.map((p: Point) => ({
                x: Math.round(p.x),
                y: Math.round(p.y),
              }));
            } else {
              s.points = s.points.map((p: Point) => ({
                x: this.snap(p.x),
                y: this.snap(p.y),
              }));
            }
          });
        }
        this.dragState.active = false;
        this.selectionBox = null;
      },

      // 지정 위치에 정점 삽입 (스냅 적용)
      insertPoint(this: any, shape: Shape, index: number, pos: Point) {
        shape.points.splice(index, 0, {
          x: this.snap(pos.x),
          y: this.snap(pos.y),
        });
      },

      // 정점 제거 (최소 3개 유지)
      removePoint(shape: Shape, i: number) {
        if (shape.points.length > 3) shape.points.splice(i, 1);
      },
    },
  };
}