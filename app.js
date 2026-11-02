(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  // ---- hero headline: split into words so they can arrive one by one
  $$("[data-words]").forEach(function (h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
            var s = document.createElement("span");
            s.className = "w"; s.style.setProperty("--i", i++); s.textContent = t;
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
  });
  if (!reduce) root.classList.add("js");

  // ---- style showcase
  var clips = {
    belgesel: ["medya/belgesel.mp4", "medya/belgesel.jpg", "Belgesel tarzı: gerçek görsellerle."],
    cizim: ["medya/cizim.mp4", "medya/cizim.jpg", "Çizim tarzı: çizgi karakterlerle."],
    karma: ["medya/karma.mp4", "medya/karma.jpg", "Karma tarzı: hızlı şablon sahneler."],
    motion: ["medya/motion.mp4", "medya/motion.jpg", "Motion tarzı: kinetik yazı ve efektler."]
  };
  var stage = $("#stage"), cap = $("#cap");
  var tabs = $$(".styles button");
  var first = true;

  function show(k) {
    tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.k === k ? "true" : "false"); });
    var c = clips[k];
    if (!first && !reduce) { stage.classList.remove("swap"); void stage.offsetWidth; stage.classList.add("swap"); }
    first = false;
    if (!c) {
      stage.innerHTML = '<div class="empty">Bu tarzın örnek videosu yakında eklenecek.</div>';
      cap.textContent = "Arayüz tarzı: telefon ekranı kartları.";
      return;
    }
    stage.innerHTML = '<video muted loop playsinline preload="metadata" poster="' + c[1] + '"><source src="' + c[0] + '" type="video/mp4"></video>';
    cap.textContent = c[2];
    var v = stage.firstChild;
    if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    else v.controls = true;
  }
  tabs.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.k); }); });
  show("belgesel");

  if (reduce) return; // everything below is motion

  // ---- play videos only while visible; pause decorative loops when their section is off screen
  var vids = $$("video[data-autoplay]");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });

    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("paused", !e.isIntersecting); });
    }, { rootMargin: "80px" });
    $$(".hero, .ribbon, #indir, .plan.best").forEach(function (s) { pio.observe(s); });
  }

  // ---- scroll reveals + price counters
  var rvSel = ".rv, .rv-l, .rv-s, .rv-h";
  function fmt(n) { return n.toLocaleString("tr-TR"); }
  function count(el) {
    var to = +el.dataset.to, t0 = null, dur = 1100;
    if (!to) return;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }
  function reveal(el) {
    el.classList.add("in");
    $$(".num", el).forEach(count);
    // once settled, drop reveal classes so hover/tilt transitions on cards are not overridden
    setTimeout(function () { el.classList.remove("rv", "rv-l", "rv-s", "rv-h", "in"); }, 1500);
  }
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); rio.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(rvSel).forEach(function (el) { rio.observe(el); });
  } else {
    $$(rvSel).forEach(function (el) { el.classList.remove("rv", "rv-l", "rv-s", "rv-h"); });
  }

  // ---- scroll progress bar
  var prog = $("#prog"), ticking = false;
  function onScroll() {
    ticking = false;
    var h = root.scrollHeight - innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ")";
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (!fine) return; // pointer effects only with a real mouse

  // ---- hero parallax: eased toward the pointer
  var hero = $(".hero"), fan = $("#fan"), orbs = $$(".orb[data-par]", hero);
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  function loop() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    fan.style.setProperty("--px", cx.toFixed(3));
    fan.style.setProperty("--py", cy.toFixed(3));
    orbs.forEach(function (o) { o.style.translate = (cx * o.dataset.par).toFixed(1) + "px " + (cy * o.dataset.par * 0.7).toFixed(1) + "px"; });
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(loop); else raf = 0;
  }
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });

  // ---- cards: edge light follows the cursor, gentle tilt
  $$(".card").forEach(function (c) {
    var big = c.classList.contains("plan") || c.classList.contains("wide") || c.classList.contains("hi");
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px");
      c.style.setProperty("--my", y + "px");
      c.classList.add("tilting");
      var k = big ? 3 : 5;
      c.style.setProperty("--ry", ((x / r.width - 0.5) * k).toFixed(2) + "deg");
      c.style.setProperty("--rx", ((0.5 - y / r.height) * k).toFixed(2) + "deg");
    });
    c.addEventListener("pointerleave", function () {
      c.classList.remove("tilting");
      c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg");
      c.style.setProperty("--mx", "-400px"); c.style.setProperty("--my", "-400px");
    });
  });
})();
