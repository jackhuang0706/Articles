# Articles Site

A minimal Markdown article site with EJS templates, an Express dev server, and a Node build step that generates static HTML in `dist/` using pretty URLs (`/<id>` for zh, `/<id>/en` for en). Markdown files (with frontmatter) are the single source of truth. Multilingual content is supported by filename suffixes (e.g., `post.md` = default locale, `post_en.md` = English).

Features:
- Light/Dark theme toggle (top-right switch, persists preference)
- Sidebar table of contents (H2/H3, smooth scroll + active highlight)
- KaTeX math support via marked-katex-extension
- GitHub-like syntax highlighting with tabbed code variants
- Localized UI strings via i18n (`heroTitle`, `back`, `toc`)

## Quick Start

- **Install:**

```bash
npm install
```

- **Develop (server-rendered):**

```bash
npm start
# open http://localhost:3000/
```

- **Build static HTML:**

```bash
npm run build
# outputs to ./dist
```

-- **Theme toggle:**
  - Follows system preference initially; saves `pref-theme` to localStorage
  - Shows moon in light mode and sun in dark mode
  - Works on both list and article pages

- **Preview static build (choose one):**

```bash
# Python
python3 -m http.server 8000 -d dist
# or using serve
npx serve dist
# or http-server
npx http-server dist -p 8000
# then open http://localhost:8000/
```

## Project Structure

```
.
├── assets/                # CSS and client JS
├── content/               # Markdown articles (.md with frontmatter; locale via suffix like _en)
├── index.ejs              # List page template (links to /<id> and /<id>/en)
├── article.ejs            # Article page template
├── scripts/build.js       # Static generator (EJS → HTML + marked)
├── server.js              # Express dev server (renders EJS at runtime)
├── dist/                  # Build output (index.html + <id>/index.html + <id>/en/index.html)
└── package.json           # Scripts and deps
```

## Editing Content

- **Add Markdown:** Put a new `.md` file under [content](content) with frontmatter (`title`, `summary`, `date`, `tags`). For extra locales, add filename suffix (e.g., `hello.md` for default locale, `hello_en.md` for English).
- **Generate HTML:** Run `npm run build` to update `dist/`.

## Templates & Rendering

- **List page:** [index.ejs](index.ejs) renders the sidebar list and links to `/<id>/`.
- **Article page:** [article.ejs](article.ejs) receives `article` + rendered `articleHtml`.
- **Dev server:** [server.js](server.js) loads Markdown per locale (default + `_en`), renders EJS via Express.
- **Static build:** [scripts/build.js](scripts/build.js) renders EJS with the same data, converts Markdown using `marked`, enables KaTeX, and writes to `dist/`. The build cleans `dist/` first to avoid stale outputs.

## Styling

- Minimal, typo-like theme tuned in [assets/style.css](assets/style.css): neutral background, thin borders, readable line-height, subdued colors.

## Pretty URLs

- Dev (zh): open `http://localhost:3000/<id>` (e.g., `/start-here`).
- Dev (en): open `http://localhost:3000/<id>/en` (e.g., `/start-here/en`) and homepage at `/en`.
- Static (zh): open `dist/<id>/index.html` via any static server.
- Static (en): open `dist/<id>/en/index.html` and homepage at `dist/en/index.html`.

## Notes

- **Restart dev server** when you change [server.js](server.js).
- **Rebuild** when you change templates ([index.ejs](index.ejs), [article.ejs](article.ejs)), styles/scripts ([assets](assets)), or Markdown ([content](content)).
- Dependencies: `express`, `ejs`, `marked`, `gray-matter`, `highlight.js`, `marked-katex-extension`.

## Localization in EJS

- The server and build pass `i18n` and `locale` to templates. Use them directly:
  - [index.ejs](index.ejs): `<title><%= i18n.heroTitle %></title>`, `<h1><%= i18n.heroTitle %></h1>`; language select uses `locale`.
  - [article.ejs](article.ejs): `<title><%= article.title %> | <%= i18n.heroTitle %></title>`, back link and TOC use `i18n.back` and `i18n.toc`.
