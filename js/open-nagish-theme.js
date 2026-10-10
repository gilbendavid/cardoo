(() => {
  function applyTheme() {
    const widget = document.querySelector("#opennagish-widget");
    const shadowRoot = widget?.shadowRoot;
    if (!shadowRoot) return false;
    if (shadowRoot.querySelector("#cardoo-open-nagish-theme")) return true;

    const theme = document.createElement("style");
    theme.id = "cardoo-open-nagish-theme";
    theme.textContent = `
    .anid-trigger,
    .anid-panel-header,
    .anid-toggle input:checked + .anid-toggle-slider,
    .anid-btn.anid-active {
      background-color: #c62828 !important;
    }

    .anid-slider::-webkit-slider-thumb {
      background-color: #c62828 !important;
    }

    .anid-slider::-moz-range-thumb {
      background-color: #c62828 !important;
    }

    .anid-btn.anid-active {
      border-color: #c62828 !important;
    }

    .anid-heading-list button,
    .anid-landmark-list button {
      color: #c62828 !important;
    }

    .anid-trigger:focus-visible,
    .anid-btn:focus-visible,
    .anid-category-header:focus-visible,
    .anid-toggle input:focus-visible + .anid-toggle-slider,
    .anid-slider:focus-visible,
    .anid-reset-btn:focus-visible,
    .anid-heading-list button:focus-visible,
    .anid-landmark-list button:focus-visible {
      outline-color: #c62828 !important;
    }

    .anid-close-btn:focus-visible {
      outline-color: #fff !important;
    }
    `;
    shadowRoot.append(theme);
    widget.setAttribute("role", "group");
    widget.setAttribute("aria-label", "כלי נגישות של Cardoo");
    return true;
  }

  if (applyTheme()) return;

  const observer = new MutationObserver(() => {
    if (applyTheme()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10000);
})();
