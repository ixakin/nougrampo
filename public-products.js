(() => {
  const list = document.querySelector('#public-products-list');
  if (!list) return;

  const locale = (document.documentElement.lang || 'es').slice(0, 2);
  const copy = {
    es: {
      all: 'Todos los tipos',
      filter: 'Filtrar por tipo',
      empty: 'No hay productos disponibles en este tipo.',
      unavailable: 'No se pudo cargar el catálogo. Inténtalo de nuevo más tarde.',
      previous: 'Anterior', next: 'Siguiente', page: 'Página', of: 'de',
      contact: 'CONSULTAR PRODUCTO →',
      categories: ['Griferías', 'Sanitarios y mamparas', 'Aire acondicionado', 'Aerotermia', 'Descalcificadores', 'Termos eléctricos y calentadores de gas', 'Productos para piscina', 'Outlet']
    },
    ca: {
      all: 'Tots els tipus',
      filter: 'Filtra per tipus',
      empty: 'No hi ha productes disponibles en aquest tipus.',
      unavailable: 'No s’ha pogut carregar el catàleg. Torna-ho a provar més tard.',
      previous: 'Anterior', next: 'Següent', page: 'Pàgina', of: 'de',
      contact: 'CONSULTAR EL PRODUCTE →',
      categories: ['Aixetes', 'Sanitaris i mampares', 'Aire condicionat', 'Aerotèrmia', 'Descalcificadors', 'Termos elèctrics i escalfadors de gas', 'Productes per a piscina', 'Outlet']
    },
    en: {
      all: 'All types',
      filter: 'Filter by type',
      empty: 'No products are available in this category.',
      unavailable: 'The catalogue could not be loaded. Please try again later.',
      previous: 'Previous', next: 'Next', page: 'Page', of: 'of',
      contact: 'ENQUIRE ABOUT PRODUCT →',
      categories: ['Taps', 'Sanitaryware and screens', 'Air conditioning', 'Aerothermal systems', 'Water softeners', 'Electric water heaters and gas boilers', 'Pool products', 'Outlet']
    },
    de: {
      all: 'Alle Typen',
      filter: 'Nach Typ filtern',
      empty: 'In dieser Kategorie sind keine Produkte verfügbar.',
      unavailable: 'Der Katalog konnte nicht geladen werden. Bitte später erneut versuchen.',
      previous: 'Zurück', next: 'Weiter', page: 'Seite', of: 'von',
      contact: 'PRODUKT ANFRAGEN →',
      categories: ['Armaturen', 'Sanitärartikel und Duschabtrennungen', 'Klimaanlage', 'Wärmepumpe', 'Wasserenthärter', 'Elektro-Warmwasserspeicher und Gasdurchlauferhitzer', 'Poolprodukte', 'Outlet']
    }
  }[locale] || {
    all: 'Todos los tipos',
    filter: 'Filtrar por tipo',
    empty: 'No hay productos disponibles en este tipo.',
    contact: 'CONSULTAR PRODUCTO →',
    categories: ['Griferías', 'Sanitarios y mamparas', 'Aire acondicionado', 'Aerotermia', 'Descalcificadores', 'Termos eléctricos y calentadores de gas', 'Productos para piscina', 'Outlet']
  };

  const categoryKeys = ['griferias', 'sanitarios', 'aire-acondicionado', 'aerotermia', 'descalcificadores', 'termos', 'piscina', 'outlet'];
  const typeNames = Object.fromEntries(categoryKeys.map((key, index) => [key, copy.categories[index]]));
  const descriptionsByLocale = { es: 'es', ca: 'ca', en: 'en', de: 'de' };
  const filter = document.querySelector('#public-product-type-filter');
  const empty = document.querySelector('#public-products-empty');
  const pagination = document.querySelector('#public-products-pagination');
  const pageSize = 9;
  let currentPage = 1;
  const types = document.createDocumentFragment();

  categoryKeys.forEach((key, index) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = copy.categories[index];
    types.append(option);
  });
  filter.append(types);

  let products = [];

  function renderPagination(pageCount) {
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;
    if (pageCount <= 1) return;
    const addButton = (page, label, ariaLabel = label) => {
      const button = element('button', 'pagination-button', label);
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
    const addEllipsis = () => pagination.append(element('span', 'pagination-ellipsis', '…'));
    addButton(Math.max(1, currentPage - 1), '‹', copy.previous);
    let previous = 0;
    for (let page = 1; page <= pageCount; page += 1) {
      if (page !== 1 && page !== pageCount && Math.abs(page - currentPage) > 1) continue;
      if (previous && page - previous > 1) addEllipsis();
      addButton(page, String(page), `${copy.page} ${page}`);
      previous = page;
    }
    addButton(Math.min(pageCount, currentPage + 1), '›', copy.next);
    pagination.append(element('span', 'pagination-status', `${copy.page} ${currentPage} ${copy.of} ${pageCount}`));
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render() {
    list.replaceChildren();
    const selectedType = filter.value;
    const visibleProducts = products.filter(product => !selectedType || product.type === selectedType);
    empty.hidden = visibleProducts.length > 0;
    empty.textContent = products.length ? copy.empty : copy.empty;

    const pageCount = Math.ceil(visibleProducts.length / pageSize);
    currentPage = Math.min(currentPage, Math.max(1, pageCount));
    renderPagination(pageCount);
    visibleProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach(product => {
      const card = element('article', 'catalog-card public-product-card');
      if (product.image) {
        const image = element('img', 'public-product-image');
        image.src = product.image;
        image.alt = product.name || '';
        image.loading = 'lazy';
        card.append(image);
      } else {
        card.append(element('div', 'public-product-image public-product-image-empty', 'NG'));
      }

      const details = element('div', 'public-product-copy');
      const type = element('p', 'public-product-type', typeNames[product.type] || '');
      const title = element('h3', '', product.name || '');
      const description = product.descriptions?.[descriptionsByLocale[locale]] || product.descriptions?.es || '';
      const paragraph = element('p', '', description);
      const contact = element('a', '', copy.contact);
      contact.href = 'contacto.html';
      details.append(type, title, paragraph, contact);
      card.append(details);
      list.append(card);
    });
  }

  filter.addEventListener('change', () => { currentPage = 1; render(); });
  fetch('/api/products')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el catálogo.');
      return response.json();
    })
    .then(items => {
      products = Array.isArray(items) ? items.filter(product => product && product.id && product.active) : [];
      render();
    })
    .catch(() => {
      pagination.hidden = true;
      empty.hidden = false;
      empty.textContent = copy.unavailable;
    });
})();
