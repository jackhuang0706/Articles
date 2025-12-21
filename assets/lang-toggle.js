(() => {
  const select = document.getElementById("lang-select");
  if (!select) return;

  const basePath = window.__PAGE_BASE__ || "";
  const normalize = (path) => path.replace(/\/+/g, "/");

  const toLocalePath = (targetLocale) => {
    const { pathname, search, hash } = window.location;
    // 移除 basePath 來取得相對路徑
    let relativePath = pathname;
    if (basePath && pathname.startsWith(basePath)) {
      relativePath = pathname.slice(basePath.length) || "/";
    }
    
    const isIndexZh = relativePath === "/";
    const isIndexEn = relativePath === "/en" || relativePath === "/en/";
    // Remove leading '/en' and trailing '/en' to get article base
    const base = relativePath
      .replace(/^(\/en)(?=\/|$)/, "")
      .replace(/(\/en)(?=\/|$)/, "");
    const rest = normalize(base);

    let next;
    if (targetLocale === "en") {
      if (isIndexZh) {
        next = "/en";
      } else {
        next = rest === "/" ? "/en" : normalize(`${rest}/en`);
      }
    } else {
      // zh
      if (isIndexEn) {
        next = "/";
      } else {
        next = rest;
      }
    }
    return `${basePath}${next}${search || ""}${hash || ""}`;
  };

  select.addEventListener("change", () => {
    const locale = select.value === "en" ? "en" : "zh";
    const next = toLocalePath(locale);
    window.location.href = next;
  });
})();
