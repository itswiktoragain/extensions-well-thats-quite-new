const SOURCES = {
  custom: {
    id: "custom",
    label: "Well That's Quite New",
    repo: "itswiktoragain/extensions-well-thats-quite-new",
    branch: "master"
  },
  official: {
    id: "official",
    label: "Official TurboWarp",
    repo: "TurboWarp/extensions",
    branch: "master"
  }
};

for (const source of Object.values(SOURCES)) {
  source.rawRoot = `https://raw.githubusercontent.com/${source.repo}/${source.branch}`;
  source.githubRoot = `https://github.com/${source.repo}/blob/${source.branch}`;
}

const grid = document.getElementById("extensionGrid");
const statusEl = document.getElementById("status");
const totalCount = document.getElementById("totalCount");
const loadedCount = document.getElementById("loadedCount");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const template = document.getElementById("extensionCardTemplate");
const sourceTabs = [...document.querySelectorAll(".source-tab")];

let activeSourceId = "custom";
let allExtensions = [];
let loadGeneration = 0;
const sourceCache = new Map();

function stripJsonComments(text) {
  let result = "";
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i++;
      } else if (char === "\n") {
        result += char;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }

    result += char;
  }

  return result;
}

function parseExtensionList(text) {
  return JSON.parse(stripJsonComments(text));
}

function parseHeaderMetadata(source) {
  const metadata = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\/\/\s*([^:]+):\s*(.*)$/);
    if (!match) {
      if (line.trim() && !line.trim().startsWith("//")) break;
      continue;
    }
    metadata[match[1].trim()] = match[2].trim();
  }
  return metadata;
}

function metadataValue(meta, key, fallback = "Not specified") {
  return meta[key] || fallback;
}

function bannerImageUrls(path, source) {
  const parts = path.split("/");
  const filename = parts.pop();
  const dir = parts.join("/");
  const names = [filename, filename.toLowerCase()];
  const extensions = ["svg", "png", "webp", "jpg", "jpeg"];
  const urls = [];

  for (const name of names) {
    for (const ext of extensions) {
      urls.push(`${source.rawRoot}/images/${dir ? `${dir}/` : ""}${name}.${ext}`);
    }
  }
  return [...new Set(urls)];
}

function loadFirstWorkingImage(img, wrap, urls, index = 0, onLoad = null, useCors = false) {
  if (index >= urls.length) {
    wrap.classList.add("fallback");
    img.removeAttribute("src");
    return;
  }

  if (useCors) img.crossOrigin = "anonymous";
  img.onload = () => {
    wrap.classList.remove("fallback");
    if (onLoad) onLoad(img);
  };
  img.onerror = () => loadFirstWorkingImage(img, wrap, urls, index + 1, onLoad, useCors);
  img.src = urls[index];
}

