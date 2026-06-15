<?php

if (!defined('ABSPATH')) {
    exit;
}

function cfp_add_timeline_event($entry_id, $message, $type = 'info')
{
    $timeline = get_post_meta($entry_id, 'cfp_timeline', true);

    if (!is_array($timeline)) {
        $timeline = [];
    }

    $timeline[] = [
        'message' => $message,
        'type' => $type,
        'time' => current_time('mysql')
    ];

    update_post_meta($entry_id, 'cfp_timeline', $timeline);
}
