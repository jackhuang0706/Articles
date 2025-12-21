# 問題排除與解決方案

本文件記錄了在開發和部署過程中遇到的問題及其解決方案。

## 目錄
- [GitHub Pages 部署問題](#github-pages-部署問題)
  - [問題 1: 標題後出現 `\n` 字符](#問題-1-標題後出現-n-字符)
  - [問題 2: 標題 ID 被簡化](#問題-2-標題-id-被簡化)
  - [問題 3: TOC 目錄連結無法正確導航](#問題-3-toc-目錄連結無法正確導航)
- [本地開發問題](#本地開發問題)
  - [問題 4: 本地伺服器渲染失敗](#問題-4-本地伺服器渲染失敗)

---

## GitHub Pages 部署問題

### 問題 1: 標題後出現 `\n` 字符

**現象：**
- 部署到 GitHub Pages 後，文章中的標題後面會出現字面的 `\n` 字符
- 本地構建和開發環境都正常，只有 GitHub Pages 上有問題
- gh-pages 分支的原始 HTML 文件中沒有 `\n`，但瀏覽器訪問時卻出現

**排查過程：**
1. 最初懷疑是 Markdown 解析問題，嘗試清理 `articleHtml`
2. 發現本地生成的 HTML 完全正常，無 `\n` 字符
3. 檢查 gh-pages 分支的原始 HTML，也沒有問題
4. 比較 `curl` 原始文件和瀏覽器訪問的內容，發現 GitHub Pages 在修改 HTML

**根本原因：**
- GitHub Pages 在從 **gh-pages 分支部署時會自動運行 Jekyll 處理**
- 即使添加了 `.nojekyll` 文件，Jekyll 仍然會對 HTML 進行轉換
- Jekyll 會在標題標籤和段落標籤之間插入換行符（顯示為 `\n`）

**解決方案：**
改用官方的 GitHub Actions 部署方式（`actions/deploy-pages@v4`），完全繞過 Jekyll 處理：

```yaml
# .github/workflows/deploy.yml
jobs:
  build:
    steps:
      # ... 構建步驟
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

**重要配置：**
- 在 GitHub 倉庫設置中，將 "Pages" → "Build and deployment" → "Source" 改為 **"GitHub Actions"**
- 不再使用 "Deploy from a branch (gh-pages)"

---

### 問題 2: 標題 ID 被簡化

**現象：**
- 本地生成：`<h3 id="第三層標題h3">第三層標題（H3）</h3>`
- GitHub Pages：`<h3 id="3">第三層標題（H3）</h3>`
- 標題 ID 被 Jekyll 簡化為純數字

**根本原因：**
與問題 1 相同，Jekyll 在處理 HTML 時會重新生成標題 ID

**解決方案：**
使用 GitHub Actions 直接部署，繞過 Jekyll（同問題 1）

---

### 問題 3: TOC 目錄連結無法正確導航

**現象：**
- 點擊 TOC 連結時，URL 變為 `/#title`，但頁面不滾動到對應標題
- 連結的 `href="#第三層標題h3"` 與實際標題 ID 不匹配

**根本原因：**
- TOC 連結使用的 ID 是構建時生成的（如 `#第三層標題h3`）
- Jekyll 處理後標題的 ID 被改為數字（如 `id="3"`）
- ID 不匹配導致錨點失效

**解決方案：**
使用 GitHub Actions 直接部署，保持標題 ID 一致（同問題 1）

---

## 本地開發問題

### 問題 4: 本地伺服器渲染失敗

**現象：**
```
Error rendering index: ...
Failed to render index
```

**根本原因：**
- 模板中使用了 `assetVersion` 變數用於資產版本控制（cache-busting）
- 靜態構建腳本（`scripts/build.js`）傳遞了 `assetVersion`
- 但本地開發伺服器（`server.js`）沒有傳遞這個變數給 EJS 模板

**解決方案：**
在 `server.js` 中添加 `assetVersion` 變數：

```javascript
const assetVersion = process.env.BUILD_VERSION || String(Date.now());

// 在 renderFile 時傳遞
await ejs.renderFile(templatePath, {
  articles: list,
  assetBase: "/",
  assetVersion,  // 新增
  // ... 其他變數
});
```

**額外改進：**
- 統一 `server.js` 和 `build.js` 的 heading renderer 邏輯
- 使用相同的 `cleanHeadingText` 函數清理標題文字
- 使用相同的 slug 生成邏輯，確保 TOC 連結與標題 ID 匹配

---

## 經驗總結

### 關鍵教訓

1. **GitHub Pages 的隱藏行為**
   - 從分支部署時會強制運行 Jekyll，即使有 `.nojekyll`
   - 建議使用 GitHub Actions 部署方式以獲得完全控制

2. **本地測試的重要性**
   - 本地正常不代表部署後也正常
   - 需要同時測試：本地開發環境、本地靜態構建、GitHub Pages 部署

3. **一致性原則**
   - 開發環境和構建環境應使用相同的邏輯
   - 模板變數要在所有環境中保持一致

4. **調試技巧**
   - 使用 `curl` 比較原始 HTML 和瀏覽器渲染的差異
   - 檢查 gh-pages 分支的原始文件
   - 在 HTML 中添加注釋標記追蹤變化

### 推薦實踐

- ✅ 使用 GitHub Actions 部署（`actions/deploy-pages`）
- ✅ 統一開發和構建環境的邏輯
- ✅ 添加 `.nojekyll` 作為額外保障
- ✅ 使用版本參數防止資產快取（`?v=<commit-sha>`）
- ✅ 定期檢查部署結果，不要只依賴本地測試
