(function () {
  "use strict";

  // 1. Compact Theme Switcher (cycles Auto -> Light -> Dark)
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const THEME_ORDER = ["auto", "light", "dark"];
  const THEME_LABELS = {
    auto: { label: "Auto", next: "Light" },
    light: { label: "Light", next: "Dark" },
    dark: { label: "Dark", next: "Auto" }
  };

  function buildThemeSvg(mode) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    if (mode === "light") {
      const sun = document.createElementNS(ns, "circle");
      sun.setAttribute("cx", "12");
      sun.setAttribute("cy", "12");
      sun.setAttribute("r", "4");
      const rays = document.createElementNS(ns, "path");
      rays.setAttribute(
        "d",
        "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      );
      svg.appendChild(sun);
      svg.appendChild(rays);
    } else if (mode === "dark") {
      const moon = document.createElementNS(ns, "path");
      moon.setAttribute(
        "d",
        "M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
      );
      svg.appendChild(moon);
    } else {
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", "12");
      ring.setAttribute("cy", "12");
      ring.setAttribute("r", "9");
      const half = document.createElementNS(ns, "path");
      half.setAttribute("d", "M12 3v18a9 9 0 0 0 0-18z");
      half.setAttribute("fill", "currentColor");
      half.setAttribute("stroke", "none");
      svg.appendChild(ring);
      svg.appendChild(half);
    }
    return svg;
  }

  let currentTheme = localStorage.getItem("beardiecare_web_theme") || "auto";

  function applyTheme(mode) {
    const valid = mode === "light" || mode === "dark" ? mode : "auto";
    currentTheme = valid;
    root.setAttribute("data-theme", valid);
    localStorage.setItem("beardiecare_web_theme", valid);

    if (themeToggleBtn) {
      const meta = THEME_LABELS[valid];
      const iconEl = themeToggleBtn.querySelector(".theme-icon");
      const labelEl = themeToggleBtn.querySelector(".theme-label");
      if (iconEl) iconEl.replaceChildren(buildThemeSvg(valid));
      if (labelEl) labelEl.textContent = meta.label;
      themeToggleBtn.setAttribute(
        "aria-label",
        "Theme: " + meta.label + ". Switch to " + meta.next
      );
      themeToggleBtn.setAttribute(
        "title",
        "Theme: " + meta.label + " (click to switch to " + meta.next + ")"
      );
    }
  }

  applyTheme(currentTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const idx = THEME_ORDER.indexOf(currentTheme);
      const nextMode = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      applyTheme(nextMode);
    });
  }

  // 2. Mobile navigation drawer toggle (3-line burger icon)
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("primary-nav");
  if (menuBtn && navLinks) {
    function setMenuOpen(open) {
      navLinks.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );
    }

    menuBtn.addEventListener("click", () => {
      setMenuOpen(!navLinks.classList.contains("open"));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
  }

  // 3. Live HH:MM:SS Age Ticker simulation in Sanctuary preview card
  const tickerClockEl = document.getElementById("live-ticker-clock");
  if (tickerClockEl) {
    function updateClock() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      tickerClockEl.textContent = hh + ":" + mm + ":" + ss;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 4. Interactive °F / °C unit switcher on Husbandry Targets
  const unitButtons = document.querySelectorAll("[data-set-unit]");
  const baskingValEl = document.getElementById("target-basking-value");
  const coolValEl = document.getElementById("target-cool-value");

  function applyTempUnit(unit) {
    const isCelsius = unit === "C";
    unitButtons.forEach((btn) => {
      const active = btn.getAttribute("data-set-unit") === unit;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    if (baskingValEl) {
      baskingValEl.textContent = isCelsius ? "35–43 °C" : "95–110 °F";
    }
    if (coolValEl) {
      coolValEl.textContent = isCelsius ? "24–29 °C" : "75–85 °F";
    }
  }

  unitButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTempUnit(btn.getAttribute("data-set-unit"));
    });
  });

  // 5. Interactive "How to Use" filter chips & search
  const guideSearch = document.getElementById("guide-search");
  const guideChips = document.querySelectorAll("[data-guide-filter]");
  const guideCards = document.querySelectorAll("[data-guide-card]");
  const emptyGuideMsg = document.getElementById("empty-guide-msg");
  let activeCategory = "all";

  function filterGuide() {
    if (!guideCards.length) return;
    const query = (guideSearch ? guideSearch.value : "").trim().toLowerCase();
    let visibleCount = 0;

    guideCards.forEach((card) => {
      const cat = card.getAttribute("data-category") || "";
      const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
      const text = card.textContent.toLowerCase();

      const matchesCat = activeCategory === "all" || cat === activeCategory;
      const matchesQuery = !query || text.includes(query) || keywords.includes(query);
      const show = matchesCat && matchesQuery;

      card.hidden = !show;
      if (show) visibleCount++;
    });

    if (emptyGuideMsg) {
      emptyGuideMsg.hidden = visibleCount > 0;
    }
  }

  guideChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.getAttribute("data-guide-filter") || "all";
      guideChips.forEach((c) => {
        const isActive = c === chip;
        c.classList.toggle("active", isActive);
        c.setAttribute("aria-pressed", String(isActive));
      });
      filterGuide();
    });
  });

  if (guideSearch) {
    guideSearch.addEventListener("input", filterGuide);
  }

  // 6. Copy developer email helper
  const copyEmailBtn = document.getElementById("copy-email-btn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const email = "beardiecare73@gmail.com";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          const original = copyEmailBtn.textContent;
          copyEmailBtn.textContent = "Copied!";
          setTimeout(() => {
            copyEmailBtn.textContent = original;
          }, 2200);
        }).catch(() => {});
      }
    });
  }

  // 7. Dynamically load Privacy Policy text from privacy_policy.json (single source of truth shared with Android app)
  const privacyContainer = document.getElementById("privacy-content");
  if (privacyContainer) {
    const sourceUrl = privacyContainer.getAttribute("data-privacy-source") || "privacy_policy.json";

    function createSafeLink(url, text) {
      const a = document.createElement("a");
      if (/^(https?:|mailto:|#)/i.test(url)) {
        a.setAttribute("href", url);
        if (/^https?:/i.test(url)) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        }
      }
      a.textContent = text;
      return a;
    }

    fetch(sourceUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then((policy) => {
        const sections = Array.isArray(policy.sections) ? policy.sections : [];
        if (!sections.length) {
          throw new Error("No policy sections found");
        }

        const fragment = document.createDocumentFragment();

        const heroDiv = document.createElement("div");
        heroDiv.className = "privacy-hero";
        const heroTitle = document.createElement("h1");
        heroTitle.textContent = (policy.appName || "BeardieCare") + " Privacy Policy";
        const heroMeta = document.createElement("p");
        heroMeta.textContent =
          "Effective Date: " +
          (policy.effectiveDate || "") +
          " \u2022 Package: " +
          (policy.packageId || "");
        heroDiv.appendChild(heroTitle);
        heroDiv.appendChild(heroMeta);
        fragment.appendChild(heroDiv);

        sections.forEach((sec) => {
          const card = document.createElement("section");
          card.className = "policy-card";
          if (sec.id) card.id = sec.id;

          const h2 = document.createElement("h2");
          h2.textContent = sec.title || "";
          card.appendChild(h2);

          if (Array.isArray(sec.paragraphs)) {
            sec.paragraphs.forEach((paraText, idx) => {
              const p = document.createElement("p");
              p.textContent = paraText;
              const hasMoreBelow =
                idx < sec.paragraphs.length - 1 ||
                (Array.isArray(sec.bullets) && sec.bullets.length > 0) ||
                Boolean(sec.footerNote) ||
                (Array.isArray(sec.links) && sec.links.length > 0);
              if (!hasMoreBelow) p.style.margin = "0";
              card.appendChild(p);
            });
          }

          if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
            const ul = document.createElement("ul");
            ul.className = "feature-bullets";
            sec.bullets.forEach((b) => {
              const li = document.createElement("li");
              if (b.label) {
                const strong = document.createElement("strong");
                strong.textContent = b.label + ": ";
                li.appendChild(strong);
              }
              li.appendChild(document.createTextNode(b.text || ""));
              ul.appendChild(li);
            });
            card.appendChild(ul);
          }

          if (sec.footerNote) {
            const note = document.createElement("p");
            note.style.margin = "10px 0 0";
            note.style.color = "var(--muted)";
            note.textContent = sec.footerNote;
            card.appendChild(note);
          }

          if (Array.isArray(sec.links) && sec.links.length > 0) {
            sec.links.forEach((lnk, idx) => {
              const p = document.createElement("p");
              if (idx === sec.links.length - 1) p.style.margin = "0";
              if (lnk.label) {
                p.appendChild(document.createTextNode(lnk.label + ": "));
              }
              p.appendChild(createSafeLink(lnk.url || "", lnk.text || lnk.url || ""));
              card.appendChild(p);
            });
          }

          fragment.appendChild(card);
        });

        privacyContainer.replaceChildren(fragment);

        const footerMeta = document.getElementById("privacy-footer-meta");
        if (footerMeta && policy.footerText) {
          footerMeta.textContent = policy.footerText;
        }
      })
      .catch(() => {
        const card = document.createElement("section");
        card.className = "policy-card";
        const heading = document.createElement("h2");
        heading.textContent = "Unable to Load Privacy Policy Inline";
        const msg = document.createElement("p");
        msg.textContent =
          "This page loads the single-source privacy policy from privacy_policy.json when served over HTTP/GitHub Pages. ";
        msg.appendChild(createSafeLink(sourceUrl, "View privacy_policy.json"));
        card.appendChild(heading);
        card.appendChild(msg);
        privacyContainer.replaceChildren(card);
      });
  }
})();
