<?php

if (!defined('ABSPATH')) {
    exit;
}

// Register Custom Post Type for Form Entries
function cfp_register_form_entry_cpt()
{
    $labels = array(
        'name'               => 'Form Entries',
        'singular_name'      => 'Form Entry',
        'menu_name'          => 'Form Entries',
        'name_admin_bar'     => 'Form Entry',
        'add_new'            => 'Add New Entry',
        'add_new_item'       => 'Add New Form Entry',
        'new_item'           => 'New Form Entry',
        'edit_item'          => 'Edit Form Entry',
        'view_item'          => 'View Form Entry',
        'all_items'          => 'All Form Entries',
        'search_items'       => 'Search Form Entries',
        'not_found'          => 'No form entries found',
        'not_found_in_trash' => 'No form entries found in Trash',
    );

    $args = array(
        'label'              => 'Form Entry',
        'labels'             => $labels,
        'public'             => false,
        'show_ui'            => false,
        'show_in_menu'       => 'edit.php?post_type=cfp_form', // Places it under the form builder
        'capability_type'    => 'post',
        'supports'           => array('title', 'custom-fields'),
        'menu_icon'          => 'dashicons-list-view',
    );

    register_post_type('cfp_form_entry', $args);
}
add_action('init', 'cfp_register_form_entry_cpt');

add_action('admin_menu', function () {
    remove_submenu_page('edit.php?post_type=cfp_form', 'edit.php?post_type=cfp_form_entry');
}, 999);
