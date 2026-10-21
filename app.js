(() => {
  const projects = Array.isArray(window.MEICO_PROJECTS) ? window.MEICO_PROJECTS : [];
  const grid = document.querySelector("#project-grid");
  const filters = document.querySelector("#work-filters");
  const dialog = document.querySelector("#video-dialog");
  const dialogVideo = document.querySelector("#dialog-video");
  const dialogSvg = document.querySelector("#dialog-svg");
  const closeButton = document.querySelector(".close-dialog");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverAvailable = window.matchMedia("(hover: hover) and (pointer: fine)");
  const mobileNavigation = window.matchMedia("(max-width: 800px)");
  let activePreview = null;
  let activeCategory = "all";
  let activeProject = null;
  let projectReturnScrollY = null;
  let revealObserver = null;
  let previewWarmObserver = null;

  const heroIcons = Array.from(document.querySelectorAll(".hero-icon"));
  const heroMotionKey = "meico-hero-motion-v1";
  const heroMotion = heroIcons.length ? getHeroMotionState() : null;

  function randomHeroPhase() {
    return Number((Math.random() * 6).toFixed(3));
  }

  function getHeroMotionState() {
    try {
      const saved = JSON.parse(localStorage.getItem(heroMotionKey));
      if (saved?.version === 1 && Number.isFinite(saved.epoch) && Array.isArray(saved.icons) && saved.icons.length === heroIcons.length) {
        let changed = false;
        saved.icons.forEach((settings) => {
          if (!Number.isFinite(settings.svgOffset)) {
            settings.svgOffset = randomHeroPhase();
            changed = true;
          }
        });
        if (changed) {
          try { localStorage.setItem(heroMotionKey, JSON.stringify(saved)); } catch {}
        }
        return saved;
      }
    } catch {}

    const state = {
      version: 1,
      epoch: Date.now(),
      icons: heroIcons.map((icon) => {
        const turnDuration = 10 + Math.random() * 8;
        const floatDelay = Number.parseFloat(getComputedStyle(icon).getPropertyValue("--float-delay")) || 0;
        const angle = () => Number((Math.random() * 4 - 2).toFixed(2));
        return {
          turnDuration: Number(turnDuration.toFixed(2)),
          turnOffset: Number((Math.random() * turnDuration).toFixed(2)),
          svgOffset: randomHeroPhase(),
          floatOffset: Math.max(0, -floatDelay),
          angles: [angle(), angle(), angle()]
        };
      })
    };
    try { localStorage.setItem(heroMotionKey, JSON.stringify(state)); } catch {}
    return state;
  }

  function scopeHeroSvgStyles(svg, scopeId) {
    const idMap = new Map();
    svg.querySelectorAll("[id]").forEach((element) => {
      const originalId = element.id;
      const namespacedId = `${scopeId}-${originalId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
      idMap.set(originalId, namespacedId);
      element.id = namespacedId;
    });

    const rewriteReferences = (value) => {
      let result = value;
      idMap.forEach((namespacedId, originalId) => {
        const escapedId = originalId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(`url\\([\\\"']?#${escapedId}[\\\"']?\\)`, "g"), `url(#${namespacedId})`);
        result = result.replace(new RegExp(`(^|[\\s(\"'])#${escapedId}(?=[)\\s\"']|$)`, "g"), `$1#${namespacedId}`);
      });
      return result;
    };

    svg.querySelectorAll("*").forEach((element) => {
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.value.includes("#")) element.setAttribute(attribute.name, rewriteReferences(attribute.value));
      }
    });

    svg.querySelectorAll("style").forEach((styleElement) => {
      const source = rewriteReferences(styleElement.textContent);
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(source);
        const serializeRules = (rules) => Array.from(rules, (rule) => {
          if (rule.type === CSSRule.STYLE_RULE) {
            const selectors = rule.selectorText.split(",").map((selector) => `#${scopeId} ${selector.trim()}`);
            return `${selectors.join(", ")} { ${rule.style.cssText} }`;
          }
          if (rule.cssRules && rule.conditionText) return `@media ${rule.conditionText} { ${serializeRules(rule.cssRules)} }`;
          return rule.cssText;
        }).join("\n");
        styleElement.textContent = serializeRules(sheet.cssRules);
      } catch {
        styleElement.textContent = source;
      }
    });
  }

  function phaseHeroSvg(svg, iconIndex) {
    if (reducedMotion.matches || !heroMotion) return;
    const elapsed = Math.max(0, (Date.now() - heroMotion.epoch) / 1000);
    const offset = heroMotion.icons[iconIndex]?.svgOffset || 0;
    const phase = (elapsed + offset) % 6;
    svg.querySelectorAll("*").forEach((element) => {
      const animationName = getComputedStyle(element).animationName;
      if (!animationName || animationName === "none") return;
      const delay = animationName.split(",").map(() => `${-phase}s`).join(", ");
      element.style.setProperty("animation-delay", delay, "important");
    });
  }

  async function inlineHeroSvgs() {
    await Promise.all(heroIcons.map(async (image, index) => {
      try {
        const response = await fetch(image.currentSrc || image.src, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Hero SVG request failed (${response.status})`);
        const source = await response.text();
        const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
        const svg = parsed.documentElement;
        if (svg.localName !== "svg" || parsed.querySelector("parsererror")) throw new Error("Invalid hero SVG");

        svg.classList.add(...image.classList);
        if (image.hasAttribute("style")) svg.setAttribute("style", image.getAttribute("style"));
        svg.id = `hero-svg-${index}`;
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.removeAttribute("data-name");
        scopeHeroSvgStyles(svg, svg.id);
        image.replaceWith(document.importNode(svg, true));
        const inlineSvg = document.getElementById(svg.id);
        requestAnimationFrame(() => phaseHeroSvg(inlineSvg, index));
      } catch (error) {
        console.warn("Keeping hero artwork as an image because its SVG could not be synchronized.", error);
      }
    }));
  }

  if (heroIcons.length && !reducedMotion.matches) {
    const elapsed = Math.max(0, (Date.now() - heroMotion.epoch) / 1000);
    heroIcons.forEach((icon, index) => {
      const settings = heroMotion.icons[index];
      const turnDuration = settings.turnDuration;
      icon.style.setProperty("--turn-duration", `${turnDuration}s`);
      icon.style.setProperty("--float-delay", `${-(elapsed + settings.floatOffset)}s`);
      icon.style.setProperty("--turn-delay", `${-(elapsed + settings.turnOffset)}s`);
      icon.style.setProperty("--turn-a", `${settings.angles[0]}deg`);
      icon.style.setProperty("--turn-b", `${settings.angles[1]}deg`);
      icon.style.setProperty("--turn-c", `${settings.angles[2]}deg`);
    });
  }

  inlineHeroSvgs();

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    document.documentElement.classList.add("has-scroll-reveal");
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  }

  if ("IntersectionObserver" in window && hoverAvailable.matches && !reducedMotion.matches) {
    previewWarmObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const project = projects[Number(card.dataset.index)];
        const preview = card.querySelector(".project-preview");
        if (project && project.mediaType !== "svg" && !preview.src) {
          preview.preload = "auto";
            preview.src = projectAssetUrl(project.preview || project.video);
          preview.load();
        }
        observer.unobserve(card);
      });
    }, { rootMargin: "320px 0px", threshold: 0.01 });
  }

  dialogVideo.disablePictureInPicture = true;

  const protectedMediaSelector = 'video, .project-media, .project-poster, .hero-icon, #dialog-svg, img[src*=".gif"]';
  document.querySelectorAll(".hero-icon, #dialog-svg").forEach((image) => {
    image.draggable = false;
  });
  document.addEventListener("contextmenu", (event) => {
    if (event.target instanceof Element && event.target.closest(protectedMediaSelector)) {
      event.preventDefault();
    }
  });
  document.addEventListener("dragstart", (event) => {
    if (event.target instanceof Element && event.target.closest(protectedMediaSelector)) {
      event.preventDefault();
    }
  });

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const projectCategories = (project) => Array.isArray(project.categories) && project.categories.length
    ? project.categories
    : [project.category].filter(Boolean);

  const pluralCategory = (category) => ({
    Illustration: "Illustrations",
    Icon: "Icons",
    Character: "Characters"
  })[category] || `${category}s`;

  const projectSlug = (project) => String(project.id || project.title || "project")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const projectHistoryUrl = (project) => window.location.protocol === "file:"
    ? `?project=${encodeURIComponent(projectSlug(project))}`
    : `/projects/${projectSlug(project)}/`;
  const projectAssetUrl = (assetPath) => window.location.protocol === "file:"
    ? new URL(assetPath, document.baseURI).href
    : new URL(assetPath, `${window.location.origin}/`).href;

  function renderFilters() {
    const counts = new Map();
    projects.forEach((project) => projectCategories(project).forEach((category) => {
      counts.set(category, (counts.get(category) || 0) + 1);
    }));

    const options = [
      { key: "all", label: "All work", count: projects.length },
      ...Array.from(counts, ([category, count]) => ({ key: category, label: pluralCategory(category), count }))
    ];

    filters.innerHTML = options.map((option) => `
      <button class="category-filter" type="button" data-filter="${escapeHTML(option.key)}" aria-pressed="${option.key === activeCategory}">
        <span>${escapeHTML(option.label)}</span><span class="filter-count">${option.count}</span>
      </button>
    `).join("");

    filters.querySelectorAll(".category-filter").forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;
        filters.querySelectorAll(".category-filter").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
        grid.querySelectorAll(".project-card").forEach((card) => {
          const project = projects[Number(card.dataset.index)];
          const shouldHide = activeCategory !== "all" && !projectCategories(project).includes(activeCategory);
          const preview = card.querySelector(".project-preview");
          if (shouldHide && activePreview === preview) {
            stopPreview(preview);
            card.classList.remove("is-previewing");
            activePreview = null;
          }
          card.hidden = shouldHide;
          if (!shouldHide && previewWarmObserver) previewWarmObserver.observe(card);
        });
      });
    });
  }

  function renderProjects() {
    grid.innerHTML = projects.map((project, index) => `
      <article class="project-card${project.mediaFit === "contain" ? " project-card--contain-media" : ""}${project.mediaType === "svg" ? " project-card--svg" : ""}" data-index="${index}">
        <button class="project-media" type="button" aria-label="${project.mediaType === "svg" ? "View" : "Play"} ${escapeHTML(project.title)}">
          <span class="media-frame">
            <img class="project-poster" src="${escapeHTML(projectAssetUrl(project.poster))}" alt="${escapeHTML(project.title)} project artwork" loading="${index < 3 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index === 0 ? "high" : "auto"}" />
            ${project.mediaType === "svg"
              ? `<img class="project-preview" data-animation-src="${escapeHTML(projectAssetUrl(project.preview))}" alt="" aria-hidden="true" />`
              : `<video class="project-preview" muted playsinline loop preload="none" aria-hidden="true"></video>`}
          </span>
        </button>
        <div class="project-title-row">
          <button class="project-title" type="button">${escapeHTML(project.title)}</button>
        </div>
        <p class="project-category">${escapeHTML(project.category || "")}</p>
      </article>
    `).join("");

    grid.querySelectorAll(".project-card").forEach((card) => {
      const project = projects[Number(card.dataset.index)];
      const preview = card.querySelector(".project-preview");
      if (revealObserver) revealObserver.observe(card);
      if (previewWarmObserver) previewWarmObserver.observe(card);
      const open = () => openProject(project);
      card.querySelector(".project-media").addEventListener("click", open);
      card.querySelector(".project-title").addEventListener("click", open);

      const startPreview = () => {
        if (!hoverAvailable.matches || reducedMotion.matches) return;
        if (activePreview && activePreview !== preview) {
          stopPreview(activePreview);
          activePreview.closest(".project-card")?.classList.remove("is-previewing");
        }
        activePreview = preview;
        if (project.mediaType === "svg") {
          if (!preview.src) {
            preview.onload = () => {
              if (activePreview === preview) card.classList.add("is-previewing");
            };
            preview.src = preview.dataset.animationSrc || project.preview;
          }
          if (preview.complete && preview.naturalWidth) card.classList.add("is-previewing");
          return;
        }
        if (!preview.src) {
          preview.preload = "auto";
          preview.src = projectAssetUrl(project.preview || project.video);
          preview.load();
        }
        const playRequest = preview.play();
        if (playRequest && typeof playRequest.then === "function") {
          playRequest.then(() => card.classList.add("is-previewing")).catch(() => {});
        }
      };
      const endPreview = () => {
        if (activePreview === preview) activePreview = null;
        stopPreview(preview);
        card.classList.remove("is-previewing");
      };
      card.addEventListener("pointerenter", startPreview);
      card.addEventListener("pointerleave", endPreview);
      card.addEventListener("focusin", startPreview);
      card.addEventListener("focusout", (event) => {
        if (!card.contains(event.relatedTarget)) endPreview();
      });
    });
  }

  function stopPreview(media) {
    if (media instanceof HTMLVideoElement) {
      media.pause();
      try { media.currentTime = 0; } catch (_) { /* Metadata may not have loaded yet. */ }
      return;
    }
    media.onload = null;
    media.onerror = null;
    media.removeAttribute("src");
  }

  function openProject(project, { historyMode = "push" } = {}) {
    if (!project) return;
    const slug = projectSlug(project);
    const projectUrl = projectHistoryUrl(project);
    if (historyMode === "push") {
      projectReturnScrollY = window.scrollY;
      window.history.pushState({ meicoProject: slug, meicoProjectFromGallery: true }, "", projectUrl);
    } else if (historyMode === "replace") {
      projectReturnScrollY = null;
      window.history.replaceState({ meicoProject: slug, meicoProjectFromGallery: false }, "", projectUrl);
    } else {
      projectReturnScrollY = window.scrollY;
    }
    activeProject = project;
    document.querySelectorAll(".project-preview").forEach((preview) => {
      stopPreview(preview);
      preview.closest(".project-card")?.classList.remove("is-previewing");
    });
    activePreview = null;
    document.querySelector("#dialog-title").textContent = project.title;
    document.querySelector("#dialog-meta").textContent = [project.category, project.year].filter(Boolean).join(" · ");
    document.querySelector("#dialog-description").textContent = project.description;
    const isSvg = project.mediaType === "svg";
    dialogSvg.hidden = !isSvg;
    dialogVideo.hidden = isSvg;
    dialogVideo.pause();
    if (isSvg) {
      dialogVideo.removeAttribute("src");
      dialogVideo.load();
      dialogSvg.alt = project.title;
      dialogSvg.src = projectAssetUrl(project.video);
    } else {
      dialogSvg.removeAttribute("src");
      dialogVideo.src = projectAssetUrl(project.video);
      dialogVideo.poster = projectAssetUrl(project.poster);
      dialogVideo.load();
    }
    dialog.showModal();
    document.body.classList.add("dialog-open");
    if (!isSvg) {
      const playRequest = dialogVideo.play();
      if (playRequest && typeof playRequest.catch === "function") playRequest.catch(() => {});
    }
  }

  function closeDialog({ syncHistory = true } = {}) {
    if (!dialog.open) return;
    dialog.close();
    if (!syncHistory) return;
    if (window.history.state?.meicoProjectFromGallery) {
      window.history.back();
    } else if (window.history.state?.meicoProject) {
      const workUrl = window.location.protocol === "file:" ? `${window.location.pathname}#work` : "/#work";
      window.history.replaceState(null, "", workUrl);
      restoreProjectPosition();
    } else {
      restoreProjectPosition();
    }
  }

  function restoreProjectPosition() {
    if (!activeProject) return;
    const project = activeProject;
    const returnScrollY = projectReturnScrollY;
    const cardIndex = projects.indexOf(project);
    const card = grid.querySelector(`.project-card[data-index="${cardIndex}"]`);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (returnScrollY !== null) {
        window.scrollTo({ top: returnScrollY, behavior: "instant" });
      } else {
        card?.scrollIntoView({ block: "center", behavior: reducedMotion.matches ? "instant" : "smooth" });
      }
      activeProject = null;
      projectReturnScrollY = null;
    }));
  }

  window.addEventListener("popstate", (event) => {
    const slug = event.state?.meicoProject;
    if (!slug) {
      if (dialog.open) closeDialog({ syncHistory: false });
      restoreProjectPosition();
      return;
    }
    const project = projects.find((item) => projectSlug(item) === slug);
    if (project) openProject(project, { historyMode: "none" });
  });

  dialog.addEventListener("close", () => {
    dialogVideo.pause();
    dialogVideo.hidden = false;
    dialogVideo.removeAttribute("src");
    dialogVideo.load();
    dialogSvg.hidden = true;
    dialogSvg.removeAttribute("src");
    document.body.classList.remove("dialog-open");
  });
  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialogVideo.pause();
    closeDialog();
  });

  function setMenuOpen(open) {
    const isOpen = Boolean(open && mobileNavigation.matches);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    siteNav.classList.toggle("is-open", isOpen);
    siteNav.inert = mobileNavigation.matches && !isOpen;
    siteNav.setAttribute("aria-hidden", String(mobileNavigation.matches && !isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  }

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    setMenuOpen(false);
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
  mobileNavigation.addEventListener("change", () => setMenuOpen(false));
  setMenuOpen(false);

  document.querySelector("#copyright-year").textContent = new Date().getFullYear();

  const sectionLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => {
        const current = link.hash === `#${visible.target.id}`;
        link.classList.toggle("is-current", current);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.35] });
    ["work", "capabilities", "process", "contact"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  renderFilters();
  renderProjects();

  // The browser can resolve a URL hash before the deferred project grid exists.
  // Re-align after page restoration so injected cards do not leave the target section offset.
  window.addEventListener("pageshow", () => {
    if (!window.location.hash) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (dialog.open) return;
      const targetId = window.location.hash.slice(1);
      const target = document.getElementById(decodeURIComponent(targetId));
      if (!target) return;
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top, behavior: "instant" });
    }));
  });

  const requestedProject = new URLSearchParams(window.location.search).get("project");
  if (requestedProject) {
    const linkedProject = projects.find((project) => projectSlug(project) === requestedProject);
    if (linkedProject) openProject(linkedProject, { historyMode: "replace" });
  }
})();
