// Name: Scratch API
// ID: itswiktoragainscratchapi
// Description: Get public user, project, studio, search, explore, news, featured, and other data from the official Scratch API.
// By: itswiktoragain
// License: MPL-2.0
/* eslint-disable extension/use-scratch-fetch */
(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Scratch API must be run unsandboxed");
  }

  const { ArgumentType, BlockType, Cast } = Scratch;
  const API = "https://api.scratch.mit.edu";
  const PROXY = "https://hxngklilobfnmdlhewbn.supabase.co/functions/v1/scratch-api-proxy";

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="#ffbb52"/><g fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"><ellipse cx="26" cy="14" rx="11" ry="5"/><path d="M15 14v8c0 3 5 5 11 5s11-2 11-5v-8M15 22v8c0 3 5 5 11 5s11-2 11-5v-8M15 30v7c0 3 5 5 11 5s11-2 11-5v-7"/></g></svg>`;
  const iconURI = `data:image/svg+xml,${encodeURIComponent(iconSvg)}`;

  const encode = (value) => encodeURIComponent(Cast.toString(value));
  const limit = (value) => Math.max(1, Math.min(40, Math.floor(Cast.toNumber(value) || 1)));
  const offset = (value) => Math.max(0, Math.floor(Cast.toNumber(value) || 0));
  const item = (text, value) => ({ text: Scratch.translate(text), value });

  const getPath = (object, path) => {
    let value = object;
    for (const key of Cast.toString(path).split(".").filter(Boolean)) {
      if (
        value === null ||
        value === undefined ||
        key === "__proto__" ||
        key === "prototype" ||
        key === "constructor"
      ) {
        return "";
      }
      value = value[key];
    }
    if (value === null || value === undefined) return "";
    return typeof value === "object" ? JSON.stringify(value) : value;
  };

  class ScratchAPI {
    constructor() {
      this.lastData = null;
      this.lastURL = "";
      this.lastStatus = 0;
      this.lastError = "";
      this.lastSuccess = false;
      this.cacheSeconds = 60;
      this.cache = new Map();
      this.inflight = new Map();
    }

    getInfo() {
      return {
        id: "itswiktoragainscratchapi",
        name: Scratch.translate("Scratch API"),
        color1: "#ffbb52",
        color2: "#e6a03f",
        color3: "#cc8730",
        menuIconURI: iconURI,
        blockIconURI: iconURI,
        blocks: [
          { blockType: BlockType.LABEL, text: Scratch.translate("Users") },
          {
            opcode: "userField",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[FIELD] of user [USERNAME]"),
            arguments: {
              FIELD: { type: ArgumentType.STRING, menu: "userFields" },
              USERNAME: { type: ArgumentType.STRING, defaultValue: "griffpatch" },
            },
          },
          {
            opcode: "userList",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[TYPE] of user [USERNAME] limit [LIMIT] offset [OFFSET]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "userLists" },
              USERNAME: { type: ArgumentType.STRING, defaultValue: "griffpatch" },
              LIMIT: { type: ArgumentType.NUMBER, defaultValue: 20 },
              OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 },
            },
            disableMonitor: true,
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Projects") },
          {
            opcode: "projectField",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[FIELD] of project [ID]"),
            arguments: {
              FIELD: { type: ArgumentType.STRING, menu: "projectFields" },
              ID: { type: ArgumentType.STRING, defaultValue: "60917032" },
            },
          },
          {
            opcode: "projectList",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[TYPE] of project [ID] limit [LIMIT] offset [OFFSET]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "projectLists" },
              ID: { type: ArgumentType.STRING, defaultValue: "60917032" },
              LIMIT: { type: ArgumentType.NUMBER, defaultValue: 20 },
              OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 },
            },
            disableMonitor: true,
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Studios") },
          {
            opcode: "studioField",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[FIELD] of studio [ID]"),
            arguments: {
              FIELD: { type: ArgumentType.STRING, menu: "studioFields" },
              ID: { type: ArgumentType.STRING, defaultValue: "1000" },
            },
          },
          {
            opcode: "studioList",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[TYPE] of studio [ID] limit [LIMIT] offset [OFFSET]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "studioLists" },
              ID: { type: ArgumentType.STRING, defaultValue: "1000" },
              LIMIT: { type: ArgumentType.NUMBER, defaultValue: 20 },
              OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 },
            },
            disableMonitor: true,
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Discover") },
          {
            opcode: "search",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("search [TYPE] for [QUERY] mode [MODE] limit [LIMIT] offset [OFFSET]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "searchTypes" },
              QUERY: { type: ArgumentType.STRING, defaultValue: "platformer" },
              MODE: { type: ArgumentType.STRING, menu: "modes" },
              LIMIT: { type: ArgumentType.NUMBER, defaultValue: 20 },
              OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 },
            },
            disableMonitor: true,
          },
          {
            opcode: "explore",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("explore [TYPE] mode [MODE] limit [LIMIT] offset [OFFSET]"),
            arguments: {
              TYPE: { type: ArgumentType.STRING, menu: "searchTypes" },
              MODE: { type: ArgumentType.STRING, menu: "modes" },
              LIMIT: { type: ArgumentType.NUMBER, defaultValue: 20 },
              OFFSET: { type: ArgumentType.NUMBER, defaultValue: 0 },
            },
            disableMonitor: true,
          },
          {
            opcode: "feed",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("Scratch [FEED] JSON"),
            arguments: { FEED: { type: ArgumentType.STRING, menu: "feeds" } },
            disableMonitor: true,
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Advanced") },
          {
            opcode: "rawEndpoint",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("GET Scratch API endpoint [PATH]"),
            arguments: {
              PATH: { type: ArgumentType.STRING, defaultValue: "/users/griffpatch" },
            },
            disableMonitor: true,
          },
          {
            opcode: "lastProperty",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("[PATH] from last response"),
            arguments: {
              PATH: { type: ArgumentType.STRING, defaultValue: "stats.views" },
            },
          },
          { opcode: "lastJSON", blockType: BlockType.REPORTER, text: Scratch.translate("last response JSON"), disableMonitor: true },
          { opcode: "lastURLReporter", blockType: BlockType.REPORTER, text: Scratch.translate("last request URL") },
          { opcode: "lastStatusReporter", blockType: BlockType.REPORTER, text: Scratch.translate("last HTTP status") },
          { opcode: "lastErrorReporter", blockType: BlockType.REPORTER, text: Scratch.translate("last request error") },
          { opcode: "lastSuccessReporter", blockType: BlockType.BOOLEAN, text: Scratch.translate("last request succeeded?") },
          {
            opcode: "setCacheSeconds",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set API cache to [SECONDS] seconds"),
            arguments: { SECONDS: { type: ArgumentType.NUMBER, defaultValue: 60 } },
          },
          { opcode: "clearCache", blockType: BlockType.COMMAND, text: Scratch.translate("clear API cache") },
        ],
        menus: {
          userFields: {
            acceptReporters: true,
            items: [
              item("username", "username"),
              item("numeric id", "id"),
              item("Scratch Team?", "scratchteam"),
              item("joined date", "history.joined"),
              item("country", "profile.country"),
              item("about me", "profile.bio"),
              item("what I'm working on", "profile.status"),
              item("avatar 90x90", "profile.images.90x90"),
              item("raw JSON", "__json"),
            ],
          },
          userLists: {
            acceptReporters: true,
            items: [
              item("projects", "projects"),
              item("favorites", "favorites"),
              item("followers", "followers"),
              item("following", "following"),
            ],
          },
          projectFields: {
            acceptReporters: true,
            items: [
              item("title", "title"),
              item("creator", "author.username"),
              item("description", "description"),
              item("instructions", "instructions"),
              item("created date", "history.created"),
              item("modified date", "history.modified"),
              item("shared date", "history.shared"),
              item("views", "stats.views"),
              item("loves", "stats.loves"),
              item("favorites", "stats.favorites"),
              item("remixes", "stats.remixes"),
              item("thumbnail", "image"),
              item("project token", "project_token"),
              item("raw JSON", "__json"),
            ],
          },
          projectLists: {
            acceptReporters: true,
            items: [item("comments", "comments"), item("remixes", "remixes"), item("studios", "studios")],
          },
          studioFields: {
            acceptReporters: true,
            items: [
              item("title", "title"),
              item("host", "host"),
              item("description", "description"),
              item("image", "image"),
              item("created date", "history.created"),
              item("modified date", "history.modified"),
              item("comments", "stats.comments"),
              item("followers", "stats.followers"),
              item("managers", "stats.managers"),
              item("projects", "stats.projects"),
              item("raw JSON", "__json"),
            ],
          },
          studioLists: {
            acceptReporters: true,
            items: [item("projects", "projects"), item("comments", "comments"), item("curators", "curators"), item("managers", "managers")],
          },
          searchTypes: {
            acceptReporters: true,
            items: [item("projects", "projects"), item("studios", "studios")],
          },
          modes: {
            acceptReporters: true,
            items: [item("trending", "trending"), item("popular", "popular"), item("recent", "recent")],
          },
          feeds: {
            acceptReporters: true,
            items: [item("health", "health"), item("news", "news"), item("featured", "featured")],
          },
        },
      };
    }

    async performRequest(url) {
      const response = await fetch(`${PROXY}?path=${encodeURIComponent(url)}`, {
        method: "GET",
        credentials: "omit",
        cache: "default",
        headers: { Accept: "application/json" },
      });
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          this.lastError = "Proxy returned invalid JSON.";
          this.lastSuccess = false;
          this.lastStatus = response.status;
          return null;
        }
      }
      this.lastStatus = response.status;
      if (!response.ok) {
        this.lastError = data && data.error ? Cast.toString(data.error) : `HTTP ${response.status} ${response.statusText}`.trim();
        this.lastSuccess = false;
        return null;
      }
      this.lastData = data;
      this.lastError = "";
      this.lastSuccess = true;
      this.cache.set(url, { time: Date.now(), status: response.status, data });
      return data;
    }

    async request(path) {
      const cleanPath = Cast.toString(path).startsWith("/") ? Cast.toString(path) : `/${Cast.toString(path)}`;
      const url = `${API}${cleanPath}`;
      const cached = this.cache.get(url);
      const now = Date.now();

      if (cached && now - cached.time < this.cacheSeconds * 1000) {
        this.lastData = cached.data;
        this.lastURL = url;
        this.lastStatus = cached.status;
        this.lastError = "";
        this.lastSuccess = true;
        return cached.data;
      }

      this.lastURL = url;
      this.lastStatus = 0;
      this.lastError = "";
      this.lastSuccess = false;

      if (this.inflight.has(url)) return this.inflight.get(url);
      const promise = this.performRequest(url).finally(() => this.inflight.delete(url));
      this.inflight.set(url, promise);
      return promise;
    }

    async json(path) {
      const data = await this.request(path);
      return data === null ? "" : JSON.stringify(data);
    }

    async field(path, field) {
      const data = await this.request(path);
      if (data === null) return "";
      return field === "__json" ? JSON.stringify(data) : getPath(data, field);
    }

    userField(args) {
      return this.field(`/users/${encode(args.USERNAME)}`, Cast.toString(args.FIELD));
    }

    userList(args) {
      const type = Cast.toString(args.TYPE);
      if (!["projects", "favorites", "followers", "following"].includes(type)) return "";
      return this.json(`/users/${encode(args.USERNAME)}/${type}?limit=${limit(args.LIMIT)}&offset=${offset(args.OFFSET)}`);
    }

    projectField(args) {
      return this.field(`/projects/${encode(args.ID)}`, Cast.toString(args.FIELD));
    }

    async projectList(args) {
      const type = Cast.toString(args.TYPE);
      if (!["comments", "remixes", "studios"].includes(type)) return "";
      const projectId = encode(args.ID);
      const query = `limit=${limit(args.LIMIT)}&offset=${offset(args.OFFSET)}`;

      if (type === "comments") {
        const metadata = await this.request(`/projects/${projectId}`);
        if (!metadata) return "";
        const username = getPath(metadata, "author.username");
        if (!username) {
          this.lastError = Scratch.translate("Could not determine the project's creator.");
          this.lastSuccess = false;
          return "";
        }
        return this.json(`/users/${encode(username)}/projects/${projectId}/comments?${query}`);
      }

      return this.json(`/projects/${projectId}/${type}?${query}`);
    }

    studioField(args) {
      return this.field(`/studios/${encode(args.ID)}`, Cast.toString(args.FIELD));
    }

    studioList(args) {
      const type = Cast.toString(args.TYPE);
      if (!["projects", "comments", "curators", "managers"].includes(type)) return "";
      return this.json(`/studios/${encode(args.ID)}/${type}?limit=${limit(args.LIMIT)}&offset=${offset(args.OFFSET)}`);
    }

    search(args) {
      const type = Cast.toString(args.TYPE) === "studios" ? "studios" : "projects";
      const mode = ["trending", "popular", "recent"].includes(Cast.toString(args.MODE)) ? Cast.toString(args.MODE) : "trending";
      return this.json(`/search/${type}?q=${encode(args.QUERY)}&mode=${mode}&limit=${limit(args.LIMIT)}&offset=${offset(args.OFFSET)}`);
    }

    explore(args) {
      const type = Cast.toString(args.TYPE) === "studios" ? "studios" : "projects";
      const mode = ["trending", "popular", "recent"].includes(Cast.toString(args.MODE)) ? Cast.toString(args.MODE) : "trending";
      return this.json(`/explore/${type}?mode=${mode}&q=*&limit=${limit(args.LIMIT)}&offset=${offset(args.OFFSET)}`);
    }

    feed(args) {
      const feed = Cast.toString(args.FEED);
      if (feed === "health") return this.json("/health");
      if (feed === "featured") return this.json("/proxy/featured");
      return this.json("/news?limit=40&offset=0");
    }

    rawEndpoint(args) {
      let path = Cast.toString(args.PATH).trim();
      if (/^https?:\/\//i.test(path)) {
        try {
          const parsed = new URL(path);
          if (parsed.origin !== API) {
            this.lastError = Scratch.translate("Only api.scratch.mit.edu endpoints are allowed.");
            this.lastSuccess = false;
            return "";
          }
          path = `${parsed.pathname}${parsed.search}`;
        } catch {
          this.lastError = Scratch.translate("Invalid URL.");
          this.lastSuccess = false;
          return "";
        }
      }
      return this.json(path);
    }

    lastProperty(args) {
      return this.lastData === null ? "" : getPath(this.lastData, args.PATH);
    }

    lastJSON() {
      return this.lastData === null ? "" : JSON.stringify(this.lastData);
    }

    lastURLReporter() {
      return this.lastURL;
    }

    lastStatusReporter() {
      return this.lastStatus;
    }

    lastErrorReporter() {
      return this.lastError;
    }

    lastSuccessReporter() {
      return this.lastSuccess;
    }

    setCacheSeconds(args) {
      this.cacheSeconds = Math.max(0, Math.min(3600, Cast.toNumber(args.SECONDS) || 0));
      if (this.cacheSeconds === 0) this.cache.clear();
    }

    clearCache() {
      this.cache.clear();
    }
  }

  Scratch.extensions.register(new ScratchAPI());
})(Scratch);
