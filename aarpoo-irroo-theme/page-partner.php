<?php
/**
 * Template Name: Partner & Contact Us
 *
 * Combined Page Template for Sponsorship, Venue Inquiries, and Contact Us
 *
 * @package AarpooIrrooTheme
 */

get_header();
?>

<main id="main-content">
    <!-- Hero Banner -->
    <section class="section-padding" style="padding-bottom:2rem; text-align:center;">
        <div class="container">
            <span class="section-kicker fade-in-up">Collaborations & Connect</span>
            <h1 class="about-headline fade-in-up">
                Partner With Us <em class="gold-italic">&amp; Contact</em>
            </h1>
            <p class="about-body-text fade-in-up" style="max-width:680px; margin:0 auto;">
                Connect directly with our community team for event sponsorships, venue hosting, F&B partnerships, or general inquiries.
            </p>
        </div>
    </section>

    <!-- Combined Partner + Contact Us Section -->
    <section class="section-padding" style="padding-top:1rem;">
        <div class="container">
            <div class="partner-contact-wrapper">
                
                <!-- Left Box: Partner Inquiries (Sponsors & Venues) -->
                <div class="partner-box-card fade-in-up">
                    <span class="section-kicker">Brands & Venues</span>
                    <h2 style="font-family:var(--font-serif); font-size:2.2rem; font-weight:400; margin-bottom:0.5rem;">
                        Partner Inquiry
                    </h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1.5rem;">
                        Reach over 695K+ digital views and connect with young Malayali professionals in MMR.
                    </p>

                    <form id="aarpoo-partner-form">
                        <div class="form-field-group">
                            <label for="partner-brand">Brand / Company Name *</label>
                            <input type="text" id="partner-brand" class="form-input-warm" placeholder="e.g. Malabar Spirits / Venue Host" required>
                        </div>

                        <div class="form-field-group">
                            <label for="partner-name">Contact Person *</label>
                            <input type="text" id="partner-name" class="form-input-warm" placeholder="Anjali Menon" required>
                        </div>

                        <div class="form-field-group">
                            <label for="partner-email">Business Email *</label>
                            <input type="email" id="partner-email" class="form-input-warm" placeholder="partner@brand.com" required>
                        </div>

                        <div class="form-field-group">
                            <label for="partner-phone">Contact Phone *</label>
                            <input type="tel" id="partner-phone" class="form-input-warm" placeholder="+91 98765 43210" required>
                        </div>

                        <div class="form-field-group">
                            <label for="partner-type">Partnership Type *</label>
                            <select id="partner-type" class="form-input-warm" required>
                                <option value="Sponsorship">Event Sponsor (Title / Associate / Stage)</option>
                                <option value="Venue Partner">Venue Host (Dining & Bar Venue)</option>
                                <option value="F&B Partner">Kerala Food & Beverage Counter</option>
                                <option value="Media Partner">Media & Community PR</option>
                            </select>
                        </div>

                        <div class="form-field-group" style="margin-bottom:1.5rem;">
                            <label for="partner-message">Proposal Details</label>
                            <textarea id="partner-message" class="form-input-warm" rows="3" placeholder="Tell us about your brand proposal..."></textarea>
                        </div>

                        <button type="submit" class="btn-gold" style="width:100%;">
                            Submit Partner Proposal →
                        </button>
                    </form>
                </div>

                <!-- Right Box: Contact Us (Direct Messages & Details) -->
                <div class="partner-box-card fade-in-up" style="background:var(--bg-warm);">
                    <span class="section-kicker">Get In Touch</span>
                    <h2 style="font-family:var(--font-serif); font-size:2.2rem; font-weight:400; margin-bottom:0.5rem;">
                        Contact Us
                    </h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1.5rem;">
                        Have questions about tickets, seating, or group bookings? Send us a direct message.
                    </p>

                    <div class="contact-info-list">
                        <div class="contact-info-item">
                            <div class="contact-icon">📧</div>
                            <div>
                                <h5 style="font-size:0.85rem; color:var(--text-dim); text-transform:uppercase;">Email Us</h5>
                                <a href="mailto:aarpooirroo@gmail.com" style="font-weight:700; color:var(--primary-gold);">aarpooirroo@gmail.com</a>
                            </div>
                        </div>

                        <div class="contact-info-item">
                            <div class="contact-icon">💬</div>
                            <div>
                                <h5 style="font-size:0.85rem; color:var(--text-dim); text-transform:uppercase;">WhatsApp Adda</h5>
                                <a href="https://whatsapp.com" target="_blank" rel="noopener" style="font-weight:700; color:var(--text-dark);">Join Thane Malayali WhatsApp Group</a>
                            </div>
                        </div>

                        <div class="contact-info-item">
                            <div class="contact-icon">📍</div>
                            <div>
                                <h5 style="font-size:0.85rem; color:var(--text-dim); text-transform:uppercase;">Flagship Venue</h5>
                                <p style="font-weight:700; color:var(--text-dark);">De Aura — Global Dining & Bar, Majiwada, Thane</p>
                            </div>
                        </div>
                    </div>

                    <form id="aarpoo-contact-form" style="margin-top:2rem;">
                        <div class="form-field-group">
                            <label for="contact-name">Your Name *</label>
                            <input type="text" id="contact-name" class="form-input-warm" placeholder="Your Name" required>
                        </div>
                        <div class="form-field-group">
                            <label for="contact-email">Your Email *</label>
                            <input type="email" id="contact-email" class="form-input-warm" placeholder="yourname@gmail.com" required>
                        </div>
                        <div class="form-field-group" style="margin-bottom:1.5rem;">
                            <label for="contact-message">Message / Question *</label>
                            <textarea id="contact-message" class="form-input-warm" rows="3" placeholder="How can we help you?" required></textarea>
                        </div>
                        <button type="submit" class="btn-outline" style="width:100%;">
                            Send Message →
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
