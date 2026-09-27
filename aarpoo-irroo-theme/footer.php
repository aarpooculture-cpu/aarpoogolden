<?php
/**
 * Aarpoo Irroo Theme Footer Component
 *
 * @package AarpooIrrooTheme
 */
?>

<footer class="site-footer">
    <div class="container">
        <div class="footer-columns-grid">
            <div>
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/aarpoo-logo.jpg'); ?>" alt="Aarpoo Logo" style="height:44px; width:44px; border-radius:50%; border:1px solid var(--primary-gold);">
                    <div>
                        <h4 class="footer-brand-title" style="margin-bottom:0; font-size:1.4rem;">AARPOO IRROO</h4>
                        <span style="font-size:0.65rem; letter-spacing:0.1em; color:var(--primary-gold); font-weight:700;">MUSIC • ENERGY • EXPERIENCE</span>
                    </div>
                </div>
                <p style="font-size:0.92rem; color:#C2B8AF; line-height:1.6; margin-bottom:1.25rem;">
                    Connecting the Malayali diaspora in Thane & Mumbai. The cultural bridge bringing Malayalam standup comedy, live indie music, DJ afterparties, and authentic chai-adda community vibes closer to home.
                </p>
                <p style="font-size:0.85rem; color:#A0948C;">
                    📩 Direct Inquiries: <a href="mailto:aarpooirroo@gmail.com" style="color:var(--primary-gold);">aarpooirroo@gmail.com</a>
                </p>
            </div>

            <div>
                <h5 style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#FAF6F0; margin-bottom:1rem;">Navigation</h5>
                <ul class="footer-links-group">
                    <li><a href="<?php echo esc_url(home_url('/')); ?>" style="color:#C2B8AF;">Home</a></li>
                    <li><a href="<?php echo esc_url(home_url('/events')); ?>" style="color:#C2B8AF;">Events</a></li>
                    <li><a href="<?php echo esc_url(home_url('/about')); ?>" style="color:#C2B8AF;">About</a></li>
                    <li><a href="<?php echo esc_url(home_url('/partner')); ?>" style="color:#C2B8AF;">Partner &amp; Contact Us</a></li>
                </ul>
            </div>

            <div>
                <h5 style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#FAF6F0; margin-bottom:1rem;">Community</h5>
                <ul class="footer-links-group">
                    <li><a href="https://instagram.com" target="_blank" rel="noopener" style="color:#C2B8AF;">Instagram (@aarpooirroo)</a></li>
                    <li><a href="https://whatsapp.com" target="_blank" rel="noopener" style="color:#C2B8AF;">Thane Malayali WhatsApp Adda</a></li>
                    <li><a href="https://youtube.com" target="_blank" rel="noopener" style="color:#C2B8AF;">YouTube Highlights</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom-bar">
            <div>
                © <?php echo date('Y'); ?> Aarpoo Irroo Cultural Brand. Built for the Thane &amp; Mumbai Diaspora.
            </div>
            <div style="font-family: var(--font-malayalam); color: var(--primary-gold); font-size: 0.95rem;">
                നമ്മുടെ ചിരി, നമ്മുടെ സംഗീതം, നമ്മുടെ പാർട്ടി ❤️
            </div>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
