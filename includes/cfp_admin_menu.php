<?php
if (!defined('ABSPATH')) {
    exit;
}

function cfp_add_new_form_page()
{
    add_submenu_page(
        'edit.php?post_type=cfp_form', // Parent CPT menu
        __('Add New Form', 'cfp'),      // Page title
        __('Add New Form', 'cfp'),      // Menu title
        'manage_options',               // Capability
        'cfp-add-new-form',             // Menu slug
        'cfp_render_form_builder_page', // Callback function
        null                            // Position
    );
}
add_action('admin_menu', 'cfp_add_new_form_page');

function cfp_render_form_builder_page()
{
?>
    <div class="wrap">
        <div id="cfp-form-builder-app"></div> <!-- React/Vite Mounting Point -->
    </div>
<?php
}

function cfp_localize_admin_script()
{
    wp_localize_script('cfp-admin-js', 'CFP', array(
        'restNonce' => wp_create_nonce('wp_rest'),
    ));
}
add_action('admin_enqueue_scripts', 'cfp_localize_admin_script');

function cfp_add_admin_menu()
{
    add_submenu_page(
        'edit.php?post_type=cfp_form',
        'Entries',
        'Entries',
        'manage_options',
        'cfp-form-entries',
        'cfp_render_entries_page'
    );

    add_submenu_page(
        'edit.php?post_type=cfp_form',
        'Entries Graph',
        'Entries Graph',
        'manage_options',
        'cfp-form-entries-graph',
        'cfp_render_entries_graph_page'
    );

    add_submenu_page(
        'edit.php?post_type=cfp_form',
        'All Forms',
        'All Forms',
        'manage_options',
        'cfp-custom-forms-page',
        'cfp_render_custom_forms_page'
    );
}
add_action('admin_menu', 'cfp_add_admin_menu');

function cfp_render_entries_graph_page()
{
    echo '<div class="wrap"><div id="cfp-entries-graph-root"></div></div>';
}

function cfp_render_custom_forms_page()
{
?>
    <div class="wrap">
        <h1 class="wp-heading-inline">All Forms</h1>
        <table class="widefat fixed striped">
            <thead>
                <tr>
                    <th>Form Title</th>
                    <th>Date</th>
                    <th>Shortcode</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $forms = get_posts([
                    'post_type'      => 'cfp_form',
                    'posts_per_page' => -1,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                ]);

                if (!empty($forms)) {
                    foreach ($forms as $form) {
                        $edit_url = admin_url("admin.php?page=cfp-edit-form&form_id={$form->ID}");
                        echo '<tr>';
                        echo '<td>' . esc_html($form->post_title) . '</td>';
                        echo '<td>' . esc_html(get_the_date('', $form)) . '</td>';
                        echo '<td>[cfp_form id="' . $form->ID . '"]</td>';
                        echo '<td><a class="button button-primary" href="' . esc_url($edit_url) . '">Edit</a></td>';
                        echo '</tr>';
                    }
                } else {
                    echo '<tr><td colspan="4">No forms found.</td></tr>';
                }
                ?>
            </tbody>
        </table>
    </div>
<?php
}
