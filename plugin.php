<?php

/**
 * Plugin Name: Custom Contact Form
 * Plugin URI: https://example.com
 * Description: A custom contact form plugin using React, Vite, and Tailwind CSS.
 * Version: 1.0.0
 * Author: Sandip Mishra
 * Author URI: https://sandipmishra.site
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Custom Post Type for Forms
 */
function cfp_register_custom_post_type()
{
    $labels = array(
        'name'                  => _x('Forms', 'Post Type General Name', 'cfp'),
        'singular_name'         => _x('Form', 'Post Type Singular Name', 'cfp'),
        'menu_name'             => __('Forms', 'cfp'),
        'add_new_item'          => __('Add New Form', 'cfp'),
        'edit_item'             => __('Edit Form', 'cfp'),
        'new_item'              => __('New Form', 'cfp'),
        'view_item'             => __('View Form', 'cfp'),
        'search_items'          => __('Search Forms', 'cfp'),
    );

    $args = array(
        'label'                 => __('Form', 'cfp'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor'),
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-feedback',
        'show_in_rest'          => true,
        'rewrite'               => array('slug' => 'cfp-form'),
        'capability_type'       => 'post',
        'meta' => [
            '_cfp_fields',
        ],
    );

    register_post_type('cfp_form', $args);

    register_meta('post', '_cfp_fields', [
        'type'         => 'string',
        'show_in_rest' => true,
        'single'       => true,
        'auth_callback' => '__return_true',
    ]);
}
add_action('init', 'cfp_register_custom_post_type');

/**
 * Remove "Add New" submenu under Forms
 */
function cfp_remove_add_new_submenu()
{
    global $submenu;
    if (isset($submenu['edit.php?post_type=cfp_form'])) {
        unset($submenu['edit.php?post_type=cfp_form'][10]);
    }
}
add_action('admin_menu', 'cfp_remove_add_new_submenu', 999);

// Define plugin constants
define('CFP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CFP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once CFP_PLUGIN_DIR . 'includes/cfp_admin_menu.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp_rest_api.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp_entries_cpt.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp_rest_api_entries.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp_entries_admin_page.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp_notification.php';
require_once CFP_PLUGIN_DIR . 'includes/telegram.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp_timeline.php';
require_once CFP_PLUGIN_DIR . 'includes/cfp-lead-notes.php';

/**
 * Enqueue Gutenberg Block Assets
 */
function cfp_enqueue_block_assets()
{
    $is_dev = wp_get_environment_type() === 'development';

    wp_enqueue_script(
        "cfp-blocks",
        $is_dev
            ? "http://localhost:5173/src/blocks/index.jsx"
            : plugin_dir_url(__FILE__) . "build/blocks/index.js",
        ["wp-blocks", "wp-block-editor", "wp-element", "wp-i18n"],
        $is_dev ? time() : filemtime(plugin_dir_path(__FILE__) . "build/blocks/index.js"),
        true
    );

    add_filter(
        'script_loader_tag',
        function ($tag, $handle) {
            if ($handle === 'cfp-blocks') {
                return str_replace(" src", " type='module' src", $tag);
            }
            return $tag;
        },
        10,
        2
    );
}
add_action("enqueue_block_editor_assets", "cfp_enqueue_block_assets");

/**
 * Register Gutenberg Blocks
 */
function myplugin_register_blocks()
{
    register_block_type(__DIR__ . '/build');
}
add_action('init', 'myplugin_register_blocks');

add_action('init', function () {
    if (!current_user_can('manage_options')) return;

    $args = [
        'post_type' => 'cfp_form',
        'posts_per_page' => -1,
    ];

    $forms = get_posts($args);

    foreach ($forms as $form) {
        $content = $form->post_content;

        $cleaned = preg_replace('/^<p>|<\/p>$/', '', $content);
        $cleaned = html_entity_decode($cleaned);

        $parsed = json_decode($cleaned, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
            wp_update_post([
                'ID' => $form->ID,
                'post_content' => wp_json_encode($parsed, JSON_UNESCAPED_SLASHES),
            ]);
        }
    }
});

add_action('wp_enqueue_scripts', 'enqueue_formbuilder_frontend_assets');

function enqueue_formbuilder_frontend_assets()
{
    // Enqueue the CSS
    wp_enqueue_style(
        'formbuilder-frontend-style',
        plugin_dir_url(__FILE__) . 'build/index.css',
        [],
        filemtime(plugin_dir_path(__FILE__) . 'build/index.css')
    );

    // Enqueue the JS
    wp_enqueue_script(
        'formbuilder-frontend-script',
        plugin_dir_url(__FILE__) . 'build/frontend/form-frontend.js',
        [
            'react',
            'react-dom',
            'wp-element',
            'wp-components',
            'wp-i18n',
            'wp-hooks'
        ],
        filemtime(plugin_dir_path(__FILE__) . 'build/frontend/form-frontend.js'),
        true
    );

    add_filter(
        'script_loader_tag',
        function ($tag, $handle) {
            if ($handle === 'formbuilder-frontend-script') {
                return str_replace(" src", " type='module' src", $tag);
            }
            return $tag;
        },
        10,
        2
    );

    // Optional: if your frontend depends on React, include WP's version
    wp_enqueue_script('react');
    wp_enqueue_script('react-dom');
}

function cfp_enqueue_form_frontend_assets()
{
    if (is_singular()) {
        wp_enqueue_script(
            'cfp-form-frontend',
            plugin_dir_url(__FILE__) . 'build/frontend/form-frontend.js',
            ['wp-element', 'wp-api-fetch'],
            '1.0',
            true
        );

        add_filter(
            'script_loader_tag',
            function ($tag, $handle) {
                if ($handle === 'cfp-form-frontend') {
                    return str_replace(" src", " type='module' src", $tag);
                }
                return $tag;
            },
            10,
            2
        );
    }
}
add_action('wp_enqueue_scripts', 'cfp_enqueue_form_frontend_assets');

/**
 * Enqueue Admin Panel Scripts
 */
function cfp_enqueue_admin_scripts($hook)
{
    $plugin_version = "1.0.0";
    $plugin_url = plugin_dir_url(__FILE__);

    if ($hook === 'cfp_form_page_cfp-add-new-form') {
        wp_enqueue_script(
            'cfp-form-builder-js',
            $plugin_url . 'build/admin/formBuilder.js',
            ['wp-element'],
            $plugin_version,
            true
        );
        add_filter(
            'script_loader_tag',
            function ($tag, $handle) {
                if ($handle === 'cfp-form-builder-js') {
                    return str_replace(" src", " type='module' src", $tag);
                }
                return $tag;
            },
            10,
            2
        );
    }

    if ($hook === 'admin_page_cfp-edit-form') {
        wp_enqueue_script(
            'cfp-edit-form',
            $plugin_url . 'build/admin/editFormBuilder.js',
            ['wp-element'],
            $plugin_version,
            true
        );
        add_filter(
            'script_loader_tag',
            function ($tag, $handle) {
                if ($handle === 'cfp-edit-form') {
                    return str_replace(" src", " type='module' src", $tag);
                }
                return $tag;
            },
            10,
            2
        );
    }

    if ($hook === 'cfp_form_page_cfp-form-entries') {
        wp_enqueue_script(
            'cfp-entries-script',
            plugins_url('build/admin/entries.js', __FILE__),
            ['wp-element', 'wp-api-fetch'],
            '1.0',
            true
        );

        add_filter(
            'script_loader_tag',
            function ($tag, $handle) {
                if ($handle === 'cfp-entries-script') {
                    return str_replace(" src", " type='module' src", $tag);
                }
                return $tag;
            },
            10,
            2
        );
    }

    if ($hook === 'cfp_form_page_cfp-form-entries-graph') {
        // Load Chart.js via CDN
        wp_enqueue_script(
            'chart-js',
            'https://cdn.jsdelivr.net/npm/chart.js',
            [],
            '4.4.0',
            true
        );

        wp_enqueue_script(
            'cfp-entries-graph',
            plugins_url('build/admin/entriesGraph.js', __FILE__),
            ['wp-element', 'wp-api-fetch', 'chart-js'],
            '1.0',
            true
        );

        add_filter(
            'script_loader_tag',
            function ($tag, $handle) {
                if ($handle === 'cfp-entries-graph') {
                    return str_replace(" src", " type='module' src", $tag);
                }
                return $tag;
            },
            10,
            2
        );
    }
}
add_action('admin_enqueue_scripts', 'cfp_enqueue_admin_scripts');

/**
 * Remove row actions from Forms list table
 */
add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_type === 'cfp_form') {
        return []; // Remove all actions
    }
    return $actions;
}, 10, 2);

