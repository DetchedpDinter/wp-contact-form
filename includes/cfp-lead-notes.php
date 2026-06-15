<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add Note To Lead
 */
function cfp_add_lead_note($entry_id, $note)
{
    if (empty($entry_id) || empty($note)) {
        return false;
    }

    $notes = get_post_meta($entry_id, 'cfp_lead_notes', true);

    if (!is_array($notes)) {
        $notes = [];
    }

    $notes[] = [
        'message' => sanitize_textarea_field($note),
        'time'    => current_time('mysql'),
    ];

    update_post_meta($entry_id, 'cfp_lead_notes', $notes);

    return true;
}
