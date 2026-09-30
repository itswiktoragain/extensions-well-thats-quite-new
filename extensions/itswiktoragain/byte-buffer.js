// Name: Byte Buffer
// ID: itswiktoragainbytebuffer
// Description: Build, inspect, encode, and decode binary byte buffers.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const T = Scratch.translate;

  const typeInfo = {
    u8: [1, "setUint8", "getUint8"],
    i8: [1, "setInt8", "getInt8"],
    u16: [2, "setUint16", "getUint16"],
    i16: [2, "setInt16", "getInt16"],
    u32: [4, "setUint32", "getUint32"],
    i32: [4, "setInt32", "getInt32"],
    f32: [4, "setFloat32", "getFloat32"],
    f64: [8, "setFloat64", "getFloat64"],
  };

  class ByteBufferExtension {
    constructor() {
      this.bytes = [];
    }

    getInfo() {
      return {
        id: "itswiktoragainbytebuffer",
        name: T("Byte Buffer"),
        color1: "#4b6cb7",
        color2: "#3a5594",
        color3: "#2c4175",
        blocks: [
          { opcode: "clear", blockType: BlockType.COMMAND, text: T("clear byte buffer") },
          {
            opcode: "append",
            blockType: BlockType.COMMAND,
            text: T("append [TYPE] [VALUE] as [ENDIAN]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "types" },
              VALUE: { type: ArgumentType.NUMBER, defaultValue: 42 },
              ENDIAN: { type: ArgumentType.STRING, menu: "endian" },
            },
          },
          {
            opcode: "read",
            blockType: BlockType.REPORTER,
            text: T("read [TYPE] at byte [OFFSET] as [ENDIAN]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "types" },
              OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 },
              ENDIAN: { type: ArgumentType.STRING, menu: "endian" },
            },
          },
          {
            opcode: "byteAt",
            blockType: BlockType.REPORTER,
            text: T("byte [OFFSET]"),
            arguments: { OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 } },
          },
          {
            opcode: "loadHex",
            blockType: BlockType.COMMAND,
            text: T("load hex [HEX] into byte buffer"),
            arguments: { HEX: { type: ArgumentType.STRING, defaultValue: "48 65 6c 6c 6f" } },
          },
          { opcode: "hex", blockType: BlockType.REPORTER, text: T("byte buffer as hex") },
          { opcode: "base64", blockType: BlockType.REPORTER, text: T("byte buffer as base64") },
          {
            opcode: "loadBase64",
            blockType: BlockType.COMMAND,
            text: T("load base64 [BASE64] into byte buffer"),
            arguments: { BASE64: { type: ArgumentType.STRING, defaultValue: "SGVsbG8=" } },
          },
          { opcode: "length", blockType: BlockType.REPORTER, text: T("byte buffer length") },
        ],
        menus: {
          types: {
            acceptReporters: true,
            items: [
              ["unsigned 8-bit", "u8"],
              ["signed 8-bit", "i8"],
              ["unsigned 16-bit", "u16"],
              ["signed 16-bit", "i16"],
              ["unsigned 32-bit", "u32"],
              ["signed 32-bit", "i32"],
              ["32-bit float", "f32"],
              ["64-bit float", "f64"],
            ].map(([text, value]) => ({ text: T(text), value })),
          },
          endian: {
            acceptReporters: true,
            items: [
              { text: T("little endian"), value: "little" },
              { text: T("big endian"), value: "big" },
            ],
          },
        },
      };
    }

    _info(type) {
      return typeInfo[Cast.toString(type)] || typeInfo.u8;
    }

    _little(value) {
      return Cast.toString(value) !== "big";
    }

    clear() {
      this.bytes = [];
    }

    append(args) {
      const [size, setter] = this._info(args.TYPE);
      const buffer = new ArrayBuffer(size);
      const view = new DataView(buffer);
      view[setter](0, Cast.toNumber(args.VALUE), this._little(args.ENDIAN));
      this.bytes.push(...new Uint8Array(buffer));
    }

    read(args) {
      const [size, , getter] = this._info(args.TYPE);
      const offset = Math.max(0, Math.floor(Cast.toNumber(args.OFFSET)));
      if (offset + size > this.bytes.length) return 0;
      const buffer = Uint8Array.from(this.bytes.slice(offset, offset + size)).buffer;
      return new DataView(buffer)[getter](0, this._little(args.ENDIAN));
    }

    byteAt(args) {
      const offset = Math.max(0, Math.floor(Cast.toNumber(args.OFFSET)));
      return this.bytes[offset] ?? 0;
    }

    loadHex(args) {
      const compact = Cast.toString(args.HEX).replace(/[^0-9a-fA-F]/g, "");
      const even = compact.length % 2 ? `0${compact}` : compact;
      const bytes = [];
      for (let i = 0; i < even.length; i += 2) bytes.push(parseInt(even.slice(i, i + 2), 16));
      this.bytes = bytes;
    }

    hex() {
      return this.bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
    }

    base64() {
      let binary = "";
      for (const byte of this.bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    }

    loadBase64(args) {
      try {
        const binary = atob(Cast.toString(args.BASE64).replace(/\s+/g, ""));
        this.bytes = Array.from(binary, (char) => char.charCodeAt(0));
      } catch (error) {
        this.bytes = [];
      }
    }

    length() {
      return this.bytes.length;
    }
  }

  Scratch.extensions.register(new ByteBufferExtension());
})(Scratch);
