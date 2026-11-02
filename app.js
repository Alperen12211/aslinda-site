(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  // ---- karaoke highlight: the active word of the headline moves along, like the captions in the videos
  var kw = $$("h1 .w");
  if (!reduce && kw.length) {
    var ki = -1, kn = 0;
    setTimeout(function () {
      var kt = setInterval(function () {
        if (kw[ki]) kw[ki].classList.remove("on");
        ki = (ki + 1) % (kw.length + 1);
        if (kw[ki]) kw[ki].classList.add("on");
        if (++kn > kw.length * 3 + 3) { clearInterval(kt); if (kw[ki]) kw[ki].classList.remove("on"); }
      }, 700);
    }, 1800);
  }

  // ---- style showcase (the clips are the product's own output)
  var clips = {
    belgesel: ["medya/belgesel.mp4", "medya/belgesel.jpg", "Belgesel tarzı: gerçek görsellerle.", "Belgesel tarzı örnek video"],
    cizim: ["medya/cizim.mp4", "medya/cizim.jpg", "Çizim tarzı: çizgi karakterlerle.", "Çizim tarzı örnek video"],
    karma: ["medya/karma.mp4", "medya/karma.jpg", "Karma tarzı: hızlı şablon sahneler.", "Karma tarzı örnek video"],
    motion: ["medya/motion.mp4", "medya/motion.jpg", "Motion tarzı: kinetik yazı ve efektler.", "Motion tarzı örnek video"]
  };
  var stage = $("#stage"), cap = $("#cap");
  var tabs = $$(".styles button");
  var first = true;

  function show(k) {
    tabs.forEach(function (b) { var on = b.dataset.k === k; b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; });
    var c = clips[k], inner;
    if (c) inner = '<video muted loop playsinline preload="metadata" poster="' + c[1] + '" aria-label="' + c[3] + '"><source src="' + c[0] + '" type="video/mp4"></video>';
    else inner = '<div class="bos"><span class="q" aria-hidden="true">?</span><p>Bu tarzın örnek videosu yakında eklenecek.</p></div>';
    stage.innerHTML = '<figure class="ph' + (!first && !reduce ? " swap" : "") + '"><div class="vid">' + inner + '</div></figure>';
    first = false;
    cap.textContent = c ? c[2] : "Arayüz tarzı: telefon ekranı kartları.";
    var v = $("video", stage);
    if (v) {
      if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.controls = true;
    }
  }
  tabs.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.k); }); });
  show("belgesel");

  // ---- arrow keys move between style tabs
  tabs.forEach(function (b, i) {
    b.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowDown" || e.key === "ArrowRight" ? i + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? i - 1 : null;
      if (n === null) return;
      e.preventDefault();
      var t = tabs[(n + tabs.length) % tabs.length]; t.focus(); t.click();
    });
  });

  if (reduce) return; // everything below is motion

  // ---- play hero videos only while visible
  var vids = $$("video[data-autoplay]");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = $("video", e.target); if (!v) return; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.2 });
    sio.observe($(".stage"));
  }

  // ---- scroll reveals + price counters
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
    if (!el.classList.contains("tile")) setTimeout(function () { el.classList.remove("rv", "in"); }, 1800);
  }
  var targets = $$(".rv");
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); rio.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { rio.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.remove("rv"); el.classList.add("in"); });
  }

  // ---- in-page links: smooth glide (CSS) + a light arrival cue on the target heading
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var id = a.getAttribute("href").slice(1), t = id && document.getElementById(id);
      if (!t) return;
      var h = $("h2", t);
      if (!h) return;
      var fired = false; function cue() { if (fired) return; fired = true; h.classList.remove("arrive"); void h.offsetWidth; h.classList.add("arrive"); removeEventListener("scrollend", cue); }
      if ("onscrollend" in window) { addEventListener("scrollend", cue, { once: true }); setTimeout(cue, 1600); } else setTimeout(cue, 900);
    });
  });

  // ---- scroll progress bar
  var prog = $("#prog"), ticking = false;
  function onScroll() {
    ticking = false;
    var h = root.scrollHeight - innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ")";
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();


