document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(window.location.search).get('slug') || window.location.pathname.split('/').filter(Boolean).pop();
  const fallbackEvents = {
    'aarpoo-vol-03': {
      event_id: 'local-aarpoo-vol-03', slug: 'aarpoo-vol-03', title: 'Aarpoo Vol. 03 — Mumbai',
      short_description: "AARPOO – Mumbai's Biggest Malayali Festival.",
      description: 'Get ready for an electrifying evening packed with music, entertainment, energy, and unforgettable vibes at NAYRA Mumbai. AARPOO brings together the Malayali community across Mumbai for live performances, musical jamming and sing-along sessions, DJ sets and immersive festival experiences.',
      hero_image_url: './aarpoo-irroo-theme/assets/images/gallery/aarpoo-vol-03.jpg', venue_name: 'Nayra', venue_address: 'Lower Parel, Mumbai',
      starts_at: '2026-11-07T15:00:00+05:30', price_in_paise: 39900, highlights: ['Live performances', 'Musical jamming & sing-along sessions', 'DJ sets', 'Lineup to be announced'],
      status: 'active',
      ticket_types: [
        { ticket_type_id: 'local-early-bird', code: 'early-bird', name: 'Early Bird', description: '₹500 venue cover charge payable directly at the venue and 100% redeemable on food and beverages.', price_in_paise: 39900 },
        { ticket_type_id: 'local-phase-1', code: 'phase-1', name: 'Phase 1', description: '₹500 venue cover charge payable directly at the venue and 100% redeemable on food and beverages.', price_in_paise: 59900 },
        { ticket_type_id: 'local-phase-2', code: 'phase-2', name: 'Phase 2', description: '₹500 venue cover charge payable directly at the venue and 100% redeemable on food and beverages.', price_in_paise: 79900 }
      ], gallery: ['./aarpoo-irroo-theme/assets/images/gallery/aarpoo-vol-03.jpg', './aarpoo-irroo-theme/assets/images/gallery/crowd-cheering.jpg']
    }
  };
  try {
    const response = await fetch(`/api/get-data?type=event&slug=${encodeURIComponent(slug)}`);
    const payload = await response.json();
    const event = payload.data && payload.data.event;
    if (!response.ok || !event) throw new Error('Event not found');
    const canBook = ['active', 'ongoing'].includes(String(event.status || '').toLowerCase());
    document.getElementById('event-booking').hidden = !canBook;
    document.getElementById('event-book-link').hidden = !canBook;

    document.title = `${event.title} | Aarpoo Culture`;
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
      ticketTypesEl.innerHTML = renderTicketTypes(ticketTypes);
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
    const event = fallbackEvents[slug] || fallbackEvents['aarpoo-vol-03'];
    if (!event) {
      document.getElementById('event-page').innerHTML = '<section class="section-padding"><div class="container"><h1>Event unavailable</h1><p>Please return to the events page.</p><a class="btn-gold" href="/events">View events →</a></div></section>';
      return;
    }
    renderEvent(event);
    document.getElementById('event-booking').hidden = true;
    document.getElementById('event-book-link').hidden = true;
  }
});

function renderEvent(event) {
  const bookingSection = document.getElementById('event-booking');
  const canBook = ['active', 'ongoing'].includes(String(event.status || '').toLowerCase());
  if (bookingSection) bookingSection.hidden = !canBook;
  const bookLink = document.getElementById('event-book-link');
  if (bookLink) {
    bookLink.hidden = !canBook;
    bookLink.href = canBook ? '#event-booking' : '#event-page';
  }
  document.title = `${event.title} | Aarpoo Culture`;
  document.getElementById('event-title').textContent = event.title;
  document.getElementById('event-summary').textContent = event.short_description || '';
  document.getElementById('event-description').textContent = event.description || event.short_description || '';
  const bookingForm = document.getElementById('aarpoo-booking-form');
  bookingForm.dataset.eventSlug = event.slug;
  bookingForm.dataset.eventId = event.event_id;
  const ticketTypes = Array.isArray(event.ticket_types) ? event.ticket_types : [];
  const startingPrice = ticketTypes.length ? Math.min(...ticketTypes.map(type => type.price_in_paise)) : (event.price_in_paise || 0);
  document.getElementById('event-meta').innerHTML = `<div class="info-column"><h6>Date</h6><p>${event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-IN') : 'TBA'}</p></div><div class="info-column"><h6>Venue</h6><p>${escapeHtml(event.venue_name || 'TBA')}</p><small>${escapeHtml(event.venue_address || '')}</small></div><div class="info-column"><h6>From</h6><p>₹${(startingPrice / 100).toLocaleString('en-IN')}</p></div>`;
  document.getElementById('event-ticket-types').innerHTML = renderTicketTypes(ticketTypes);
  document.dispatchEvent(new CustomEvent('ticket-types-loaded'));
  document.getElementById('event-image').src = event.hero_image_url;
  document.getElementById('event-highlights').innerHTML = (event.highlights || []).map(item => `<div class="metric-box"><div class="metric-number-pill">✦</div><span class="metric-caption">${escapeHtml(item)}</span></div>`).join('');
  document.getElementById('event-gallery').innerHTML = (event.gallery || []).map(src => `<div class="photo-card"><img src="${escapeHtml(src)}" alt="${escapeHtml(event.title)} gallery image" loading="lazy" decoding="async"></div>`).join('');
}

function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

function renderTicketTypes(ticketTypes) {
  return ticketTypes.map((type, index) => { const left = Math.max(0, Number(type.inventory_left ?? 0)); const disabled = type.status !== 'active' || left === 0; return `<button type="button" class="ticket-option-card${index === 0 && !disabled ? ' active' : ''}${disabled ? ' sold-out' : ''}" data-ticket-type-id="${escapeHtml(type.ticket_type_id)}" data-ticket-type-code="${escapeHtml(type.code)}" data-ticket-name="${escapeHtml(type.name)}" data-ticket-price="${Math.round(type.price_in_paise / 100)}" data-ticket-status="${disabled ? 'disabled' : 'active'}" data-inventory-left="${left}"><span class="ticket-option-left"><span class="ticket-option-icon">🎟️</span><span><span class="ticket-option-name">${escapeHtml(type.name)}</span><span class="ticket-option-separator"> - </span><span class="ticket-option-sub">${escapeHtml(type.description || '')}</span></span></span><span class="ticket-option-price">₹${(type.price_in_paise / 100).toLocaleString('en-IN')}</span>${disabled ? '<span class="ticket-sold-out-label">Sold Out</span>' : `<span class="ticket-inline-counter"><span class="ticket-counter-label">SEATS</span><span class="ticket-counter-controls"><span class="ticket-counter-btn" data-ticket-step="-1">−</span><span class="ticket-counter-value">${index === 0 ? '1' : '0'}</span><span class="ticket-counter-btn" data-ticket-step="1">+</span></span></span>`}</button>`; }).join('');
}

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
