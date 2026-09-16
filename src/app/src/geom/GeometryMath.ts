import Vector, { Point } from './Vector';

/**
 * Pure geometric and Bézier mathematics decoupled from DOM, Window, and SVG elements.
 * Provides high-cohesion, independently testable algorithms for curve fitting, point smoothing,
 * polygon winding determination, and spatial boundary checks.
 */
export default class GeometryMath {
    /**
     * Moving average smoothing on a sequence of 2D points.
     */
    static smoothPoints (points: Point[], interval = 3): Point[] {
        const n = points.length;
        if (n < 2) {
            return [...points];
        }
        const plist: Point[] = [];
        for (let i = 0; i < (n - 1); i++) {
            let ax = 0;
            let ay = 0;
            for (let j = -interval; j <= interval; j++) {
                let nj = Math.max(0, i + j);
                nj = Math.min(nj, n - 1);
                ax += points[nj].x;
                ay += points[nj].y;
            }
            ax /= ((interval * 2) + 1);
            ay /= ((interval * 2) + 1);
            plist.push({ x: ax, y: ay });
        }
        plist.push(points[n - 1]);
        return plist;
    }

    /**
     * Subdivides segments longer than minDistance with their midpoints.
     */
    static fillWithPoints (points: Point[], minDistance = 5): [boolean, Point[]] {
        const n = points.length;
        if (n < 2) {
            return [false, [...points]];
        }
        let i = 1;
        let res = false;
        const plist = [points[0]];
        while (i < n - 1) {
            const here = points[i];
            const after = points[i + 1];
            const l2 = Vector.len(Vector.diff(after, here));
            plist.push(points[i]);
            if (l2 > minDistance) {
                const mp = Vector.mid(here, after);
                plist.push({ x: mp.x, y: mp.y });
                res = true;
            }
            i++;
        }
        plist.push(points[n - 1]);
        return [res, plist];
    }

    /**
     * Iteratively interpolates midpoints until point spacing is below threshold or max iterations reached.
     */
    static addPoints (points: Point[], maxIterations = 10): Point[] {
        let it = 0;
        let b = true;
        let result: [boolean, Point[]] = [true, points];
        while (b) {
            result = GeometryMath.fillWithPoints(result[1]);
            b = result[0];
            it++;
            if (it > maxIterations) {
                return result[1];
            }
        }
        return result[1];
    }

    /**
     * Removes collinear and clustered points while preserving significant curve vertices.
     */
    static deletePoints (points: Point[], dist = 30): Point[] {
        const n = points.length;
        if (n < 3) {
            return [...points];
        }
        let i = 1;
        let j = 0;
        const plist: Point[] = [points[0]];
        while (i < n - 1) {
            const before = points[j];
            const here = points[i];
            const after = points[i + 1];
            const l1 = Vector.diff(before, here);
            const l2 = Vector.diff(after, here);
            let div = Vector.len(l1) * Vector.len(l2);
            if (div === 0) {
                div = 0.01;
            }
            const factor = Vector.dot(l1, l2) / div;
            if ((factor > -0.9) || (Vector.len(l2) > dist) || (Vector.len(l1) > dist)) {
                plist.push(points[i]);
                j = i;
            }
            i++;
        }
        const beforeLast = points[n - 2];
        const last = points[n - 1];
        if ((plist.length > 2) && (Vector.len(Vector.diff(beforeLast, last)) < 3)) {
            plist.pop();
        }
        plist.push(points[n - 1]);
        return plist;
    }

    /**
     * Computes the cubic Bézier control point for a vertex given its neighbors.
     */
    static getControlPoint (before: Point, here: Point, after: Point): Point {
        const l1 = Vector.len(Vector.diff(before, here));
        const l2 = Vector.len(Vector.diff(here, after));
        const l3 = Vector.len(Vector.diff(before, after));
        let l = 0;
        if ((l1 + l2) !== 0) {
            l = l3 / (l1 + l2);
        }
        const min = Math.min(l1, l2);
        const beforev = Vector.diff(before, here);
        const afterv = Vector.diff(after, here);
        const bisect = Vector.sum(Vector.norm(beforev), Vector.norm(afterv));
        let perp = Vector.perp(bisect);
        if (Vector.dot(perp, afterv) < 0) {
            perp = Vector.neg(perp);
        }
        if ((bisect.x === 0) || (bisect.y === 0)) {
            const kappa = (Math.sqrt(2) - 1) / 3 * 4;
            perp = Vector.norm(perp);
            const lx = Vector.dot(Vector.diff(here, before), perp);
            return Vector.diff(here, Vector.scale(perp, lx * kappa));
        }
        return Vector.diff(here, Vector.scale(perp, l * l * min * 0.666));
    }

