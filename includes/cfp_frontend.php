<?php

if (!defined('ABSPATH')) {
    exit;
}

function cfp_enqueue_frontend_assets() {
    wp_enqueue_script(
        'cfp-form-render',
        plugins_url('../build/frontend/formRenderer.js', __FILE__),
        [],
        '1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'cfp_enqueue_frontend_assets');
