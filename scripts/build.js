const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const ejs = require("ejs");
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
    // 生成 slug ID，並清理 text 中的換行和控制字符
    const cleanText = token.text
      .replace(/\\/g, '') // 移除反斜線
      .replace(/\n/g, '') // 移除換行符
      .replace(/[\r\t]/g, ' ') // 其他空白轉為空格
      .trim();
    
    const id = cleanText
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // 移除 HTML 標籤
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、數字、中文、空格、連字號
      .trim()
      .replace(/\s+/g, '-') // 空格轉連字號
      .replace(/-+/g, '-') // 多個連字號合併
      .replace(/^-|-$/g, ''); // 移除首尾連字號
    return `<h${token.depth} id="${id}">${cleanText}</h${token.depth}>`;
  },
  code(codeArg, infoString = "") {
    let source = "";
    let info = infoString || "";

    if (codeArg && typeof codeArg === "object") {
      const token = codeArg;
      source = typeof token.text === "string" ? token.text : String(token.text ?? "");
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

function extractTOC(content) {
  const toc = [];
  const tokens = marked.lexer(content);
  tokens.forEach((token) => {
    if (token.type === "heading" && token.depth >= 2 && token.depth <= 3) {
      const cleanText = token.text
        .replace(/\\/g, '') // 移除反斜線
        .replace(/\n/g, '') // 移除換行符
        .replace(/[\r\t]/g, ' ') // 其他空白轉為空格
        .trim();
      
      // 使用與 marked 相同的 slug 生成邏輯
      const id = cleanText
        .toLowerCase()
        .replace(/<[^>]*>/g, '') // 移除 HTML 標籤
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、數字、中文、空格、連字號
        .trim()
        .replace(/\s+/g, '-') // 空格轉連字號
        .replace(/-+/g, '-') // 多個連字號合併為一個
        .replace(/^-|-$/g, ''); // 移除首尾連字號
      toc.push({ level: token.depth, text: cleanText, id });
    }
  });
  return toc;
}

marked.use({ renderer });
marked.use(markedKatex({ throwOnError: false }));

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

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

async function loadArticles(contentDir) {
  const files = await fsp.readdir(contentDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const byLocale = {};
  locales.forEach((l) => { byLocale[l.code] = []; });

  for (const file of mdFiles) {
    const parsed = parseLocaleFromFilename(file);
    if (!parsed) continue;
    const { baseId, lang } = parsed;
    const filePath = path.join(contentDir, file);
    const raw = await fsp.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const stats = await fsp.stat(filePath);

    const id = baseId;
    const target = byLocale[lang];
    if (!target) continue;

    target.push({
      id,
      title: (data.title || id).trim().replace(/\n/g, ' '),
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

async function build() {
  const rootDir = path.resolve(__dirname, "..");
  const distDir = path.join(rootDir, "dist");
  const contentDir = path.join(rootDir, "content");
  const assetsDir = path.join(rootDir, "assets");
  const indexTpl = path.join(rootDir, "index.ejs");
  const articleTpl = path.join(rootDir, "article.ejs");
  const assetVersion = process.env.BUILD_VERSION || String(Date.now());
  // Clean dist to remove stale outputs before rebuilding
  try { await fsp.rm(distDir, { recursive: true, force: true }); } catch (_) {}
  await ensureDir(distDir);

  const articlesByLocale = await loadArticles(contentDir);
  
  // 支援 GitHub Pages 子路徑部署（例如 /Articles/）
  const basePath = process.env.BASE_PATH || "";

  for (const locale of locales) {
    const list = articlesByLocale[locale.code] || [];
    const indexAssetBase = locale.code === "en" ? "../" : "";
    const pageBase = basePath + "/";
    const pageExt = locale.code === "en" ? "/en" : "";

    const indexHtml = await ejs.renderFile(
      indexTpl,
      {
        articles: list,
        assetBase: indexAssetBase,
        assetVersion,
        pageBase,
        pageExt,
        i18n: locale.i18n,
        locale: locale.code
      },
      { async: true }
    );

    const indexOutDir = locale.code === "en" ? path.join(distDir, "en") : distDir;
    await ensureDir(indexOutDir);
    await fsp.writeFile(path.join(indexOutDir, "index.html"), indexHtml, "utf8");

    for (const article of list) {
      const toc = extractTOC(article.content);
      let articleHtml = marked.parse(article.content, { mangle: false, langPrefix: "hljs language-" });
      // 徹底移除所有形式的 \n 字符（包括反斜線+n 和中間的空白）
      articleHtml = articleHtml
        .replace(/\\n/g, '')  // 移除字面的 \n（反斜線+n）
        .replace(/\\?\s*n(?=<|$)/g, '') // 移除單獨或前面有反斜線的 n
        .replace(/<p>[\s\\]*n[\s\\]*<\/p>/g, '') // 移除包含 n 的空段落
        .replace(/<p>\s*\\?n\s*<\/p>/g, '') // 移除包含 \n 和空白的段落
        .replace(/>\s*\\?n\s*</g, '><') // 移除標籤間的 n 或 \n
        .replace(/(<\/h[1-6]>)\s*<p>\s*\\?n\s*<\/p>/g, '$1') // 移除標題後緊接的 n 段落
        .replace(/>[\s]*\\n[\s]*</g, '><') // 最後一次全清理
        // 在標題標籤和段落標籤之間添加換行，分離塊元素
        .replace(/(<\/h[1-6]>)(<(?:p|ul|ol|blockquote|hr|table))/g, '$1\n$2');
      const html = await ejs.renderFile(
        articleTpl,
        {
          article,
          articleHtml,
          toc,
          assetBase: locale.code === "en" ? "../../" : "../",
          assetVersion,
          pageBase: basePath || "/",
          homeHref: locale.code === "en" ? (basePath || "") + "/en" : (basePath || "") + "/",
          i18n: locale.i18n,
          locale: locale.code
        },
        { async: true }
      );

      const outDir = locale.code === "en"
        ? path.join(distDir, article.id, "en")
        : path.join(distDir, article.id);
      await ensureDir(outDir);
      await fsp.writeFile(path.join(outDir, "index.html"), html, "utf8");
    }
  }

  // Copy assets
  await ensureDir(path.join(distDir, "assets"));
  const assetEntries = await fsp.readdir(assetsDir, { withFileTypes: true });
  for (const entry of assetEntries) {
    const srcPath = path.join(assetsDir, entry.name);
    const destPath = path.join(distDir, "assets", entry.name);
    if (entry.isDirectory()) {
      await fsp.cp(srcPath, destPath, { recursive: true });
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }

  // Remove zh folder if it exists (zh is root now)
  try { await fsp.rm(path.join(distDir, "zh"), { recursive: true, force: true }); } catch (_) {}

  console.log("Static site generated in ./dist");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
