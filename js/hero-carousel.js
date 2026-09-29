(() => {
  const carousel = document.querySelector(".hero-carousel");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".hero-slide")];
  const controls = document.querySelector(".hero-carousel-controls");
  const dots = [...controls.querySelectorAll(".hero-carousel-dot")];
  const toggle = controls.querySelector(".hero-carousel-toggle");
  const toggleIcon = toggle.querySelector(".carousel-toggle-icon");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileViewport = window.matchMedia("(max-width: 760px), (max-width: 900px) and (max-height: 540px)");
  const intervalMs = 6800;
  let activeIndex = 0;
  let timer = null;
  let manuallyPaused = reducedMotion.matches;
  let inView = true;

  function imageSource(slide) {
    return mobileViewport.matches && slide.dataset.mobileImage
      ? slide.dataset.mobileImage
      : slide.dataset.image;
  }

  function imagePosition(slide) {
    return mobileViewport.matches
      ? slide.dataset.mobilePosition || slide.dataset.position || "center"
      : slide.dataset.position || "center";
  }

  function loadSlide(index) {
    const slide = slides[index];
    const source = imageSource(slide);
    if (slide.classList.contains("is-ready") && slide.loadedSource === source) return Promise.resolve(true);
    if (slide.loadPromise && slide.pendingSource === source) return slide.loadPromise;

    const requestId = (slide.loadRequestId || 0) + 1;
    slide.loadRequestId = requestId;
    slide.pendingSource = source;
    slide.loadPromise = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (slide.loadRequestId === requestId) {
          slide.style.backgroundImage = `url("${source}")`;
          slide.style.backgroundPosition = imagePosition(slide);
          slide.loadedSource = source;
          slide.classList.add("is-ready");
          slide.loadPromise = null;
          slide.pendingSource = null;
          resolve(true);
        } else {
          resolve(false);
        }
      };
      image.onerror = () => {
        if (slide.loadRequestId === requestId) {
          slide.loadPromise = null;
          slide.pendingSource = null;
        }
        resolve(false);
      };
      image.src = source;
    });

    return slide.loadPromise;
  }

  function updateControls() {
    dots.forEach((dot, index) => {
      const active = index === activeIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });

    toggle.setAttribute("aria-pressed", String(manuallyPaused));
    toggle.setAttribute("aria-label", manuallyPaused ? "הפעלת החלפה אוטומטית" : "השהיית החלפת התמונות");
    toggleIcon.textContent = manuallyPaused ? "▶" : "Ⅱ";
  }

  function scheduleNext() {
    window.clearTimeout(timer);
    if (manuallyPaused || !inView || document.hidden) return;
    timer = window.setTimeout(() => showSlide((activeIndex + 1) % slides.length), intervalMs);
  }

  async function showSlide(index) {
    const nextIndex = (index + slides.length) % slides.length;
    const ready = await loadSlide(nextIndex);
    if (!ready) {
      scheduleNext();
      return;
    }

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === nextIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", "true");
    });
    activeIndex = nextIndex;
    updateControls();

    // Fetch only the next image in the sequence; the remaining backgrounds stay unloaded.
    loadSlide((activeIndex + 1) % slides.length);
    scheduleNext();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  toggle.addEventListener("click", () => {
    manuallyPaused = !manuallyPaused;
    updateControls();
    scheduleNext();
  });

  document.addEventListener("visibilitychange", scheduleNext);
  reducedMotion.addEventListener?.("change", (event) => {
    if (event.matches) manuallyPaused = true;
    updateControls();
    scheduleNext();
  });

  mobileViewport.addEventListener?.("change", async () => {
    await loadSlide(activeIndex);
    loadSlide((activeIndex + 1) % slides.length);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      scheduleNext();
    }, { threshold: 0.1 });
    observer.observe(document.querySelector(".hero"));
  }

  updateControls();
  loadSlide(activeIndex);
  loadSlide(1);
  scheduleNext();
})();
