// Name: Seeded Random
// ID: itswiktoragainseededrandom
// Description: Make repeatable random sequences from a seed.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const T = Scratch.translate;

  const hashSeed = (text) => {
    let h = 1779033703 ^ Cast.toString(text).length;
    for (const ch of Cast.toString(text)) {
      h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0 || 0x6d2b79f5;
  };

  class SeededRandom {
    constructor() {
      this.seedText = "scratch";
      this.state = hashSeed(this.seedText);
    }

    getInfo() {
      return {
        id: "itswiktoragainseededrandom",
        name: T("Seeded Random"),
        color1: "#ff8c42",
        color2: "#dd6f29",
        color3: "#bb581c",
        blocks: [
          {
            opcode: "setSeed",
            blockType: BlockType.COMMAND,
            text: T("set random seed [SEED]"),
            arguments: { SEED: { type: ArgumentType.STRING, defaultValue: "scratch" } },
          },
          {
            opcode: "random",
            blockType: BlockType.REPORTER,
            text: T("seeded random [MIN] to [MAX]"),
            arguments: {
              MIN: { type: ArgumentType.NUMBER, defaultValue: 0 },
              MAX: { type: ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "randomInt",
            blockType: BlockType.REPORTER,
            text: T("seeded random integer [MIN] to [MAX]"),
            arguments: {
              MIN: { type: ArgumentType.NUMBER, defaultValue: 1 },
              MAX: { type: ArgumentType.NUMBER, defaultValue: 10 },
            },
          },
          {
            opcode: "chance",
            blockType: BlockType.BOOLEAN,
            text: T("seeded chance [PERCENT] %?"),
            arguments: { PERCENT: { type: ArgumentType.NUMBER, defaultValue: 50 } },
          },
          {
            opcode: "choose",
            blockType: BlockType.REPORTER,
            text: T("seeded item from [TEXT] split by [SEPARATOR]"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "red,green,blue" },
              SEPARATOR: { type: ArgumentType.STRING, defaultValue: "," },
            },
          },
          {
            opcode: "shuffle",
            blockType: BlockType.REPORTER,
            text: T("seeded shuffle [TEXT] split by [SEPARATOR]"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "one,two,three,four" },
              SEPARATOR: { type: ArgumentType.STRING, defaultValue: "," },
            },
          },
          {
            opcode: "seedReporter",
            blockType: BlockType.REPORTER,
            text: T("random seed"),
          },
        ],
      };
    }

    setSeed(args) {
      this.seedText = Cast.toString(args.SEED);
      this.state = hashSeed(this.seedText);
    }

    _next() {
      let x = this.state >>> 0;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      this.state = x >>> 0 || 0x6d2b79f5;
      return (this.state >>> 0) / 4294967296;
    }

    random(args) {
      let min = Cast.toNumber(args.MIN);
      let max = Cast.toNumber(args.MAX);
      if (min > max) [min, max] = [max, min];
      return min + this._next() * (max - min);
    }

    randomInt(args) {
      let min = Math.ceil(Cast.toNumber(args.MIN));
      let max = Math.floor(Cast.toNumber(args.MAX));
      if (min > max) [min, max] = [max, min];
      return min + Math.floor(this._next() * (max - min + 1));
    }

    chance(args) {
      const percent = Math.max(0, Math.min(100, Cast.toNumber(args.PERCENT)));
      return this._next() * 100 < percent;
    }

    choose(args) {
      const separator = Cast.toString(args.SEPARATOR);
      const text = Cast.toString(args.TEXT);
      const items = separator === "" ? Array.from(text) : text.split(separator);
      if (!items.length) return "";
      return items[Math.floor(this._next() * items.length)];
    }

    shuffle(args) {
      const separator = Cast.toString(args.SEPARATOR);
      const text = Cast.toString(args.TEXT);
      const items = separator === "" ? Array.from(text) : text.split(separator);
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(this._next() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items.join(separator);
    }

    seedReporter() {
      return this.seedText;
    }
  }

  Scratch.extensions.register(new SeededRandom());
})(Scratch);
