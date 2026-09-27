<?php
/**
 * Template Name: About & Mission
 *
 * Page Template for Cultural Mission Statement and Brand Story
 *
 * @package AarpooIrrooTheme
 */

get_header();
?>

<main id="main-content">
    <section class="section-padding" style="padding-bottom:2rem; text-align:center;">
        <div class="container">
            <span class="section-kicker fade-in-up">About Aarpoo Irroo</span>
            <h1 class="about-headline fade-in-up" style="font-size:3.5rem;">
                Every Malayali has <em class="gold-italic">two homes.</em>
            </h1>
            <p class="about-body-text fade-in-up" style="max-width:720px; margin:0 auto 2rem;">
                One is where they live. The other is Kerala. Aarpoo Irroo is the bridge — live cultural nights that translate distant heritage into active weekend plans.
            </p>
        </div>
    </section>

    <section class="section-padding" style="padding-top:1rem;">
        <div class="container" style="max-width:920px;">
            <div class="partner-box-card fade-in-up" style="line-height:1.8;">
                <span class="section-kicker">Our Cultural Story</span>
                <h2 style="font-family:var(--font-serif); font-size:2.5rem; font-weight:400; margin-bottom:1.5rem;">
                    Connecting the Diaspora in Thane &amp; Mumbai
                </h2>

                <p style="margin-bottom:1.25rem; color:var(--text-muted);">
                    Founded in Thane, <strong>Aarpoo Irroo</strong> was born out of a simple realization: thousands of young Malayali professionals, students, artists, and families living across Thane and Mumbai missed the authentic, unpretentious warmth of Kerala's cultural gatherings.
                </p>

                <p style="margin-bottom:2rem; color:var(--text-muted);">
                    While traditional cultural associations offer annual festival celebrations, there was no recurring night-life space that blended contemporary Malayali standup comedy, live indie music, fusion DJ nights, and casual adda energy.
                </p>

                <h3 style="font-family:var(--font-serif); font-size:1.8rem; font-weight:400; color:var(--primary-gold); margin-bottom:1.25rem;">
                    Core Festival Pillars
                </h3>

                <div class="acts-4-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom:2.5rem;">
                    <div style="background:var(--bg-warm); padding:1.25rem; border-radius:12px; border:1px solid var(--border-warm);">
                        <h4 style="font-weight:700; margin-bottom:0.4rem; color:var(--text-dark);">🎭 Standup Comedy</h4>
                        <p style="font-size:0.88rem; color:var(--text-muted);">Curating relatable Malayalam standup comics sharing diaspora banter and observational humor.</p>
                    </div>

                    <div style="background:var(--bg-warm); padding:1.25rem; border-radius:12px; border:1px solid var(--border-warm);">
                        <h4 style="font-weight:700; margin-bottom:0.4rem; color:var(--text-dark);">🎵 Indie Live Music</h4>
                        <p style="font-size:0.88rem; color:var(--text-muted);">Spotlighting flute live instrumentalists, acoustic vocalists, and Malayalam fusion bands.</p>
                    </div>

                    <div style="background:var(--bg-warm); padding:1.25rem; border-radius:12px; border:1px solid var(--border-warm);">
                        <h4 style="font-weight:700; margin-bottom:0.4rem; color:var(--text-dark);">🤝 Community Adda</h4>
                        <p style="font-size:0.88rem; color:var(--text-muted);">Fostering genuine connections, chai conversations, and networking for Malayalis in MMR.</p>
                    </div>
                </div>

                <div style="text-align:center; padding-top:1.5rem; border-top:1px solid var(--border-warm);">
                    <a href="<?php echo esc_url(home_url('/#booking-section')); ?>" class="btn-gold">
                        Reserve Your Seat For Vol. 02 →
                    </a>
                </div>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
