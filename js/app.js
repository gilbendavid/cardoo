(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  const filters = document.querySelector("#catalog-filters");
  const filterOpen = document.querySelector(".filter-open");
  const filterClose = document.querySelector(".filter-close");
  const backdrop = document.querySelector(".drawer-backdrop");
  const contactSection = document.querySelector("#contact");
  const stickyCta = document.querySelector(".mobile-sticky-cta");

  function setMenu(open) {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  function setFilterDrawer(open) {
    filters.classList.toggle("is-open", open);
    backdrop.hidden = !open;
    filterOpen.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("drawer-open", open);
    if (open) {
      window.requestAnimationFrame(() => backdrop.classList.add("is-visible"));
      filterClose.focus();
    } else {
      backdrop.classList.remove("is-visible");
      filterOpen.focus();
    }
  }

  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  filterOpen.addEventListener("click", () => setFilterDrawer(true));
  filterClose.addEventListener("click", () => setFilterDrawer(false));
  backdrop.addEventListener("click", () => {
    if (filters.classList.contains("is-open")) setFilterDrawer(false);
    if (document.body.classList.contains("menu-open")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (filters.classList.contains("is-open")) setFilterDrawer(false);
    if (document.body.classList.contains("menu-open")) setMenu(false);
  });

  document.addEventListener("click", (event) => {
    const carButton = event.target.closest("[data-car-name]");
    if (!carButton) return;
    const selectedCar = document.querySelector("#selected-car");
    const selectedCarNote = document.querySelector("#selected-car-note");
    selectedCar.value = carButton.dataset.carName;
    selectedCarNote.textContent = `מתעניינים ב־${carButton.dataset.carName}`;
    selectedCarNote.hidden = false;
    document.querySelector("#contact-title").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      stickyCta.classList.toggle("is-visible", !entry.isIntersecting && window.scrollY > 500);
    }, { threshold: 0.12 });
    observer.observe(contactSection);
    window.addEventListener("scroll", () => {
      if (window.scrollY <= 500) stickyCta.classList.remove("is-visible");
    }, { passive: true });
  }

  document.querySelector("#current-year").textContent = String(new Date().getFullYear());

  function validateLead(form) {
    const name = form.elements.name;
    const phone = form.elements.phone;
    const email = form.elements.email;
    const consent = form.elements.consent;
    const normalizedPhone = phone.value.replace(/\D/g, "").replace(/^972/, "0");
    const errors = {
      name: name.value.trim().length < 2 ? "נא להזין שם מלא." : "",
      phone: !/^0\d{8,9}$/.test(normalizedPhone) ? "נא להזין מספר טלפון תקין." : "",
      email: email.value.trim() && !email.validity.valid ? "נא להזין כתובת אימייל תקינה." : "",
      consent: !consent.checked ? "כדי שנוכל לחזור אליכם, יש לאשר יצירת קשר." : ""
    };

    Object.entries(errors).forEach(([field, message]) => {
      const control = form.elements[field];
      const errorNode = document.querySelector(`#${field}-error`);
      if (errorNode) errorNode.textContent = message;
      if (control.type !== "checkbox") control.setAttribute("aria-invalid", String(Boolean(message)));
      else control.setAttribute("aria-invalid", String(Boolean(message)));
    });
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  async function submitLead(payload) {
    // Replace this mock with fetch('/api/leads', { method: 'POST', ... }) when a backend is ready.
    await new Promise((resolve) => window.setTimeout(resolve, 850));
    return { ok: true, received: Boolean(payload.name && payload.phone) };
  }

  const form = document.querySelector("#lead-form");
  const submitButton = form.querySelector(".form-submit");
  const message = document.querySelector("#form-message");
  form.addEventListener("input", (event) => {
    if (event.target.matches("input")) {
      event.target.removeAttribute("aria-invalid");
      const error = document.querySelector(`#${event.target.name}-error`);
      if (error) error.textContent = "";
      message.textContent = "";
      message.classList.remove("is-error");
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    message.classList.remove("is-error");
    if (!validateLead(form)) return;

    submitButton.classList.add("is-loading");
    submitButton.setAttribute("aria-busy", "true");
    submitButton.disabled = true;
    try {
      const formData = new FormData(form);
      const result = await submitLead(Object.fromEntries(formData.entries()));
      if (!result.ok) throw new Error("lead-submit-failed");
      form.reset();
      document.querySelector("#selected-car").value = "";
      document.querySelector("#selected-car-note").hidden = true;
      message.textContent = "תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.";
    } catch {
      message.textContent = "משהו השתבש בשליחת הטופס. נסו שוב בעוד רגע.";
      message.classList.add("is-error");
    } finally {
      submitButton.classList.remove("is-loading");
      submitButton.removeAttribute("aria-busy");
      submitButton.disabled = false;
    }
  });
})();
