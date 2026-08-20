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

function parseExtensionList(text) {
  const withoutLineComments = text.replace(/^\s*\/\/.*$/gm, "");
  const withoutBlockComments = withoutLineComments.replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(withoutBlockComments);
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

function candidateImageUrls(path) {
  const parts = path.split("/");
  const filename = parts.pop();
  const dir = parts.join("/");
  const lowerFilename = filename.toLowerCase();
  const bases = [filename, lowerFilename];
  const extensions = ["svg", "png", "webp", "jpg", "jpeg"];
  const urls = [];
  for (const base of bases) {
    for (const ext of extensions) {
      urls.push(`${RAW_ROOT}/images/${dir ? `${dir}/` : ""}${base}.${ext}`);
    }
  }
  return [...new Set(urls)];
}

function loadFirstWorkingImage(img, wrap, urls, index = 0) {
  if (index >= urls.length) {
    wrap.classList.add("fallback");
    return;
  }
  img.onerror = () => loadFirstWorkingImage(img, wrap, urls, index + 1);
  img.src = urls[index];
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
  const img = fragment.querySelector(".extension-icon");
  const wrap = fragment.querySelector(".extension-icon-wrap");

  fragment.querySelector(".extension-name").textContent = ext.name;
  fragment.querySelector(".extension-path").textContent = ext.path;
  fragment.querySelector(".extension-description").textContent = ext.description;
  fragment.querySelector(".meta-id").textContent = ext.id;
  fragment.querySelector(".meta-by").textContent = ext.by;
  fragment.querySelector(".meta-license").textContent = ext.license;

  img.alt = ext.name ? `${ext.name} icon` : "Extension icon";
  loadFirstWorkingImage(img, wrap, candidateImageUrls(ext.path));

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

  article.dataset.search = [
    ext.name,
    ext.path,
    ext.id,
    ext.description,
    ext.by,
    ext.license,
    ...Object.entries(ext.meta).flat()
  ].join(" ").toLowerCase();

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
    name: metadataValue(meta, "Name", fallbackName),
    id: metadataValue(meta, "ID"),
    description: metadataValue(meta, "Description", "No description provided."),
    by: metadataValue(meta, "By"),
    license: metadataValue(meta, "License")
  };
  ext.search = [ext.name, ext.path, ext.id, ext.description, ext.by, ext.license, ...Object.entries(meta).flat()].join(" ").toLowerCase();
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
    statusEl.textContent = "Could not load the extension gallery. Check the repository or try again later.";
    totalCount.textContent = "—";
    loadedCount.textContent = "—";
  }
}

searchInput.addEventListener("input", () => render(searchInput.value));
main();
