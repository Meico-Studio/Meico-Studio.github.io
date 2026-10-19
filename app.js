(() => {
  const projects = Array.isArray(window.MEICO_PROJECTS) ? window.MEICO_PROJECTS : [];
  const grid = document.querySelector("#project-grid");
  const filters = document.querySelector("#work-filters");
  const dialog = document.querySelector("#video-dialog");
  const dialogVideo = document.querySelector("#dialog-video");
  const dialogSvg = document.querySelector("#dialog-svg");
  const dialogDelivery = document.querySelector("#dialog-delivery");
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
          preview.src = project.preview || project.video;
          preview.load();
        }
        observer.unobserve(card);
      });
    }, { rootMargin: "320px 0px", threshold: 0.01 });
  }

  dialogVideo.disablePictureInPicture = true;

  document.addEventListener("contextmenu", (event) => {
    if (event.target instanceof Element && event.target.closest("video, .project-media, .project-poster")) {
      event.preventDefault();
    }
  });
  document.addEventListener("dragstart", (event) => {
    if (event.target instanceof Element && event.target.closest("video, .project-media, .project-poster")) {
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
  const projectShareUrl = (project) => `https://meico-studio.github.io/projects/${projectSlug(project)}/`;
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
            <img class="project-poster" src="${escapeHTML(project.poster)}" alt="${escapeHTML(project.title)} project artwork" loading="${index < 3 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index === 0 ? "high" : "auto"}" />
            ${project.mediaType === "svg"
              ? `<img class="project-preview" data-animation-src="${escapeHTML(project.preview)}" alt="" aria-hidden="true" />`
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
          preview.src = project.preview || project.video;
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
    const formats = isSvg ? ["Animated SVG"] : ["MP4 video"];
    const shareUrl = projectShareUrl(project);
    const emailSubject = `Project inquiry — ${project.title} | Meico Studio`;
    const emailBody = `Hi Meico Studio,\n\nI’m interested in the ${project.title} project.\n\n${shareUrl}`;
    const emailHref = `mailto:info.meicostudio@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const requestSubject = encodeURIComponent(`Editable Source Files Inquiry — ${project.title} | Meico Studio`);
    dialogDelivery.innerHTML = `
      <div class="delivery-current"><span class="delivery-label">Included preview</span><span class="delivery-format">${formats.map(escapeHTML).join(" · ")}</span></div>
      <div class="delivery-actions"><a class="project-share-link" href="${escapeHTML(emailHref)}">Email this project</a><a class="delivery-request" href="mailto:info.meicostudio@gmail.com?subject=${requestSubject}">Ask about editable files</a></div>
    `;
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
  const requestedProject = new URLSearchParams(window.location.search).get("project");
  if (requestedProject) {
    const linkedProject = projects.find((project) => projectSlug(project) === requestedProject);
    if (linkedProject) openProject(linkedProject, { historyMode: "replace" });
  }
})();
