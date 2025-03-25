<?php

if (!defined('ABSPATH')) {
    exit;
}

// Register REST API Endpoints for Form Entries
function cfp_register_form_entries_rest_routes() {
    // Save a new form entry
    register_rest_route('cfp/v1', '/entries/', array(
        'methods'  => 'POST',
        'callback' => 'cfp_save_form_entry',
        'permission_callback' => '__return_true',
    ));

    // Get entries by form ID
    register_rest_route('cfp/v1', '/entries/', array(
        'methods'  => 'GET',
        'callback' => 'cfp_get_form_entries',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'cfp_register_form_entries_rest_routes');

// Function to save a new form entry
function cfp_save_form_entry(WP_REST_Request $request) {
    $params = $request->get_json_params();

    // Validate required fields
    if (empty($params['form_id']) || empty($params['data'])) {
        return new WP_Error('missing_data', 'Form ID and data are required.', array('status' => 400));
    }

    $form_id = intval($params['form_id']);
    $submitted_data = json_encode($params['data'], JSON_UNESCAPED_SLASHES);
    
    // Save the entry as a custom post
    $entry_id = wp_insert_post(array(
        'post_type'   => 'cfp_form_entry',
        'post_title'  => 'Entry for Form ' . $form_id,
        'post_status' => 'publish',
        'meta_input'  => array(
            'form_id' => $form_id,
            'data'    => $submitted_data,
        ),
    ));

    if ($entry_id) {
        return new WP_REST_Response(array('id' => $entry_id, 'message' => 'Entry saved successfully!'), 200);
    } else {
        return new WP_Error('save_error', 'Failed to save form entry.', array('status' => 500));
    }
}

// Function to fetch form entries by form ID
function cfp_get_form_entries(WP_REST_Request $request) {
    $form_id = intval($request->get_param('form_id'));

    if (!$form_id) {
        return new WP_Error('missing_form_id', 'Form ID is required.', array('status' => 400));
    }

    $entries = get_posts(array(
        'post_type'  => 'cfp_form_entry',
        'meta_query' => array(
            array(
                'key'   => 'form_id',
                'value' => $form_id,
            ),
        ),
        'posts_per_page' => -1,
    ));

    $formatted_entries = array();

    foreach ($entries as $entry) {
        $formatted_entries[] = array(
            'id'        => $entry->ID,
            'title'     => $entry->post_title,
            'data'      => json_decode(get_post_meta($entry->ID, 'data', true), true),
            'date'      => $entry->post_date,
        );
    }

    return new WP_REST_Response($formatted_entries, 200);
}
