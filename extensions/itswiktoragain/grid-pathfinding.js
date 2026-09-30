// Name: Grid Pathfinding
// ID: itswiktoragaingridpathfinding
// Description: Find shortest paths through rectangular tile grids with blocked cells.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const T = Scratch.translate;
  const MAX_SIDE = 200;

  const clampInt = (value, min, max) => Math.max(min, Math.min(max, Math.floor(Cast.toNumber(value))));

  const parseBlocked = (value) => {
    const text = Cast.toString(value).trim();
    const out = [];
    if (!text) return out;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        for (const point of parsed) {
          if (Array.isArray(point) && point.length >= 2) out.push([Math.floor(Number(point[0])), Math.floor(Number(point[1]))]);
        }
        return out;
      }
    } catch (error) {
      // Fall back to x,y;x,y syntax.
    }
    for (const pair of text.split(";")) {
      const [x, y] = pair.split(",").map((item) => Math.floor(Number(item.trim())));
      if (Number.isFinite(x) && Number.isFinite(y)) out.push([x, y]);
    }
    return out;
  };

  class GridPathfinding {
    constructor() {
      this.lastKey = "";
      this.lastResult = [];
      this.lastExplored = 0;
    }

    getInfo() {
      return {
        id: "itswiktoragaingridpathfinding",
        name: T("Grid Pathfinding"),
        color1: "#34b4d9",
        color2: "#2794b5",
        color3: "#1e7691",
        blocks: [
          {
            opcode: "path",
            blockType: BlockType.REPORTER,
            text: T("path from [SX] [SY] to [EX] [EY] on [WIDTH] x [HEIGHT] grid blocked [BLOCKED] movement [MODE]"),
            arguments: {
              SX: { type: ArgumentType.NUMBER, defaultValue: 0 },
              SY: { type: ArgumentType.NUMBER, defaultValue: 0 },
              EX: { type: ArgumentType.NUMBER, defaultValue: 9 },
              EY: { type: ArgumentType.NUMBER, defaultValue: 9 },
              WIDTH: { type: ArgumentType.NUMBER, defaultValue: 10 },
              HEIGHT: { type: ArgumentType.NUMBER, defaultValue: 10 },
              BLOCKED: { type: ArgumentType.STRING, defaultValue: "3,3;3,4;3,5;4,5;5,5" },
              MODE: { type: ArgumentType.STRING, menu: "modes" },
            },
          },
          {
            opcode: "length",
            blockType: BlockType.REPORTER,
            text: T("path length from [SX] [SY] to [EX] [EY] on [WIDTH] x [HEIGHT] grid blocked [BLOCKED] movement [MODE]"),
            arguments: {
              SX: { type: ArgumentType.NUMBER, defaultValue: 0 },
              SY: { type: ArgumentType.NUMBER, defaultValue: 0 },
              EX: { type: ArgumentType.NUMBER, defaultValue: 9 },
              EY: { type: ArgumentType.NUMBER, defaultValue: 9 },
              WIDTH: { type: ArgumentType.NUMBER, defaultValue: 10 },
              HEIGHT: { type: ArgumentType.NUMBER, defaultValue: 10 },
              BLOCKED: { type: ArgumentType.STRING, defaultValue: "3,3;3,4;3,5;4,5;5,5" },
              MODE: { type: ArgumentType.STRING, menu: "modes" },
            },
          },
          {
            opcode: "exists",
            blockType: BlockType.BOOLEAN,
            text: T("path exists from [SX] [SY] to [EX] [EY] on [WIDTH] x [HEIGHT] grid blocked [BLOCKED] movement [MODE]?"),
            arguments: {
              SX: { type: ArgumentType.NUMBER, defaultValue: 0 },
              SY: { type: ArgumentType.NUMBER, defaultValue: 0 },
              EX: { type: ArgumentType.NUMBER, defaultValue: 9 },
              EY: { type: ArgumentType.NUMBER, defaultValue: 9 },
              WIDTH: { type: ArgumentType.NUMBER, defaultValue: 10 },
              HEIGHT: { type: ArgumentType.NUMBER, defaultValue: 10 },
              BLOCKED: { type: ArgumentType.STRING, defaultValue: "3,3;3,4;3,5;4,5;5,5" },
              MODE: { type: ArgumentType.STRING, menu: "modes" },
            },
          },
          { opcode: "explored", blockType: BlockType.REPORTER, text: T("cells explored by last path") },
        ],
        menus: {
          modes: {
            acceptReporters: true,
            items: [
              { text: T("4 directions"), value: "4" },
              { text: T("8 directions"), value: "8" },
            ],
          },
        },
      };
    }

    _solve(args) {
      const width = clampInt(args.WIDTH, 1, MAX_SIDE);
      const height = clampInt(args.HEIGHT, 1, MAX_SIDE);
      const sx = clampInt(args.SX, 0, width - 1);
      const sy = clampInt(args.SY, 0, height - 1);
      const ex = clampInt(args.EX, 0, width - 1);
      const ey = clampInt(args.EY, 0, height - 1);
      const mode = Cast.toString(args.MODE) === "8" ? "8" : "4";
      const blockedText = Cast.toString(args.BLOCKED);
      const key = JSON.stringify([width, height, sx, sy, ex, ey, mode, blockedText]);
      if (key === this.lastKey) return this.lastResult;

      const blocked = new Uint8Array(width * height);
      for (const [x, y] of parseBlocked(blockedText)) {
        if (x >= 0 && x < width && y >= 0 && y < height) blocked[y * width + x] = 1;
      }
      blocked[sy * width + sx] = 0;
      blocked[ey * width + ex] = 0;

      const total = width * height;
      const parent = new Int32Array(total);
      parent.fill(-1);
      const seen = new Uint8Array(total);
      const queue = new Int32Array(total);
      const start = sy * width + sx;
      const goal = ey * width + ex;
      queue[0] = start;
      seen[start] = 1;
      let head = 0;
      let tail = 1;
      let explored = 0;
      const directions = mode === "8"
        ? [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
        : [[1,0],[-1,0],[0,1],[0,-1]];

      while (head < tail) {
        const current = queue[head++];
        explored++;
        if (current === goal) break;
        const x = current % width;
        const y = Math.floor(current / width);
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (blocked[next] || seen[next]) continue;
          if (dx !== 0 && dy !== 0) {
            const sideA = y * width + nx;
            const sideB = ny * width + x;
            if (blocked[sideA] || blocked[sideB]) continue;
          }
          seen[next] = 1;
          parent[next] = current;
          queue[tail++] = next;
        }
      }

      const result = [];
      if (seen[goal]) {
        let current = goal;
        while (current !== -1) {
          result.push([current % width, Math.floor(current / width)]);
          if (current === start) break;
          current = parent[current];
        }
        result.reverse();
      }
      this.lastKey = key;
      this.lastResult = result;
      this.lastExplored = explored;
      return result;
    }

    path(args) {
      return JSON.stringify(this._solve(args));
    }

    length(args) {
      const path = this._solve(args);
      return path.length ? path.length - 1 : -1;
    }

    exists(args) {
      return this._solve(args).length > 0;
    }

    explored() {
      return this.lastExplored;
    }
  }

  Scratch.extensions.register(new GridPathfinding());
})(Scratch);
