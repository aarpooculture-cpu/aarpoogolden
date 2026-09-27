<?php
/**
 * Template Name: Front Page
 *
 * Aarpoo Irroo Homepage Template (With Hero Marquee Animation & Concert Background)
 *
 * @package AarpooIrrooTheme
 */

get_header();
?>

<main id="main-content">

    <!-- ==========================================================================
         1. HERO SECTION (WITH ANIMATED CONCERT BACKGROUND & INTEGRATED MARQUEE TICKER)
         ========================================================================== -->
    <section class="hero-section-wrap">
        <!-- Canvas Animated Hero Background (250-Frame Image Animation) -->
        <div class="hero-bg-slideshow" aria-hidden="true">
            <canvas id="heroFrameCanvas" class="hero-frame-canvas" data-base-url="<?php echo esc_url(get_template_directory_uri() . '/assets/images/hero/'); ?>" data-total-frames="250"></canvas>
            <div class="hero-bg-overlay"></div>
        </div>

        <div class="container">
            <div class="hero-wrapper">
                <!-- Left Hero Details -->
                <div class="hero-left-content fade-in-up">
                    <div class="hero-pills-row">
                        <span class="pill-badge">● Early Bird Live</span>
                        <span class="pill-tag">Thane</span>
                    </div>

                    <h1 class="hero-main-title apple-shimmer-text">
                        Aarpoo Vol. <em class="gold-italic apple-gold-shimmer">02</em>
                    </h1>

                    <p class="hero-description apple-text-reveal">
                        A full-throttle Malayali night — comedy, flute, live vocals and DJ.
                    </p>

                    <div class="hero-info-grid">
                        <div class="info-column">
                            <h6>Date</h6>
                            <p>9 August 2026</p>
                            <small>Sunday</small>
                        </div>
                        <div class="info-column">
                            <h6>Time</h6>
                            <p>7:30 PM onwards</p>
                        </div>
                        <div class="info-column">
                            <h6>Venue</h6>
                            <p>De Aura — Global Dining & Bar</p>
                            <small>Majiwada, Thane</small>
                        </div>
                    </div>

                    <div class="hero-cta-group">
                        <a href="#booking-section" class="btn-gold">
                            Book your seat →
                        </a>
                        <a href="<?php echo esc_url(home_url('/events')); ?>" class="btn-outline">
                            All events
                        </a>
                    </div>

                    <div class="hero-lineup-ticker">
                        LINEUP · VISHNU PAI · JAMES THAKARA · ABHIRAM RJ · FLUTE LIVE · DJ AARPOO
                    </div>
                </div>

                <!-- Right Hero Glassmorphism Floating Poster Card -->
                <div class="hero-poster-card hover-lift fade-in-up">
                    <div>
                        <div class="poster-header-tag">AARPOO IRROO PRESENTS</div>
                        <h2 class="poster-title">Aarpoo Vol. 02</h2>
                        <p class="poster-subtitle">
                            A full-throttle Malayali night — comedy, flute, live vocals and DJ.
                        </p>

                        <div class="poster-artist-list">
                            <div class="poster-artist-item">
                                <strong>Vishnu Pai</strong> <span>· Standup Comedy</span>
                            </div>
                            <div class="poster-artist-item">
                                <strong>James Thakara</strong> <span>· Standup Comedy</span>
                            </div>
                            <div class="poster-artist-item">
                                <strong>Abhiram RJ</strong> <span>· Live Vocals</span>
                            </div>
                            <div class="poster-artist-item">
                                <strong>Flute Live</strong> <span>· Instrumental Set</span>
                            </div>
                        </div>
                    </div>

                    <div class="poster-footer">
                        <div>
                            09·08·26<br>
                            <small style="font-weight:400; color:var(--text-muted);">SUNDAY · 7:30</small>
                        </div>
                        <div style="text-align:right;">
                            De Aura<br>
                            <small style="font-weight:400; color:var(--text-muted);">MAJIWADA, THANE</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Integrated Continuous Horizontal Marquee Banner inside Hero Section -->
        <div class="hero-marquee-banner" aria-label="Announcement Ticker">
            <div class="marquee-track">
                <div class="marquee-item">
                    <span>AARPOO IRROO</span>
                    <span class="marquee-bullet">•</span>
                    <span>Closer to Home</span>
                    <span class="marquee-bullet">•</span>
                    <span class="marquee-highlight">Book Tickets →</span>
                    <span class="marquee-bullet">•</span>
                    <span>Early Bird Live @ ₹599</span>
                    <span class="marquee-bullet">•</span>
                    <span>Sunday, 9 August 2026</span>
                    <span class="marquee-bullet">•</span>
                    <span>De Aura, Thane</span>
                    <span class="marquee-bullet">•</span>
                </div>
                <div class="marquee-item">
                    <span>AARPOO IRROO</span>
                    <span class="marquee-bullet">•</span>
                    <span>Closer to Home</span>
                    <span class="marquee-bullet">•</span>
                    <span class="marquee-highlight">Book Tickets →</span>
                    <span class="marquee-bullet">•</span>
                    <span>Early Bird Live @ ₹599</span>
                    <span class="marquee-bullet">•</span>
                    <span>Sunday, 9 August 2026</span>
                    <span class="marquee-bullet">•</span>
                    <span>De Aura, Thane</span>
                    <span class="marquee-bullet">•</span>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         2. ABOUT & 2X2 IMPACT METRICS
         ========================================================================== -->
    <section class="about-section">
        <div class="container">
            <div class="about-grid-wrapper">
                <!-- Left About Content -->
                <div class="fade-in-up">
                    <span class="section-kicker">About Aarpoo Irroo</span>
                    <h2 class="about-headline">
                        Every Malayali has <em class="gold-italic apple-gold-shimmer">two homes.</em>
                    </h2>
                    <p class="about-body-text apple-text-reveal">
                        One is where they live. The other is Kerala. Aarpoo Irroo is the bridge — live cultural nights that translate distant heritage into active weekend plans.
                    </p>

                    <div class="about-actions">
                        <a href="<?php echo esc_url(home_url('/about')); ?>" class="btn-outline" style="color:var(--text-dark); border-color:var(--border-warm);">
                            Read our story →
                        </a>
                        <a href="<?php echo esc_url(home_url('/partner')); ?>" class="btn-gold">
                            Partner with us
                        </a>
                    </div>
                </div>

                <!-- Right 2x2 Metric Cards Grid -->
                <div class="metrics-2x2-grid fade-in-up">
                    <div class="metric-box">
                        <div class="metric-number-pill">695K+</div>
                        <span class="metric-caption">Digital campaign views</span>
                    </div>

                    <div class="metric-box">
                        <div class="metric-number-pill">300+</div>
                        <span class="metric-caption">Avg. tickets per event</span>
                    </div>

                    <div class="metric-box">
                        <div class="metric-number-pill">400%+</div>
                        <span class="metric-caption">Follower growth in campaigns</span>
                    </div>

                    <div class="metric-box">
                        <div class="metric-number-pill">Sold Out</div>
                        <span class="metric-caption">Inaugural festival capacity</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         3. THE 4-ACT EXPERIENCE GRID
         ========================================================================== -->
    <section class="section-padding">
        <div class="container">
            <div class="section-header-centered fade-in-up">
                <span class="section-kicker">The Evening</span>
                <h2 class="section-title-large">Four acts. <em class="gold-italic">One roaring night.</em></h2>
            </div>

            <div class="acts-4-grid">
                <div class="act-card-box fade-in-up">
                    <div>
                        <div class="act-number-tag">Act 01</div>
                        <div class="act-malayalam-script">ചിരി</div>
                        <h3 class="act-heading">Standup Comedy</h3>
                        <p class="act-body">
                            Back-to-back homegrown sets by Vishnu Pai and James Thakara bringing relatable Mumbai-Malayali banter and observational humor.
                        </p>
                    </div>
                </div>

                <div class="act-card-box fade-in-up">
                    <div>
                        <div class="act-number-tag">Act 02</div>
                        <div class="act-malayalam-script">സംഗീതം</div>
                        <h3 class="act-heading">Live Concert</h3>
                        <p class="act-body">
                            Flute live instrumental performance paired with Abhiram RJ on lead vocals delivering soulful Malayalam indie hits.
                        </p>
                    </div>
                </div>

                <div class="act-card-box fade-in-up">
                    <div>
                        <div class="act-number-tag">Act 03</div>
                        <div class="act-malayalam-script">പാർട്ടി</div>
                        <h3 class="act-heading">DJ Afterparty</h3>
                        <p class="act-body">
                            Malayali-forward DJ set stitched with Bollywood bangers and South Indian dance anthems by DJ Aarpoo.
                        </p>
                    </div>
                </div>

                <div class="act-card-box fade-in-up">
                    <div>
                        <div class="act-number-tag">Act 04</div>
                        <div class="act-malayalam-script">വൈബ്</div>
                        <h3 class="act-heading">Community Vibe</h3>
                        <p class="act-body">
                            Chai-adda energy, easy conversations with fellow diaspora Malayalis, and authentic Kerala-inspired F&B counters.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         4. SCHEDULE & VENUE GUIDELINES
         ========================================================================== -->
    <section class="schedule-section">
        <div class="container">
            <div class="section-header-centered fade-in-up">
                <span class="section-kicker">Rundown</span>
                <h2 class="section-title-large">Interactive Schedule</h2>
            </div>

            <div class="timeline-flow">
                <div class="timeline-row fade-in-up">
                    <div class="timeline-time-badge">7:30 PM</div>
                    <div class="timeline-card-content">
                        <h4>Doors Open & Community Check-in</h4>
                        <p>Settle in, meet the room, and enjoy Kerala-inspired appetizers at De Aura.</p>
                    </div>
                </div>

                <div class="timeline-row fade-in-up">
                    <div class="timeline-time-badge">8:15 PM</div>
                    <div class="timeline-card-content">
                        <h4>Standup Comedy — Vishnu Pai</h4>
                        <p>Opening comedy act bringing hilarious diaspora stories.</p>
                    </div>
                </div>

                <div class="timeline-row fade-in-up">
                    <div class="timeline-time-badge">9:00 PM</div>
                    <div class="timeline-card-content">
                        <h4>Standup Comedy — James Thakara</h4>
                        <p>High-tempo Malayalam standup set packed with sharp punchlines.</p>
                    </div>
                </div>

                <div class="timeline-row fade-in-up">
                    <div class="timeline-time-badge">9:45 PM</div>
                    <div class="timeline-card-content">
                        <h4>Live Concert — Flute Live + Abhiram RJ</h4>
                        <p>Fusion indie music concert blending live flute with soulful vocals.</p>
                    </div>
                </div>

                <div class="timeline-row fade-in-up">
                    <div class="timeline-time-badge">10:45 PM</div>
                    <div class="timeline-card-content">
                        <h4>DJ Afterparty — DJ Aarpoo</h4>
                        <p>Malayalam dance tracks and Bollywood fillers to wrap up the festival.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Guidelines Accordion -->
    <section class="section-padding">
        <div class="container">
            <div class="section-header-centered fade-in-up">
                <span class="section-kicker">Important Rules</span>
                <h2 class="section-title-large">Venue Guidelines</h2>
            </div>

            <div class="accordion-wrapper">
                <div class="accordion-item-warm active fade-in-up">
                    <button class="accordion-btn" type="button">
                        <span>Seating Policy & Allocation</span>
                        <span class="accordion-arrow">▼</span>
                    </button>
                    <div class="accordion-panel">
                        Seating is strictly on a <strong>First-Come, First-Served basis</strong>. Doors open sharp at 7:30 PM.
                    </div>
                </div>

                <div class="accordion-item-warm fade-in-up">
                    <button class="accordion-btn" type="button">
                        <span>Age & Physical Photo ID</span>
                        <span class="accordion-arrow">▼</span>
                    </button>
                    <div class="accordion-panel">
                        This is an <strong>18+ event</strong>. Physical or digital photo ID is mandatory at entry security.
                    </div>
                </div>

                <div class="accordion-item-warm fade-in-up">
                    <button class="accordion-btn" type="button">
                        <span>Food & Beverage Policy</span>
                        <span class="accordion-arrow">▼</span>
                    </button>
                    <div class="accordion-panel">
                        De Aura — Global Dining & Bar runs a curated Kerala-inspired paid F&B menu. External food/drinks are prohibited.
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         5. INTERACTIVE SEAT BOOKING MODULE
         ========================================================================== -->
    <section id="booking-section" class="booking-section-container">
        <div class="container">
            <div class="booking-warm-card fade-in-up">
                <h2 class="booking-card-title">Book Your Seat</h2>
                <p style="text-align:center; color:var(--text-muted); margin-bottom:1.5rem;">
                    Aarpoo Vol. 02 • Early Bird ₹599 / seat (GST Included)
                </p>

                <div style="text-align:center;">
                    <span style="font-weight:700; font-size:0.9rem; color:var(--text-muted); text-transform:uppercase;">Select Seats (1–6):</span>
                    <div class="seat-btn-picker">
                        <button type="button" class="seat-btn seat-num-btn active" data-seats="1">1</button>
                        <button type="button" class="seat-btn seat-num-btn" data-seats="2">2</button>
                        <button type="button" class="seat-btn seat-num-btn" data-seats="3">3</button>
                        <button type="button" class="seat-btn seat-num-btn" data-seats="4">4</button>
                        <button type="button" class="seat-btn seat-num-btn" data-seats="5">5</button>
                        <button type="button" class="seat-btn seat-num-btn" data-seats="6">6</button>
                    </div>

                    <div id="group-notice" class="group-notice" style="margin-bottom:1.5rem;">
                        💡 Planning for &gt;6 seats? Contact our team at <a href="mailto:aarpooirroo@gmail.com" style="color:var(--primary-gold); text-decoration:underline;">aarpooirroo@gmail.com</a> for group bookings!
                    </div>
                </div>

                <div class="price-summary-card">
                    <div class="price-row">
                        <span>Price per seat</span>
                        <span>₹599</span>
                    </div>
                    <div class="price-row total-bold">
                        <span>Total Payable</span>
                        <span id="total-val" style="color:var(--primary-gold);">₹599</span>
                    </div>
                </div>

                <form id="aarpoo-booking-form">
                    <input type="hidden" id="selected-seats-input" name="seats" value="1">

                    <div class="form-field-group">
                        <label for="customer-name">Full Name *</label>
                        <input type="text" id="customer-name" class="form-input-warm" placeholder="Rahul Nair" required>
                    </div>

                    <div class="form-field-group">
                        <label for="customer-email">Email Address *</label>
                        <input type="email" id="customer-email" class="form-input-warm" placeholder="rahul@example.com" required>
                    </div>

                    <div class="form-field-group" style="margin-bottom:1.5rem;">
                        <label for="customer-phone">WhatsApp Number *</label>
                        <input type="tel" id="customer-phone" class="form-input-warm" placeholder="+91 98765 43210" required>
                    </div>

                    <button type="submit" id="btn-razorpay-checkout" class="btn-razorpay-pay">
                        <span class="rzp-logo-badge">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.4 2L4 14.5H11L9.6 22L20 9.5H13L13.4 2Z" fill="#3395FF"/>
                            </svg>
                        </span>
                        <span>Pay &amp; Confirm Seats via Razorpay →</span>
                    </button>
                </form>

                <!-- Razorpay Trust Shield & Payment Method Badges -->
                <div class="razorpay-trust-shield">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3395FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>256-bit Encrypted Payments • Secured by <strong>Razorpay</strong></span>
                </div>

                <div class="razorpay-method-badges">
                    <span class="payment-pill">⚡ UPI (GPay / PhonePe / Paytm)</span>
                    <span class="payment-pill">💳 Credit &amp; Debit Cards</span>
                    <span class="payment-pill">🏛️ NetBanking</span>
                    <span class="payment-pill">👛 Wallets &amp; CRED</span>
                </div>
            </div>
        </div>
    </section>

</main>

<?php get_footer(); ?>
