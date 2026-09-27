<?php
/**
 * Template Name: Events Archive
 *
 * Page Template for Event Listings and City Archives
 *
 * @package AarpooIrrooTheme
 */

get_header();
?>

<main id="main-content">
    <section class="section-padding" style="padding-bottom:2rem; text-align:center;">
        <div class="container">
            <span class="section-kicker fade-in-up">City Chapters</span>
            <h1 class="about-headline fade-in-up">
                Events &amp; <em class="gold-italic">Archives</em>
            </h1>
            <p class="about-body-text fade-in-up" style="max-width:680px; margin:0 auto;">
                Explore current festival editions, city archives in Thane and Mumbai, and upcoming chapter roadmaps.
            </p>
        </div>
    </section>

    <!-- Flagship Featured Event -->
    <section class="section-padding" style="padding-top:1rem;">
        <div class="container">
            <div class="hero-poster-card hover-lift fade-in-up" style="max-width:900px; margin:0 auto; background:var(--bg-card-elevated);">
                <div class="poster-header-tag">FLAGSHIP EDITION VOL. 02</div>
                <h2 class="poster-title" style="font-size:3.2rem;">Aarpoo Vol. 02 — Thane</h2>
                <p class="poster-subtitle">
                    A full-throttle Malayali night — comedy, flute, live vocals and DJ.
                </p>

                <div class="poster-artist-list">
                    <div class="poster-artist-item"><strong>Vishnu Pai</strong> <span>· Standup Comedy</span></div>
                    <div class="poster-artist-item"><strong>James Thakara</strong> <span>· Standup Comedy</span></div>
                    <div class="poster-artist-item"><strong>Abhiram RJ</strong> <span>· Live Vocals</span></div>
                    <div class="poster-artist-item"><strong>Flute Live</strong> <span>· Instrumental Set</span></div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-top:1px dashed var(--border-warm); padding-top:1.5rem;">
                    <div>
                        <strong>Sunday, 9 August 2026 • 7:30 PM</strong><br>
                        <small style="color:var(--text-muted);">De Aura — Global Dining & Bar, Majiwada, Thane</small>
                    </div>
                    <a href="<?php echo esc_url(home_url('/#booking-section')); ?>" class="btn-gold">
                        Book Seats ₹599 →
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Past Archives Grid -->
    <section class="section-padding" style="background:var(--bg-warm-alt);">
        <div class="container">
            <div class="section-header-centered fade-in-up">
                <span class="section-kicker">Archive</span>
                <h2 class="section-title-large">Past <em class="gold-italic">Editions</em></h2>
            </div>

            <div class="acts-4-grid">
                <div class="act-card-box fade-in-up">
                    <span style="font-size:0.75rem; font-weight:800; color:var(--primary-gold); text-transform:uppercase; margin-bottom:0.5rem; display:block;">SOLD OUT</span>
                    <h3 class="act-heading">Aarpoo Vol. 01 — Thane Debut</h3>
                    <p class="act-body" style="margin-bottom:1rem;">
                        Over 320 tickets sold out. Inaugural standup comedy set, unplugged music, and chai-adda community vibe.
                    </p>
                    <small style="color:var(--text-dim);">June 2025 • Thane West</small>
                </div>

                <div class="act-card-box fade-in-up">
                    <span style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.5rem; display:block;">POP-UP EDITION</span>
                    <h3 class="act-heading">Chai & Comedy Adda</h3>
                    <p class="act-body" style="margin-bottom:1rem;">
                        An intimate evening of open-mic Malayalam comedy and filter coffee networking in Bandra, Mumbai.
                    </p>
                    <small style="color:var(--text-dim);">March 2025 • Bandra Chapter</small>
                </div>

                <div class="act-card-box fade-in-up">
                    <span style="font-size:0.75rem; font-weight:800; color:var(--primary-gold); text-transform:uppercase; margin-bottom:0.5rem; display:block;">ROADMAP 2026</span>
                    <h3 class="act-heading">Bangalore Chapter</h3>
                    <p class="act-body" style="margin-bottom:1rem;">
                        Expanding our cultural bridge to the Malayali diaspora in Bangalore. Stay tuned for launch dates!
                    </p>
                    <small style="color:var(--text-dim);">Late 2026 Launch</small>
                </div>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
