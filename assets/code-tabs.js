(() => {
  const body = document.querySelector(".article-body");
  if (!body) return;

  const labelMap = {
    js: "JavaScript", javascript: "JavaScript",
    ts: "TypeScript", typescript: "TypeScript", tsx: "TypeScript",
    py: "Python", python: "Python",
    rb: "Ruby", ruby: "Ruby",
    php: "PHP",
    java: "Java",
    cs: "C#", csharp: "C#",
    cpp: "C++", cc: "C++", cxx: "C++", 'c++': "C++",
    c: "C",
    go: "Go", golang: "Go",
    rs: "Rust", rust: "Rust",
    swift: "Swift",
    kt: "Kotlin", kotlin: "Kotlin",
    scala: "Scala",
    sh: "Bash", bash: "Bash", zsh: "Bash", shell: "Shell",
    html: "HTML", xml: "XML",
    css: "CSS", scss: "SCSS", less: "Less",
    json: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML",
    md: "Markdown", markdown: "Markdown",
    sql: "SQL",
    diff: "Diff",
    txt: "Text", plaintext: "Text"
  };

  const prettifyLang = (lang) => {
    if (!lang) return "Code";
    const key = lang.toLowerCase();
    if (labelMap[key]) return labelMap[key];
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const isCodeBlock = (el) => el?.tagName === "PRE" && el.querySelector("code");
  const getVariant = (el) => (el?.dataset ? el.dataset.variant ?? null : null);
  const isHeading = (el) => el && /^H[2-4]$/.test(el.tagName);
  const children = Array.from(body.children);
  const handled = new Set();
  const groups = [];
  const headingsToRemove = new Set();

  // 只基於 data-variant 分組：只要 ``` 後面有 []，就找所有相同 variant 的合併
  for (let i = 0; i < children.length; ) {
    if (handled.has(children[i])) { i += 1; continue; }

    // 只處理有 variant 的程式碼區塊
    if (isCodeBlock(children[i])) {
      const variant = getVariant(children[i]);

      if (variant !== null) {
        const preGroup = [children[i]];
        handled.add(children[i]);
        
        // 檢查前一個元素是否為標題，如果是就標記要移除
        if (i > 0 && isHeading(children[i - 1])) {
          headingsToRemove.add(children[i - 1]);
        }
        
        // 向後查找所有相同 variant 的程式碼區塊
        let j = i + 1;
        while (j < children.length) {
          if (isCodeBlock(children[j]) && getVariant(children[j]) === variant) {
            // 找到相同 variant 的區塊
            preGroup.push(children[j]);
            handled.add(children[j]);
            
            // 檢查這個區塊前面是否有標題
            if (j > 0 && isHeading(children[j - 1]) && !handled.has(children[j - 1])) {
              headingsToRemove.add(children[j - 1]);
              handled.add(children[j - 1]);
            }
            j += 1;
          } else if (!handled.has(children[j])) {
            // 遇到其他元素，繼續往後找
            j += 1;
          } else {
            j += 1;
          }
        }
        
        if (preGroup.length > 1) {
          groups.push({ type: "pre-only", items: preGroup, headingsToRemove: Array.from(headingsToRemove) });
        }
        headingsToRemove.clear();
        i = j;
        continue;
      }

      // 沒 variant：不合併，保持獨立
      i += 1;
      continue;
    }

    i += 1;
  }

  if (!groups.length) return;

  let uid = 0;

  const makeTabs = (parent, panelsData) => {
    const wrapper = document.createElement("div");
    wrapper.className = "code-tabs";

    const tabs = document.createElement("div");
    tabs.className = "code-tabs__tabs";

    const panels = document.createElement("div");
    panels.className = "code-tabs__panels";

    parent.insertBefore(wrapper, panelsData[0].anchor);

    panelsData.forEach((item, idx) => {
      const { pre, label } = item;
      const tabId = `code-tab-${++uid}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-tabs__tab" + (idx === 0 ? " is-active" : "");
      btn.dataset.target = tabId;
      btn.textContent = label;
      tabs.appendChild(btn);

      pre.classList.add("code-tabs__panel");
      pre.dataset.tabId = tabId;
      if (idx !== 0) pre.hidden = true;
      panels.appendChild(pre);
    });

    wrapper.appendChild(tabs);
    wrapper.appendChild(panels);

    tabs.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-target]");
      if (!btn) return;
      const target = btn.dataset.target;
      tabs.querySelectorAll(".code-tabs__tab").forEach((el) => {
        el.classList.toggle("is-active", el === btn);
      });
      panels.querySelectorAll(".code-tabs__panel").forEach((panel) => {
        panel.hidden = panel.dataset.tabId !== target;
      });
    });
  };

  groups.forEach((group) => {
    // 移除被標記的標題
    if (group.headingsToRemove) {
      group.headingsToRemove.forEach((h) => h.remove());
    }

    const items = group.items.map((pre) => {
      const code = pre.querySelector("code");
      const langClass = (code?.className || "").split(/\s+/).find((c) => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "";
      const label = prettifyLang(lang);
      return { pre, label, anchor: pre };
    });
    const parent = items[0].pre.parentNode;
    makeTabs(parent, items);
  });
})();
