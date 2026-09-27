/**
 * Aarpoo Irroo - Interactive Booking Engine & Micro-Interactions
 * Handles 1-6 seat selection, dynamic price updates, Razorpay API checkout,
 * accordion toggles, partner form submissions, and scroll entrance animations.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Config defaults (overridden by wp_localize_script aarpooData if available)
  const config = window.aarpooData || {
    restUrl: '/api/',
    ticketPrice: 599,
    razorpayKeyId: ''
  };

  let selectedSeats = 1;
  const ticketPrice = parseInt(config.ticketPrice, 10) || 599;

  // --------------------------------------------------------------------------
  // 0. Mobile Hamburger Navigation Toggle
  // --------------------------------------------------------------------------
  (function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    if (!toggleBtn || !siteNav) return;

    // Create backdrop overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);

    function openNav() {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      siteNav.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', () => {
      if (siteNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on overlay tap
    overlay.addEventListener('click', closeNav);

    // Close when any nav link is tapped
    siteNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('open')) {
        closeNav();
      }
    });
  })();

  // --------------------------------------------------------------------------
  // 1. Seat Quantity & Dynamic Price Calculation Engine
  // --------------------------------------------------------------------------
  const seatBtns = document.querySelectorAll('.seat-btn');
  const subtotalEl = document.getElementById('subtotal-val');
  const totalEl = document.getElementById('total-val');
  const groupNoticeEl = document.getElementById('group-notice');
  const seatsInputEl = document.getElementById('selected-seats-input');

  function updatePriceDisplay(seats) {
    selectedSeats = seats;
    const subtotal = seats * ticketPrice;
    const total = subtotal; // GST inclusive

    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
    if (seatsInputEl) seatsInputEl.value = seats;

    // Show/hide group notice for >= 6 seats
    if (groupNoticeEl) {
      if (seats >= 6) {
        groupNoticeEl.classList.add('visible');
      } else {
        groupNoticeEl.classList.remove('visible');
      }
    }
  }

  if (seatBtns.length > 0) {
    seatBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        seatBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const seats = parseInt(this.getAttribute('data-seats'), 10) || 1;
        updatePriceDisplay(seats);
      });
    });
    // Initialize default (1 seat)
    updatePriceDisplay(1);
  }

  // --------------------------------------------------------------------------
  // 2. Server-Side Ticketing & Razorpay API Checkout Integration
  // --------------------------------------------------------------------------
  const bookingForm = document.getElementById('aarpoo-booking-form');
  const checkoutBtn = document.getElementById('btn-razorpay-checkout');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('customer-name').value.trim();
      const email = document.getElementById('customer-email').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();

      if (!name || !email || !phone) {
        alert('Please complete all required fields (Name, Email, and Phone).');
        return;
      }

      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<span class="rzp-logo-badge"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.4 2L4 14.5H11L9.6 22L20 9.5H13L13.4 2Z" fill="#3395FF"/></svg></span><span>Connecting to Razorpay Secure Gateway...</span>';
      }

      try {
        // Step A: Call Serverless / REST API endpoint to create Razorpay Order
        let orderEndpoint = `${config.restUrl}create-order`;
        if (config.restUrl === '/wp-json/') {
          orderEndpoint = `${config.restUrl}aarpoo/v1/create-order`;
        }

        let orderResponse;
        try {
          orderResponse = await fetch(orderEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': config.nonce || ''
            },
            body: JSON.stringify({
              seats: selectedSeats,
              name: name,
              email: email,
              phone: phone,
              amount: selectedSeats * ticketPrice * 100
            })
          });
        } catch (fetchErr) {
          // Fallback to Netlify function directly
          orderResponse = await fetch('/.netlify/functions/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              seats: selectedSeats,
              name: name,
              email: email,
              phone: phone,
              amount: selectedSeats * ticketPrice * 100
            })
          });
        }

        const orderData = await orderResponse.json();

        if (!orderResponse.ok || !orderData.success) {
          throw new Error(orderData.message || 'Failed to initiate ticket order.');
        }

        const razorpayKey = orderData.key_id || config.razorpayKeyId || '';

        // Step B: Check if Razorpay Checkout SDK is loaded & open modal
        if (typeof Razorpay !== 'undefined' && razorpayKey) {
          const options = {
            key: razorpayKey,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'Aarpoo Irroo Festivals',
            description: `Aarpoo Vol. 02 Ticket (${selectedSeats} Seat${selectedSeats > 1 ? 's' : ''})`,
            order_id: orderData.order_id,
            handler: async function (response) {
              // Step C: Verify payment signature server-side via HMAC SHA-256 validation
              await verifyPaymentServerSide({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                name: name,
                email: email,
                phone: phone,
                seats: selectedSeats,
                amount: orderData.amount / 100
              });
            },
            modal: {
              ondismiss: function () {
                console.log('Razorpay modal dismissed by user.');
                resetCheckoutBtn();
              }
            },
            prefill: {
              name: name,
              email: email,
              contact: phone
            },
            theme: {
              color: '#3395FF'
            }
          };

          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response) {
            alert('Payment failed: ' + (response.error.description || response.error.reason));
            resetCheckoutBtn();
          });
          rzp.open();
        } else {
          // Fallback Demo Mode for testing UI without live keys configured
          setTimeout(async () => {
            const mockOrderId = orderData.order_id || ('order_demo_' + Date.now());
            const mockPaymentId = 'pay_demo_' + Math.random().toString(36).substring(2, 10);
            const mockSig = 'demo_sig_' + Date.now();

            await verifyPaymentServerSide({
              razorpay_order_id: mockOrderId,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: mockSig,
              name: name,
              email: email,
              phone: phone,
              seats: selectedSeats,
              amount: selectedSeats * ticketPrice,
              is_demo: true
            });
          }, 800);
        }
      } catch (err) {
        alert('Error: ' + err.message);
        resetCheckoutBtn();
      }
    });
  }

  function resetCheckoutBtn() {
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<span class="rzp-logo-badge"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.4 2L4 14.5H11L9.6 22L20 9.5H13L13.4 2Z" fill="#3395FF"/></svg></span><span>Pay &amp; Confirm Seats via Razorpay →</span>';
    }
  }

  async function verifyPaymentServerSide(paymentPayload) {
    try {
      let verifyEndpoint = `${config.restUrl}verify-payment`;
      if (config.restUrl === '/wp-json/') {
        verifyEndpoint = `${config.restUrl}aarpoo/v1/verify-payment`;
      }

      let response;
      try {
        response = await fetch(verifyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': config.nonce || ''
          },
          body: JSON.stringify(paymentPayload)
        });
      } catch (err) {
        response = await fetch('/.netlify/functions/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentPayload)
        });
      }

      const resData = await response.json();

      if (response.ok && resData.success) {
        showSuccessModal(resData, paymentPayload);
        if (bookingForm) bookingForm.reset();
        updatePriceDisplay(1);
      } else {
        alert('Payment verification failed: ' + (resData.message || 'Invalid signature'));
      }
    } catch (e) {
      alert('Network error verifying payment: ' + e.message);
    } finally {
      resetCheckoutBtn();
    }
  }

  function showSuccessModal(resData, payload) {
    const modalHtml = `
      <div id="booking-success-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem;">
        <div style="background:#141622;border:2px solid #FF3E24;border-radius:20px;padding:2.5rem;max-width:540px;width:100%;text-align:center;box-shadow:0 0 40px rgba(255,62,36,0.4);color:#FFF;position:relative;">
          <div style="width:64px;height:64px;background:rgba(255,62,36,0.2);color:#FF3E24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1.25rem;">✓</div>
          <h3 style="font-size:1.8rem;font-weight:800;margin-bottom:0.5rem;">Ticket Confirmed!</h3>
          <p style="color:#9CA3AF;margin-bottom:1.5rem;">Aarpoo Vol. 02 • De Aura, Thane</p>
          <div style="background:rgba(255,255,255,0.04);padding:1.25rem;border-radius:12px;text-align:left;font-size:0.95rem;margin-bottom:1.5rem;border:1px solid rgba(255,255,255,0.08);">
            <p><strong>Booking ID:</strong> ${resData.booking_id || 'ARPOO-' + Math.floor(Math.random()*90000+10000)}</p>
            <p><strong>Name:</strong> ${payload.name}</p>
            <p><strong>Email:</strong> ${payload.email}</p>
            <p><strong>Seats Reserved:</strong> ${payload.seats}</p>
            <p><strong>Total Paid:</strong> ₹${payload.amount.toLocaleString('en-IN')}</p>
            <p><strong>Payment ID:</strong> ${payload.razorpay_payment_id}</p>
          </div>
          <p style="font-size:0.85rem;color:#FF6B35;margin-bottom:1.5rem;">Confirmation email and entry QR code have been dispatched to ${payload.email}.</p>
          <button id="close-modal-btn" class="btn-glow" style="width:100%;">Awesome, See You There! 🎉</button>
        </div>
      </div>
    `;

    const existingModal = document.getElementById('booking-success-modal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('close-modal-btn').addEventListener('click', function () {
      const modal = document.getElementById('booking-success-modal');
      if (modal) modal.remove();
    });
  }

  // --------------------------------------------------------------------------
  // 3. Animated Accordions (Event Schedule & Venue Guidelines)
  // --------------------------------------------------------------------------
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function () {
      const item = this.parentElement;
      const isOpen = item.classList.contains('active');

      // Close all accordion items in same container
      const siblingItems = item.parentElement.querySelectorAll('.accordion-item');
      siblingItems.forEach(sib => sib.classList.remove('active'));

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Staggered Scroll Animations (IntersectionObserver)
  // --------------------------------------------------------------------------
  const animatedElements = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // --------------------------------------------------------------------------
  // 5. Partner Form AJAX Submission (page-partner.php)
  // --------------------------------------------------------------------------
  const partnerForm = document.getElementById('aarpoo-partner-form');
  if (partnerForm) {
    partnerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = partnerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Inquiry...';
      }

      const formData = {
        brand_name: document.getElementById('partner-brand').value,
        contact_person: document.getElementById('partner-name').value,
        email: document.getElementById('partner-email').value,
        phone: document.getElementById('partner-phone').value,
        partner_type: document.getElementById('partner-type').value,
        message: document.getElementById('partner-message').value
      };

      try {
        const response = await fetch(`${config.restUrl}aarpoo/v1/submit-partner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': config.nonce || ''
          },
          body: JSON.stringify(formData)
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          alert('Thank you! Your partnership inquiry has been received. Our brand team will reach out shortly.');
          partnerForm.reset();
        } else {
          alert('Submission failed: ' + (resData.message || 'Please try again.'));
        }
      } catch (err) {
        alert('Error sending inquiry: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Partner Inquiry →';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Hero Frame-by-Frame Canvas Animation Engine (Smooth Scroll & Auto Hybrid)
  // --------------------------------------------------------------------------
  (function initHeroFrameAnimation() {
    const canvas = document.getElementById('heroFrameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const totalFrames = parseInt(canvas.getAttribute('data-total-frames'), 10) || 250;
    const baseUrl = canvas.getAttribute('data-base-url') || './aarpoo-irroo-theme/assets/images/hero/';

    const frames = [];
    const loadedStatus = new Array(totalFrames).fill(false);

    // Animation state variables with linear interpolation (LERP)
    let currentFrameFloat = 0;
    let renderedFrame = -1;
    let isPlaying = true;
    let isScrolling = false;
    let scrollTimeout = null;
    let lastTimestamp = 0;
    const targetFps = 30;
    const frameInterval = 1000 / targetFps;

    // Helper: format index to 3-digit frame URL (ezgif-frame-001.png ... ezgif-frame-250.png)
    function getFrameUrl(index) {
      const numStr = String(index + 1).padStart(3, '0');
      return `${baseUrl}ezgif-frame-${numStr}.png`;
    }

    // Set canvas dimensions dynamically for Retina / HiDPI screens
    function resizeCanvas() {
      const container = canvas.parentElement || document.body;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      renderFrame(Math.round(currentFrameFloat));
    }

    // Render single frame using object-fit cover math
    function renderFrame(index) {
      const clampedIndex = Math.max(0, Math.min(totalFrames - 1, index));
      if (clampedIndex === renderedFrame) return; // avoid redundant draws

      const img = frames[clampedIndex];
      if (!img || !loadedStatus[clampedIndex]) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;

      if (!iw || !ih) return;

      ctx.clearRect(0, 0, cw, ch);

      // Scale to cover entire canvas container
      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const cx = (cw - nw) / 2;
      const cy = (ch - nh) / 2;

      ctx.drawImage(img, cx, cy, nw, nh);
      renderedFrame = clampedIndex;
    }

    // Preload image frames progressively
    function preloadFrames() {
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
          loadedStatus[i] = true;
          if (i === 0 && renderedFrame === -1) {
            renderFrame(0);
          }
        };
        frames[i] = img;
      }
    }

    // Calculate target frame index based on scroll position in hero section
    function getScrollTargetFrame() {
      const heroSection = canvas.closest('.hero-section-wrap') || document.body;
      const heroHeight = heroSection.offsetHeight || window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;

      // Calculate scroll fraction through the hero section (0.0 to 1.0)
      const maxScrollDistance = heroHeight;
      let scrollFraction = scrollY / maxScrollDistance;
      scrollFraction = Math.max(0, Math.min(1, scrollFraction));

      return scrollFraction * (totalFrames - 1);
    }

    // Scroll listener with smooth inertia transition & parallax fade
    function onScroll() {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Reset isScrolling state 250ms after scroll halts
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 250);

      // Parallax scale & opacity fade transition on scroll
      const heroSection = canvas.closest('.hero-section-wrap');
      if (heroSection) {
        const scrollY = window.scrollY || window.pageYOffset;
        const heroHeight = heroSection.offsetHeight || window.innerHeight;
        if (scrollY <= heroHeight * 1.2) {
          const fadeRatio = Math.min(1, scrollY / heroHeight);
          canvas.style.transform = `scale(${1 + fadeRatio * 0.06}) translateY(${scrollY * 0.2}px)`;
          canvas.style.opacity = Math.max(0.2, 1 - fadeRatio * 0.65);
        }
      }
    }

    // Main animation loop driven by requestAnimationFrame & LERP smoothing
    function animate(timestamp) {
      if (!isPlaying) return;

      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      if (elapsed >= frameInterval) {
        lastTimestamp = timestamp - (elapsed % frameInterval);

        if (isScrolling) {
          // SCRUB MODE: Lerp smoothly towards target frame calculated from scroll position
          const targetFrame = getScrollTargetFrame();
          // Lerp factor 0.18 gives a silky smooth fluid response to scrolling
          currentFrameFloat += (targetFrame - currentFrameFloat) * 0.18;
        } else {
          // AUTO MODE: Continuous fluid sequence playback at 30 FPS when static
          currentFrameFloat = (currentFrameFloat + 1) % totalFrames;
        }

        renderFrame(Math.round(currentFrameFloat));
      }

      requestAnimationFrame(animate);
    }

    // Pause canvas rendering when hero is off screen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!isPlaying) {
              isPlaying = true;
              lastTimestamp = 0;
              requestAnimationFrame(animate);
            }
          } else {
            isPlaying = false;
          }
        });
      }, { threshold: 0.02 });

      observer.observe(canvas);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    preloadFrames();
    requestAnimationFrame(animate);
  })();

  // --------------------------------------------------------------------------
  // 7. Apple-Style Keynote Scroll Text Spotlight & Reveal Engine
  // --------------------------------------------------------------------------
  (function initAppleTextAnimation() {
    const textRevealElements = document.querySelectorAll('.apple-text-reveal');

    // Split text into word spans dynamically
    textRevealElements.forEach(el => {
      if (el.getAttribute('data-split') === 'true') return;

      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="apple-word">${w}</span>`).join(' ');
      el.setAttribute('data-split', 'true');
    });

    // Scroll lighting calculation: words brighten line-by-line as user scrolls past
    function updateTextReveal() {
      const windowHeight = window.innerHeight;

      textRevealElements.forEach(container => {
        const words = container.querySelectorAll('.apple-word');
        if (words.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        if (containerRect.bottom < -50 || containerRect.top > windowHeight + 50) return;

        const startPoint = windowHeight * 0.88;
        const endPoint = windowHeight * 0.25;

        let progress = (startPoint - containerRect.top) / (startPoint - endPoint);
        progress = Math.max(0, Math.min(1, progress));

        const wordsToLight = Math.floor(progress * words.length);

        words.forEach((word, index) => {
          if (index <= wordsToLight) {
            word.classList.add('lit');
          } else {
            word.classList.remove('lit');
          }
        });
      });
    }

    window.addEventListener('scroll', updateTextReveal, { passive: true });
    window.addEventListener('resize', updateTextReveal);
    // Initial call
    setTimeout(updateTextReveal, 100);
  })();

  // --------------------------------------------------------------------------
  // 8. Sticky Mobile Quick-Booking Bar Controller
  // --------------------------------------------------------------------------
  (function initMobileStickyBar() {
    let stickyBar = document.querySelector('.mobile-sticky-bar');
    if (!stickyBar) {
      stickyBar = document.createElement('div');
      stickyBar.className = 'mobile-sticky-bar';
      stickyBar.innerHTML = `
        <div class="bar-info">
          <span class="bar-title">Aarpoo Vol. 02</span>
          <span class="bar-price">₹599 / Seat • Early Bird</span>
        </div>
        <a href="#booking-section" class="btn-gold">Book Now →</a>
      `;
      document.body.appendChild(stickyBar);
    }

    const bookingSection = document.getElementById('booking-section');
    const heroSection = document.getElementById('hero');

    function checkStickyVisibility() {
      if (window.innerWidth > 768) {
        stickyBar.classList.remove('visible');
        document.body.classList.remove('has-sticky-bar');
        return;
      }

      const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 300;
      const bookingRect = bookingSection ? bookingSection.getBoundingClientRect() : null;

      const scrolledPastHero = heroBottom < 100;
      const inBookingForm = bookingRect && (bookingRect.top < window.innerHeight && bookingRect.bottom > 0);

      if (scrolledPastHero && !inBookingForm) {
        stickyBar.classList.add('visible');
        document.body.classList.add('has-sticky-bar');
      } else {
        stickyBar.classList.remove('visible');
        document.body.classList.remove('has-sticky-bar');
      }
    }

    window.addEventListener('scroll', checkStickyVisibility, { passive: true });
    window.addEventListener('resize', checkStickyVisibility);
    checkStickyVisibility();
  })();
});

