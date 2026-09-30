// Name: Text Metrics
// ID: itswiktoragaintextmetrics
// Description: Measure text width, height, ascent, and descent using browser font metrics.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;

  class TextMetricsExtension {
    constructor() {
      this.size = 24;
      this.family = "sans-serif";
      this.style = "normal";
      this.canvas =
        typeof document !== "undefined"
          ? document.createElement("canvas")
          : null;
      this.context = this.canvas ? this.canvas.getContext("2d") : null;
    }

    getInfo() {
      return {
        id: "itswiktoragaintextmetrics",
        name: Scratch.translate("Text Metrics"),
        color1: "#d94f9d",
        color2: "#b53b82",
        color3: "#923069",
        blocks: [
          {
            opcode: "setFont",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set font size [SIZE] px family [FAMILY]"),
            arguments: {
              SIZE: { type: ArgumentType.NUMBER, defaultValue: 24 },
              FAMILY: { type: ArgumentType.STRING, defaultValue: "sans-serif" },
            },
          },
          {
            opcode: "setStyle",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set font style [STYLE]"),
            arguments: { STYLE: { type: ArgumentType.STRING, menu: "styles" } },
          },
          {
            opcode: "width",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("width of text [TEXT] in pixels"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
            },
          },
          {
            opcode: "height",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("height of text [TEXT] in pixels"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
            },
          },
          {
            opcode: "ascent",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("ascent of text [TEXT] in pixels"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
            },
          },
          {
            opcode: "descent",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("descent of text [TEXT] in pixels"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
            },
          },
          {
            opcode: "fitSize",
            blockType: BlockType.REPORTER,
            text: Scratch.translate(
              "largest font size for [TEXT] within [WIDTH] pixels"
            ),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
              WIDTH: { type: ArgumentType.NUMBER, defaultValue: 200 },
            },
          },
          {
            opcode: "fontReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("current font"),
          },
        ],
        menus: {
          styles: {
            acceptReporters: true,
            items: ["normal", "bold", "italic", "bold italic"].map((value) => ({
              text: Scratch.translate(value),
              value,
            })),
          },
        },
      };
    }

    _font(size = this.size) {
      const style = this.style === "bold italic" ? "italic bold" : this.style;
      return `${style} ${size}px ${this.family}`;
    }

    _measure(text, size = this.size) {
      if (!this.context) {
        const width = Array.from(Cast.toString(text)).length * size * 0.6;
        return {
          width,
          actualBoundingBoxAscent: size * 0.8,
          actualBoundingBoxDescent: size * 0.2,
        };
      }
      this.context.font = this._font(size);
      return this.context.measureText(Cast.toString(text));
    }

    setFont(args) {
      this.size = Math.max(1, Math.min(1000, Cast.toNumber(args.SIZE) || 1));
      this.family = Cast.toString(args.FAMILY).trim() || "sans-serif";
    }

    setStyle(args) {
      const style = Cast.toString(args.STYLE);
      this.style = ["normal", "bold", "italic", "bold italic"].includes(style)
        ? style
        : "normal";
    }

    width(args) {
      return this._measure(args.TEXT).width;
    }

    height(args) {
      const metrics = this._measure(args.TEXT);
      return (
        (metrics.actualBoundingBoxAscent || this.size * 0.8) +
        (metrics.actualBoundingBoxDescent || this.size * 0.2)
      );
    }

    ascent(args) {
      const metrics = this._measure(args.TEXT);
      return metrics.actualBoundingBoxAscent || this.size * 0.8;
    }

    descent(args) {
      const metrics = this._measure(args.TEXT);
      return metrics.actualBoundingBoxDescent || this.size * 0.2;
    }

    fitSize(args) {
      const width = Math.max(0, Cast.toNumber(args.WIDTH));
      const text = Cast.toString(args.TEXT);
      if (!text || width <= 0) return 0;
      let low = 1;
      let high = 1000;
      while (low < high) {
        const mid = Math.ceil((low + high) / 2);
        if (this._measure(text, mid).width <= width) low = mid;
        else high = mid - 1;
      }
      return low;
    }

    fontReporter() {
      return this._font();
    }
  }

  Scratch.extensions.register(new TextMetricsExtension());
})(Scratch);