/**
 * Enqueue Plugin Styles
 */
function my_plugin_enqueue_assets()
{
    wp_enqueue_style('cfp-styles', plugin_dir_url(__FILE__) . 'build/index.css', array(), '1.0.0');
}
add_action('admin_enqueue_scripts', 'my_plugin_enqueue_assets');

/**
 * Remove WordPress Footer Text & Version
 */
add_filter('admin_footer_text', '__return_empty_string');
add_filter('update_footer', '__return_empty_string', 11);

/**
 * Save Form Meta Data
 */
function cfp_save_form_meta($post_id, $post, $update)
{
    if ($post->post_type !== 'cfp_form') {
        return;
    }

    if (isset($_POST['fields'])) {
        update_post_meta($post_id, '_cfp_form_fields', $_POST['fields']);
    }
}
add_action('save_post_cfp_form', 'cfp_save_form_meta', 10, 3);

/**
 * Add Custom Column for Edit Button
 */
add_filter('manage_cfp_form_posts_columns', function ($columns) {
    $columns['cfp_edit'] = __('Edit', 'cfp');
    return $columns;
});

add_action('manage_cfp_form_posts_custom_column', function ($column, $post_id) {
    if ($column === 'cfp_edit') {
        $edit_url = admin_url("admin.php?page=cfp-edit-form&form_id=" . $post_id);
        echo '<a href="' . esc_url($edit_url) . '" class="button button-primary">Edit</a>';
    }
}, 10, 2);

