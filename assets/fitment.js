/**
 * Auto Parts Fitment engine
 * ------------------------------------------------------------------
 * Drives the Year / Make / Model "My Garage" vehicle picker:
 *  - header trigger + modal picker (snippets/fitment-picker.liquid)
 *  - inline hero picker (sections/vehicle-hero.liquid)
 *  - product page fitment check (snippets/fitment-product.liquid)
 *  - collection / search "shopping for" chip (snippets/fitment-status.liquid)
 *  - referral code capture (?ref=CODE -> cart attribute)
 *
 * Product + garage data is injected by Liquid:
 *   window.FitmentConfig = { strings, urls, customer, ... }
 *   window.FitmentProductData = { makes: [], models: [], years: [] } (optional, product pages)
 */
(function () {
  'use strict';

  var GARAGE_KEY = 'ap:garage';
  var REF_KEY = 'ap:ref';
  var REF_MAX_AGE = 90 * 24 * 60 * 60 * 1000; // 90 days

  var cfg = window.FitmentConfig || {};
  var STR = cfg.strings || {};
  var dataPromise = null;
  var vehicleData = null;

  function t(key, fallback) {
    return STR[key] || fallback || '';
  }

  /* ---------------- storage ---------------- */

  function readGarage() {
    try {
      return JSON.parse(window.localStorage.getItem(GARAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function writeGarage(garage) {
    try {
      if (garage) window.localStorage.setItem(GARAGE_KEY, JSON.stringify(garage));
      else window.localStorage.removeItem(GARAGE_KEY);
    } catch (e) {
      /* storage unavailable */
    }
    document.dispatchEvent(new CustomEvent('fitment:change', { detail: garage }));
  }

  function garageLabel(garage) {
    if (!garage || !garage.make) return '';
    var parts = [];
    if (garage.year) parts.push(garage.year);
    parts.push(garage.make);
    if (garage.model) parts.push(garage.model);
    return parts.join(' ');
  }

  /* ---------------- vehicle data ---------------- */

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(cfg.dataUrl, { cache: 'force-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('fitment data ' + res.status);
          return res.json();
        })
        .then(function (json) {
          vehicleData = json;
          return json;
        })
        .catch(function (err) {
          dataPromise = null;
          throw err;
        });
    }
    return dataPromise;
  }

  function modelsFor(makeName) {
    if (!vehicleData) return [];
    var make = vehicleData.makes.find(function (m) {
      return m.name.toLowerCase() === String(makeName || '').toLowerCase();
    });
    return make ? make.models : [];
  }

  function yearsFor(makeName, modelName) {
    var model = modelsFor(makeName).find(function (m) {
      return m.name.toLowerCase() === String(modelName || '').toLowerCase();
    });
    if (!model) return [];
    var years = [];
    for (var y = model.year_to; y >= model.year_from; y--) years.push(String(y));
    return years;
  }

  /* ---------------- filter urls ---------------- */

  function filterParams(garage) {
    var params = [];
    if (!garage) return params;
    if (garage.make) params.push(['filter.p.m.custom.fitment_make', garage.make]);
    if (garage.model) params.push(['filter.p.m.custom.fitment_model', garage.model]);
    // NOTE: Shopify storefront filtering returns 0 results when 3+ metafield
    // filters are combined, so the year is intentionally NOT sent as a URL
    // filter. The selected year is kept in the garage and enforced by the
    // exact green/red fitment check on every product page instead.
    return params;
  }

  function shopUrl(garage, base) {
    var url = base || cfg.filterBaseUrl || '/collections/all';
    var params = filterParams(garage).map(function (p) {
      return p[0] + '=' + encodeURIComponent(p[1]);
    });
    if (!params.length) return url;
    return url + (url.indexOf('?') > -1 ? '&' : '?') + params.join('&');
  }

  /* ---------------- picker population ---------------- */

  function fillSelect(select, placeholder, values, selected) {
    if (!select) return;
    select.innerHTML = '';
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholder;
    ph.disabled = true;
    ph.selected = true;
    select.appendChild(ph);
    values.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v.value !== undefined ? v.value : v;
      opt.textContent = v.label !== undefined ? v.label : v;
      if (selected && String(selected).toLowerCase() === String(opt.value).toLowerCase()) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.disabled = false;
  }

  function wireForm(form) {
    var makeSel = form.querySelector('[data-fitment-select="make"]');
    var modelSel = form.querySelector('[data-fitment-select="model"]');
    var yearSel = form.querySelector('[data-fitment-select="year"]');
    if (!makeSel || makeSel.dataset.fitmentWired) return;
    makeSel.dataset.fitmentWired = 'true';

    fillSelect(makeSel, t('select_make', 'Select make'), []);
    fillSelect(modelSel, t('select_model', 'Select model'), []);
    fillSelect(yearSel, t('select_year', 'Select year'), []);
    modelSel.disabled = true;
    yearSel.disabled = true;

    loadData()
      .then(function (json) {
        fillSelect(
          makeSel,
          t('select_make', 'Select make'),
          json.makes.map(function (m) {
            return m.name;
          })
        );
        syncFromGarage(form);
      })
      .catch(function () {
        makeSel.innerHTML = '';
        var opt = document.createElement('option');
        opt.textContent = t('load_error', 'Failed to load vehicle data');
        opt.selected = true;
        makeSel.appendChild(opt);
      });

    makeSel.addEventListener('change', function () {
      var models = modelsFor(makeSel.value);
      fillSelect(
        modelSel,
        t('select_model', 'Select model'),
        models.map(function (m) {
          return m.name;
        })
      );
      fillSelect(yearSel, t('select_year', 'Select year'), []);
    });

    modelSel.addEventListener('change', function () {
      fillSelect(yearSel, t('select_year', 'Select year'), yearsFor(makeSel.value, modelSel.value));
    });
  }

  function syncFromGarage(form) {
    var garage = readGarage();
    if (!garage) return;
    var makeSel = form.querySelector('[data-fitment-select="make"]');
    var modelSel = form.querySelector('[data-fitment-select="model"]');
    var yearSel = form.querySelector('[data-fitment-select="year"]');
    if (!makeSel || !garage.make) return;
    makeSel.value = garage.make;
    var models = modelsFor(garage.make);
    fillSelect(
      modelSel,
      t('select_model', 'Select model'),
      models.map(function (m) {
        return m.name;
      }),
      garage.model
    );
    fillSelect(yearSel, t('select_year', 'Select year'), yearsFor(garage.make, garage.model), garage.year);
  }

  /* ---------------- modal ---------------- */

  var modalEl = null;
  var lastTrigger = null;

  function getModal() {
    if (modalEl && document.contains(modalEl)) return modalEl;
    modalEl = document.getElementById('FitmentModal');
    return modalEl;
  }

  function openModal(trigger) {
    var modal = getModal();
    if (!modal) return;
    lastTrigger = trigger || null;
    modal.hidden = false;
    // next frame so the CSS transition can play
    requestAnimationFrame(function () {
      modal.classList.add('fitment-modal--open');
    });
    document.body.classList.add('fitment-locked');
    var form = modal.querySelector('[data-fitment-form]');
    if (form) {
      wireForm(form);
      syncFromGarage(form);
    }
    var firstFocusable = modal.querySelector('select, button');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal() {
    var modal = getModal();
    if (!modal) return;
    if (modal.hidden) return;
    modal.hidden = true;
    modal.classList.remove('fitment-modal--open');
    document.body.classList.remove('fitment-locked');
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  /* ---------------- triggers & labels ---------------- */

  function updateTriggers() {
    var garage = readGarage();
    var label = garage ? garageLabel(garage) : t('select_vehicle', 'Select your vehicle');
    document.querySelectorAll('.fitment-trigger__label').forEach(function (el) {
      el.textContent = label;
    });
    document.querySelectorAll('.fitment-trigger').forEach(function (el) {
      el.classList.toggle('fitment-trigger--active', !!garage);
      el.setAttribute('aria-label', garage ? t('change_vehicle', 'Change vehicle') + ': ' + label : label);
    });
  }

  /* ---------------- product page check ---------------- */

  var ICONS = {
    car:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 11l1.5-4.2A2 2 0 0 1 8.4 5.5h7.2a2 2 0 0 1 1.9 1.3L19 11"/><path d="M4 11h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1"/><path d="M3 12v3a1 1 0 0 0 1 1h1"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 12.5l5 5 10-11"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    info:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>',
  };

  function productCheck() {
    var widgets = document.querySelectorAll('[data-fitment-check]');
    if (!widgets.length) return;
    var productData = window.FitmentProductData || null;
    var hasData = !!(productData && ((productData.makes && productData.makes.length) || (productData.models && productData.models.length)));
    var isUniversal = !!(productData && productData.universal);

    function render() {
      var garage = readGarage();
      widgets.forEach(function (widget) {
        var out = widget.querySelector('[data-fitment-result]');
        if (!out) return;
        out.innerHTML = '';

        if (isUniversal) {
          out.innerHTML =
            '<div class="fitment-result fitment-result--fit">' +
            '<span class="fitment-result__icon">' + ICONS.check + '</span>' +
            '<span class="fitment-result__text">' + t('universal', 'Fits all vehicles — universal part') + '</span>' +
            '</div>';
          return;
        }

        if (!garage) {
          out.innerHTML =
            '<div class="fitment-result fitment-result--idle">' +
            '<span class="fitment-result__icon">' + ICONS.car + '</span>' +
            '<span class="fitment-result__text">' +
            (hasData ? t('no_vehicle', 'Select your vehicle to confirm fitment') : t('no_data_prompt', 'Select your vehicle to check fitment')) +
            '</span>' +
            '<button type="button" class="button button--primary fitment-result__cta" data-fitment-open>' +
            t('select_vehicle', 'Select your vehicle') +
            '</button></div>';
          return;
        }

        if (!hasData) {
          out.innerHTML =
            '<div class="fitment-result fitment-result--unknown">' +
            '<span class="fitment-result__icon">' + ICONS.info + '</span>' +
            '<span class="fitment-result__text">' +
            t('no_data', 'No fitment data listed for this part — it may fit all vehicles. Contact us to confirm.') +
            '</span></div>';
          return;
        }

        var makeOk = productData.makes.some(function (v) {
          return v.toLowerCase() === garage.make.toLowerCase();
        });
        var modelOk = !garage.model || !productData.models || !productData.models.length || productData.models.some(function (v) {
          return v.toLowerCase() === garage.model.toLowerCase();
        });
        var yearOk = !garage.year || !productData.years || !productData.years.length || productData.years.some(function (v) {
          return String(v) === String(garage.year);
        });

        var label = garageLabel(garage);
        if (makeOk && modelOk && yearOk) {
          out.innerHTML =
            '<div class="fitment-result fitment-result--fit">' +
            '<span class="fitment-result__icon">' + ICONS.check + '</span>' +
            '<span class="fitment-result__text">' + t('fits', 'Fits your {vehicle}').replace('{vehicle}', '<strong>' + label + '</strong>') + '</span>' +
            '</div>';
        } else {
          out.innerHTML =
            '<div class="fitment-result fitment-result--no">' +
            '<span class="fitment-result__icon">' + ICONS.x + '</span>' +
            '<span class="fitment-result__text">' + t('not_fit', 'Does not fit your {vehicle}').replace('{vehicle}', '<strong>' + label + '</strong>') + '</span>' +
            '<a class="button button--secondary fitment-result__cta" href="' + shopUrl(garage) + '">' + t('shop_fitting', 'Shop parts that fit') + '</a>' +
            '</div>';
        }
      });
      bindTriggers(widgets[0].closest('body') || document);
    }

    render();
    document.addEventListener('fitment:change', render);
  }

  /* ---------------- collection / search status chip ---------------- */

  function statusChip() {
    var chips = document.querySelectorAll('[data-fitment-status]');
    if (!chips.length) return;

    var params = new URLSearchParams(window.location.search);
    var filtered = ['fitment_year', 'fitment_make', 'fitment_model']
      .map(function (f) {
        return params.get('filter.p.m.custom.' + f);
      })
      .filter(Boolean)
      .join(' ');

    function render() {
      var garage = readGarage();
      var label = filtered ? filtered : garage ? garageLabel(garage) : '';
      chips.forEach(function (chip) {
        if (!label) {
          chip.hidden = true;
          return;
        }
        chip.hidden = false;
        var textEl = chip.querySelector('[data-fitment-status-label]');
        if (textEl) textEl.textContent = t('shopping_for', 'Shopping for') + ': ' + label;
      });
    }

    chips.forEach(function (chip) {
      var clearBtn = chip.querySelector('[data-fitment-clear]');
      if (clearBtn && !clearBtn.dataset.fitmentBound) {
        clearBtn.dataset.fitmentBound = 'true';
        clearBtn.addEventListener('click', function () {
          writeGarage(null);
          var url = new URL(window.location.href);
          Array.from(url.searchParams.keys()).forEach(function (key) {
            if (key.indexOf('filter.') === 0) url.searchParams.delete(key);
          });
          url.searchParams.delete('page');
          window.location.href = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '');
        });
      }
    });

    render();
    document.addEventListener('fitment:change', render);
  }

  /* ---------------- referral capture (?ref=CODE) ---------------- */

  function readRef() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(REF_KEY) || 'null');
      if (raw && raw.code && Date.now() - raw.ts < REF_MAX_AGE) return raw.code;
      if (raw) window.localStorage.removeItem(REF_KEY);
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function referral() {
    var code = null;
    try {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get(cfg.refParam || 'ref')) {
        code = urlParams.get(cfg.refParam || 'ref').slice(0, 64);
        window.localStorage.setItem(REF_KEY, JSON.stringify({ code: code, ts: Date.now() }));
      } else {
        code = readRef();
      }
    } catch (e) {
      return;
    }
    if (!code) return;

    // Fill the native cart attribute input on the cart page if present.
    document.querySelectorAll('[data-fitment-dealer-input]').forEach(function (input) {
      if (!input.value) input.value = code;
    });

    // Persist as a cart attribute so every order in the session is attributed.
    var body = 'attributes[' + (cfg.dealerAttribute || 'Dealer / Referral code') + ']=' + encodeURIComponent(code);
    fetch(window.routes ? window.routes.cart_update_url : '/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    }).catch(function () {});
  }

  /* ---------------- global wiring ---------------- */

  function bindTriggers(root) {
    (root || document).querySelectorAll('[data-fitment-open]').forEach(function (el) {
      if (el.dataset.fitmentBound) return;
      el.dataset.fitmentBound = 'true';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var modal = getModal();
        if (modal && !modal.hidden) {
          closeModal();
          return;
        }
        if (modal) openModal(el);
        else document.dispatchEvent(new CustomEvent('fitment:open'));
      });
    });
  }

  function bindForms(root) {
    (root || document).querySelectorAll('[data-fitment-form]').forEach(function (form) {
      wireForm(form);
      var submit = form.querySelector('[data-fitment-go]');
      if (submit && !submit.dataset.fitmentBound) {
        submit.dataset.fitmentBound = 'true';
        submit.addEventListener('click', function (e) {
          e.preventDefault();
          var make = form.querySelector('[data-fitment-select="make"]').value;
          var model = form.querySelector('[data-fitment-select="model"]').value;
          var year = form.querySelector('[data-fitment-select="year"]').value;
          if (!make) {
            window.location.href = cfg.filterBaseUrl || '/collections/all';
            return;
          }
          writeGarage({ make: make, model: model, year: year });
          closeModal();
          window.location.href = shopUrl({ make: make, model: model, year: year }, form.dataset.fitmentBase);
        });
      }
      var save = form.querySelector('[data-fitment-save]');
      if (save && !save.dataset.fitmentBound) {
        save.dataset.fitmentBound = 'true';
        save.addEventListener('click', function (e) {
          e.preventDefault();
          var make = form.querySelector('[data-fitment-select="make"]').value;
          if (!make) {
            closeModal();
            return;
          }
          writeGarage({
            make: make,
            model: form.querySelector('[data-fitment-select="model"]').value,
            year: form.querySelector('[data-fitment-select="year"]').value,
          });
          closeModal();
        });
      }
    });
  }

  function init() {
    bindTriggers(document);
    bindForms(document);

    var modal = getModal();
    if (modal) {
      // Close on backdrop click, on the X button, or on any [data-fitment-close]
      // child (the visible click target is often the SVG inside the button).
      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('[data-fitment-close]')) closeModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
      });
    }

    document.addEventListener('fitment:open', function () {
      openModal(null);
    });
    updateTriggers();
    document.addEventListener('fitment:change', updateTriggers);

    productCheck();
    statusChip();
    referral();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
