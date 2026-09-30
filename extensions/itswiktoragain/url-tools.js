// Name: URL Tools
// ID: itswiktoragainurltools
// Description: Parse, inspect, modify, and resolve URLs.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  const { ArgumentType, BlockType, Cast } = Scratch;
  const T = Scratch.translate;

  const parseURL = (value) => {
    try {
      return new URL(Cast.toString(value));
    } catch (error) {
      return null;
    }
  };

  class URLTools {
    getInfo() {
      return {
        id: "itswiktoragainurltools",
        name: T("URL Tools"),
        color1: "#4c97ff",
        color2: "#3373cc",
        color3: "#2e64b5",
        blocks: [
          {
            opcode: "part",
            blockType: BlockType.REPORTER,
            text: T("[PART] of URL [URL]"),
            arguments: {
              PART: { type: ArgumentType.STRING, menu: "parts" },
              URL: { type: ArgumentType.STRING, defaultValue: "https://example.com/page?q=hello#top" },
            },
          },
          {
            opcode: "query",
            blockType: BlockType.REPORTER,
            text: T("query parameter [NAME] of URL [URL]"),
            arguments: {
              NAME: { type: ArgumentType.STRING, defaultValue: "q" },
              URL: { type: ArgumentType.STRING, defaultValue: "https://example.com/?q=hello" },
            },
          },
          {
            opcode: "setQuery",
            blockType: BlockType.REPORTER,
            text: T("URL [URL] with query [NAME] = [VALUE]"),
            arguments: {
              URL: { type: ArgumentType.STRING, defaultValue: "https://example.com/" },
              NAME: { type: ArgumentType.STRING, defaultValue: "q" },
              VALUE: { type: ArgumentType.STRING, defaultValue: "hello world" },
            },
          },
          {
            opcode: "removeQuery",
            blockType: BlockType.REPORTER,
            text: T("URL [URL] without query [NAME]"),
            arguments: {
              URL: { type: ArgumentType.STRING, defaultValue: "https://example.com/?q=hello&page=2" },
              NAME: { type: ArgumentType.STRING, defaultValue: "q" },
            },
          },
          {
            opcode: "resolve",
            blockType: BlockType.REPORTER,
            text: T("resolve [RELATIVE] against [BASE]"),
            arguments: {
              RELATIVE: { type: ArgumentType.STRING, defaultValue: "../image.png" },
              BASE: { type: ArgumentType.STRING, defaultValue: "https://example.com/folder/page.html" },
            },
          },
          {
            opcode: "valid",
            blockType: BlockType.BOOLEAN,
            text: T("URL [URL] is valid?"),
            arguments: {
              URL: { type: ArgumentType.STRING, defaultValue: "https://example.com/" },
            },
          },
        ],
        menus: {
          parts: {
            acceptReporters: true,
            items: [
              "protocol",
              "origin",
              "host",
              "hostname",
              "port",
              "pathname",
              "search",
              "hash",
              "username",
              "password",
            ].map((value) => ({ text: T(value), value })),
          },
        },
      };
    }

    part(args) {
      const url = parseURL(args.URL);
      if (!url) return "";
      const part = Cast.toString(args.PART);
      return Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(url), part) || part in url
        ? Cast.toString(url[part] ?? "")
        : "";
    }

    query(args) {
      const url = parseURL(args.URL);
      if (!url) return "";
      return url.searchParams.get(Cast.toString(args.NAME)) ?? "";
    }

    setQuery(args) {
      const url = parseURL(args.URL);
      if (!url) return "";
      url.searchParams.set(Cast.toString(args.NAME), Cast.toString(args.VALUE));
      return url.toString();
    }

    removeQuery(args) {
      const url = parseURL(args.URL);
      if (!url) return "";
      url.searchParams.delete(Cast.toString(args.NAME));
      return url.toString();
    }

    resolve(args) {
      try {
        return new URL(Cast.toString(args.RELATIVE), Cast.toString(args.BASE)).toString();
      } catch (error) {
        return "";
      }
    }

    valid(args) {
      return Boolean(parseURL(args.URL));
    }
  }

  Scratch.extensions.register(new URLTools());
})(Scratch);
