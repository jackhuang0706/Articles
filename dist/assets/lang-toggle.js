(() => {
  const select = document.getElementById("lang-select");
  if (!select) return;

  const normalize = (path) => path.replace(/\/+/g, "/");

  const toLocalePath = (targetLocale) => {
    const { pathname, search, hash } = window.location;
    const isIndexZh = pathname === "/";
    const isIndexEn = pathname === "/en" || pathname === "/en/";
    // Remove leading '/en' and trailing '/en' to get article base
    const base = pathname
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
    return `${next}${search || ""}${hash || ""}`;
  };

  select.addEventListener("change", () => {
    const locale = select.value === "en" ? "en" : "zh";
    const next = toLocalePath(locale);
    window.location.href = next;
  });
})();
