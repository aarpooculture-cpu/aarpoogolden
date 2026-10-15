document.addEventListener('DOMContentLoaded', async () => {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  try {
    const response = await fetch(`/api/get-data?type=event&slug=${encodeURIComponent(slug)}`);
    const payload = await response.json();
    const event = payload.data && payload.data.event;
    if (!response.ok || !event) throw new Error('Event not found');

    document.title = `${event.title} | Aarpoo Irroo`;
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-summary').textContent = event.short_description || '';
    document.getElementById('event-description').textContent = event.description || event.short_description || '';
    document.getElementById('event-book-link').href = '#event-booking';
    const bookingForm = document.getElementById('aarpoo-booking-form');
    bookingForm.dataset.eventSlug = event.slug;
    bookingForm.dataset.eventId = event.event_id;

    const ticketTypes = Array.isArray(event.ticket_types) ? event.ticket_types : [];
    const startingPrice = ticketTypes.length ? Math.min(...ticketTypes.map(type => type.price_in_paise)) : (event.price_in_paise || 0);
    const meta = document.getElementById('event-meta');
    meta.innerHTML = `<div class="info-column"><h6>Date</h6><p>${event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-IN') : 'TBA'}</p></div><div class="info-column"><h6>Venue</h6><p>${escapeHtml(event.venue_name || 'TBA')}</p><small>${escapeHtml(event.venue_address || '')}</small></div><div class="info-column"><h6>From</h6><p>₹${(startingPrice / 100).toLocaleString('en-IN')}</p></div>`;

    const ticketTypesEl = document.getElementById('event-ticket-types');
    if (ticketTypes.length) {
      ticketTypesEl.innerHTML = ticketTypes.map((type, index) => `<button type="button" class="ticket-option-card${index === 0 ? ' active' : ''}" data-ticket-type-id="${escapeHtml(type.ticket_type_id)}" data-ticket-type-code="${escapeHtml(type.code)}" data-ticket-name="${escapeHtml(type.name)}" data-ticket-price="${Math.round(type.price_in_paise / 100)}"><span class="ticket-option-left"><span class="ticket-option-icon">🎟️</span><span><span class="ticket-option-name">${escapeHtml(type.name)}</span><span class="ticket-option-sub">${escapeHtml(type.description || '')}</span></span></span><span class="ticket-option-price">₹${(type.price_in_paise / 100).toLocaleString('en-IN')}</span></button>`).join('');
      document.dispatchEvent(new CustomEvent('ticket-types-loaded'));
    } else {
      ticketTypesEl.innerHTML = '<p style="color:var(--text-muted);">Ticket sales are not open for this event.</p>';
      document.getElementById('btn-razorpay-checkout').disabled = true;
    }

    const image = event.hero_image_url || './aarpoo-irroo-theme/assets/images/gallery/aarpoo-banner.jpg';
    document.getElementById('event-image').src = image;
    if (event.hero_video_url) { const video = document.getElementById('event-video'); video.src = event.hero_video_url; video.style.display = 'block'; document.getElementById('event-image').style.display = 'none'; }

    document.getElementById('event-highlights').innerHTML = (event.highlights || []).map(item => `<div class="metric-box"><div class="metric-number-pill">✦</div><span class="metric-caption">${escapeHtml(item)}</span></div>`).join('');
    document.getElementById('event-gallery').innerHTML = (event.gallery || []).map(src => `<div class="photo-card"><img data-lazy-src="${escapeHtml(src)}" alt="${escapeHtml(event.title)} gallery image" loading="lazy" decoding="async"></div>`).join('');
    initDeferredGalleryImages();
  } catch (error) {
    document.getElementById('event-page').innerHTML = '<section class="section-padding"><div class="container"><h1>Event unavailable</h1><p>Please return to the events page.</p><a class="btn-gold" href="/events">View events →</a></div></section>';
  }
});

function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

function initDeferredGalleryImages() {
  const images = document.querySelectorAll('#event-gallery img[data-lazy-src]');
  const load = image => {
    image.src = image.dataset.lazySrc;
    image.removeAttribute('data-lazy-src');
  };
  if (!('IntersectionObserver' in window)) return images.forEach(load);
  const observer = new IntersectionObserver((entries, instance) => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    load(entry.target);
    instance.unobserve(entry.target);
  }), { rootMargin: '300px 0px' });
  images.forEach(image => observer.observe(image));
}
