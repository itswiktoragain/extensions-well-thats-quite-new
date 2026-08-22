// Name: Scratch API
// ID: itswiktoragainscratchapi
// Description: Get public user, project, studio, news, featured, and other data from the official Scratch API.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
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
  const iconURL = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1Mi4yMzE3MiIgaGVpZ2h0PSI1Mi4yMzE3MiIgdmlld0JveD0iMCwwLDUyLjIzMTcyLDUyLjIzMTcyIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjczLjg4NDE0LC0xMjMuODg0MTQpIj48ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxwYXRoIGQ9Ik0yNzMuODg0MTQsMTUwYzAsLTE0LjQyMzM5IDExLjY5MjQ3LC0yNi4xMTU4NiAyNi4xMTU4NiwtMjYuMTE1ODZjMTQuNDIzMzksMCAyNi4xMTU4NiwxMS42OTI0NyAyNi4xMTU4NiwyNi4xMTU4NmMwLDE0LjQyMzM5IC0xMS42OTI0NywyNi4xMTU4NiAtMjYuMTE1ODYsMjYuMTE1ODZjLTE0LjQyMzM5LDAgLTI2LjExNTg2LC0xMS42OTI0NyAtMjYuMTE1ODYsLTI2LjExNTg2eiIgZmlsbD0iI2ZmYmI1MiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9Im5vbmUiLz48cGF0aCBkPSIiIGZpbGw9IiMwMGMyOGMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGcgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI1Ij48cGF0aCBkPSJNMjk5Ljk2NDksMTQxLjgwNTg0Yy02LjE5ODYxLDAgLTExLjM5MTQ0LC0yLjE3IC0xMS4zOTE0NCwtNC43ODkzNWMwLC0yLjU0NDIyIDUuMTkzMjMsLTQuNzg5MzYgMTEuMzkxNDQsLTQuNzg5MzZjMy4wMDY5OCwwLjAzNjQzIDExLjMwNDM0LDAuMzc3MjcgMTEuNDU5NzgsNC43Mjc0M2MwLjE0NTM3LDQuMDY4NTIgLTguMjY4MzUsNC44NTEyOCAtMTEuNDU5NzgsNC44NTEyOHoiIHN0cm9rZS1vcGFjaXR5PSIwLjE0OTAyIiBzdHJva2U9IiMwMDAwMDAiLz48cGF0aCBkPSJNMzExLjM1NjM0LDE0NS42OTczMWMwLDIuNjE4OTEgLTUuMTkzMjMsNC43ODkzNiAtMTEuMzkxNDQsNC43ODkzNmMtNi4xOTg2MSwtMC4wNzUxMSAtMTEuMzkxNDQsLTIuMjQ1MTQgLTExLjM5MTQ0LC00Ljc4OTM2di01LjUzNzZjMi4yNjE3LDEuODcwNjcgNi40NTAwNSwzLjE0Mjk2IDExLjM5MTQ0LDMuMTQyOTZjNC45NDIxOCwwIDkuMjEzODUsLTEuMjcyMjggMTEuMzkxNDUsLTMuMTQyOTZ6IiBzdHJva2Utb3BhY2l0eT0iMC4xNDkwMiIgc3Ryb2tlPSIjMDAwMDAwIi8+PHBhdGggZD0iTTMxMS4zNTYzNCwxNTQuOTc1ODhjMCwyLjU0NDIyIC01LjE5MzIzLDQuNzg5MzYgLTExLjM5MTQ0LDQuNzg5MzZjLTYuMTk4NjEsMCAtMTEuMzkxNDQsLTIuMTcwMzYgLTExLjM5MTQ0LC00Ljc4OTM2di02LjIxMTEzYzIuMjYxNywxLjg3MDY4IDYuNDQ5NjUsMy4xNDI5NiAxMS4zOTE0NCwzLjE0Mjk2YzQuOTQxNzksMCA5LjIxMzg1LC0xLjI3MTkzIDExLjM5MTQ1LC0zLjE0Mjk2eiIgc3Ryb2tlLW9wYWNpdHk9IjAuMTQ5MDIiIHN0cm9rZT0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik0zMTEuMzU2MzQsMTYyLjk4MzUyYzAsMi42MTg5MSAtNS4xOTMyMyw0Ljc4OTM2IC0xMS4zOTE0NCw0Ljc4OTM2Yy02LjE5ODYxLC0wLjAwMDM1IC0xMS4zOTE0NCwtMi4xNzAzNiAtMTEuMzkxNDQsLTQuNzg5MzZ2LTQuODY0MDZjMi4yNjE3LDEuODcwNjggNi40NTAwNSwzLjE0Mjk2IDExLjM5MTQ0LDMuMTQyOTZjNC45NDIxOCwwIDkuMjEzODUsLTEuMjcyMjggMTEuMzkxNDUsLTMuMTQyOTZ6IiBzdHJva2Utb3BhY2l0eT0iMC4xNDkwMiIgc3Ryb2tlPSIjMDAwMDAwIi8+PHBhdGggZD0iTTMxMS4zNTYzNCwxNDUuNjk3MzFjMCwyLjYxODkxIC01LjE5MzIzLDQuNzg5MzYgLTExLjM5MTQ0LDQuNzg5MzZjLTYuMTk4NjEsLTAuMDc1MTEgLTExLjM5MTQ0LC0yLjI0NTE0IC0xMS4zOTE0NCwtNC43ODkzNnYtNS41Mzc2YzIuMjYxNywxLjg3MDY3IDYuNDUwMDUsMy4xNDI5NiAxMS4zOTE0NCwzLjE0Mjk2YzQuOTQyMTgsMCA5LjIxMzg1LC0xLjI3MjI4IDExLjM5MTQ1LC0zLjE0Mjk2eiIgc3Ryb2tlPSJub25lIi8+PHBhdGggZD0iTTMxMS4zNTYzNCwxNTQuOTc1ODhjMCwyLjU0NDIyIC01LjE5MzIzLDQuNzg5MzYgLTExLjM5MTQ0LDQuNzg5MzZjLTYuMTk4NjEsMCAtMTEuMzkxNDQsLTIuMTcwMzYgLTExLjM5MTQ0LC00Ljc4OTM2di02LjIxMTEzYzIuMjYxNywxLjg3MDY4IDYuNDQ5NjUsMy4xNDI5NiAxMS4zOTE0NCwzLjE0Mjk2YzQuOTQxNzksMCA5LjIxMzg1LC0xLjI3MTkzIDExLjM5MTQ1LC0zLjE0Mjk2eiIgc3Ryb2tlPSJub25lIi8+PHBhdGggZD0iTTMxMS4zNTYzNCwxNjIuOTgzNTJjMCwyLjYxODkxIC01LjE5MzIzLDQuNzg5MzYgLTExLjM5MTQ0LDQuNzg5MzZjLTYuMTk4NjEsLTAuMDAwMzUgLTExLjM5MTQ0LC0yLjE3MDM2IC0xMS4zOTE0NCwtNC43ODkzNnYtNC44NjQwNmMyLjI2MTcsMS44NzA2OCA2LjQ1MDA1LDMuMTQyOTYgMTEuMzkxNDQsMy4xNDI5NmM0Ljk0MjE4LDAgOS4yMTM4NSwtMS4yNzIyOCAxMS4zOTE0NSwtMy4xNDI5NnoiIHN0cm9rZT0ibm9uZSIvPjxwYXRoIGQ9Ik0zMTEuNDI2NTQsMTM3LjAxNjQ4YzAsMi42NDUwOSAtNS4xMTU4NCw0Ljc4OTM1IC0xMS40MjY1NCw0Ljc4OTM1Yy02LjMxMDcsMCAtMTEuNDI2NTQsLTIuMTQ0MjcgLTExLjQyNjU0LC00Ljc4OTM1YzAsLTIuNjQ1MDkgNS4xMTU4NCwtNC43ODkzNiAxMS40MjY1NCwtNC43ODkzNmM2LjMxMDcsMCAxMS40MjY1NCwyLjE0NDI3IDExLjQyNjU0LDQuNzg5MzZ6IiBzdHJva2U9Im5vbmUiLz48L2c+PC9nPjwvZz48L3N2Zz48IS0tcm90YXRpb25DZW50ZXI6MjYuMTE1ODU5NDQ5MTkyODQ6MjYuMTE1ODU5NDQ5MTkyODEtLT4=";

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
        menuIconURI: iconURL,
        blockIconURI: iconURL,
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
