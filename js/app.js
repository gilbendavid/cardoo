(() => {
  // Add the backend URL here when it is available.
  const LEAD_API_URL =
    "https://ben-david-automation.app.n8n.cloud/webhook/cardoo-lead";
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

  menuToggle.addEventListener("click", () =>
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true"),
  );
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
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
    document
      .querySelector("#contact-title")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyCta.classList.toggle(
          "is-visible",
          !entry.isIntersecting && window.scrollY > 500,
        );
      },
      { threshold: 0.12 },
    );
    observer.observe(contactSection);
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY <= 500) stickyCta.classList.remove("is-visible");
      },
      { passive: true },
    );
  }

  document.querySelector("#current-year").textContent = String(
    new Date().getFullYear(),
  );

  function validateLead(form) {
    const name = form.elements.name;
    const phone = form.elements.phone;
    const email = form.elements.email;
    const consent = form.elements.consent;
    const normalizedPhone = phone.value.replace(/\D/g, "").replace(/^972/, "0");
    const errors = {
      name: name.value.trim().length < 2 ? "נא להזין שם מלא." : "",
      phone: !/^0\d{8,9}$/.test(normalizedPhone)
        ? "נא להזין מספר טלפון תקין."
        : "",
      email:
        email.value.trim() && !email.validity.valid
          ? "נא להזין כתובת אימייל תקינה."
          : "",
      consent: !consent.checked
        ? "כדי שנוכל לחזור אליכם, יש לאשר יצירת קשר."
        : "",
    };

    Object.entries(errors).forEach(([field, message]) => {
      const control = form.elements[field];
      const errorNode = document.querySelector(`#${field}-error`);
      if (errorNode) errorNode.textContent = message;
      if (control.type !== "checkbox")
        control.setAttribute("aria-invalid", String(Boolean(message)));
      else control.setAttribute("aria-invalid", String(Boolean(message)));
    });
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function createLeadPayload(form) {
    return {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim() || null,
      consent: form.elements.consent.checked,
      selectedCar: form.elements.selectedCar.value.trim() || null,
    };
  }

  async function submitLead(payload) {
    if (!LEAD_API_URL) throw new Error("lead-endpoint-not-configured");

    const response = await fetch(LEAD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) throw new Error("lead-submit-failed");
  }

  const form = document.querySelector("#lead-form");
  const submitButton = form.querySelector(".form-submit");
  const submitLabel = form.querySelector(".submit-label");
  const message = document.querySelector("#form-message");
  const formHeading = document.querySelector("#form-card-heading");
  const successState = document.querySelector("#lead-success");
  let isSubmitting = false;
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
    if (isSubmitting) return;
    message.textContent = "";
    message.classList.remove("is-error");
    if (!validateLead(form)) return;

    isSubmitting = true;
    submitButton.classList.add("is-loading");
    submitButton.setAttribute("aria-busy", "true");
    submitButton.disabled = true;
    submitLabel.textContent = "שולחים...";
    try {
      //await submitLead(createLeadPayload(form));
      form.reset();
      document.querySelector("#selected-car").value = "";
      document.querySelector("#selected-car-note").hidden = true;
      form.hidden = true;
      formHeading.hidden = true;
      successState.hidden = false;
      successState.focus();
    } catch {
      message.textContent = "שליחת הפרטים נכשלה. נא לנסות שוב בעוד רגע.";
      message.classList.add("is-error");
    } finally {
      isSubmitting = false;
      submitButton.classList.remove("is-loading");
      submitButton.removeAttribute("aria-busy");
      submitButton.disabled = false;
      submitLabel.textContent = "שליחה";
    }
  });
})();
