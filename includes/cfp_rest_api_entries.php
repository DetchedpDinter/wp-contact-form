<?php

if (!defined('ABSPATH')) {
    exit;
}

// Register REST API Endpoints for Form Entries
function cfp_register_form_entries_rest_routes()
{
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

    // Add lead note
    register_rest_route('cfp/v1', '/entries/(?P<id>\d+)/notes', array(
        'methods'  => 'POST',
        'callback' => 'cfp_add_note_to_entry',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('cfp/v1', '/entries/(?P<id>\d+)/status', array(
        'methods'  => 'POST',
        'callback' => 'cfp_update_entry_status',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'cfp_register_form_entries_rest_routes');

// Function to save a new form entry
function cfp_save_form_entry(WP_REST_Request $request)
{
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

    cfp_add_timeline_event(
        $entry_id,
        'Lead created',
        'success'
    );

    if ($entry_id) {

        $data = $params['data'];

        $name = '';
        $email = '';
        $phone = '';

        $message = "🚀 New Lead Received\n\n";

        foreach ($data as $field_id => $field) {

            $label = $field['label'] ?? 'Field';
            $value = $field['value'] ?? '';
            $type  = $field['type'] ?? '';

            $message .= $label . ": " . $value . "\n";

            // Detect important fields
            if ($type === 'name-input') {
                $name = $value;
            }

            if ($type === 'email-input') {
                $email = $value;
            }

            if ($type === 'phone-input') {
                $phone = $value;
            }
        }

        $message .= "\nStatus: New";

        update_post_meta($entry_id, 'status', 'new');

        cfp_create_notification(
            'new_lead',
            'New lead submitted successfully'
        );

        // Telegram notification
        cfp_send_telegram_message($message);

        cfp_add_timeline_event(
            $entry_id,
            'Telegram notification sent',
            'info'
        );

        // Send acknowledgement email
        if (!empty($email)) {

            $subject = 'Submission Received';

            $mail_message = "Hello {$name},\n\n";
            $mail_message .= "Thank you for contacting us.\n";
            $mail_message .= "We received your submission successfully.\n\n";
            $mail_message .= "Regards";

            wp_mail($email, $subject, $mail_message);

            cfp_add_timeline_event(
                $entry_id,
                'Acknowledgement email sent',
                'success'
            );
        }

        return new WP_REST_Response(array(
            'id' => $entry_id,
            'message' => 'Entry saved successfully!'
        ), 200);
    } else {
        return new WP_Error('save_error', 'Failed to save form entry.', array('status' => 500));
    }
}

// Function to fetch form entries by form ID
function cfp_get_form_entries(WP_REST_Request $request)
{
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
            'date' => $entry->post_date,
            'status' => get_post_meta($entry->ID, 'status', true) ?: 'new',
            'timeline' => get_post_meta($entry->ID, 'cfp_timeline', true) ?: [],
            'notes' => get_post_meta($entry->ID, 'cfp_lead_notes', true) ?: [],
        );
    }

    return new WP_REST_Response($formatted_entries, 200);
}

/**
 * Add note to lead entry
 */
function cfp_add_note_to_entry(WP_REST_Request $request)
{
    $entry_id = intval($request['id']);
    $params = $request->get_json_params();

    $note = $params['note'] ?? '';

    if (empty($note)) {
        return new WP_Error(
            'missing_note',
            'Note is required',
            ['status' => 400]
        );
    }

    cfp_add_lead_note($entry_id, $note);

    cfp_add_timeline_event(
        $entry_id,
        'Internal note added',
        'info'
    );

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Note added successfully'
    ], 200);
}

function cfp_update_entry_status(WP_REST_Request $request)
{
    $entry_id = intval($request['id']);
    $params = $request->get_json_params();

    $status = sanitize_text_field($params['status'] ?? '');

    if (!$entry_id || empty($status)) {
        return new WP_Error(
            'missing_data',
            'Entry ID and status are required.',
            array('status' => 400)
        );
    }

    update_post_meta($entry_id, 'status', $status);

    cfp_add_timeline_event(
        $entry_id,
        'Lead status changed to: ' . ucfirst($status),
        'info'
    );

    return new WP_REST_Response(array(
        'success' => true,
        'status' => $status,
    ), 200);
}
