# 網站架構說明

## 目錄
- [系統概述](#系統概述)
- [核心功能原理](#核心功能原理)
  - [光暗模式切換](#光暗模式切換)
  - [多語言支援](#多語言支援)
  - [程式碼分頁顯示](#程式碼分頁顯示)
- [專案結構](#專案結構)
- [開發過程遇到的問題](#開發過程遇到的問題)
- [部署到 GitHub Pages](#部署到-github-pages)

---

## 系統概述

這是一個基於 Express + EJS 的靜態文章網站生成器，支援：
- **中文為預設語言**（路徑為根目錄 `/`）
- **英文為次要語言**（路徑後綴 `/en`）
- **光暗模式切換**（localStorage 持久化）
- **程式碼區塊分頁顯示**（支援同一程式碼的多種語言變體）

### 技術棧
- **後端**：Express 5.x + EJS 模板引擎
- **Markdown 解析**：marked + gray-matter
- **語法高亮**：highlight.js (GitHub 風格)
- **前端**：純 JavaScript (ES6+) + CSS Variables
- **靜態生成**：自訂 build script

---

## 核心功能原理

### 光暗模式切換

#### 1. CSS Variables 實作
`assets/style.css` 定義了兩套主題變數：

```css
:root {
  /* 淺色模式 */
  --bg: #ffffff;
  --text: #1a1a1a;
  --muted: #6b7280;
  /* ... 更多顏色變數 */
}

[data-theme="dark"] {
  /* 深色模式 */
  --bg: #0f172a;
  --text: #f1f5f9;
  --muted: #94a3b8;
  /* ... 更多顏色變數 */
}
```

#### 2. 主題切換邏輯
`assets/theme-toggle.js` 負責：

```javascript
// 1. 初始化：優先讀取 localStorage，否則使用系統偏好
const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const theme = saved || (prefersDark ? "dark" : "light");

// 2. 切換主題時同步更新
document.documentElement.setAttribute("data-theme", theme);
localStorage.setItem("theme", theme);

// 3. 更新切換按鈕的圖示和狀態
```

#### 3. Highlight.js 代碼主題整合
程式碼區塊的顏色也使用 CSS Variables 控制：

```css
.hljs {
  background: var(--code-bg);
  color: var(--code-text);
}

.hljs-keyword { color: var(--token-keyword); }
.hljs-string { color: var(--token-string); }
/* ... 其他 token 顏色 */
```

這樣切換主題時，程式碼區塊的顏色也會同步改變。

---

### 多語言支援

#### 1. 檔案命名規則
多語言透過檔案名後綴區分：

```
content/
  start-here.md       # 中文版（預設）
  start-here_en.md    # 英文版
  write-markdown.md   # 中文版
  write-markdown_en.md # 英文版
```

解析邏輯（`server.js` 和 `scripts/build.js`）：
```javascript
function parseLocaleFromFilename(filename) {
  const match = filename.match(/^(.*?)(?:_([a-z]{2}))?\.md$/i);
  if (!match) return null;
  const baseId = match[1];  // 例如：start-here
  const lang = match[2] && localeMap.has(match[2].toLowerCase()) 
    ? match[2].toLowerCase() 
    : "zh"; // 沒有後綴 = 中文
  return { baseId, lang };
}
```

#### 2. URL 路由設計
採用**語言後綴模式**：

| 語言 | 首頁路徑 | 文章路徑 |
|------|---------|---------|
| 中文 | `/` | `/:id` |
| 英文 | `/en` | `/:id/en` |

**範例：**
- 中文文章：`/start-here`
- 英文文章：`/start-here/en`

#### 3. Express 路由配置
```javascript
// 首頁路由
app.get("/", (req, res) => renderIndex("zh", req, res));
app.get("/zh", (req, res) => res.redirect(301, "/")); // 相容性重定向
app.get("/en", (req, res) => renderIndex("en", req, res));

// 文章路由（順序很重要！）
app.get("/:id/en", (req, res) => renderArticle("en", req, res)); // 英文優先
app.get("/:id", (req, res) => renderArticle("zh", req, res));    // 中文兜底
```

> **⚠️ 重要**：英文路由（`/:id/en`）必須放在中文兜底路由（`/:id`）之前，否則會被錯誤匹配。

#### 4. 靜態網站結構
`npm run build` 產生的目錄結構：

```
dist/
  index.html              # 中文首頁
  <id>/
    index.html            # 中文文章
    en/
      index.html          # 英文文章
  en/
    index.html            # 英文首頁
  assets/
    style.css
    theme-toggle.js
    lang-toggle.js
    code-tabs.js
    highlight-github.min.css
```
（建置前會先清理 `dist/` 以避免殘留舊檔案）

#### 5. 語言切換器
`assets/lang-toggle.js` 處理路徑映射：

```javascript
const toLocalePath = (targetLocale) => {
  const pathname = window.location.pathname;
  const isIndexZh = pathname === "/";
  const isIndexEn = pathname === "/en" || pathname === "/en/";
  
  // 移除語言後綴，取得基礎路徑
  const base = pathname
    .replace(/^(\/en)(?=\/|$)/, "")  // 移除開頭 /en
    .replace(/(\/en)(?=\/|$)/, "");  // 移除結尾 /en
  
  if (targetLocale === "en") {
    if (isIndexZh) return "/en";           // 首頁：/ → /en
    return base === "/" ? "/en" : `${base}/en`; // 文章：/id → /id/en
  } else {
    if (isIndexEn) return "/";             // 首頁：/en → /
    return base;                           // 文章：/id/en → /id
  }
};
```

#### 6. 國際化字串
每個 locale 定義對應的 UI 文字：

```javascript
const locales = [
  { 
    code: "zh", 
    prefix: "", 
    i18n: { heroTitle: "文章列表", back: "← 返回列表" } 
  },
  { 
    code: "en", 
    prefix: "en", 
    i18n: { heroTitle: "Articles", back: "← Back to list" } 
  }
];
```

在 EJS 模板中使用：
```html
<h1><%= i18n.heroTitle %></h1>
<a href="<%= homeHref %>"><%= i18n.back %></a>
```
---

### 數學公式支援（KaTeX）

- 在伺服器與建置流程中啟用 `marked-katex-extension`（`throwOnError: false`），支援 `$...$` 與 `$$...$$`。
- 在文章頁模板 [article.ejs](article.ejs) 引入 KaTeX CSS：`katex.min.css`。
- LaTeX 語法在 Markdown 中可直接使用，建置與即時渲染一致。

### 目錄（TOC）

- 使用 `marked.lexer` 擷取 H2/H3 標題為目錄項目，並以與自訂 heading renderer 一致的規則產生 `id`。
- 客戶端腳本 [assets/toc.js](assets/toc.js) 提供：
  - Smooth scroll 到目標標題
  - IntersectionObserver 追蹤目前活躍段落，更新側欄連結的 `active` 樣式
- 側欄位於左側，字體加大、滑過加底線；行動版自動隱藏以避免擠壓內容。

### 程式碼分頁顯示

#### 1. Markdown 語法
在程式碼區塊的語言標籤後加上 `[variant]`：

````markdown
```javascript [Browser]
console.log('Running in browser');
```

```javascript [Node.js]
console.log('Running in Node.js');
```
````

#### 2. 自訂 Marked Renderer
解析 `[variant]` 並加入 `data-variant` 屬性：

```javascript
const renderer = {
  code(codeArg, infoString = "") {
    const info = String(infoString).trim();
    const langMatch = info.match(/^([^\s\[]+)/);
    const metaMatch = info.match(/\[(.*)\]/);
    const lang = langMatch ? langMatch[1] : "";
    const variant = metaMatch ? metaMatch[1] : null;
    
    const variantAttr = variant !== null 
      ? ` data-variant="${escapeAttr(variant)}"` 
      : "";
    
    return `<pre${variantAttr}><code class="hljs language-${lang}">
      ${highlighted}
    </code></pre>`;
  }
};
```

#### 3. 前端分頁邏輯
`assets/code-tabs.js` 在客戶端執行：

```javascript
// 1. 找出所有帶 data-variant 的程式碼區塊
const blocks = Array.from(document.querySelectorAll('pre[data-variant]'));

// 2. 按相鄰分組（同一組的 variant 會被放在一起）
const groups = [];
blocks.forEach(block => {
  const lastGroup = groups[groups.length - 1];
  if (lastGroup && isAdjacent(lastGroup[0], block)) {
    lastGroup.push(block);
  } else {
    groups.push([block]);
  }
});

// 3. 為每組建立分頁 UI
groups.forEach(group => {
  const container = document.createElement('div');
  container.className = 'code-tabs';
  
  // 建立分頁按鈕
  const tabs = document.createElement('div');
  tabs.className = 'code-tabs__nav';
  group.forEach((block, index) => {
    const button = document.createElement('button');
    button.textContent = block.dataset.variant;
    button.onclick = () => showTab(group, index);
    tabs.appendChild(button);
  });
  
  // 包裹所有程式碼區塊
  group[0].parentNode.insertBefore(container, group[0]);
  container.appendChild(tabs);
  group.forEach(block => container.appendChild(block));
  
  // 預設顯示第一個
  showTab(group, 0);
});
```

---

## 專案結構

```
Articles/
├── content/              # Markdown 文章原檔
│   ├── *.md             # 中文文章
│   └── *_en.md          # 英文文章
├── assets/              # 靜態資源
│   ├── style.css        # 全域樣式（含主題變數）
│   ├── theme-toggle.js  # 光暗模式切換
│   ├── lang-toggle.js   # 語言切換
│   ├── code-tabs.js     # 程式碼分頁
│   └── highlight-github.min.css  # highlight.js 樣式
├── scripts/
│   └── build.js         # 靜態網站生成器
├── index.ejs            # 首頁模板
├── article.ejs          # 文章頁模板
├── server.js            # Express 開發伺服器
├── package.json
└── dist/                # 靜態網站輸出目錄（執行 npm run build 產生）
```

---

## 開發過程遇到的問題

### 1. **Express 路由順序問題**
**問題**：英文路由 `/en/:id` 無法匹配，總是被中文兜底路由 `/:id` 攔截。

**原因**：Express 按照路由定義順序匹配，`/:id` 會匹配所有 `/xxx` 形式的路徑。

**解決方案**：
```javascript
// ❌ 錯誤順序
app.get("/:id", (req, res) => renderArticle("zh", req, res));
app.get("/en/:id", (req, res) => renderArticle("en", req, res));

// ✅ 正確順序（具體路由優先）
app.get("/en/:id", (req, res) => renderArticle("en", req, res));
app.get("/:id", (req, res) => renderArticle("zh", req, res));
```

### 2. **改用語言後綴模式（`/:id/en`）**
**問題**：原本採用前綴模式（`/en/:id`），但用戶希望改成後綴模式（`/:id/en`）。

**挑戰**：
- 靜態網站目錄結構需要從 `dist/en/start-here/` 改為 `dist/start-here/en/`
- 語言切換器的路徑映射邏輯需要重寫
- 首頁仍需維持在 `/en/`（不是 `/index/en`）

**解決方案**：
1. **路由配置**：
   ```javascript
   app.get("/:id/en", (req, res) => renderArticle("en", req, res));
   ```

2. **靜態構建邏輯**：
   ```javascript
   const outDir = locale.code === "en"
     ? path.join(distDir, article.id, "en")  // dist/start-here/en/
     : path.join(distDir, article.id);       // dist/start-here/
   ```

3. **語言切換器**：處理首頁與文章頁的不同邏輯。

### 3. **Node.js 程序不自動重載**
**問題**：修改 `server.js` 後，執行 `npm start` 仍然載入舊版程式碼。

**原因**：已有 Node 程序在背景執行，新的 `npm start` 無法覆蓋。

**解決方案**：
```bash
# 找到並停止舊進程
lsof -ti:3000 | xargs kill -9

# 或使用 nodemon 自動重載（建議加入 package.json）
npm install --save-dev nodemon
# package.json: "dev": "nodemon server.js"
```

### 4. **highlight.js 的模板字串顯示問題**
**問題**：JavaScript 程式碼中的 `${variable}` 在深色模式下看不見。

**原因**：highlight.js 的 `.hljs-subst` 和 `.hljs-template-variable` token 沒有定義顏色。

**解決方案**：在 `style.css` 中補充：
```css
.hljs-subst,
.hljs-template-variable {
  color: var(--token-variable);
}
```

### 5. **靜態網站的資源路徑問題**
**問題**：中文首頁在 `dist/index.html`，英文首頁在 `dist/en/index.html`，但資源路徑深度不同。

**解決方案**：根據語言動態設定 `assetBase`：
```javascript
const assetBase = locale.code === "en" ? "../assets/" : "assets/";
```

EJS 模板中：
```html
<link rel="stylesheet" href="<%= assetBase %>style.css" />
```

### 6. **語言切換器的路徑正規化**
**問題**：從 `/en/start-here` 切換到中文時，需要正確移除 `/en` 前綴；從 `/start-here/en` 切換時，需要移除 `/en` 後綴。

**解決方案**：使用兩次 `replace` 確保清理乾淨：
```javascript
const base = pathname
  .replace(/^(\/en)(?=\/|$)/, "")  // 移除開頭 /en
  .replace(/(\/en)(?=\/|$)/, "");  // 移除結尾 /en
```

---

## 部署到 GitHub Pages

### 方法一：使用 GitHub Actions（推薦）

#### 1. 建立 GitHub Repository
```bash
cd /home/fijjj/Desktop/Articles
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用戶名/你的倉庫名.git
git push -u origin main
```

#### 2. 建立 GitHub Actions 工作流程
建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build static site
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 3. 啟用 GitHub Pages
1. 進入 Repository → **Settings** → **Pages**
2. **Source** 選擇：**GitHub Actions**
3. 推送程式碼後，Actions 會自動構建並部署

### 方法二：手動部署

#### 1. 構建靜態網站
```bash
npm run build
```

#### 2. 初始化 `dist` 目錄為 Git 倉庫
```bash
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/你的用戶名/你的倉庫名.git
git push -f origin gh-pages
```

#### 3. 設定 GitHub Pages
Repository → Settings → Pages → Source 選擇 `gh-pages` 分支

### 注意事項

#### 1. **Base Path 設定**（如果不是根域名）
如果你的網站會部署在 `https://username.github.io/repo-name/`，需要調整路徑：

修改 `scripts/build.js`：
```javascript
const BASE_PATH = process.env.BASE_PATH || "";

// 在生成 HTML 時
pageBase: `${BASE_PATH}/`,
assetBase: `${BASE_PATH}/assets/`,
```

在 GitHub Actions 中設定環境變數：
```yaml
- name: Build static site
  run: npm run build
  env:
    BASE_PATH: /你的倉庫名
```

#### 2. **排除開發檔案**
確保 `.gitignore` 包含：
```
node_modules/
dist/
.DS_Store
*.log
```

#### 3. **驗證部署**
部署完成後測試：
- 中文首頁：`https://username.github.io/`
- 英文首頁：`https://username.github.io/en`
- 中文文章：`https://username.github.io/start-here`
- 英文文章：`https://username.github.io/start-here/en`
- 光暗模式切換
- 語言切換器

---

## 開發命令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（http://localhost:3000）
npm start

# 建構靜態網站（輸出到 ./dist）
npm run build

# （建議）使用 nodemon 自動重載
npx nodemon server.js
```

---

## 未來改進建議

1. **自動監聽 content/ 變更**：使用 `chokidar` 監聽 Markdown 檔案變更，自動重新載入。
2. **增加搜尋功能**：使用 `lunr.js` 或 `flexsearch` 建立全文索引。
3. **RSS Feed**：自動生成 RSS/Atom feed 供訂閱。
4. **圖片優化**：整合 `sharp` 自動壓縮和生成 WebP 格式。
5. **SEO 優化**：
   - 自動生成 `sitemap.xml`
   - 添加 Open Graph 和 Twitter Card meta tags
   - 結構化資料（JSON-LD）
6. **CDN 加速**：將 assets 上傳到 CDN（如 Cloudflare）。

---

**最後更新**：2025-12-20  
**維護者**：請根據需要更新此文件
