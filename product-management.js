(() => {
  const categories = {
    griferias: 'Griferías', sanitarios: 'Sanitarios y mamparas',
    'aire-acondicionado': 'Aire acondicionado', aerotermia: 'Aerotermia',
    descalcificadores: 'Descalcificadores', termos: 'Termos eléctricos y calentadores de gas',
    piscina: 'Productos para piscina', outlet: 'Outlet'
  };
  const imageLimit = 1024 * 1024;

  async function api(path, options = {}) {
    const response = await fetch('/api' + path, {
      credentials: 'same-origin',
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
    });
    let result = {};
    try { result = await response.json(); } catch { /* Keep the HTTP status as the error. */ }
    if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
    return result;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeLoginPanel() {
    const root = document.querySelector('.product-admin');
    if (!root) return null;
    const panel = el('section', 'admin-panel');
    panel.setAttribute('aria-labelledby', 'admin-login-title');
    const heading = el('div', 'admin-panel-heading');
    const copy = document.createElement('div');
    const title = el('h2', '', 'Iniciar sesión');
    title.id = 'admin-login-title';
    copy.append(el('p', 'eyebrow', 'ACCESO PRIVADO'), title);
    heading.append(copy);
    const form = el('form', 'product-form');
    form.id = 'admin-login-form';
    const label = el('label', 'admin-field', 'Contraseña de administrador');
    label.htmlFor = 'admin-password';
    const password = document.createElement('input');
    password.id = 'admin-password';
    password.type = 'password';
    password.autocomplete = 'current-password';
    password.required = true;
    label.append(password);
    const actions = el('div', 'form-actions');
    const button = el('button', 'button', 'ACCEDER');
    button.type = 'submit';
    actions.append(button);
    const status = el('p', 'admin-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.append(label, actions, status);
    panel.append(heading, form);
    const backLink = root.querySelector('.private-back');
    if (backLink?.nextSibling) root.insertBefore(panel, backLink.nextSibling);
    else root.prepend(panel);
    return { panel, form, password, button, status };
  }

  async function requireAdmin() {
    const login = makeLoginPanel();
    if (!login) return false;
    try {
      await api('/auth');
      login.panel.hidden = true;
      return true;
    } catch {
      login.panel.hidden = false;
      const root = document.querySelector('.product-admin');
      root.querySelectorAll('.admin-panel:not(:first-of-type)').forEach(panel => { panel.hidden = true; });
      return new Promise(resolve => {
        login.form.addEventListener('submit', async event => {
          event.preventDefault();
          login.button.disabled = true;
          login.status.textContent = 'Comprobando…';
          login.status.classList.remove('error');
          try {
            await api('/login', { method: 'POST', body: JSON.stringify({ password: login.password.value }) });
            login.panel.hidden = true;
            root.querySelectorAll('.admin-panel').forEach(panel => { if (panel !== login.panel) panel.hidden = false; });
            resolve(true);
          } catch (error) {
            login.status.textContent = error.message;
            login.status.classList.add('error');
            login.password.focus();
          } finally {
            login.button.disabled = false;
          }
        });
      });
    }
  }

  function normalize(text) {
    return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
  }

  async function initList() {
    const list = document.querySelector('#products-list');
    if (!list || !(await requireAdmin())) return;
    const count = document.querySelector('#product-count');
    const empty = document.querySelector('#empty-products');
    const search = document.querySelector('#product-search');
    const typeFilter = document.querySelector('#product-type-filter');
    const stateFilter = document.querySelector('#product-filter');
    const pagination = document.querySelector('#products-pagination');
    let products = [];
    let currentPage = 1;
    const pageSize = 9;

    function renderPagination(pageCount) {
      pagination.replaceChildren();
      pagination.hidden = pageCount <= 1;
      if (pageCount <= 1) return;
      const addButton = (page, label, ariaLabel = label) => {
        const button = el('button', 'pagination-button', label);
        button.type = 'button';
        button.setAttribute('aria-label', ariaLabel);
        if (page === currentPage) button.setAttribute('aria-current', 'page');
        button.disabled = page === currentPage;
        button.addEventListener('click', () => {
          currentPage = page;
          render();
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        pagination.append(button);
      };
      const addEllipsis = () => pagination.append(el('span', 'pagination-ellipsis', '…'));
      addButton(Math.max(1, currentPage - 1), '‹', 'Página anterior');
      let previous = 0;
      for (let page = 1; page <= pageCount; page += 1) {
        if (page !== 1 && page !== pageCount && Math.abs(page - currentPage) > 1) continue;
        if (previous && page - previous > 1) addEllipsis();
        addButton(page, String(page), `Página ${page}`);
        previous = page;
      }
      addButton(Math.min(pageCount, currentPage + 1), '›', 'Página siguiente');
      pagination.append(el('span', 'pagination-status', `Página ${currentPage} de ${pageCount}`));
    }

    function render() {
      list.replaceChildren();
      const query = normalize(search.value);
      const matching = products.filter(product => {
        const matchesQuery = normalize(product.name + ' ' + (categories[product.type] || product.type)).includes(query);
        const matchesType = typeFilter.value === 'all' || product.type === typeFilter.value;
        const matchesState = stateFilter.value === 'all' || (stateFilter.value === 'active' ? product.active : !product.active);
        return matchesQuery && matchesType && matchesState;
      }).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      count.textContent = String(products.length);
      empty.hidden = matching.length > 0;
      empty.textContent = products.length ? 'No hay productos que coincidan con la búsqueda y los filtros.' : 'Todavía no hay productos guardados.';
      const pageCount = Math.ceil(matching.length / pageSize);
      currentPage = Math.min(currentPage, Math.max(1, pageCount));
      renderPagination(pageCount);
      matching.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach(product => {
        const row = el('article', 'managed-product');
        if (product.image) {
          const image = el('img', 'managed-product-image');
          image.src = product.image;
          image.alt = product.name;
          row.append(image);
        } else row.append(el('div', 'managed-product-image is-empty', '＋'));
        const copy = el('div', 'managed-product-copy');
        const meta = el('div', 'managed-product-meta');
        meta.append(el('span', 'managed-product-type', categories[product.type] || product.type));
        meta.append(el('span', 'managed-product-state' + (product.active ? '' : ' inactive'), product.active ? 'Activo' : 'Inactivo'));
        copy.append(meta, el('h3', '', product.name), el('p', '', product.descriptions?.es || ''));
        const actions = el('div', 'managed-product-actions');
        const editLink = el('a', '', 'Editar');
        editLink.href = 'editar-producto.html?id=' + encodeURIComponent(product.id);
        editLink.setAttribute('aria-label', 'Editar ' + product.name);
        actions.append(editLink);
        row.append(copy, actions);
        list.append(row);
      });
    }

    try {
      products = await api('/products?all=1');
      render();
    } catch (error) {
      empty.hidden = false;
      empty.textContent = error.message;
    }
    search.addEventListener('input', () => { currentPage = 1; render(); });
    typeFilter.addEventListener('change', () => { currentPage = 1; render(); });
    stateFilter.addEventListener('change', () => { currentPage = 1; render(); });
  }

  async function initEditor() {
    const form = document.querySelector('#product-form');
    if (!form || !(await requireAdmin())) return;
    const fields = {
      id: document.querySelector('#product-id'), name: document.querySelector('#product-name'),
      type: document.querySelector('#product-type'), image: document.querySelector('#product-image'),
      active: document.querySelector('#product-active'), es: document.querySelector('#description-es'),
      ca: document.querySelector('#description-ca'), en: document.querySelector('#description-en'),
      de: document.querySelector('#description-de')
    };
    const status = document.querySelector('#form-status');
    const formTitle = document.querySelector('#product-form-title');
    const pageTitle = document.querySelector('#editor-page-title');
    const saveButton = document.querySelector('#save-product');
    const previewWrap = document.querySelector('#image-preview-wrap');
    const preview = document.querySelector('#image-preview');
    const id = new URLSearchParams(location.search).get('id');
    let currentImage = '';
    let imageWasRemoved = false;
    let imageReadPending = false;
    const setStatus = (message, error = false) => {
      status.textContent = message;
      status.classList.toggle('error', error);
    };
    const showImage = data => {
      currentImage = data || '';
      preview.src = currentImage;
      previewWrap.hidden = !currentImage;
    };

    if (id) {
      try {
        const products = await api('/products?all=1');
        const existing = products.find(product => product.id === id);
        if (!existing) throw new Error('No se encontró ese producto. Vuelve al listado y selecciona otro.');
        fields.id.value = existing.id;
        fields.name.value = existing.name || '';
        fields.type.value = existing.type || '';
        fields.active.checked = Boolean(existing.active);
        fields.es.value = existing.descriptions?.es || '';
        fields.ca.value = existing.descriptions?.ca || '';
        fields.en.value = existing.descriptions?.en || '';
        fields.de.value = existing.descriptions?.de || '';
        showImage(existing.image || '');
        formTitle.textContent = 'Modificar producto';
        pageTitle.textContent = 'Modificar producto';
        saveButton.textContent = 'GUARDAR CAMBIOS';
      } catch (error) {
        setStatus(error.message, true);
        form.querySelectorAll('input,select,textarea,button').forEach(field => { field.disabled = true; });
        return;
      }
    }

    fields.image.addEventListener('change', () => {
      const file = fields.image.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        fields.image.value = '';
        setStatus('El archivo seleccionado no es una imagen.', true);
        return;
      }
      if (file.size > imageLimit) {
        fields.image.value = '';
        setStatus('La imagen supera el límite de 1 MB para guardarla en D1.', true);
        return;
      }
      imageReadPending = true;
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        imageReadPending = false;
        imageWasRemoved = false;
        showImage(String(reader.result || ''));
        setStatus('');
      });
      reader.addEventListener('error', () => {
        imageReadPending = false;
        fields.image.value = '';
        setStatus('No se pudo leer la imagen.', true);
      });
      reader.readAsDataURL(file);
    });
    document.querySelector('#remove-image').addEventListener('click', () => {
      fields.image.value = '';
      imageWasRemoved = true;
      showImage('');
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (imageReadPending) return setStatus('Espera a que termine de cargarse la imagen.', true);
      saveButton.disabled = true;
      setStatus('Guardando…');
      const product = {
        name: fields.name.value.trim(), type: fields.type.value, active: fields.active.checked,
        image: fields.image.files?.[0] ? currentImage : (imageWasRemoved ? '' : currentImage),
        descriptions: { es: fields.es.value.trim(), ca: fields.ca.value.trim(), en: fields.en.value.trim(), de: fields.de.value.trim() }
      };
      try {
        await api(fields.id.value ? '/products/' + encodeURIComponent(fields.id.value) : '/products', {
          method: fields.id.value ? 'PUT' : 'POST', body: JSON.stringify(product)
        });
        location.href = 'gestion-productos.html';
      } catch (error) {
        setStatus(error.message, true);
        saveButton.disabled = false;
      }
    });
  }

  initList();
  initEditor();
})();
