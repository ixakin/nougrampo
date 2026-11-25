(() => {
  const grid = document.querySelector('.brands-grid');
  if (!grid) return;
  const locale = (document.documentElement.lang || 'es').slice(0, 2);
  fetch('/api/brands').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(brands => {
    grid.replaceChildren();
    brands.filter(brand => brand && brand.active).forEach(brand => {
      const card = document.createElement('article'); card.className = 'brand-card';
      const copy = document.createElement('div');
      if (brand.image) { const image = document.createElement('img'); image.className = 'public-brand-image'; image.src = brand.image; image.alt = brand.name || ''; image.loading = 'lazy'; card.append(image); }
      const title = document.createElement('h3'); title.textContent = brand.name || ''; copy.append(title); card.append(copy);
      const description = document.createElement('p'); description.textContent = brand.descriptions?.[locale] || brand.descriptions?.es || ''; card.append(description); grid.append(card);
    });
  }).catch(() => {});
})();