/**
 * Register Hidden Edit Form Page
 */
add_action('admin_menu', function () {
    add_submenu_page(
        null,
        'Edit Form',
        'Edit Form',
        'manage_options',
        'cfp-edit-form',
        'cfp_render_edit_form_page'
    );
});

/**
 * Render Edit Form Page
 */
function cfp_render_edit_form_page()
{
    $form_id = isset($_GET['form_id']) ? intval($_GET['form_id']) : 0;
    echo '<div id="cfp-edit-form-root" data-form-id="' . esc_attr($form_id) . '"></div>';
}

add_action('admin_menu', function () {
    remove_submenu_page('edit.php?post_type=cfp_form', 'edit.php?post_type=cfp_form');
}, 999);

add_shortcode('cfp_form', 'cfp_render_form_shortcode');

function cfp_render_form_shortcode($atts)
{
    $atts = shortcode_atts([
        'id' => '',
    ], $atts);

    $form_id = intval($atts['id']);

    if (!$form_id) {
        return '<p>No form ID specified.</p>';
    }

    // Fetch and return the form render HTML
    ob_start();
    echo '<div id="cfp-form-render" data-form-id="' . esc_attr($form_id) . '"></div>';
    return ob_get_clean();
}

add_action('phpmailer_init', 'cfp_configure_smtp');

function cfp_configure_smtp($phpmailer)
{
    $phpmailer->isSMTP();

    $phpmailer->Host = 'smtp.gmail.com';
    $phpmailer->SMTPAuth = true;
    $phpmailer->Port = 587;

    $phpmailer->Username = 'sandipmishra777@gmail.com';
    $phpmailer->Password = 'yiwl adgu gaje ormw';

    $phpmailer->SMTPSecure = 'tls';

    $phpmailer->From = 'sandipmishra777@gmail.com';
    $phpmailer->FromName = 'Lead Automation System';
}
