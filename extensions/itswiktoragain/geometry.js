// Name: Geometry
// ID: itswiktoragaingeometry
// Description: Calculate distances, angles, rotations, intersections, and polygon properties.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const T = Scratch.translate;
  const radians = (degrees) => (degrees * Math.PI) / 180;

  const parsePolygon = (value) => {
    try {
      const points = JSON.parse(Cast.toString(value));
      if (!Array.isArray(points)) return [];
      return points
        .filter((point) => Array.isArray(point) && point.length >= 2)
        .map((point) => [Number(point[0]) || 0, Number(point[1]) || 0]);
    } catch (error) {
      return [];
    }
  };

  class GeometryExtension {
    getInfo() {
      return {
        id: "itswiktoragaingeometry",
        name: T("Geometry"),
        color1: "#59c059",
        color2: "#459d45",
        color3: "#367f36",
        blocks: [
          {
            opcode: "distance",
            blockType: BlockType.REPORTER,
            text: T("distance from x [X1] y [Y1] to x [X2] y [Y2]"),
            arguments: {
              X1: { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Y2: { type: ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "angle",
            blockType: BlockType.REPORTER,
            text: T("angle from x [X1] y [Y1] to x [X2] y [Y2]"),
            arguments: {
              X1: { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Y2: { type: ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "rotate",
            blockType: BlockType.REPORTER,
            text: T("rotate point x [X] y [Y] around x [CX] y [CY] by [DEGREES] degrees"),
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 0 },
              CX: { type: ArgumentType.NUMBER, defaultValue: 0 },
              CY: { type: ArgumentType.NUMBER, defaultValue: 0 },
              DEGREES: { type: ArgumentType.NUMBER, defaultValue: 90 },
            },
          },
          {
            opcode: "intersection",
            blockType: BlockType.REPORTER,
            text: T("intersection of line [X1] [Y1] [X2] [Y2] and line [X3] [Y3] [X4] [Y4]"),
            arguments: {
              X1: { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Y2: { type: ArgumentType.NUMBER, defaultValue: 100 },
              X3: { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y3: { type: ArgumentType.NUMBER, defaultValue: 100 },
              X4: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Y4: { type: ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "pointInPolygon",
            blockType: BlockType.BOOLEAN,
            text: T("point x [X] y [Y] inside polygon [POLYGON]?"),
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 50 },
              POLYGON: { type: ArgumentType.STRING, defaultValue: "[[0,0],[100,0],[100,100],[0,100]]" },
            },
          },
          {
            opcode: "polygonArea",
            blockType: BlockType.REPORTER,
            text: T("area of polygon [POLYGON]"),
            arguments: {
              POLYGON: { type: ArgumentType.STRING, defaultValue: "[[0,0],[100,0],[100,100],[0,100]]" },
            },
          },
        ],
      };
    }

    distance(args) {
      return Math.hypot(Cast.toNumber(args.X2) - Cast.toNumber(args.X1), Cast.toNumber(args.Y2) - Cast.toNumber(args.Y1));
    }

    angle(args) {
      return (Math.atan2(Cast.toNumber(args.Y2) - Cast.toNumber(args.Y1), Cast.toNumber(args.X2) - Cast.toNumber(args.X1)) * 180) / Math.PI;
    }

    rotate(args) {
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      const cx = Cast.toNumber(args.CX);
      const cy = Cast.toNumber(args.CY);
      const a = radians(Cast.toNumber(args.DEGREES));
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      return JSON.stringify([
        cx + (x - cx) * cos - (y - cy) * sin,
        cy + (x - cx) * sin + (y - cy) * cos,
      ]);
    }

    intersection(args) {
      const x1 = Cast.toNumber(args.X1);
      const y1 = Cast.toNumber(args.Y1);
      const x2 = Cast.toNumber(args.X2);
      const y2 = Cast.toNumber(args.Y2);
      const x3 = Cast.toNumber(args.X3);
      const y3 = Cast.toNumber(args.Y3);
      const x4 = Cast.toNumber(args.X4);
      const y4 = Cast.toNumber(args.Y4);
      const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (Math.abs(denominator) < 1e-12) return "";
      const cross1 = x1 * y2 - y1 * x2;
      const cross2 = x3 * y4 - y3 * x4;
      const x = (cross1 * (x3 - x4) - (x1 - x2) * cross2) / denominator;
      const y = (cross1 * (y3 - y4) - (y1 - y2) * cross2) / denominator;
      return JSON.stringify([x, y]);
    }

    pointInPolygon(args) {
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      const points = parsePolygon(args.POLYGON);
      if (points.length < 3) return false;
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersects) inside = !inside;
      }
      return inside;
    }

    polygonArea(args) {
      const points = parsePolygon(args.POLYGON);
      if (points.length < 3) return 0;
      let total = 0;
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        total += x1 * y2 - x2 * y1;
      }
      return Math.abs(total) / 2;
    }
  }

  Scratch.extensions.register(new GeometryExtension());
})(Scratch);
