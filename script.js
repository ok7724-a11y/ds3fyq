/* 폴리텍전준옥 — interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme ---------- */
  var STORE = "pjo-theme";
  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) { /* private mode */ }

  if (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    saved = "light";
  }
  if (saved) root.setAttribute("data-theme", saved);

  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content",
        root.getAttribute("data-theme") === "light" ? "#FBFBFC" : "#08090D");
    }
  }
  syncThemeColor();

  var themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(STORE, next); } catch (e) { /* ignore */ }
      syncThemeColor();
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $("#burger");
  var navLinks = $("#navLinks");

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Nav state: stuck + scroll progress ---------- */
  var nav = $("#nav");
  var progress = $("#progress");
  var toTop = $("#toTop");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (nav) nav.classList.toggle("is-stuck", y > 12);
    if (toTop) toTop.classList.toggle("is-on", y > 600);
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  reveals.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d);
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { io.observe(el); });

    // Safety net: never leave content invisible if the observer misses.
    setTimeout(function () {
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    }, 1200);
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Active section in nav ---------- */
  var links = $$(".nav__links a");
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Card spotlight ---------- */
  var fine = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    $$(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Toast ---------- */
  var toast = $("#toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }

  /* ---------- Copy email ---------- */
  var copyBtn = $("#copyMail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var mail = copyBtn.getAttribute("data-mail");

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = mail;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:-999px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        showToast(ok ? "이메일 주소를 복사했습니다" : mail);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(mail)
          .then(function () { showToast("이메일 주소를 복사했습니다"); })
          .catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- Year ---------- */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
