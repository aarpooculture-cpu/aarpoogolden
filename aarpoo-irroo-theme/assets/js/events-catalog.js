document.addEventListener('DOMContentLoaded', async () => {
  initDeferredImages();
  const catalog = document.getElementById('events-catalog');
  if (!catalog) return;

  try {
    const response = await fetch('/api/get-data?type=events');
    const payload = await response.json();
    const events = payload.data && payload.data.events ? payload.data.events : [];

    if (!response.ok || !payload.success) throw new Error('Unable to load events.');

    if (!events.length) throw new Error('No published events returned.');
    catalog.innerHTML = events.map(event => {
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
          <a class="btn-gold" href="./event.html?slug=${encodeURIComponent(event.slug)}" style="margin-top:1rem;display:inline-block;">Book Tickets →</a>
        </div>
      </article>`;
    }).join('');
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
      ['aarpoo-vol-03', 'Aarpoo Vol. 03', "AARPOO – Mumbai's Biggest Malayali Festival. Music, entertainment, energy and unforgettable vibes at NAYRA Mumbai.", '7 November 2026 · From ₹399', 'UPCOMING · ON SALE', 'aarpoo-vol-03.jpg', 'Book Tickets'],
      ['aarpoo-vol-02', 'Aarpoo Vol. 02', 'A full-throttle Malayali night with comedy, flute, live vocals and DJ. Sold out.', 'Past event · Sold out', 'PAST · SOLD OUT', 'aarpoo-banner.jpg', 'View Event'],
      ['aarpoo-vol-01', 'Aarpoo Vol. 01', 'The inaugural Aarpoo community night — packed, high-energy and sold out.', 'Past event · Sold out', 'PAST · SOLD OUT', 'aarpoo-banner.jpg', 'View Event']
    ].map(([slug, title, description, price, status, image, cta]) => `<article class="act-card-box photo-card fade-in-up"><img src="./aarpoo-irroo-theme/assets/images/gallery/${image}" alt="${title}" loading="lazy" decoding="async"><div class="photo-caption-overlay"><span class="section-kicker">${status}</span><h3 class="act-heading">${title}</h3><p class="act-body">${description}</p><small style="display:block;margin-top:.75rem;color:var(--text-muted);">${price}</small><a class="btn-gold" href="./event.html?slug=${slug}" style="margin-top:1rem;display:inline-block;">${cta} →</a></div></article>`).join('');
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
