---
title: Markdown Syntax Test
summary: Examples covering headings, lists, tables, links, images, and multi-language code blocks.
tags: [Markdown]
---

# Headings and Paragraphs

Markdown supports six levels of headings using `#` symbols. More symbols mean lower levels:

## Second-level Heading (H2)

Use `## Heading Text` to create. Suitable for section titles.

### Third-level Heading (H3)

Use `### Heading Text` to create. Suitable for subsection titles.

#### Fourth-level Heading (H4)

Use `#### Heading Text` to create. Suitable for finer categorization.

##### Fifth-level Heading (H5)

Use `##### Heading Text` to create. Less commonly used, suitable for deep structures.

###### Sixth-level Heading (H6)

Use `###### Heading Text` to create. The smallest heading level.

---

## Text Formatting

This article verifies Markdown rendering and shows common syntax:

- **Bold**: Use `**text**` or `__text__`
- *Italics*: Use `*text*` or `_text_`
- ***Bold Italics***: Use `***text***`
- `inline code`: Use backticks `` `code` ``
- ~~Strikethrough~~: Use `~~text~~`
- [Links](https://example.com): Use `[text](url)`

---

## Block Quotes

> Quote: can contain **bold** and `inline code`, and can span lines.
> Second line of quote.

Use `>` symbol to create block quotes, commonly used for quoting text or emphasizing points.

---

## Lists

### Unordered Lists

Use `-`, `+`, or `*` to start:

- Unordered list example
  - Nested item A
  - Nested item B
- ✅ Done item
- ⏳ In progress

### Ordered Lists

Use numbers followed by a period `1.` to start:

1. Ordered step one
2. Step two
   1. Substep 2.1
   2. Substep 2.2
3. Step three

## Table

Use `|` and `-` to create tables. The second row defines alignment:

| Syntax | Meaning | Note |
| --- | --- | --- |
| `**bold**` | Bold | Emphasis |
| `*italic*` | Italic | Softer emphasis |
| `` `code` `` | Inline code | Snippet |

Alignment options:
- Left: `| --- |`
- Center: `| :---: |`
- Right: `| ---: |`

## Images and Links

### Links

Use `[text](url)` syntax:

- External link: [Google](https://www.google.com)
- Relative path: [Other article](./write-markdown)

### Images

Use `![alt text](image url)` syntax:

![Placeholder](https://via.placeholder.com/400x180?text=Markdown+Image)

Images automatically adjust to text width and maintain aspect ratio.

---

## Code Blocks (Multi-language)

### JavaScript

Use triple backticks ` ``` ` to wrap code, specify the language for syntax highlighting:

```js []
function greet(name) {
  const msg = `Hello, ${name}!`;
  console.log(msg);
  return msg;
}

greet("World");
```

### Python

```python []
def fib(n):
    a, b = 0, 1
    out = []
    for _ in range(n):
        out.append(a)
        a, b = b, a + b
    return out

print(fib(7))
```

### Bash

```bash
#!/usr/bin/env bash
echo "Build project"
npm run build
```

### HTML

```html
<section class="card">
  <h2>Card Title</h2>
  <p>Some content here.</p>
</section>
```

### CSS

```css
.card {
  border: 1px dashed #ccc;
  padding: 12px;
}
```

### JSON

```json
{
  "title": "Markdown Test",
  "tags": ["Markdown", "Test"],
  "ok": true
}
```

### Diff (Change Display)

```diff
- const mode = "dev";
+ const mode = process.env.NODE_ENV || "dev";
```

---

## Horizontal Rules

Use three or more `-`, `*`, or `_` to create horizontal rules:

```markdown
---
***
___
```

---

## Body Text

Keep blank lines between paragraphs for proper breaks. Use language markers on inline `code` and fenced code blocks to see syntax highlighting.

### Markdown Syntax Summary

| Element | Syntax | Example |
| :---- | :---- | :---- |
| Heading | `# H1` to `###### H6` | `## Second Level` |
| Bold | `**text**` | **bold** |
| Italic | `*text*` | *italic* |
| Inline Code | `` `code` `` | `const x = 1;` |
| Link | `[text](url)` | [Google](https://google.com) |
| Image | `![alt](url)` | ![img](url) |
| Quote | `> text` | > Quoted content |
| Unordered List | `- item` | - item |
| Ordered List | `1. item` | 1. item |
| Code Block | ` ```language ` | ` ```js ` |
| Horizontal Rule | `---` | --- |
| Table | `\| col \| col \|` | See table examples above |
