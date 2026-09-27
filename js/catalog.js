(() => {
  const grid = document.querySelector("#cars-grid");
  if (!grid) return;

  const resultsCount = document.querySelector("#results-count");
  const emptyState = document.querySelector("#empty-state");
  const categoriesRoot = document.querySelector("#category-options");
  const searchInput = document.querySelector("#brand-search");
  const minInput = document.querySelector("#payment-min");
  const maxInput = document.querySelector("#payment-max");
  const sortSelect = document.querySelector("#sort-cars");
  const clearButton = document.querySelector("#clear-filters");
  const mobileCount = document.querySelector("#mobile-filter-count");
  const cars = Array.isArray(window.CardooCars) ? window.CardooCars : [];

  const formatPrice = (price) => new Intl.NumberFormat("he-IL").format(price);
  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("he-IL");

  function getSelectedCategories() {
    return [...categoriesRoot.querySelectorAll("input:checked")].map((input) => input.value);
  }

  function getFilteredCars() {
    const query = normalize(searchInput.value);
    const min = minInput.value === "" ? 0 : Number(minInput.value);
    const max = maxInput.value === "" ? Infinity : Number(maxInput.value);
    const categories = getSelectedCategories();

    const filtered = cars.filter((car) => {
      const searchable = normalize([car.name, car.model, car.manufacturer, car.category, ...(car.categories || []), car.drivetrain].join(" "));
      const matchesQuery = !query || searchable.includes(query);
      const carCategories = [car.category, ...(car.categories || []), car.drivetrain];
      const matchesCategory = categories.length === 0 || categories.some((category) => carCategories.includes(category));
      const matchesPayment = car.monthlyPayment >= min && car.monthlyPayment <= max;
      return matchesQuery && matchesCategory && matchesPayment;
    });

    if (sortSelect.value === "price-asc") filtered.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
    if (sortSelect.value === "price-desc") filtered.sort((a, b) => b.monthlyPayment - a.monthlyPayment);
    return filtered;
  }

  function makeCategoryFilters() {
    const categories = [...new Set(cars.flatMap((car) => [car.category, ...(car.categories || []), car.drivetrain]).filter(Boolean))];
    categoriesRoot.innerHTML = categories.map((category, index) => `
      <label class="category-option">
        <input type="checkbox" value="${escapeHtml(category)}" id="category-${index}" />
        <span>${escapeHtml(category)}</span>
      </label>
    `).join("");
    categoriesRoot.addEventListener("change", render);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function cardMarkup(car, index) {
    const details = (car.details || []).slice(0, 3).map((detail) => `<span class="car-detail">${escapeHtml(detail)}</span>`).join("");
    const safeName = escapeHtml(car.name);
    const safeMaker = escapeHtml(car.manufacturer);
    const safeAlt = escapeHtml(car.imageAlt || car.name);
    const safeImage = escapeHtml(car.image || "");
    const safeDescription = escapeHtml(car.shortDescription || "");
    const safeCategory = escapeHtml(car.category || "רכב");
    return `
      <article class="car-card" style="animation-delay:${Math.min(index * 45, 180)}ms">
        <div class="car-image-wrap">
          <img class="car-image" src="${safeImage}" alt="${safeAlt}" loading="lazy" />
          <span class="car-category">${safeCategory}</span>
        </div>
        <div class="car-card-body">
          <p class="car-maker">${safeMaker}</p>
          <h3 class="car-name">${safeName}</h3>
          <p class="car-description">${safeDescription}</p>
          <div class="car-details">${details}</div>
          <div class="car-price-row">
            <div><span class="car-price-label">החזר חודשי משוער</span><strong class="car-price">₪${formatPrice(car.monthlyPayment)}<small>/ חודש</small></strong></div>
            <button class="car-cta" type="button" data-car-name="${safeName}" aria-label="קבלת פרטים על ${safeName}">←</button>
          </div>
        </div>
      </article>`;
  }

  function updateMobileFilterCount() {
    const count = getSelectedCategories().length + (searchInput.value.trim() ? 1 : 0) + (minInput.value ? 1 : 0) + (maxInput.value ? 1 : 0);
    mobileCount.textContent = count ? String(count) : "";
  }

  function render() {
    const filteredCars = getFilteredCars();
    grid.innerHTML = filteredCars.map(cardMarkup).join("");
    grid.setAttribute("aria-busy", "false");
    resultsCount.innerHTML = `נמצאו <strong>${filteredCars.length}</strong> רכבים מתוך ${cars.length}`;
    emptyState.hidden = filteredCars.length > 0;
    grid.hidden = filteredCars.length === 0;
    updateMobileFilterCount();
  }

  function clearFilters() {
    searchInput.value = "";
    minInput.value = "";
    maxInput.value = "";
    categoriesRoot.querySelectorAll("input").forEach((input) => { input.checked = false; });
    sortSelect.value = "recommended";
    render();
  }

  [searchInput, minInput, maxInput, sortSelect].forEach((input) => {
    input.addEventListener(input === sortSelect ? "change" : "input", render);
  });
  clearButton.addEventListener("click", clearFilters);
  document.querySelector("#empty-clear").addEventListener("click", clearFilters);

  if (cars.length) {
    makeCategoryFilters();
    render();
  } else {
    grid.hidden = true;
    grid.setAttribute("aria-busy", "false");
    resultsCount.textContent = "לא ניתן לטעון כרגע את קטלוג הרכבים.";
    emptyState.hidden = false;
    emptyState.querySelector("h3").textContent = "הקטלוג לא זמין כרגע";
    emptyState.querySelector("p").textContent = "רעננו את העמוד או השאירו פרטים ונחזור אליכם עם אפשרויות.";
  }

  window.CardooCatalog = { clearFilters };
})();
