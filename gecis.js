// Logo loader on first paint and a short fade between the site's own pages.
(function () {
  var root = document.documentElement;
  var t0 = Date.now();
  function done() {
    var wait = Math.max(0, 650 - (Date.now() - t0)); // let the logo be seen, never block long
    setTimeout(function () { root.classList.add("yuklendi"); }, wait);
  }
  if (document.readyState === "complete") done(); else addEventListener("load", done);
  setTimeout(function () { root.classList.add("yuklendi"); }, 2500); // slow media never holds the page

  // coming back via the back button restores the page from cache: drop the exit state
  addEventListener("pageshow", function (e) { if (e.persisted) root.classList.remove("cikis"); root.classList.add("yuklendi"); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    root.classList.add("cikis");
    setTimeout(function () { location.href = a.href; }, 380);
  });
})();
