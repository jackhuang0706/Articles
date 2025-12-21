(() => {
  const select = document.getElementById("lang-select");
  if (!select) return;

  const basePath = window.__PAGE_BASE__ || "";
  const normalize = (path) => path.replace(/\/+/g, "/");

  const toLocalePath = (targetLocale) => {
    const { pathname, search, hash } = window.location;
    
    // Remove basePath from pathname to get relative path
    let relativePath = pathname;
    if (basePath && pathname.startsWith(basePath)) {
      relativePath = pathname.slice(basePath.length) || "/";
    }
    
    // Ensure relative path starts with /
    if (!relativePath.startsWith("/")) {
      relativePath = "/" + relativePath;
    }
    
    const isIndexZh = relativePath === "/";
    const isIndexEn = relativePath === "/en" || relativePath === "/en/";
    
    // Remove trailing '/en' to get article base path
    // For /article-slug/en -> /article-slug
    const articleBase = relativePath.replace(/(\/en)$/, "");
    const rest = normalize(articleBase === "" ? "/" : articleBase);

    let next;
    if (targetLocale === "en") {
      if (isIndexZh) {
        next = "/en";
      } else if (rest === "/") {
        next = "/en";
      } else {
        next = normalize(`${rest}/en`);
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
