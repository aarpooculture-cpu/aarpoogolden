<?php
/**
 * Aarpoo Irroo Theme Functions & Server-Side API Engine
 *
 * @package AarpooIrrooTheme
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// --------------------------------------------------------------------------
// 1. Theme Setup & Asset Enqueuing
// --------------------------------------------------------------------------
function aarpoo_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));

    register_nav_menus(array(
        'primary' => __('Primary Menu', 'aarpoo-irroo'),
        'footer'  => __('Footer Menu', 'aarpoo-irroo'),
    ));
}
add_action('after_setup_theme', 'aarpoo_theme_setup');

function aarpoo_enqueue_scripts() {
    // Google Fonts: Plus Jakarta Sans & Noto Serif Malayalam
    wp_enqueue_style('aarpoo-fonts', 'https://fonts.googleapis.com/css2?family=Noto+Serif+Malayalam:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap', array(), null);

    // Theme Stylesheet
    wp_enqueue_style('aarpoo-theme-style', get_template_directory_uri() . '/assets/theme.css', array(), '1.0.0');
    wp_enqueue_style('aarpoo-main-style', get_stylesheet_uri(), array('aarpoo-theme-style'), '1.0.0');

    // Razorpay Checkout JS SDK
    wp_enqueue_script('razorpay-checkout', 'https://checkout.razorpay.com/v1/checkout.js', array(), null, true);

    // Booking & Micro-interaction JS Script
    wp_enqueue_script('aarpoo-booking', get_template_directory_uri() . '/assets/js/booking.js', array('razorpay-checkout'), '1.0.0', true);

    // Localize Script for REST API Endpoints & Config
    $razorpay_key_id = get_option('aarpoo_razorpay_key_id', '') ?: (getenv('RAZORPAY_KEY_ID') ?: '');
    $ticket_price = get_option('aarpoo_ticket_price', '599');

    wp_localize_script('aarpoo-booking', 'aarpooData', array(
        'restUrl'       => esc_url_raw(rest_url()),
        'nonce'         => wp_create_nonce('wp_rest'),
        'ticketPrice'   => (int) $ticket_price,
        'razorpayKeyId' => sanitize_text_field($razorpay_key_id),
    ));
}
add_action('wp_enqueue_scripts', 'aarpoo_enqueue_scripts');

// --------------------------------------------------------------------------
// 2. Register Custom Post Types (Bookings & Partner Inquiries)
// --------------------------------------------------------------------------
function aarpoo_register_cpts() {
    // A. Bookings CPT
    $booking_labels = array(
        'name'               => _x('Bookings', 'Post Type General Name', 'aarpoo-irroo'),
        'singular_name'      => _x('Booking', 'Post Type Singular Name', 'aarpoo-irroo'),
        'menu_name'          => __('Bookings', 'aarpoo-irroo'),
        'all_items'          => __('All Bookings', 'aarpoo-irroo'),
        'add_new_item'       => __('Add New Booking', 'aarpoo-irroo'),
        'edit_item'          => __('Edit Booking', 'aarpoo-irroo'),
        'view_item'          => __('View Booking', 'aarpoo-irroo'),
        'search_items'       => __('Search Bookings', 'aarpoo-irroo'),
    );

    $booking_args = array(
        'label'               => __('Booking', 'aarpoo-irroo'),
        'labels'              => $booking_labels,
        'supports'            => array('title', 'custom-fields'),
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_position'       => 5,
        'menu_icon'           => 'dashicons-tickets-alt',
        'can_export'          => true,
        'has_archive'         => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'capability_type'     => 'post',
    );
    register_post_type('aarpoo_booking', $booking_args);

    // B. Partner Inquiries CPT
    $partner_labels = array(
        'name'               => _x('Partner Inquiries', 'Post Type General Name', 'aarpoo-irroo'),
        'singular_name'      => _x('Partner Inquiry', 'Post Type Singular Name', 'aarpoo-irroo'),
        'menu_name'          => __('Partner Inquiries', 'aarpoo-irroo'),
        'all_items'          => __('All Inquiries', 'aarpoo-irroo'),
        'add_new_item'       => __('Add New Inquiry', 'aarpoo-irroo'),
        'edit_item'          => __('Edit Inquiry', 'aarpoo-irroo'),
        'view_item'          => __('View Inquiry', 'aarpoo-irroo'),
        'search_items'       => __('Search Inquiries', 'aarpoo-irroo'),
    );

    $partner_args = array(
        'label'               => __('Partner Inquiry', 'aarpoo-irroo'),
        'labels'              => $partner_labels,
        'supports'            => array('title', 'editor', 'custom-fields'),
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_position'       => 6,
        'menu_icon'           => 'dashicons-businessperson',
        'can_export'          => true,
        'has_archive'         => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'capability_type'     => 'post',
    );
    register_post_type('aarpoo_partner', $partner_args);
}
add_action('init', 'aarpoo_register_cpts');

// Custom Columns in WP Admin for Bookings
function aarpoo_booking_columns($columns) {
    return array(
        'cb'            => '<input type="checkbox" />',
        'title'         => __('Booking Ref', 'aarpoo-irroo'),
        'customer'      => __('Customer Name', 'aarpoo-irroo'),
        'contact'       => __('Email / Phone', 'aarpoo-irroo'),
        'seats'         => __('Seats', 'aarpoo-irroo'),
        'amount'        => __('Amount Paid', 'aarpoo-irroo'),
        'razorpay_id'   => __('Payment ID', 'aarpoo-irroo'),
        'date'          => __('Booking Date', 'aarpoo-irroo'),
    );
}
add_filter('manage_aarpoo_booking_posts_columns', 'aarpoo_booking_columns');

function aarpoo_booking_custom_column($column, $post_id) {
    switch ($column) {
        case 'customer':
            echo esc_html(get_post_meta($post_id, '_customer_name', true));
            break;
        case 'contact':
            echo esc_html(get_post_meta($post_id, '_customer_email', true)) . '<br><small>' . esc_html(get_post_meta($post_id, '_customer_phone', true)) . '</small>';
            break;
        case 'seats':
            echo esc_html(get_post_meta($post_id, '_seats', true));
            break;
        case 'amount':
            $amt = get_post_meta($post_id, '_amount', true);
            echo '₹' . esc_html(number_format((float)$amt, 2));
            break;
        case 'razorpay_id':
            echo '<code>' . esc_html(get_post_meta($post_id, '_payment_id', true)) . '</code>';
            break;
    }
}
add_action('manage_aarpoo_booking_posts_custom_column', 'aarpoo_booking_custom_column', 10, 2);

// --------------------------------------------------------------------------
// 3. Admin Settings Page (Settings > Aarpoo Settings)
// --------------------------------------------------------------------------
function aarpoo_admin_menu() {
    add_options_page(
        __('Aarpoo Settings', 'aarpoo-irroo'),
        __('Aarpoo Settings', 'aarpoo-irroo'),
        'manage_options',
        'aarpoo-settings',
        'aarpoo_settings_page_html'
    );
}
add_action('admin_menu', 'aarpoo_admin_menu');

function aarpoo_register_settings() {
    register_setting('aarpoo_settings_group', 'aarpoo_razorpay_key_id', 'sanitize_text_field');
    register_setting('aarpoo_settings_group', 'aarpoo_razorpay_key_secret', 'sanitize_text_field');
    register_setting('aarpoo_settings_group', 'aarpoo_webhook_url', 'esc_url_raw');
    register_setting('aarpoo_settings_group', 'aarpoo_ticket_price', 'absint');
}
add_action('admin_init', 'aarpoo_register_settings');

function aarpoo_settings_page_html() {
    if (!current_user_can('manage_options')) return;
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <p>Configure Razorpay API Keys, Webhooks, and Event Pricing for Aarpoo Irroo Ticketing.</p>
        <form action="options.php" method="post">
            <?php
            settings_fields('aarpoo_settings_group');
            do_settings_sections('aarpoo_settings_group');
            ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="aarpoo_razorpay_key_id">Razorpay Key ID</label></th>
                    <td>
                        <input type="text" id="aarpoo_razorpay_key_id" name="aarpoo_razorpay_key_id" class="regular-text" value="<?php echo esc_attr(get_option('aarpoo_razorpay_key_id')); ?>" placeholder="rzp_live_xxxxxxxxxxxx" />
                        <p class="description">Public Key ID used for client-side checkout modal.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="aarpoo_razorpay_key_secret">Razorpay Key Secret</label></th>
                    <td>
                        <input type="password" id="aarpoo_razorpay_key_secret" name="aarpoo_razorpay_key_secret" class="regular-text" value="<?php echo esc_attr(get_option('aarpoo_razorpay_key_secret')); ?>" />
                        <p class="description"><strong>Security Warning:</strong> Key Secret is strictly kept server-side in WordPress options to sign and verify payment HMAC SHA-256 signatures.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="aarpoo_ticket_price">Ticket Price per Seat (₹)</label></th>
                    <td>
                        <input type="number" id="aarpoo_ticket_price" name="aarpoo_ticket_price" class="small-text" value="<?php echo esc_attr(get_option('aarpoo_ticket_price', '599')); ?>" />
                        <p class="description">Early Bird ticket pricing (GST inclusive).</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="aarpoo_webhook_url">Google Sheets Webhook URL</label></th>
                    <td>
                        <input type="url" id="aarpoo_webhook_url" name="aarpoo_webhook_url" class="large-text" value="<?php echo esc_attr(get_option('aarpoo_webhook_url')); ?>" placeholder="https://script.google.com/macros/s/.../exec" />
                        <p class="description">Optional Google Apps Script Webhook URL for real-time payload logging into Google Sheets.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Configuration Settings'); ?>
        </form>
    </div>
    <?php
}

// --------------------------------------------------------------------------
// 4. REST API Endpoints: Razorpay Server-Side Order & Signature Verification
// --------------------------------------------------------------------------
function aarpoo_register_rest_routes() {
    // Endpoint 1: Create Order (Server-Side Razorpay API Call)
    register_rest_route('aarpoo/v1', '/create-order', array(
        'methods'             => 'POST',
        'callback'            => 'aarpoo_rest_create_order',
        'permission_callback' => '__return_true',
    ));

    // Endpoint 2: Verify Payment Signature & Log Booking
    register_rest_route('aarpoo/v1', '/verify-payment', array(
        'methods'             => 'POST',
        'callback'            => 'aarpoo_rest_verify_payment',
        'permission_callback' => '__return_true',
    ));

    // Endpoint 3: Submit Partner Inquiry Form
    register_rest_route('aarpoo/v1', '/submit-partner', array(
        'methods'             => 'POST',
        'callback'            => 'aarpoo_rest_submit_partner',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'aarpoo_register_rest_routes');

/**
 * Server-Side Razorpay Order Creation
 */
