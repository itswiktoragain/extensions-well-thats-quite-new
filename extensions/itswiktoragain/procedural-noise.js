// Name: Procedural Noise
// ID: itswiktoragainproceduralnoise
// Description: Generate deterministic smooth and fractal noise for terrain, effects, and procedural projects.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;

  const hashString = (text) => {
    let hash = 2166136261 >>> 0;
    const value = Cast.toString(text);
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  };

  const fade = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  class ProceduralNoise {
    constructor() {
      this.seedText = "scratch";
      this.seed = hashString(this.seedText);
    }

    getInfo() {
      return {
        id: "itswiktoragainproceduralnoise",
        name: Scratch.translate("Procedural Noise"),
        color1: "#7e57c2",
        color2: "#6744a6",
        color3: "#56378d",
        blocks: [
          {
            opcode: "setSeed",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set noise seed [SEED]"),
            arguments: {
              SEED: { type: ArgumentType.STRING, defaultValue: "scratch" },
            },
          },
          {
            opcode: "noise1D",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("noise at x [X]"),
            arguments: { X: { type: ArgumentType.NUMBER, defaultValue: 12.5 } },
          },
          {
            opcode: "noise2D",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("noise at x [X] y [Y]"),
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 12.5 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 8.25 },
            },
          },
          {
            opcode: "fractal",
            blockType: BlockType.REPORTER,
            text: Scratch.translate(
              "fractal noise x [X] y [Y] octaves [OCTAVES] persistence [PERSISTENCE]"
            ),
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 12.5 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 8.25 },
              OCTAVES: { type: ArgumentType.NUMBER, defaultValue: 4 },
              PERSISTENCE: { type: ArgumentType.NUMBER, defaultValue: 0.5 },
            },
          },
          {
            opcode: "mapped",
            blockType: BlockType.REPORTER,
            text: Scratch.translate(
              "noise x [X] y [Y] mapped from [MIN] to [MAX]"
            ),
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 12.5 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 8.25 },
              MIN: { type: ArgumentType.NUMBER, defaultValue: -1 },
              MAX: { type: ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "seedReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("noise seed"),
          },
        ],
      };
    }

    setSeed(args) {
      this.seedText = Cast.toString(args.SEED);
      this.seed = hashString(this.seedText);
    }

    _value(ix, iy) {
      let h =
        this.seed ^
        Math.imul(ix | 0, 0x27d4eb2d) ^
        Math.imul(iy | 0, 0x165667b1);
      h ^= h >>> 15;
      h = Math.imul(h, 0x85ebca6b);
      h ^= h >>> 13;
      h = Math.imul(h, 0xc2b2ae35);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967295;
    }

    _noise2D(x, y) {
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const tx = fade(x - x0);
      const ty = fade(y - y0);
      const a = lerp(this._value(x0, y0), this._value(x0 + 1, y0), tx);
      const b = lerp(this._value(x0, y0 + 1), this._value(x0 + 1, y0 + 1), tx);
      return lerp(a, b, ty);
    }

    noise1D(args) {
      return this._noise2D(Cast.toNumber(args.X), 0);
    }

    noise2D(args) {
      return this._noise2D(Cast.toNumber(args.X), Cast.toNumber(args.Y));
    }

    fractal(args) {
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      const octaves = Math.max(
        1,
        Math.min(12, Math.floor(Cast.toNumber(args.OCTAVES)))
      );
      const persistence = Math.max(
        0,
        Math.min(1, Cast.toNumber(args.PERSISTENCE))
      );
      let amplitude = 1;
      let frequency = 1;
      let total = 0;
      let weight = 0;
      for (let i = 0; i < octaves; i++) {
        total += this._noise2D(x * frequency, y * frequency) * amplitude;
        weight += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }
      return weight ? total / weight : 0;
    }

    mapped(args) {
      const min = Cast.toNumber(args.MIN);
      const max = Cast.toNumber(args.MAX);
      const n = this._noise2D(Cast.toNumber(args.X), Cast.toNumber(args.Y));
      return min + (max - min) * n;
    }

    seedReporter() {
      return this.seedText;
    }
  }

  Scratch.extensions.register(new ProceduralNoise());
})(Scratch);
