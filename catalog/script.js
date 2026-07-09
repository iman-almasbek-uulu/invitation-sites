const templates = [
  { name: 'Wedding Luxury 01', category: 'Wedding', url: '../templates/wedding-luxury-01/index.html' },
  { name: 'Wedding Minimal 01', category: 'Wedding', url: '../templates/wedding-minimal-01/index.html' },
  { name: 'Nikah Elegant 01', category: 'Nikah', url: '../templates/nikah-elegant-01/index.html' },
  { name: 'Birthday Party 01', category: 'Birthday', url: '../templates/birthday-party-01/index.html' },
  { name: 'Baby Shower 01', category: 'Baby Shower', url: '../templates/baby-shower-01/index.html' }
];

document.getElementById('catalog').innerHTML = templates.map(t => `
  <article class="card">
    <p class="category">${t.category}</p>
    <h2>${t.name}</h2>
    <p>Original invitation website template. Ready to customize with client data.</p>
    <div class="actions">
      <a href="${t.url}">View demo</a>
      <a class="secondary" href="../docs/client-brief.md">Order this</a>
    </div>
  </article>
`).join('');
