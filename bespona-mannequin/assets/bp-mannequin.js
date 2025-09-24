(function () {
  'use strict';

  var scriptEl = document.currentScript;
  var scriptSrc = scriptEl && scriptEl.src ? scriptEl.src.split('?')[0] : '';
  var scriptDir = scriptSrc ? scriptSrc.replace(/\/[^/]*$/, '/') : '';
  var settings = window.bpMannequinSettings || {};

  function ensureTrailingSlash(path) {
    if (!path) {
      return '';
    }
    return path.endsWith('/') ? path : path + '/';
  }

  var assetsBase = ensureTrailingSlash(settings.assetsBaseUrl || scriptDir);
  var presetsBase = ensureTrailingSlash(settings.presetsBaseUrl || (assetsBase + 'presets/'));

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function warn(message) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Bespona Mannequin:', message);
    }
  }

  function resolveAssetPath(file) {
    if (!file) {
      return '';
    }

    if (/^([a-z]+:)?\/\//i.test(file)) {
      return file;
    }

    return assetsBase + file.replace(/^\//, '');
  }

  function emitSelection(id, label) {
    var detail = { id: id, label: label };
    if (typeof console !== 'undefined' && console.info) {
      console.info('bp_mannequin_select', detail);
    }

    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({
        event: 'bp_mannequin_select',
        id: id,
        label: label
      });
    }
  }

  function setSelected(pointEl, selected) {
    pointEl.classList.toggle('is-selected', selected);
    pointEl.setAttribute('aria-pressed', selected ? 'true' : 'false');
  }

  function createPoint(point, index, mode, collection) {
    var pointEl = document.createElement('li');
    pointEl.className = 'bp-point';
    pointEl.setAttribute('role', 'button');
    pointEl.setAttribute('tabindex', '0');
    pointEl.setAttribute('aria-pressed', 'false');
    pointEl.setAttribute('aria-label', point.label);
    pointEl.dataset.id = point.id;
    pointEl.dataset.label = point.label;
    pointEl.style.setProperty('--bp-top', point.top + '%');
    pointEl.style.setProperty('--bp-left', point.left + '%');
    pointEl.style.setProperty('--bp-order', index);

    var dotEl = document.createElement('span');
    dotEl.className = 'bp-point__dot';

    var labelEl = document.createElement('span');
    labelEl.className = 'bp-point__label';
    labelEl.textContent = point.label;

    pointEl.appendChild(dotEl);
    pointEl.appendChild(labelEl);

    function activate() {
      var isSelected = pointEl.classList.contains('is-selected');
      var nextState = !isSelected;

      if (mode === 'single') {
        collection.forEach(function (item) {
          if (item !== pointEl) {
            setSelected(item, false);
          }
        });
      }

      setSelected(pointEl, nextState);

      if (nextState) {
        emitSelection(point.id, point.label);
      }
    }

    pointEl.addEventListener('click', function (event) {
      event.preventDefault();
      activate();
    });

    pointEl.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        activate();
      }
    });

    return pointEl;
  }

  function initialiseContainer(container) {
    if (!container || container.dataset.bpReady === 'true') {
      return;
    }

    container.dataset.bpReady = 'true';

    var presetName = container.getAttribute('data-preset') || 'default';
    var mode = container.getAttribute('data-mode') === 'multi' ? 'multi' : 'single';
    var list = container.querySelector('.bp-mannequin__points');
    var image = container.querySelector('.bp-mannequin__img');

    if (!list) {
      warn('Aucun conteneur de points trouvé pour le mannequin.');
      return;
    }

    var presetUrl = presetsBase + presetName + '.json';

    fetch(presetUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.points)) {
          warn('Le preset "' + presetName + '" ne contient aucun point.');
          return;
        }

        if (data.image && image) {
          image.src = resolveAssetPath(data.image);
        }

        list.innerHTML = '';
        var points = [];

        data.points.forEach(function (point, index) {
          if (typeof point.top !== 'number' || typeof point.left !== 'number') {
            return;
          }

          var pointEl = createPoint(point, index, mode, points);
          points.push(pointEl);
          list.appendChild(pointEl);
        });

        container.dataset.bpMode = mode;
      })
      .catch(function (error) {
        warn('Impossible de charger le preset "' + presetName + '" (' + error.message + ').');
      });
  }

  ready(function () {
    var containers = document.querySelectorAll('.bp-mannequin');
    containers.forEach(initialiseContainer);
  });

  window.BesponaMannequin = window.BesponaMannequin || {};
  window.BesponaMannequin.getSelection = function (target) {
    var element = typeof target === 'string' ? document.querySelector(target) : target;

    if (!element) {
      return [];
    }

    return Array.prototype.slice.call(element.querySelectorAll('.bp-point.is-selected')).map(function (item) {
      return {
        id: item.dataset.id || '',
        label: item.dataset.label || ''
      };
    });
  };
})();