    /**
     * Generates discrete raster points along a cubic Bézier curve segment.
     */
    static getBezierPoints (points: (string | number)[]): Point[] {
        if (points.length < 8) {
            return [];
        }
        const p1x = points[0] as number;
        const p1y = points[1] as number;
        const p2x = points[2] as number;
        const p2y = points[3] as number;
        const p3x = points[4] as number;
        const p3y = points[5] as number;
        const p4x = points[6] as number;
        const p4y = points[7] as number;

        let xl = p1x - 1;
        let yl = p1y - 1;
        let t = 0;
        let f = 1;
        const k = 1.1;
        const curvePoints: Point[] = [];

        while ((t <= 1) && (t >= 0)) {
            let x = (1 - t) * (1 - t) * (1 - t) * p1x + 3 * (1 - t) * (1 - t)
                * t * p2x + 3 * (1 - t) * t * t * p3x + t * t * t * p4x;
            let y = (1 - t) * (1 - t) * (1 - t) * p1y + 3 * (1 - t) * (1 - t)
                * t * p2y + 3 * (1 - t) * t * t * p3y + t * t * t * p4y;
            x = Math.round(x);
            y = Math.round(y);
            if (x !== xl || y !== yl) {
                if (t === 0) {
                    xl = x;
                    yl = y;
                }
                if (Math.abs(x - xl) > 1 || Math.abs(y - yl) > 1) {
                    t -= f;
                    f = f / k;
                } else {
                    curvePoints.push({ x, y });
                    xl = x;
                    yl = y;
                }
            } else {
                t -= f;
                f = f * k;
            }
            t += f;
        }
        return curvePoints;
    }

    /**
     * Cleans a Bézier point sequence by downsampling points closer than dist.
     */
    static cleanBezier (points: Point[], dist = 5): Point[] {
        const n = points.length;
        if (n < 2) {
            return [...points];
        }
        let i = 1;
        let j = 0;
        const plist: Point[] = [points[0]];
        while (i < n - 1) {
            const before = points[j];
            const here = points[i];
            const after = points[i + 1];
            const l1 = Vector.diff(before, here);
            const l2 = Vector.diff(after, here);
            if ((Vector.len(l2) > dist) || (Vector.len(l1) > dist)) {
                plist.push(points[i]);
                j = i;
            }
            i++;
        }
        return plist;
    }

    /**
     * Computes bounding extrema points with original list indices.
     */
    static getMinMaxPoints (list: Point[]): Array<{ type: string; x: number; y: number; index: number } | number> {
        const res: Array<{ type: string; x: number; y: number; index: number } | number> = [0, 0, 0, 0];
        if (list.length < 1) {
            return res;
        }
        let minx = 9999999;
        let miny = 9999999;
        let maxx = -9999999;
        let maxy = -9999999;
        for (let i = 0; i < list.length; i++) {
            if (list[i].x < minx) {
                minx = list[i].x;
                res[0] = { type: 'minx', x: list[i].x, y: list[i].y, index: i };
            }
            if (list[i].x > maxx) {
                maxx = list[i].x;
                res[2] = { type: 'maxx', x: list[i].x, y: list[i].y, index: i };
            }
            if (list[i].y < miny) {
                miny = list[i].y;
                res[1] = { type: 'miny', x: list[i].x, y: list[i].y, index: i };
            }
            if (list[i].y > maxy) {
                maxy = list[i].y;
                res[3] = { type: 'maxy', x: list[i].x, y: list[i].y, index: i };
            }
        }
        return res;
    }

    static findGreaterThanIndex (
        list: Array<{ type: string; x: number; y: number; index: number } | number>,
        min: number
    ): { type: string; x: number; y: number; index: number } | null {
        let lastmin = 99999999;
        let pos: { type: string; x: number; y: number; index: number } | null = null;
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (typeof item === 'object' && item !== null) {
                if ((item.index > min) && (item.index < lastmin)) {
                    lastmin = item.index;
                    pos = item;
                }
            }
        }
        return pos;
    }

    /**
     * Calculates signed triangle area orientation for 3 2D points.
     */
    static triangleAreaDir (
        a: { x: number; y: number },
        b: { x: number; y: number },
        c: { x: number; y: number }
    ): 'clockwise' | 'counterclockwise' | 'colinear' {
        const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        if (area > 0) {
            return 'clockwise';
        }
        if (area < 0) {
            return 'counterclockwise';
        }
        return 'colinear';
    }

    /**
     * Determines whether a sequence of points winds clockwise, counterclockwise, or is colinear.
     */
    static getTurnType (list: Point[]): 'clockwise' | 'counterclockwise' | 'colinear' {
        if (list.length < 3) {
            return 'colinear';
        }
        const limitpoints = GeometryMath.getMinMaxPoints(list);
        const a = GeometryMath.findGreaterThanIndex(limitpoints, -1);
        if (!a) {
            return 'colinear';
        }
        const b = GeometryMath.findGreaterThanIndex(limitpoints, a.index);
        if (!b) {
            return 'colinear';
        }
        const c = GeometryMath.findGreaterThanIndex(limitpoints, b.index);
        if (!c) {
            return 'colinear';
        }
        return GeometryMath.triangleAreaDir(a, b, c);
    }

    /**
     * Bounding box containment check.
     */
    static withinBounds (
        box: { x: number; y: number; width: number; height: number },
        box2: { x: number; y: number; width: number; height: number }
    ): boolean {
        if ((box.x <= box2.x) && ((box.width + box.x) >= box2.width)) {
            return false;
        }
        if (box.y > box2.y) {
            return true;
        }
        if ((box.height + box.y) < box2.height) {
            return true;
        }
        return false;
    }

    /**
     * Checks if a point lies at or beyond the workspace boundary limits.
     */
    static atEdge (pt: Point, bounds = { minX: -10, maxX: 490, minY: -10, maxY: 370 }): boolean {
        if (pt.x <= bounds.minX || pt.x >= bounds.maxX || pt.y >= bounds.maxY || pt.y <= bounds.minY) {
            return true;
        }
        return false;
    }
}
