<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register REST API routes for CFP Forms.
 */
function cfp_register_rest_routes()
{
    register_rest_route('cfp/v1', '/forms/', array(
        'methods'  => 'POST',
        'callback' => 'cfp_save_form',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('cfp/v1', '/forms/(?P<id>\d+)', array(
        'methods'  => 'PUT',
        'callback' => 'cfp_update_form',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('cfp/v1', '/forms/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => 'cfp_get_form_data',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('cfp/v1', '/forms/', [
        'methods'  => 'GET',
        'callback' => 'cfp_get_all_forms',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'cfp_register_rest_routes');

/**
 * Save form data via REST API.
 */
function cfp_save_form(WP_REST_Request $request)
{
    $params = $request->get_json_params();

    if (empty($params['title'])) {
        return new WP_REST_Response(['error' => 'Form title is required'], 400);
    }

    if (!isset($params['fields']) || !is_array($params['fields'])) {
        return new WP_REST_Response(['error' => 'Invalid or missing fields data'], 400);
    }

    $sanitized_fields = array_map(function ($field) {
        return [
            'id'         => sanitize_text_field($field['id'] ?? ''),
            'type'       => sanitize_text_field($field['type'] ?? ''),
            'label'      => sanitize_text_field($field['label'] ?? ''),
            'isRequired' => !empty($field['isRequired']),
            'size'       => sanitize_text_field($field['size'] ?? 'medium'),
        ];
    }, $params['fields']);

    $form_id = wp_insert_post([
        'post_title'   => sanitize_text_field($params['title']),
        'post_type'    => 'cfp_form',
        'post_status'  => 'publish',
        'post_content' => '',
    ]);

    if (is_wp_error($form_id)) {
        return new WP_REST_Response(['error' => 'Failed to save form'], 500);
    }

    update_post_meta($form_id, '_cfp_fields', wp_json_encode($sanitized_fields));

    return new WP_REST_Response(['id' => $form_id], 200);
}

/**
 * Get form data via REST API.
 */
function cfp_get_form_data(WP_REST_Request $request)
{
    $form_id = (int) $request['id'];
    $post = get_post($form_id);

    if (!$post || $post->post_type !== 'cfp_form') {
        return new WP_Error('not_found', 'Form not found', ['status' => 404]);
    }

    $fields_json = get_post_meta($form_id, '_cfp_fields', true);
    $fields = json_decode($fields_json, true);

    if (!is_array($fields)) {
        $fields = [];
    }

    return [
        'id'     => $post->ID,
        'title'  => $post->post_title,
        'fields' => $fields,
    ];
}

/**
 * Update form data via REST API.
 */
function cfp_update_form(WP_REST_Request $request)
{
    $params = $request->get_json_params();
    $form_id = $request->get_param('id');

    $post = get_post($form_id);

    if (!$post || $post->post_type !== 'cfp_form') {
        return new WP_Error('not_found', 'Form not found', ['status' => 404]);
    }

    $sanitized_fields = array_map(function ($field) {
        return [
            'id'         => sanitize_text_field($field['id'] ?? ''),
            'type'       => sanitize_text_field($field['type'] ?? ''),
            'label'      => sanitize_text_field($field['label'] ?? ''),
            'isRequired' => !empty($field['isRequired']),
            'size'       => sanitize_text_field($field['size'] ?? 'medium'),
        ];
    }, $params['fields']);

    wp_update_post([
        'ID'         => $form_id,
        'post_title' => sanitize_text_field($params['title']),
        'post_content' => '',
    ]);

    update_post_meta($form_id, '_cfp_fields', wp_json_encode($sanitized_fields));

    return new WP_REST_Response(['id' => $form_id], 200);
}

/**
 * Get all forms via REST API.
 */
function cfp_get_all_forms()
{
    $forms = get_posts([
        'post_type'      => 'cfp_form',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
    ]);

    $response = array_map(function ($form) {
        $fields_json = get_post_meta($form->ID, '_cfp_fields', true);
        $fields = json_decode($fields_json, true);
        return [
            'id'     => $form->ID,
            'title'  => $form->post_title,
            'fields' => is_array($fields) ? $fields : [],
        ];
    }, $forms);

    return $response;
}
