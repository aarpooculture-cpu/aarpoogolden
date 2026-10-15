document.addEventListener('DOMContentLoaded', async () => {
  initDeferredImages();
  const catalog = document.getElementById('events-catalog');
  if (!catalog) return;

  try {
    const response = await fetch('/api/get-data?type=events');
    const payload = await response.json();
    const events = payload.data && payload.data.events ? payload.data.events : [];

    if (!response.ok || !payload.success) throw new Error('Unable to load events.');

    catalog.innerHTML = events.length ? events.map(event => {
      const price = ((event.price_in_paise || 0) / 100).toLocaleString('en-IN');
      const image = event.hero_image_url || './aarpoo-irroo-theme/assets/images/gallery/aarpoo-banner.jpg';
      const date = event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be announced';
      return `<article class="act-card-box photo-card fade-in-up">
        <img data-lazy-src="${escapeHtml(image)}" alt="${escapeHtml(event.title)}" loading="lazy" decoding="async">
        <div class="photo-caption-overlay">
          <span class="sticker-badge alt-gold">${escapeHtml(event.status || 'ACTIVE')}</span>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.short_description || '')}</p>
          <small>${date} · From ₹${price}</small>
          <a class="btn-gold" href="/events/${encodeURIComponent(event.slug)}" style="margin-top:1rem;display:inline-block;">Reserve Your Seat →</a>
        </div>
      </article>`;
    }).join('') : '<p style="color:var(--text-muted);">No published events yet. Check back soon.</p>';
    if (events.length > 3) {
      const cards = [...catalog.children];
      let start = 0;
      const renderWindow = () => cards.forEach((card, index) => { card.style.display = index >= start && index < start + 3 ? '' : 'none'; });
      document.getElementById('events-prev')?.addEventListener('click', () => { start = Math.max(0, start - 1); renderWindow(); });
      document.getElementById('events-next')?.addEventListener('click', () => { start = Math.min(cards.length - 3, start + 1); renderWindow(); });
      renderWindow();
    }
  } catch (error) {
    catalog.innerHTML = [
      ['aarpoo-vol-03', 'AARPOO Vol. 03 — Mumbai', 'The ultimate Malayali festival in Mumbai.', '₹399'],
      ['aarpoo-vol-02', 'AARPOO Vol. 02 — Thane', 'Comedy, flute fusion, live vocals and DJ.', 'Sold out'],
      ['aarpoo-vol-01', 'AARPOO Vol. 01 — Thane', 'The inaugural Aarpoo Irroo community night.', 'Archive']
    ].map(([slug, title, description, price]) => `<article class="act-card-box fade-in-up"><span class="section-kicker">Aarpoo Irroo</span><h3 class="act-heading">${title}</h3><p class="act-body">${description}</p><a class="btn-gold" href="/events/${slug}" style="margin-top:1rem;display:inline-block;">Reserve Your Seat →</a><small style="display:block;margin-top:.75rem;color:var(--text-muted);">${price}</small></article>`).join('');
    console.error(error);
  }

  initDeferredImages();
});

/** Load below-the-fold event/gallery images shortly before they enter view. */
function initDeferredImages() {
  const images = document.querySelectorAll('img[data-lazy-src]');
  if (!images.length) return;

  const load = (image) => {
    const source = image.getAttribute('data-lazy-src');
    if (!source) return;
    image.src = source;
    image.removeAttribute('data-lazy-src');
  };

  if (!('IntersectionObserver' in window)) {
    images.forEach(load);
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      load(entry.target);
      instance.unobserve(entry.target);
    });
  }, { rootMargin: '300px 0px' });

  images.forEach(image => observer.observe(image));
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
