<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title('|', true, 'right'); bloginfo('name'); ?> - Aarpoo Irroo Cultural Portal</title>
    <!-- Google Fonts: Instrument Serif, DM Serif Display, Plus Jakarta Sans, Noto Serif Malayalam -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Serif:ital@0;1&family=Noto+Serif+Malayalam:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Header Navigation Bar -->
<header class="site-header">
    <div class="container">
        <div class="header-inner">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="site-logo">
                <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/aarpoo-logo.jpg'); ?>" alt="Aarpoo Irroo Kathakali Logo" class="brand-logo-img">
                <div class="logo-text-group">
                    <span class="logo-brand">AARPOO IRROO</span>
                    <span class="logo-tagline">MUSIC • ENERGY • EXPERIENCE</span>
                </div>
            </a>

            <button class="mobile-nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>

            <nav class="site-nav">
                <ul class="nav-links">
                    <li><a href="<?php echo esc_url(home_url('/')); ?>" class="nav-link <?php echo is_front_page() ? 'active' : ''; ?>">Home</a></li>
                    <li><a href="<?php echo esc_url(home_url('/events')); ?>" class="nav-link <?php echo is_page('events') ? 'active' : ''; ?>">Events</a></li>
                    <li><a href="<?php echo esc_url(home_url('/about')); ?>" class="nav-link <?php echo is_page('about') ? 'active' : ''; ?>">About</a></li>
                    <li><a href="<?php echo esc_url(home_url('/partner')); ?>" class="nav-link <?php echo is_page('partner') ? 'active' : ''; ?>">Partner</a></li>
                </ul>
            </nav>

            <div class="nav-cta">
                <a href="<?php echo is_front_page() ? '#booking-section' : esc_url(home_url('/#booking-section')); ?>" class="btn-gold">
                    Book tickets →
                </a>
            </div>
        </div>
    </div>
</header>
