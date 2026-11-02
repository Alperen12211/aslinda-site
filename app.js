(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clips = {
    belgesel: ["medya/belgesel.mp4", "medya/belgesel.jpg", "Belgesel tarzı: gerçek görsellerle."],
    cizim: ["medya/cizim.mp4", "medya/cizim.jpg", "Çizim tarzı: çizgi karakterlerle."],
    karma: ["medya/karma.mp4", "medya/karma.jpg", "Karma tarzı: hızlı şablon sahneler."],
    motion: ["medya/motion.mp4", "medya/motion.jpg", "Motion tarzı: kinetik yazı ve efektler."]
  };
  var stage = document.getElementById("stage"), cap = document.getElementById("cap");
  var tabs = document.querySelectorAll(".styles button");

  function show(k) {
    tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.k === k ? "true" : "false"); });
    var c = clips[k];
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

  // autoplay only while visible; stay on poster when motion is reduced
  var vids = document.querySelectorAll("video[data-autoplay]");
  if (reduce || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    });
  }, { threshold: 0.25 });
  vids.forEach(function (v) { io.observe(v); });
})();
