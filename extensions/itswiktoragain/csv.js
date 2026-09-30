// Name: CSV
// ID: itswiktoragaincsv
// Description: Read and write comma-separated and other delimited table data.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const T = Scratch.translate;

  const delimiterFrom = (value) => {
    const text = Cast.toString(value);
    return text.length ? text[0] : ",";
  };

  const parse = (input, delimiter) => {
    const text = Cast.toString(input);
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            quoted = false;
          }
        } else {
          field += ch;
        }
      } else if (ch === '"' && field === "") {
        quoted = true;
      } else if (ch === delimiter) {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }

    if (field !== "" || row.length || text.endsWith(delimiter)) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  };

  const encodeField = (value, delimiter) => {
    const text = Cast.toString(value);
    if (text.includes(delimiter) || text.includes('"') || /[\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  class CSVExtension {
    constructor() {
      this.delimiter = ",";
    }

    getInfo() {
      return {
        id: "itswiktoragaincsv",
        name: T("CSV"),
        color1: "#2bb9a9",
        color2: "#209889",
        color3: "#19796d",
        blocks: [
          {
            opcode: "setDelimiter",
            blockType: BlockType.COMMAND,
            text: T("set CSV delimiter to [DELIMITER]"),
            arguments: { DELIMITER: { type: ArgumentType.STRING, defaultValue: "," } },
          },
          {
            opcode: "rowCount",
            blockType: BlockType.REPORTER,
            text: T("row count of CSV [CSV]"),
            arguments: { CSV: { type: ArgumentType.STRING, defaultValue: "name,score\nAlex,10\nSam,20" } },
          },
          {
            opcode: "columnCount",
            blockType: BlockType.REPORTER,
            text: T("column count of row [ROW] in CSV [CSV]"),
            arguments: {
              ROW: { type: ArgumentType.NUMBER, defaultValue: 1 },
              CSV: { type: ArgumentType.STRING, defaultValue: "name,score\nAlex,10" },
            },
          },
          {
            opcode: "cell",
            blockType: BlockType.REPORTER,
            text: T("cell row [ROW] column [COLUMN] of CSV [CSV]"),
            arguments: {
              ROW: { type: ArgumentType.NUMBER, defaultValue: 2 },
              COLUMN: { type: ArgumentType.NUMBER, defaultValue: 1 },
              CSV: { type: ArgumentType.STRING, defaultValue: "name,score\nAlex,10" },
            },
          },
          {
            opcode: "rowJSON",
            blockType: BlockType.REPORTER,
            text: T("row [ROW] of CSV [CSV] as JSON"),
            arguments: {
              ROW: { type: ArgumentType.NUMBER, defaultValue: 1 },
              CSV: { type: ArgumentType.STRING, defaultValue: "name,score\nAlex,10" },
            },
          },
          {
            opcode: "columnJSON",
            blockType: BlockType.REPORTER,
            text: T("column [COLUMN] of CSV [CSV] as JSON"),
            arguments: {
              COLUMN: { type: ArgumentType.NUMBER, defaultValue: 1 },
              CSV: { type: ArgumentType.STRING, defaultValue: "name,score\nAlex,10" },
            },
          },
          {
            opcode: "toJSON",
            blockType: BlockType.REPORTER,
            text: T("CSV [CSV] as JSON arrays"),
            arguments: { CSV: { type: ArgumentType.STRING, defaultValue: "name,score\nAlex,10" } },
          },
          {
            opcode: "fromJSON",
            blockType: BlockType.REPORTER,
            text: T("JSON arrays [JSON] as CSV"),
            arguments: { JSON: { type: ArgumentType.STRING, defaultValue: '[["name","score"],["Alex",10]]' } },
          },
          {
            opcode: "delimiterReporter",
            blockType: BlockType.REPORTER,
            text: T("CSV delimiter"),
          },
        ],
      };
    }

    _parse(value) {
      return parse(value, this.delimiter);
    }

    setDelimiter(args) {
      this.delimiter = delimiterFrom(args.DELIMITER);
    }

    rowCount(args) {
      return this._parse(args.CSV).length;
    }

    columnCount(args) {
      const rows = this._parse(args.CSV);
      const row = Math.max(1, Math.floor(Cast.toNumber(args.ROW))) - 1;
      return rows[row] ? rows[row].length : 0;
    }

    cell(args) {
      const rows = this._parse(args.CSV);
      const row = Math.max(1, Math.floor(Cast.toNumber(args.ROW))) - 1;
      const column = Math.max(1, Math.floor(Cast.toNumber(args.COLUMN))) - 1;
      return rows[row]?.[column] ?? "";
    }

    rowJSON(args) {
      const rows = this._parse(args.CSV);
      const row = Math.max(1, Math.floor(Cast.toNumber(args.ROW))) - 1;
      return JSON.stringify(rows[row] ?? []);
    }

    columnJSON(args) {
      const rows = this._parse(args.CSV);
      const column = Math.max(1, Math.floor(Cast.toNumber(args.COLUMN))) - 1;
      return JSON.stringify(rows.map((row) => row[column] ?? ""));
    }

    toJSON(args) {
      return JSON.stringify(this._parse(args.CSV));
    }

    fromJSON(args) {
      try {
        const rows = JSON.parse(Cast.toString(args.JSON));
        if (!Array.isArray(rows)) return "";
        return rows
          .map((row) => (Array.isArray(row) ? row : [row]).map((value) => encodeField(value, this.delimiter)).join(this.delimiter))
          .join("\n");
      } catch (error) {
        return "";
      }
    }

    delimiterReporter() {
      return this.delimiter;
    }
  }

  Scratch.extensions.register(new CSVExtension());
})(Scratch);
