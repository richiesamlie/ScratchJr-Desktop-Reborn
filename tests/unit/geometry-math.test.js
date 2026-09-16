import { describe, it, expect } from 'vitest';
import GeometryMath from '../../src/app/src/geom/GeometryMath';

describe('GeometryMath Pure Geometry & Bézier Suite', () => {
    describe('smoothPoints', () => {
        it('handles empty and single-point lists gracefully', () => {
            expect(GeometryMath.smoothPoints([])).toEqual([]);
            expect(GeometryMath.smoothPoints([{ x: 10, y: 20 }])).toEqual([{ x: 10, y: 20 }]);
        });

        it('smooths points via moving average', () => {
            const raw = [
                { x: 0, y: 0 },
                { x: 10, y: 50 },
                { x: 20, y: 0 },
                { x: 30, y: 50 },
                { x: 40, y: 0 }
            ];
            const smoothed = GeometryMath.smoothPoints(raw, 1);
            expect(smoothed.length).toBe(raw.length);
            expect(smoothed[0].x).toBeCloseTo(3.33, 1);
            expect(smoothed[smoothed.length - 1].x).toBe(raw[raw.length - 1].x);
        });
    });

    describe('fillWithPoints & addPoints', () => {
        it('interpolates midpoints for segments exceeding minDistance', () => {
            const p1 = { x: 0, y: 0 };
            const p2 = { x: 0, y: 10 };
            const [changed, points] = GeometryMath.fillWithPoints([p1, p2], 4);
            // With length 2, fillWithPoints keeps endpoints unchanged if n < 3:
            // Let's test with 3 points:
            const p3 = { x: 0, y: 20 };
            const [changed2, points2] = GeometryMath.fillWithPoints([p1, p2, p3], 5);
            expect(changed2).toBe(true);
            expect(points2.length).toBeGreaterThan(3);
        });

        it('densifies point spacing using addPoints', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                { x: 100, y: 100 }
            ];
            const dense = GeometryMath.addPoints(points, 5);
            expect(dense.length).toBeGreaterThan(points.length);
        });
    });

    describe('deletePoints', () => {
        it('removes collinear points', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 20, y: 20 },
                { x: 30, y: 30 }
            ];
            const cleaned = GeometryMath.deletePoints(points, 50);
            expect(cleaned.length).toBeLessThan(points.length);
            expect(cleaned[0]).toEqual({ x: 0, y: 0 });
            expect(cleaned[cleaned.length - 1]).toEqual({ x: 30, y: 30 });
        });
    });

    describe('getControlPoint', () => {
        it('calculates valid control point given collinear points', () => {
            const before = { x: 0, y: 0 };
            const here = { x: 10, y: 10 };
            const after = { x: 20, y: 20 };
            const cp = GeometryMath.getControlPoint(before, here, after);
            expect(Number.isFinite(cp.x)).toBe(true);
            expect(Number.isFinite(cp.y)).toBe(true);
        });

        it('calculates perpendicular curvature for 90-degree bend', () => {
            const before = { x: 0, y: 10 };
            const here = { x: 10, y: 10 };
            const after = { x: 10, y: 0 };
            const cp = GeometryMath.getControlPoint(before, here, after);
            expect(Number.isFinite(cp.x)).toBe(true);
            expect(Number.isFinite(cp.y)).toBe(true);
        });
    });

    describe('getBezierPoints & cleanBezier', () => {
        it('returns empty array if fewer than 8 coordinates', () => {
            expect(GeometryMath.getBezierPoints([0, 0, 10, 10])).toEqual([]);
        });

        it('generates points on cubic Bezier curve', () => {
            const coords = [0, 0, 20, 40, 60, 40, 100, 0];
            const pts = GeometryMath.getBezierPoints(coords);
            expect(pts.length).toBeGreaterThan(5);
            expect(pts[0].x).toBe(0);
            expect(pts[0].y).toBe(0);
            expect(pts[pts.length - 1].x).toBeGreaterThanOrEqual(99);
            expect(pts[pts.length - 1].y).toBeLessThanOrEqual(1);
        });

        it('filters dense points with cleanBezier', () => {
            const dense = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 20, y: 20 }
            ];
            const cleaned = GeometryMath.cleanBezier(dense, 5);
            expect(cleaned.length).toBeLessThan(dense.length);
        });
    });

    describe('polygon winding & orientation', () => {
        it('determines clockwise triangle', () => {
            // Screen coords: (0,0) top-left, (10,0) top-right, (0,10) bottom-left
            const triCW = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 0, y: 10 }
            ];
            const dir = GeometryMath.triangleAreaDir(triCW[0], triCW[1], triCW[2]);
            expect(dir).toBe('clockwise');
        });

        it('determines counterclockwise triangle', () => {
            const triCCW = [
                { x: 0, y: 0 },
                { x: 0, y: 10 },
                { x: 10, y: 0 }
            ];
            const dir = GeometryMath.triangleAreaDir(triCCW[0], triCCW[1], triCCW[2]);
            expect(dir).toBe('counterclockwise');
        });

        it('computes min/max bounds accurately', () => {
            const points = [
                { x: 5, y: 15 },
                { x: 100, y: 2 },
                { x: -10, y: 50 }
            ];
            const extrema = GeometryMath.getMinMaxPoints(points);
            expect(extrema[0].x).toBe(-10); // minx
            expect(extrema[1].y).toBe(2);   // miny
            expect(extrema[2].x).toBe(100); // maxx
            expect(extrema[3].y).toBe(50);  // maxy
        });
    });

    describe('withinBounds & atEdge', () => {
        it('checks edge bounds correctly', () => {
            expect(GeometryMath.atEdge({ x: -15, y: 100 })).toBe(true);
            expect(GeometryMath.atEdge({ x: 500, y: 100 })).toBe(true);
            expect(GeometryMath.atEdge({ x: 200, y: -12 })).toBe(true);
            expect(GeometryMath.atEdge({ x: 200, y: 380 })).toBe(true);
            expect(GeometryMath.atEdge({ x: 200, y: 200 })).toBe(false);
        });

        it('verifies bounding box containment', () => {
            const parent = { x: 0, y: 0, width: 200, height: 200 };
            const inside = { x: 10, y: 10, width: 50, height: 50 };
            expect(GeometryMath.withinBounds(inside, parent)).toBe(true);
        });
    });
});