function aarpoo_rest_create_order(WP_REST_Request $request) {
    $params = $request->get_json_params();
    $seats  = isset($params['seats']) ? intval($params['seats']) : 1;
    $name   = isset($params['name']) ? sanitize_text_field($params['name']) : '';
    $email  = isset($params['email']) ? sanitize_email($params['email']) : '';
    $phone  = isset($params['phone']) ? sanitize_text_field($params['phone']) : '';

    if ($seats < 1 || $seats > 6) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Seats must be between 1 and 6.'), 400);
    }

    $key_id     = get_option('aarpoo_razorpay_key_id', '') ?: (getenv('RAZORPAY_KEY_ID') ?: '');
    $key_secret = get_option('aarpoo_razorpay_key_secret', '') ?: (getenv('RAZORPAY_KEY_SECRET') ?: '');
    $unit_price = (int) get_option('aarpoo_ticket_price', '599');
    $amount_in_paise = $seats * $unit_price * 100;

    // If Razorpay API credentials are configured, execute server-to-server HTTP POST request
    if (!empty($key_id) && !empty($key_secret)) {
        $api_url = 'https://api.razorpay.com/v1/orders';
        $auth    = base64_encode($key_id . ':' . $key_secret);

        $body_payload = array(
            'amount'          => $amount_in_paise,
            'currency'        => 'INR',
            'receipt'         => 'rcpt_' . time() . '_' . rand(1000, 9999),
            'notes'           => array(
                'customer_name'  => $name,
                'customer_email' => $email,
                'customer_phone' => $phone,
                'seats_reserved' => $seats,
                'event'          => 'Aarpoo Vol. 02 Thane'
            )
        );

        $response = wp_remote_post($api_url, array(
            'headers' => array(
                'Authorization' => 'Basic ' . $auth,
                'Content-Type'  => 'application/json'
            ),
            'body'    => json_encode($body_payload),
            'timeout' => 15
        ));

        if (is_wp_error($response)) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Razorpay API error: ' . $response->get_error_message()), 500);
        }

        $res_body = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($res_body['id'])) {
            return new WP_REST_Response(array(
                'success'  => true,
                'order_id' => $res_body['id'],
                'amount'   => $amount_in_paise,
                'currency' => 'INR',
                'key_id'   => $key_id
            ), 200);
        } else {
            $err_msg = isset($res_body['error']['description']) ? $res_body['error']['description'] : 'Failed creating Razorpay order';
            return new WP_REST_Response(array('success' => false, 'message' => $err_msg), 400);
        }
    } else {
        // Demo mode fallback when API keys are pending setup
        $demo_order_id = 'order_demo_' . time() . '_' . rand(100, 999);
        return new WP_REST_Response(array(
            'success'  => true,
            'order_id' => $demo_order_id,
            'amount'   => $amount_in_paise,
            'currency' => 'INR',
            'key_id'   => 'demo_key',
            'is_demo'  => true
        ), 200);
    }
}

