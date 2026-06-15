<?php

if (!defined('ABSPATH')) {
    exit;
}

function cfp_create_notification($type, $message)
{
    $notifications = get_option('cfp_notifications', []);

    $notifications[] = [
        'id' => time(),
        'type' => $type,
        'message' => $message,
        'read' => false,
        'created_at' => current_time('mysql')
    ];

    update_option('cfp_notifications', $notifications);
}

function cfp_notifications_page()
{
    $notifications = get_option('cfp_notifications', []);

    // Mark all as read
    foreach ($notifications as &$notification) {
        $notification['read'] = true;
    }

    update_option('cfp_notifications', $notifications);

    echo '<div class="wrap">';
    echo '<h1>Notifications</h1>';

    if (empty($notifications)) {
        echo '<p>No notifications found.</p>';
    }

    foreach (array_reverse($notifications) as $notification) {

        $style = !$notification['read']
            ? 'style="font-weight:bold;"'
            : '';

        echo '<div ' . $style . '>';

        echo '<p>';
        echo esc_html($notification['message']);
        echo '</p>';

        echo '<small>';
        echo esc_html($notification['created_at']);
        echo '</small>';

        echo '<hr>';

        echo '</div>';
    }

    echo '</div>';
}

function cfp_register_notifications_menu()
{
    $notifications = get_option('cfp_notifications', []);

    $unread_count = count(
        array_filter($notifications, function ($n) {
            return !$n['read'];
        })
    );

    $menu_title = 'Notifications';

    if ($unread_count > 0) {
        $menu_title .= ' (' . $unread_count . ')';
    }

    add_menu_page(
        'Notifications',
        $menu_title,
        'manage_options',
        'cfp-notifications',
        'cfp_notifications_page',
        'dashicons-bell',
        30
    );
}

add_action('admin_menu', 'cfp_register_notifications_menu');
