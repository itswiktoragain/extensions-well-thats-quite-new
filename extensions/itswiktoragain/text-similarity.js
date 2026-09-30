// Name: Text Similarity
// ID: itswiktoragaintextsimilarity
// Description: Compare text using edit distance, similarity, common edges, and word overlap.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const LIMIT = 4096;

  const clipped = (value) => Array.from(Cast.toString(value)).slice(0, LIMIT);

  const levenshtein = (aValue, bValue) => {
    let a = clipped(aValue);
    let b = clipped(bValue);
    if (a.length > b.length) [a, b] = [b, a];
    let previous = Array.from({ length: a.length + 1 }, (_, i) => i);
    let current = new Array(a.length + 1);
    for (let y = 1; y <= b.length; y++) {
      current[0] = y;
      for (let x = 1; x <= a.length; x++) {
        const cost = a[x - 1] === b[y - 1] ? 0 : 1;
        current[x] = Math.min(
          current[x - 1] + 1,
          previous[x] + 1,
          previous[x - 1] + cost
        );
      }
      [previous, current] = [current, previous];
    }
    return previous[a.length];
  };

  const wordSet = (value) =>
    new Set(
      Cast.toString(value)
        .toLowerCase()
        .match(/[\p{L}\p{N}_]+/gu) || []
    );

  class TextSimilarity {
    getInfo() {
      return {
        id: "itswiktoragaintextsimilarity",
        name: Scratch.translate("Text Similarity"),
        color1: "#e95f5f",
        color2: "#c94747",
        color3: "#a53939",
        blocks: [
          {
            opcode: "distance",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("edit distance between [A] and [B]"),
            arguments: {
              A: { type: ArgumentType.STRING, defaultValue: "kitten" },
              B: { type: ArgumentType.STRING, defaultValue: "sitting" },
            },
          },
          {
            opcode: "similarity",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("similarity percent of [A] and [B]"),
            arguments: {
              A: { type: ArgumentType.STRING, defaultValue: "hello" },
              B: { type: ArgumentType.STRING, defaultValue: "hallo" },
            },
          },
          {
            opcode: "commonPrefix",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("common prefix of [A] and [B]"),
            arguments: {
              A: { type: ArgumentType.STRING, defaultValue: "scratch" },
              B: { type: ArgumentType.STRING, defaultValue: "scrape" },
            },
          },
          {
            opcode: "commonSuffix",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("common suffix of [A] and [B]"),
            arguments: {
              A: { type: ArgumentType.STRING, defaultValue: "walking" },
              B: { type: ArgumentType.STRING, defaultValue: "talking" },
            },
          },
          {
            opcode: "wordOverlap",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("word overlap percent of [A] and [B]"),
            arguments: {
              A: {
                type: ArgumentType.STRING,
                defaultValue: "the quick brown fox",
              },
              B: { type: ArgumentType.STRING, defaultValue: "the brown dog" },
            },
          },
        ],
      };
    }

    distance(args) {
      return levenshtein(args.A, args.B);
    }

    similarity(args) {
      const a = clipped(args.A);
      const b = clipped(args.B);
      const max = Math.max(a.length, b.length);
      if (!max) return 100;
      return ((max - levenshtein(a.join(""), b.join(""))) / max) * 100;
    }

    commonPrefix(args) {
      const a = Array.from(Cast.toString(args.A));
      const b = Array.from(Cast.toString(args.B));
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return a.slice(0, i).join("");
    }

    commonSuffix(args) {
      const a = Array.from(Cast.toString(args.A));
      const b = Array.from(Cast.toString(args.B));
      let i = 0;
      while (
        i < a.length &&
        i < b.length &&
        a[a.length - 1 - i] === b[b.length - 1 - i]
      )
        i++;
      return a.slice(a.length - i).join("");
    }

    wordOverlap(args) {
      const a = wordSet(args.A);
      const b = wordSet(args.B);
      if (!a.size && !b.size) return 100;
      let intersection = 0;
      for (const word of a) if (b.has(word)) intersection++;
      const union = new Set([...a, ...b]).size;
      return union ? (intersection / union) * 100 : 0;
    }
  }

  Scratch.extensions.register(new TextSimilarity());
})(Scratch);