/**
 * Server-Side HMAC SHA-256 Payment Signature Verification & Booking Log
 */
function aarpoo_rest_verify_payment(WP_REST_Request $request) {
    $params     = $request->get_json_params();
    $order_id   = isset($params['razorpay_order_id']) ? sanitize_text_field($params['razorpay_order_id']) : '';
    $payment_id = isset($params['razorpay_payment_id']) ? sanitize_text_field($params['razorpay_payment_id']) : '';
    $signature  = isset($params['razorpay_signature']) ? sanitize_text_field($params['razorpay_signature']) : '';
    $name       = isset($params['name']) ? sanitize_text_field($params['name']) : '';
    $email      = isset($params['email']) ? sanitize_email($params['email']) : '';
    $phone      = isset($params['phone']) ? sanitize_text_field($params['phone']) : '';
    $seats      = isset($params['seats']) ? intval($params['seats']) : 1;
    $amount     = isset($params['amount']) ? floatval($params['amount']) : ($seats * 599);
    $is_demo    = !empty($params['is_demo']);

    $key_secret = get_option('aarpoo_razorpay_key_secret', '') ?: (getenv('RAZORPAY_KEY_SECRET') ?: '');

    // Security Verification: Signature Check via HMAC SHA-256
    if (!$is_demo && !empty($key_secret)) {
        $expected_signature = hash_hmac('sha256', $order_id . '|' . $payment_id, $key_secret);
        if (!hash_equals($expected_signature, $signature)) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Invalid payment signature security check.'), 400);
        }
    }

    // Create Custom Post Type Record under "Bookings"
    $booking_title = sprintf('Booking #%s - %s (%d Seat%s)', strtoupper(substr(md5($payment_id), 0, 6)), $name, $seats, $seats > 1 ? 's' : '');
    $post_data = array(
        'post_title'   => $booking_title,
        'post_status'  => 'publish',
        'post_type'    => 'aarpoo_booking',
    );

    $booking_id = wp_insert_post($post_data);

    if (is_wp_error($booking_id)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Database error saving booking.'), 500);
    }

    // Save Post Meta
    update_post_meta($booking_id, '_customer_name', $name);
    update_post_meta($booking_id, '_customer_email', $email);
    update_post_meta($booking_id, '_customer_phone', $phone);
    update_post_meta($booking_id, '_seats', $seats);
    update_post_meta($booking_id, '_amount', $amount);
    update_post_meta($booking_id, '_order_id', $order_id);
    update_post_meta($booking_id, '_payment_id', $payment_id);
    update_post_meta($booking_id, '_booking_status', 'Confirmed');

    // Optional: Real-Time Webhook Trigger (e.g. Google Sheets Apps Script)
    $webhook_url = get_option('aarpoo_webhook_url', '');
    if (!empty($webhook_url)) {
        wp_remote_post($webhook_url, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body'    => json_encode(array(
                'event'        => 'ticket_booked',
                'booking_id'   => $booking_id,
                'order_id'     => $order_id,
                'payment_id'   => $payment_id,
                'name'         => $name,
                'email'        => $email,
                'phone'        => $phone,
                'seats'        => $seats,
                'amount'       => $amount,
                'timestamp'    => current_time('mysql')
            )),
            'blocking' => false
        ));
    }

    return new WP_REST_Response(array(
        'success'    => true,
        'booking_id' => 'ARPOO-' . $booking_id,
        'message'    => 'Ticket payment verified and booking recorded successfully!'
    ), 200);
}

