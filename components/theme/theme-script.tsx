const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("bracket-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

// next/script's beforeInteractive strategy relies on a render-collected queue
// that the App Router's not-found boundary doesn't populate, leaving the
// hydration mismatch that trips React's "script tag" warning on 404s. A plain
// inline <script> is rendered directly in the tree on every path (including
// not-found), so it stays in sync with the SSR markup and hydrates cleanly.
export function ThemeScript() {
  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
