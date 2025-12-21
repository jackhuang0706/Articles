(() => {
  const storageKey = "pref-theme";
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn || !root) return;

  const sunIcon = btn.querySelector(".theme-toggle__icon--sun");
  const moonIcon = btn.querySelector(".theme-toggle__icon--moon");

  const applyTheme = (theme) => {
    const next = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(storageKey, next); } catch (_) {}
    
    // 更新圖示狀態：只有當前模式的圖示是 "活躍" 的
    if (sunIcon) {
      sunIcon.setAttribute("aria-hidden", next === "dark" ? "true" : "false");
    }
    if (moonIcon) {
      moonIcon.setAttribute("aria-hidden", next !== "dark" ? "true" : "false");
    }
    
    btn.classList.toggle("is-dark", next === "dark");
    btn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    btn.setAttribute("aria-label", next === "dark" ? "目前深色模式，點擊切換為淺色" : "目前淺色模式，點擊切換為深色");
  };

  const stored = (() => {
    try {
      const value = localStorage.getItem(storageKey);
      if (value === "light" || value === "dark") return value;
    } catch (_) {}
    return null;
  })();

  const preferred = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(preferred);

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });
})();