/**
 * Handle Partner Inquiry Submissions
 */
function aarpoo_rest_submit_partner(WP_REST_Request $request) {
    $params         = $request->get_json_params();
    $brand_name     = isset($params['brand_name']) ? sanitize_text_field($params['brand_name']) : '';
    $contact_person = isset($params['contact_person']) ? sanitize_text_field($params['contact_person']) : '';
    $email          = isset($params['email']) ? sanitize_email($params['email']) : '';
    $phone          = isset($params['phone']) ? sanitize_text_field($params['phone']) : '';
    $partner_type   = isset($params['partner_type']) ? sanitize_text_field($params['partner_type']) : '';
    $message        = isset($params['message']) ? sanitize_textarea_field($params['message']) : '';

    if (empty($brand_name) || empty($email) || empty($contact_person)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Brand name, contact person, and email are required.'), 400);
    }

    $post_data = array(
        'post_title'   => sprintf('%s (%s)', $brand_name, $partner_type ? $partner_type : 'Partner Inquiry'),
        'post_content' => $message,
        'post_status'  => 'publish',
        'post_type'    => 'aarpoo_partner',
    );

    $inquiry_id = wp_insert_post($post_data);

    if (is_wp_error($inquiry_id)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Error saving partner inquiry.'), 500);
    }

    update_post_meta($inquiry_id, '_brand_name', $brand_name);
    update_post_meta($inquiry_id, '_contact_person', $contact_person);
    update_post_meta($inquiry_id, '_email', $email);
    update_post_meta($inquiry_id, '_phone', $phone);
    update_post_meta($inquiry_id, '_partner_type', $partner_type);

    return new WP_REST_Response(array(
        'success'    => true,
        'inquiry_id' => $inquiry_id,
        'message'    => 'Partner inquiry submitted successfully.'
    ), 200);
}
