<?php

if (!defined('ABSPATH')) {
    exit;
}

function cfp_render_form_block($attributes) {
    if (!isset($attributes['formId']) || empty($attributes['formId'])) {
        return "<p>Please select a form.</p>";
    }

    $form_id = intval($attributes['formId']); // Get the selected form ID
    
    ob_start(); // Start output buffering
    ?>
    <div class="cfp-rendered-form" data-form-id="<?php echo esc_attr($form_id); ?>"></div>
    <?php
    return ob_get_clean(); // Return the buffered output
}

function cfp_register_form_render_block() {
    register_block_type(__DIR__ . "/build/blocks"); // ✅ Ensure correct path
}
add_action("init", "cfp_register_form_render_block");
