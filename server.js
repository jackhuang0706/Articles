const express = require("express");
const path = require("path");
const fs = require("fs");
const { marked } = require("marked");
const matter = require("gray-matter");
const hljs = require("highlight.js");
const markedKatex = require("marked-katex-extension");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

const renderer = {
  heading(token) {
    // 生成 slug ID
    const id = token.text
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // 移除 HTML 標籤
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、數字、中文、空格、連字號
      .trim()
      .replace(/\s+/g, '-') // 空格轉連字號
      .replace(/-+/g, '-') // 多個連字號合併
      .replace(/^-|-$/g, ''); // 移除首尾連字號
    return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>\n`;
  },
  code(codeArg, infoString = "") {
    let source = "";
    let info = infoString || "";

    if (codeArg && typeof codeArg === "object") {
      const token = codeArg;
      source = typeof token.text === "string" ? token.text : String(token.text ?? "");
      // meta 是語言後面的字串（例如 "[]"），lang 是主要語言
      const meta = typeof token.meta === "string" ? token.meta : "";
      info = [token.lang || "", meta].filter(Boolean).join(" ");
    } else {
      source = typeof codeArg === "string" ? codeArg : String(codeArg ?? "");
    }

    info = String(info).trim();
    const langMatch = info.match(/^([^\s\[]+)/);
    const metaMatch = info.match(/\[(.*)\]/);
    const lang = langMatch ? langMatch[1] : "";
    const variant = metaMatch ? metaMatch[1] : null;
    const langClass = lang ? `language-${lang}` : "";

    const highlighted = lang && hljs.getLanguage(lang)
      ? hljs.highlight(source, { language: lang }).value
      : hljs.highlightAuto(source).value;

    const variantAttr = variant !== null ? ` data-variant="${escapeAttr(variant)}"` : "";
    const classes = ["hljs", langClass].filter(Boolean).join(" ");
    return `<pre${variantAttr}><code class="${classes}">${highlighted}</code></pre>`;
  }
};

marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
  mangle: false
});

marked.use({ renderer });
marked.use(markedKatex({ throwOnError: false }));

const app = express();
const PORT = process.env.PORT || 3000;

const locales = [
  { code: "zh", prefix: "", i18n: { heroTitle: "文章列表", back: "← 返回列表", toc: "目錄" } },
  { code: "en", prefix: "en", i18n: { heroTitle: "Articles", back: "← Back to list", toc: "Table of contents" } }
];

const localeMap = new Map(locales.map((l) => [l.code, l]));

function parseLocaleFromFilename(filename) {
  const match = filename.match(/^(.*?)(?:_([a-z]{2}))?\.md$/i);
  if (!match) return null;
  const baseId = match[1];
  const lang = match[2] && localeMap.has(match[2].toLowerCase()) ? match[2].toLowerCase() : "zh";
  return { baseId, lang };
}

// Load articles grouped by locale
async function loadArticles() {
  const contentDir = path.join(__dirname, "content");
  const files = await fs.promises.readdir(contentDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const byLocale = {};
  locales.forEach((l) => { byLocale[l.code] = []; });

  for (const file of mdFiles) {
    const parsed = parseLocaleFromFilename(file);
    if (!parsed) continue;
    const { baseId, lang } = parsed;
    const filePath = path.join(contentDir, file);
    const raw = await fs.promises.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const stats = await fs.promises.stat(filePath);

    const id = baseId;
    const target = byLocale[lang];
    if (!target) continue;

    target.push({
      id,
      title: data.title || id,
      summary: data.summary || "",
      date: data.date || stats.mtime.toISOString().split("T")[0],
      tags: data.tags || [],
      file: `/content/${file}`,
      content
    });
  }

  Object.values(byLocale).forEach((arr) => arr.sort((a, b) => new Date(b.date) - new Date(a.date)));
  return byLocale;
}

let articlesByLocale = {};
loadArticles().then((loaded) => {
  articlesByLocale = loaded;
  const counts = Object.entries(loaded).map(([k, v]) => `${k}:${v.length}`).join(", ");
  console.log(`Loaded articles per locale -> ${counts}`);
}).catch((err) => {
  console.error("Failed to load articles:", err);
});

app.set("view engine", "ejs");
app.set("views", __dirname);

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/content", express.static(path.join(__dirname, "content")));

// Redirect trailing slash to canonical form (except root)
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith("/")) {
    const target = req.path.replace(/\/$/, "");
    const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, target + qs);
  }
  next();
});

function renderIndex(localeCode, req, res) {
  const locale = localeMap.get(localeCode) || localeMap.get("zh");
  const list = articlesByLocale[locale.code] || [];
  // For English, we link as /:id/en instead of /en/:id
  const pageBase = "/";
  const pageExt = locale.code === "en" ? "/en" : "";
  res.render("index", {
    articles: list,
    assetBase: "/",
    pageBase,
    pageExt,
    i18n: locale.i18n,
    locale: locale.code
  });
}

function extractTOC(content) {
  const toc = [];
  const tokens = marked.lexer(content);
  tokens.forEach((token) => {
    if (token.type === "heading" && token.depth >= 2 && token.depth <= 3) {
      const text = token.text;
      // 使用與 marked 相同的 slug 生成邏輯
      const id = text
        .toLowerCase()
        .replace(/<[^>]*>/g, '') // 移除 HTML 標籤
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、數字、中文、空格、連字號
        .trim()
        .replace(/\s+/g, '-') // 空格轉連字號
        .replace(/-+/g, '-') // 多個連字號合併為一個
        .replace(/^-|-$/g, ''); // 移除首尾連字號
      toc.push({ level: token.depth, text, id });
    }
  });
  return toc;
}

function renderArticle(localeCode, req, res) {
  const locale = localeMap.get(localeCode) || localeMap.get("zh");
  const list = articlesByLocale[locale.code] || [];
  const base = locale.prefix ? `/${locale.prefix}/` : "/";
  const id = req.params.id;
  const article = list.find((a) => a.id === id);
  if (!article) {
    return res.status(404).send("Article not found");
  }
  try {
    const toc = extractTOC(article.content);
    const html = marked.parse(article.content, { mangle: false, langPrefix: "hljs language-" });
    res.render("article", {
      article,
      articleHtml: html,
      toc,
      assetBase: "/",
      pageBase: base,
      homeHref: base,
      i18n: locale.i18n,
      locale: locale.code
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load article");
  }
}

// Index routes
app.get("/", (req, res) => renderIndex("zh", req, res));
// Optional compatibility: redirect /zh to root
app.get("/zh", (req, res) => res.redirect(301, "/"));
app.get("/en", (req, res) => renderIndex("en", req, res));

// Article routes (specific before catch-all)
// English articles as /:id/en
app.get("/:id/en", (req, res) => renderArticle("en", req, res));

// Default catch-all for zh (Chinese is root)
app.get("/:id", (req, res) => renderArticle("zh", req, res));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
