(() => {
  const imageLimit = 1024 * 1024;
  async function api(path, options = {}) {
    const response = await fetch('/api' + path, { credentials: 'same-origin', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
    let result = {}; try { result = await response.json(); } catch {}
    if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
    return result;
  }
  function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function makeLoginPanel() {
    const root = document.querySelector('.product-admin'); if (!root) return null;
    const panel = el('section', 'admin-panel'); panel.setAttribute('aria-labelledby', 'admin-login-title');
    const heading = el('div', 'admin-panel-heading'); const copy = document.createElement('div'); const title = el('h2', '', 'Iniciar sesión'); title.id = 'admin-login-title'; copy.append(el('p', 'eyebrow', 'ACCESO PRIVADO'), title); heading.append(copy);
    const form = el('form', 'product-form'); const label = el('label', 'admin-field', 'Contraseña de administrador'); const password = document.createElement('input'); password.type = 'password'; password.autocomplete = 'current-password'; password.required = true; label.append(password);
    const actions = el('div', 'form-actions'); const button = el('button', 'button', 'ACCEDER'); button.type = 'submit'; actions.append(button); const status = el('p', 'admin-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); form.append(label, actions, status); panel.append(heading, form); root.prepend(panel); return { panel, form, password, button, status };
  }
  async function requireAdmin() {
    const login = makeLoginPanel(); if (!login) return false;
    try { await api('/auth'); login.panel.hidden = true; return true; } catch {
      const root = document.querySelector('.product-admin'); root.querySelectorAll('.admin-panel:not(:first-of-type)').forEach(panel => { panel.hidden = true; });
      return new Promise(resolve => login.form.addEventListener('submit', async event => { event.preventDefault(); login.button.disabled = true; login.status.textContent = 'Comprobando…'; try { await api('/login', { method: 'POST', body: JSON.stringify({ password: login.password.value }) }); login.panel.hidden = true; root.querySelectorAll('.admin-panel').forEach(panel => { if (panel !== login.panel) panel.hidden = false; }); resolve(true); } catch (error) { login.status.textContent = error.message; login.status.classList.add('error'); login.password.focus(); } finally { login.button.disabled = false; } }));
    }
  }
  function normalize(text) { return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim(); }
  async function initList() {
    const list = document.querySelector('#brands-list'); if (!list || !(await requireAdmin())) return;
    const count = document.querySelector('#brand-count'), empty = document.querySelector('#empty-brands'), search = document.querySelector('#brand-search'), state = document.querySelector('#brand-filter'); let brands = [];
    function render() {
      list.replaceChildren(); const query = normalize(search.value); const matching = brands.filter(brand => normalize(brand.name + ' ' + (brand.descriptions?.es || '')).includes(query) && (state.value === 'all' || (state.value === 'active' ? brand.active : !brand.active))).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')); count.textContent = String(brands.length); empty.hidden = matching.length > 0; empty.textContent = brands.length ? 'No hay marcas que coincidan con la búsqueda.' : 'Todavía no hay marcas guardadas.';
      matching.forEach(brand => { const row = el('article', 'managed-product'); row.append(brand.image ? Object.assign(el('img', 'managed-product-image'), { src: brand.image, alt: brand.name }) : el('div', 'managed-product-image is-empty', 'NG')); const copy = el('div', 'managed-product-copy'); const meta = el('div', 'managed-product-meta'); meta.append(el('span', 'managed-product-type', 'Marca'), el('span', 'managed-product-state' + (brand.active ? '' : ' inactive'), brand.active ? 'Activa' : 'Inactiva')); copy.append(meta, el('h3', '', brand.name), el('p', '', brand.descriptions?.es || '')); const actions = el('div', 'managed-product-actions'); const edit = el('a', '', 'Editar'); edit.href = 'editar-marca.html?id=' + encodeURIComponent(brand.id); edit.setAttribute('aria-label', 'Editar ' + brand.name); actions.append(edit); row.append(copy, actions); list.append(row); });
    }
    try { brands = await api('/brands?all=1'); render(); } catch (error) { empty.hidden = false; empty.textContent = error.message; }
    search.addEventListener('input', render); state.addEventListener('change', render);
  }
  async function initEditor() {
    const form = document.querySelector('#brand-form'); if (!form || !(await requireAdmin())) return;
    const fields = { id: document.querySelector('#brand-id'), name: document.querySelector('#brand-name'), image: document.querySelector('#brand-image'), active: document.querySelector('#brand-active'), es: document.querySelector('#description-es'), ca: document.querySelector('#description-ca'), en: document.querySelector('#description-en'), de: document.querySelector('#description-de') };
    const status = document.querySelector('#form-status'), save = document.querySelector('#save-brand'), previewWrap = document.querySelector('#image-preview-wrap'), preview = document.querySelector('#image-preview'), id = new URLSearchParams(location.search).get('id'); let currentImage = '', imageWasRemoved = false, imageReadPending = false;
    const setStatus = (message, error = false) => { status.textContent = message; status.classList.toggle('error', error); }; const showImage = data => { currentImage = data || ''; preview.src = currentImage; previewWrap.hidden = !currentImage; };
    if (id) { try { const brands = await api('/brands?all=1'); const existing = brands.find(brand => brand.id === id); if (!existing) throw new Error('No se encontró esa marca.'); fields.id.value = existing.id; fields.name.value = existing.name || ''; fields.active.checked = Boolean(existing.active); fields.es.value = existing.descriptions?.es || ''; fields.ca.value = existing.descriptions?.ca || ''; fields.en.value = existing.descriptions?.en || ''; fields.de.value = existing.descriptions?.de || ''; showImage(existing.image); document.querySelector('#editor-page-title').textContent = 'Modificar marca'; document.querySelector('#brand-form-title').textContent = 'Modificar marca'; save.textContent = 'GUARDAR CAMBIOS'; } catch (error) { setStatus(error.message, true); form.querySelectorAll('input,textarea,button').forEach(field => { field.disabled = true; }); return; } }
    fields.image.addEventListener('change', () => { const file = fields.image.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { fields.image.value = ''; return setStatus('El archivo seleccionado no es una imagen.', true); } if (file.size > imageLimit) { fields.image.value = ''; return setStatus('La imagen supera el límite de 1 MB.', true); } imageReadPending = true; const reader = new FileReader(); reader.addEventListener('load', () => { imageReadPending = false; imageWasRemoved = false; showImage(String(reader.result || '')); setStatus(''); }); reader.addEventListener('error', () => { imageReadPending = false; fields.image.value = ''; setStatus('No se pudo leer la imagen.', true); }); reader.readAsDataURL(file); });
    document.querySelector('#remove-image').addEventListener('click', () => { fields.image.value = ''; imageWasRemoved = true; showImage(''); });
    form.addEventListener('submit', async event => { event.preventDefault(); if (imageReadPending) return setStatus('Espera a que termine de cargarse la imagen.', true); save.disabled = true; setStatus('Guardando…'); const brand = { name: fields.name.value.trim(), active: fields.active.checked, image: fields.image.files?.[0] ? currentImage : (imageWasRemoved ? '' : currentImage), descriptions: { es: fields.es.value.trim(), ca: fields.ca.value.trim(), en: fields.en.value.trim(), de: fields.de.value.trim() } }; try { await api(fields.id.value ? '/brands/' + encodeURIComponent(fields.id.value) : '/brands', { method: fields.id.value ? 'PUT' : 'POST', body: JSON.stringify(brand) }); location.href = 'gestion-marcas.html'; } catch (error) { setStatus(error.message, true); save.disabled = false; } });
  }
  initList(); initEditor();
})();