function relativeLuminance(r, g, b) {
  const convert = (value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}

function applyTileColor(article, r, g, b) {
  const lightText = relativeLuminance(r, g, b) < 0.42;
  article.style.setProperty("--tile-bg", `rgb(${r}, ${g}, ${b})`);
  article.style.setProperty("--tile-fg", lightText ? "#ffffff" : "#111111");
  article.style.setProperty("--tile-muted", lightText ? "rgba(255,255,255,.78)" : "rgba(0,0,0,.68)");
  article.style.setProperty("--tile-link", lightText ? "#ffffff" : "#003f6b");
}

function applyProminentBottomBannerColor(img, article) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 40;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    const bottomStart = Math.floor(canvas.height * 0.75);
    const pixels = context.getImageData(0, bottomStart, canvas.width, canvas.height - bottomStart).data;
    const buckets = new Map();

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a < 128) continue;

      const key = `${r >> 5}:${g >> 5}:${b >> 5}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { count: 0, r: 0, g: 0, b: 0 };
        buckets.set(key, bucket);
      }
      bucket.count++;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    }

    let winner = null;
    for (const bucket of buckets.values()) {
      if (!winner || bucket.count > winner.count) winner = bucket;
    }
    if (!winner || winner.count === 0) return;

    applyTileColor(
      article,
      Math.round(winner.r / winner.count),
      Math.round(winner.g / winner.count),
      Math.round(winner.b / winner.count)
    );
  } catch (error) {
    console.debug("Could not sample bottom banner color", error);
  }
}

function encodeSvgAsDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function extractExtensionIcon(source) {
  const btoaTemplate = source.match(/(?:menuIconURI|iconURI)\s*=\s*["'`]data:image\/svg\+xml;base64,["'`]\s*\+\s*btoa\(\s*`([\s\S]*?)`\s*\)/i);
  if (btoaTemplate && !btoaTemplate[1].includes("${")) return encodeSvgAsDataUri(btoaTemplate[1]);

  const encodedTemplate = source.match(/(?:menuIconURI|iconURI)\s*=\s*["'`]data:image\/svg\+xml(?:;charset=utf-8)?[,;][^"'`]*["'`]\s*\+\s*encodeURIComponent\(\s*`([\s\S]*?)`\s*\)/i);
  if (encodedTemplate && !encodedTemplate[1].includes("${")) return encodeSvgAsDataUri(encodedTemplate[1]);

  const namedDirect = source.match(/(?:menuIconURI|iconURI)\s*(?:=|:)\s*["'`](data:image\/[^"'`\s]+)["'`]/i);
  if (namedDirect) return namedDirect[1];

  const anyDataImage = source.match(/["'`](data:image\/[^"'`\s]+)["'`]/i);
  return anyDataImage ? anyDataImage[1] : null;
}

function cropTransparentIcon(img, wrap) {
  if (img.dataset.cropped === "1") {
    wrap.classList.remove("fallback");
    return;
  }

  try {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    if (!naturalWidth || !naturalHeight) {
      wrap.classList.remove("fallback");
      return;
    }

    const scale = Math.min(1, 256 / Math.max(naturalWidth, naturalHeight));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0, width, height);

    const pixels = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = pixels[(y * width + x) * 4 + 3];
        if (alpha <= 12) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX || maxY < minY) {
      wrap.classList.add("fallback");
      return;
    }

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    if (cropWidth === width && cropHeight === height) {
      wrap.classList.remove("fallback");
      return;
    }

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    croppedCanvas.getContext("2d").putImageData(
      context.getImageData(minX, minY, cropWidth, cropHeight),
      0,
      0
    );

    img.dataset.cropped = "1";
    img.onload = () => wrap.classList.remove("fallback");
    img.onerror = () => wrap.classList.add("fallback");
    img.src = croppedCanvas.toDataURL("image/png");
  } catch (error) {
    console.debug("Could not crop icon whitespace", error);
    wrap.classList.remove("fallback");
  }
}

function renderCreatorLinks(container, raw) {
  container.replaceChildren();

  if (!raw || raw === "Not specified") {
    container.textContent = raw || "Not specified";
    return;
  }

  const chunks = raw.split(/(,\s*|;\s*|\s+and\s+)/i);
  for (const chunk of chunks) {
    if (!chunk) continue;

    if (/^(,\s*|;\s*|\s+and\s+)$/i.test(chunk)) {
      container.append(document.createTextNode(chunk));
      continue;
    }

    const match = chunk.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    if (!match) {
      container.append(document.createTextNode(chunk));
      continue;
    }

    const name = match[1].trim() || match[2].trim();
    const href = match[2].trim();

    try {
      const url = new URL(href);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported protocol");
      const link = document.createElement("a");
      link.href = url.href;
      link.textContent = name;
      link.target = "_blank";
      link.rel = "noreferrer";
      container.append(link);
    } catch {
      container.append(document.createTextNode(chunk));
    }
  }
}

function makeMetaRow(key, value) {
  const row = document.createElement("div");
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = key;
  dd.textContent = value;
  row.append(dt, dd);
  return row;
}

function buildCard(ext) {
  const fragment = template.content.cloneNode(true);
  const article = fragment.querySelector(".extension-card");

  const bannerImg = fragment.querySelector(".extension-banner");
  const bannerWrap = fragment.querySelector(".extension-banner-wrap");
  bannerImg.alt = ext.name ? `${ext.name} banner` : "Extension banner";
  loadFirstWorkingImage(
    bannerImg,
    bannerWrap,
    bannerImageUrls(ext.path, ext.source),
    0,
    (img) => applyProminentBottomBannerColor(img, article),
    true
  );

  const iconImg = fragment.querySelector(".extension-icon");
  const iconWrap = fragment.querySelector(".extension-icon-wrap");
  iconImg.alt = ext.name ? `${ext.name} icon` : "Extension icon";

  if (ext.icon) {
    iconImg.onload = () => cropTransparentIcon(iconImg, iconWrap);
    iconImg.onerror = () => iconWrap.classList.add("fallback");
    iconImg.src = ext.icon;
  } else {
    iconWrap.classList.add("fallback");
  }

  fragment.querySelector(".extension-name").textContent = ext.name;
  fragment.querySelector(".extension-path").textContent = ext.path;
  fragment.querySelector(".extension-description").textContent = ext.description;
  fragment.querySelector(".meta-id").textContent = ext.id;
  renderCreatorLinks(fragment.querySelector(".meta-by"), ext.by);
  fragment.querySelector(".meta-license").textContent = ext.license;

  fragment.querySelector(".source-link").href = `${ext.source.githubRoot}/extensions/${ext.path}.js`;
  fragment.querySelector(".raw-link").href = `${ext.source.rawRoot}/extensions/${ext.path}.js`;

  const standardKeys = new Set(["Name", "ID", "Description", "By", "License"]);
  const extras = Object.entries(ext.meta).filter(([key, value]) => !standardKeys.has(key) && value);
  if (extras.length) {
    const details = fragment.querySelector(".extra-details");
    const dl = fragment.querySelector(".extra-metadata");
    details.hidden = false;
    for (const [key, value] of extras) dl.append(makeMetaRow(key, value));
  }

  return fragment;
}

function render(filter = "") {
  const query = filter.trim().toLowerCase();
  grid.replaceChildren();

  const matches = allExtensions.filter((ext) => !query || ext.search.includes(query));
  for (const ext of matches) grid.append(buildCard(ext));

  emptyState.hidden = matches.length !== 0;
  const source = SOURCES[activeSourceId];
  statusEl.textContent = `${matches.length} of ${allExtensions.length} extensions shown · ${source.label}`;
}

function makeFallbackExtension(path, source, error = null) {
  const fallbackName = path.split("/").pop().replace(/[-_]/g, " ");
  const description = error
    ? "Metadata could not be loaded, but this extension is listed in the selected gallery."
    : "No description provided.";

  const ext = {
    path,
    source,
    meta: {},
    icon: null,
    name: fallbackName,
    id: "Not specified",
    description,
    by: "Not specified",
    license: "Not specified"
  };
  ext.search = [ext.name, ext.path, ext.id, ext.description, ext.by, ext.license].join(" ").toLowerCase();
  return ext;
}

async function loadExtension(path, source) {
  try {
    const response = await fetch(`${source.rawRoot}/extensions/${path}.js`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const sourceCode = await response.text();
    const meta = parseHeaderMetadata(sourceCode);
    const fallbackName = path.split("/").pop().replace(/[-_]/g, " ");

    const ext = {
      path,
      source,
      meta,
      icon: extractExtensionIcon(sourceCode),
      name: metadataValue(meta, "Name", fallbackName),
      id: metadataValue(meta, "ID"),
      description: metadataValue(meta, "Description", "No description provided."),
      by: metadataValue(meta, "By"),
      license: metadataValue(meta, "License")
    };

    ext.search = [
      ext.name,
      ext.path,
      ext.id,
      ext.description,
      ext.by,
      ext.license,
      ...Object.entries(meta).flat()
    ].join(" ").toLowerCase();

    return ext;
  } catch (error) {
    console.debug(`Could not load ${source.repo}/extensions/${path}.js`, error);
    return makeFallbackExtension(path, source, error);
  }
}

async function mapWithConcurrency(items, limit, worker, onProgress) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let completed = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
      completed++;
      if (onProgress) onProgress(completed, items.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return results;
}

function updateTabs() {
  for (const tab of sourceTabs) {
    const selected = tab.dataset.source === activeSourceId;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
  }
}

async function loadSource(sourceId) {
  const source = SOURCES[sourceId];
  if (!source) return;

  activeSourceId = sourceId;
  const generation = ++loadGeneration;
  updateTabs();

  grid.replaceChildren();
  emptyState.hidden = true;
  totalCount.textContent = "—";
  loadedCount.textContent = "—";
  statusEl.textContent = `Loading ${source.label}…`;

  const cached = sourceCache.get(sourceId);
  if (cached) {
    if (generation !== loadGeneration) return;
    allExtensions = cached.extensions;
    totalCount.textContent = cached.total;
    loadedCount.textContent = cached.extensions.length;
    render(searchInput.value);
    return;
  }

  try {
    const listResponse = await fetch(`${source.rawRoot}/extensions/extensions.json`);
    if (!listResponse.ok) throw new Error(`Could not load extension list (${listResponse.status})`);

    const paths = parseExtensionList(await listResponse.text());
    if (generation !== loadGeneration) return;

    totalCount.textContent = paths.length;
    loadedCount.textContent = "0";

    const extensions = await mapWithConcurrency(
      paths,
      10,
      (path) => loadExtension(path, source),
      (completed, total) => {
        if (generation !== loadGeneration) return;
        loadedCount.textContent = completed;
        statusEl.textContent = `Loading ${source.label} metadata… ${completed}/${total}`;
      }
    );

    if (generation !== loadGeneration) return;

    sourceCache.set(sourceId, { extensions, total: paths.length });
    allExtensions = extensions;
    loadedCount.textContent = extensions.length;
    render(searchInput.value);
  } catch (error) {
    if (generation !== loadGeneration) return;
    console.error(error);
    allExtensions = [];
    grid.replaceChildren();
    emptyState.hidden = false;
    totalCount.textContent = "—";
    loadedCount.textContent = "—";
    statusEl.textContent = `Could not load ${source.label}: ${error.message}`;
  }
}

for (const tab of sourceTabs) {
  tab.addEventListener("click", () => loadSource(tab.dataset.source));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = sourceTabs.indexOf(tab);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = sourceTabs[(index + direction + sourceTabs.length) % sourceTabs.length];
    next.focus();
    loadSource(next.dataset.source);
  });
}

searchInput.addEventListener("input", () => render(searchInput.value));
loadSource("custom");
