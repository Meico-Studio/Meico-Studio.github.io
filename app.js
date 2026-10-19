(() => {
  const projects = Array.isArray(window.MEICO_PROJECTS) ? window.MEICO_PROJECTS : [];
  const grid = document.querySelector("#project-grid");
  const filters = document.querySelector("#work-filters");
  const dialog = document.querySelector("#video-dialog");
  const dialogVideo = document.querySelector("#dialog-video");
  const closeButton = document.querySelector(".close-dialog");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverAvailable = window.matchMedia("(hover: hover) and (pointer: fine)");
  const mobileNavigation = window.matchMedia("(max-width: 800px)");
  let activePreview = null;
  let activeCategory = "all";
  let revealObserver = null;

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
          card.hidden = activeCategory !== "all" && !projectCategories(project).includes(activeCategory);
        });
      });
    });
  }

  function renderProjects() {
    grid.innerHTML = projects.map((project, index) => `
      <article class="project-card${project.mediaFit === "contain" ? " project-card--contain-media" : ""}" data-index="${index}">
        <button class="project-media" type="button" aria-label="Play ${escapeHTML(project.title)}">
          <span class="media-frame">
            <img class="project-poster" src="${escapeHTML(project.poster)}" alt="${escapeHTML(project.title)} film still" loading="${index < 3 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index === 0 ? "high" : "auto"}" />
            <video class="project-preview" muted playsinline loop preload="none" aria-hidden="true"></video>
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
      const open = () => openProject(project);
      card.querySelector(".project-media").addEventListener("click", open);
      card.querySelector(".project-title").addEventListener("click", open);

      const startPreview = () => {
        if (!hoverAvailable.matches || reducedMotion.matches) return;
        if (activePreview && activePreview !== preview) stopPreview(activePreview);
        activePreview = preview;
        if (!preview.src) preview.src = project.preview || project.video;
        preview.play().then(() => card.classList.add("is-previewing")).catch(() => {});
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

  function stopPreview(video) {
    video.pause();
    try { video.currentTime = 0; } catch (_) { /* Metadata may not have loaded yet. */ }
  }

  function openProject(project) {
    if (!project) return;
    document.querySelectorAll(".project-preview").forEach((preview) => {
      stopPreview(preview);
      preview.closest(".project-card")?.classList.remove("is-previewing");
    });
    activePreview = null;
    document.querySelector("#dialog-title").textContent = project.title;
    document.querySelector("#dialog-meta").textContent = [project.category, project.year].filter(Boolean).join(" · ");
    document.querySelector("#dialog-description").textContent = project.description;
    dialogVideo.pause();
    dialogVideo.src = project.video;
    dialogVideo.poster = project.poster;
    dialogVideo.load();
    dialog.showModal();
    document.body.classList.add("dialog-open");
    const playRequest = dialogVideo.play();
    if (playRequest && typeof playRequest.catch === "function") playRequest.catch(() => {});
  }

  function closeDialog() {
    if (!dialog.open) return;
    dialog.close();
  }

  dialog.addEventListener("close", () => {
    dialogVideo.pause();
    dialogVideo.removeAttribute("src");
    dialogVideo.load();
    document.body.classList.remove("dialog-open");
  });
  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("cancel", () => {
    dialogVideo.pause();
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
  renderFilters();
  renderProjects();
})();
