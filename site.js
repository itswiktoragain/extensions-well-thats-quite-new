const REPO = "itswiktoragain/extensions-well-thats-quite-new";
const BRANCH = "master";
const RAW_ROOT = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const GITHUB_ROOT = `https://github.com/${REPO}/blob/${BRANCH}`;

const grid = document.getElementById("extensionGrid");
const statusEl = document.getElementById("status");
const totalCount = document.getElementById("totalCount");
const loadedCount = document.getElementById("loadedCount");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const template = document.getElementById("extensionCardTemplate");

let allExtensions = [];

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
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
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

function bannerImageUrls(path) {
  const parts = path.split("/");
  const filename = parts.pop();
  const dir = parts.join("/");
  const names = [filename, filename.toLowerCase()];
  const extensions = ["svg", "png", "webp", "jpg", "jpeg"];
  const urls = [];

  for (const name of names) {
    for (const ext of extensions) {
      urls.push(`${RAW_ROOT}/images/${dir ? `${dir}/` : ""}${name}.${ext}`);
    }
  }

  return [...new Set(urls)];
}

function loadFirstWorkingImage(img, wrap, urls, index = 0) {
  if (index >= urls.length) {
    wrap.classList.add("fallback");
    img.removeAttribute("src");
    return;
  }

  img.onload = () => wrap.classList.remove("fallback");
  img.onerror = () => loadFirstWorkingImage(img, wrap, urls, index + 1);
  img.src = urls[index];
}

function encodeSvgAsDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function extractExtensionIcon(source) {
  const btoaTemplate = source.match(
    /(?:menuIconURI|iconURI)\s*=\s*["'`]data:image\/svg\+xml;base64,["'`]\s*\+\s*btoa\(\s*`([\s\S]*?)`\s*\)/i
  );
  if (btoaTemplate && !btoaTemplate[1].includes("${")) {
    return encodeSvgAsDataUri(btoaTemplate[1]);
  }

  const encodedTemplate = source.match(
    /(?:menuIconURI|iconURI)\s*=\s*["'`]data:image\/svg\+xml(?:;charset=utf-8)?[,;][^"'`]*["'`]\s*\+\s*encodeURIComponent\(\s*`([\s\S]*?)`\s*\)/i
  );
  if (encodedTemplate && !encodedTemplate[1].includes("${")) {
    return encodeSvgAsDataUri(encodedTemplate[1]);
  }

  const namedDirect = source.match(
    /(?:menuIconURI|iconURI)\s*(?:=|:)\s*["'`](data:image\/[^"'`\s]+)["'`]/i
  );
  if (namedDirect) return namedDirect[1];

  const anyDataImage = source.match(/["'`](data:image\/[^"'`\s]+)["'`]/i);
  return anyDataImage ? anyDataImage[1] : null;
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
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol");
      }

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
  loadFirstWorkingImage(bannerImg, bannerWrap, bannerImageUrls(ext.path));

  const iconImg = fragment.querySelector(".extension-icon");
  const iconWrap = fragment.querySelector(".extension-icon-wrap");
  iconImg.alt = ext.name ? `${ext.name} icon` : "Extension icon";
  if (ext.icon) {
    iconImg.onload = () => iconWrap.classList.remove("fallback");
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

  const sourceLink = fragment.querySelector(".source-link");
  sourceLink.href = `${GITHUB_ROOT}/extensions/${ext.path}.js`;

  const rawLink = fragment.querySelector(".raw-link");
  rawLink.href = `${RAW_ROOT}/extensions/${ext.path}.js`;

  const standardKeys = new Set(["Name", "ID", "Description", "By", "License"]);
  const extras = Object.entries(ext.meta).filter(([key, value]) => !standardKeys.has(key) && value);
  if (extras.length) {
    const details = fragment.querySelector(".extra-details");
    const dl = fragment.querySelector(".extra-metadata");
    details.hidden = false;
    for (const [key, value] of extras) dl.append(makeMetaRow(key, value));
  }

  article.dataset.search = ext.search;
  return fragment;
}

function render(filter = "") {
  const query = filter.trim().toLowerCase();
  grid.replaceChildren();

  const matches = allExtensions.filter((ext) => !query || ext.search.includes(query));
  for (const ext of matches) grid.append(buildCard(ext));

  emptyState.hidden = matches.length !== 0;
  statusEl.textContent = `${matches.length} of ${allExtensions.length} extensions shown`;
}

async function loadExtension(path) {
  const response = await fetch(`${RAW_ROOT}/extensions/${path}.js`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  const source = await response.text();
  const meta = parseHeaderMetadata(source);
  const fallbackName = path.split("/").pop().replace(/[-_]/g, " ");

  const ext = {
    path,
    meta,
    icon: extractExtensionIcon(source),
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
}

async function main() {
  try {
    const listResponse = await fetch(`${RAW_ROOT}/extensions/extensions.json`);
    if (!listResponse.ok) throw new Error(`Could not load extension list (${listResponse.status})`);

    const paths = parseExtensionList(await listResponse.text());
    totalCount.textContent = paths.length;

    const settled = await Promise.allSettled(paths.map(loadExtension));
    allExtensions = settled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    loadedCount.textContent = allExtensions.length;
    render();

    const failed = settled.length - allExtensions.length;
    if (failed) {
      statusEl.textContent += ` · ${failed} file${failed === 1 ? "" : "s"} could not be read`;
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Could not load the extension gallery: ${error.message}`;
    totalCount.textContent = "—";
    loadedCount.textContent = "—";
  }
}

searchInput.addEventListener("input", () => render(searchInput.value));
main();
