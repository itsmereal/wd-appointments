<?php
/**
 * The admin-specific functionality of the plugin
 */
class WD_Appointments_Admin {
    /**
     * Initialize the class
     */
    public function __construct() {
        // Add initialization hook to ensure proper order
        add_action('init', array($this, 'init'));

        // Add REST API initialization
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        error_log('WD_Appointments_Admin constructor called');
    }

    /**
     * Initialize admin features
     */
    public function init() {
        // Initialize admin menu and scripts
        add_action('admin_menu', array($this, 'add_plugin_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));

        // Log initialization
        error_log('WD_Appointments_Admin initialized');
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        error_log('Registering WD Appointments REST routes');

        // Register settings endpoints
        register_rest_route(
            'wd-appointments/v1',
            '/settings',
            array(
                array(
                    'methods' => 'GET',
                    'callback' => array($this, 'get_settings'),
                    'permission_callback' => array($this, 'check_admin_permissions'),
                ),
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'update_settings'),
                    'permission_callback' => array($this, 'check_admin_permissions'),
                )
            )
        );

        // Register forms endpoints
        register_rest_route(
            'wd-appointments/v1',
            '/forms',
            array(
                array(
                    'methods' => 'GET',
                    'callback' => array($this, 'get_forms'),
                    'permission_callback' => array($this, 'check_admin_permissions'),
                ),
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'create_form'),
                    'permission_callback' => array($this, 'check_admin_permissions'),
                )
            )
        );

        // Log registration
        error_log('REST routes registered for WD Appointments');
        error_log('Full settings endpoint: ' . rest_url('wd-appointments/v1/settings'));
    }

    /**
     * Register the admin menu
     */
    public function add_plugin_admin_menu() {
        // Main menu
        add_menu_page(
            __('Appointments', 'wd-appointments'),
            __('Appointments', 'wd-appointments'),
            'manage_options',
            'wd-appointments',
            array($this, 'display_plugin_admin_page'),
            'dashicons-calendar-alt',
            30
        );
    }

    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'wd-appointments') !== false) {
            // Get the build directory contents
            $js_files = glob(WD_APPOINTMENTS_PLUGIN_DIR . 'admin/react-app/build/static/js/main.*.js');
            $css_files = glob(WD_APPOINTMENTS_PLUGIN_DIR . 'admin/react-app/build/static/css/main.*.css');

            // Enqueue React app
            if (!empty($js_files)) {
                wp_enqueue_script(
                    'wd-appointments-admin',
                    WD_APPOINTMENTS_PLUGIN_URL . 'admin/react-app/build/static/js/' . basename($js_files[0]),
                    array(),
                    WD_APPOINTMENTS_VERSION,
                    true
                );
            }

            if (!empty($css_files)) {
                wp_enqueue_style(
                    'wd-appointments-admin',
                    WD_APPOINTMENTS_PLUGIN_URL . 'admin/react-app/build/static/css/' . basename($css_files[0]),
                    array(),
                    WD_APPOINTMENTS_VERSION
                );
            }

            // Add custom admin styles
            wp_add_inline_style('wd-appointments-admin', '
                .wrap {
                    margin: 10px 20px 0 2px;
                }
                #wd-appointments-admin-app {
                    position: relative;
                    margin: 0;
                }
                #wd-appointments-admin-app .MuiDrawer-root {
                    position: relative;
                    width: 100%;
                }
                #wd-appointments-admin-app .MuiDrawer-paper {
                    position: relative;
                    width: 100%;
                    background: transparent;
                    border: none;
                }
                #wpcontent {
                    padding-left: 0;
                }
            ');

            // Pass necessary data to React app
            wp_localize_script('wd-appointments-admin', 'wdAppointments', array(
                'apiUrl' => rest_url('wd-appointments/v1'),
                'nonce' => wp_create_nonce('wp_rest'),
                'currentPage' => $hook,
                'settings' => $this->ensure_settings_exist(),
                'translations' => $this->get_translations(),
                'wpAdminUrl' => admin_url(),
                'pluginUrl' => WD_APPOINTMENTS_PLUGIN_URL
            ));
        }
    }

    /**
     * Get translations for the React app
     */
    private function get_translations() {
        return array(
            'save' => __('Save', 'wd-appointments'),
            'cancel' => __('Cancel', 'wd-appointments'),
            'delete' => __('Delete', 'wd-appointments'),
            'edit' => __('Edit', 'wd-appointments'),
            'create' => __('Create', 'wd-appointments'),
            'confirmDelete' => __('Are you sure you want to delete this item?', 'wd-appointments'),
            'success' => __('Success!', 'wd-appointments'),
            'error' => __('Error!', 'wd-appointments'),
        );
    }

    /**
     * Display the main admin page
     */
    public function display_plugin_admin_page() {
        echo '<div class="wrap">';
        echo '<div id="wd-appointments-admin-app" data-page="wd-appointments"></div>';
        echo '</div>';
    }

    /**
     * Display the booking forms page
     */
    public function display_booking_forms_page() {
        echo '<div class="wrap">';
        echo '<div id="wd-appointments-admin-app" data-page="wd-appointments-forms"></div>';
        echo '</div>';
    }

    /**
     * Display the appointments page
     */
    public function display_appointments_page() {
        echo '<div class="wrap">';
        echo '<div id="wd-appointments-admin-app" data-page="wd-appointments-list"></div>';
        echo '</div>';
    }

    /**
     * Display the settings page
     */
    public function display_plugin_settings_page() {
        echo '<div class="wrap">';
        echo '<div id="wd-appointments-admin-app" data-page="wd-appointments-settings"></div>';
        echo '</div>';
    }

    /**
     * Check if user has admin permissions
     */
    public function check_admin_permissions() {
        // Check if user is logged in
        if (!is_user_logged_in()) {
            error_log('User is not logged in');
            return false;
        }

        // Check if user has manage_options capability
        $has_permission = current_user_can('manage_options');
        $user = wp_get_current_user();

        error_log('Checking admin permissions for user ID ' . $user->ID);
        error_log('User roles: ' . implode(', ', $user->roles));
        error_log('Has manage_options: ' . ($has_permission ? 'yes' : 'no'));

        return $has_permission;
    }

    /**
     * Check if settings exist and create default if not
     */
    private function ensure_settings_exist() {
        $settings = get_option('wd_appointments_settings');
        if (!$settings) {
            $default_settings = array(
                'calendar_type' => 'google',
                'email_verification' => true,
                'timezone' => 'UTC',
                'date_format' => 'Y-m-d',
                'time_format' => 'H:i',
                'appearance' => array(
                    'primaryColor' => '#007bff',
                    'secondaryColor' => '#6c757d',
                    'fontFamily' => '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    'borderRadius' => 4
                )
            );
            update_option('wd_appointments_settings', $default_settings);
            return $default_settings;
        }
        return $settings;
    }

    /**
     * Get plugin settings
     */
    public function get_settings($request) {
        error_log('get_settings method called');

        // Check if user is logged in and has permissions
        if (!is_user_logged_in()) {
            return new WP_Error(
                'rest_not_logged_in',
                __('You must be logged in to access settings.', 'wd-appointments'),
                array('status' => 401)
            );
        }

        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_forbidden',
                __('You do not have permissions to view settings.', 'wd-appointments'),
                array('status' => 403)
            );
        }

        // Get settings
        $settings = $this->ensure_settings_exist();
        error_log('Settings retrieved: ' . print_r($settings, true));

        if (empty($settings)) {
            return new WP_Error(
                'no_settings',
                __('No settings found.', 'wd-appointments'),
                array('status' => 404)
            );
        }

        return rest_ensure_response($settings);
    }

    /**
     * Update plugin settings
     */
    public function update_settings($request) {
        $settings = $request->get_json_params();
        update_option('wd_appointments_settings', $settings);
        return rest_ensure_response(array('success' => true));
    }

    // Forms endpoints handlers
    public function get_forms() {
        global $wpdb;
        $forms = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wd_appointment_forms ORDER BY created_at DESC");
        return rest_ensure_response($forms);
    }

    public function get_form($request) {
        global $wpdb;
        $form_id = $request['id'];
        $form = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}wd_appointment_forms WHERE id = %d",
            $form_id
        ));

        if (!$form) {
            return new WP_Error('not_found', 'Form not found', array('status' => 404));
        }

        return rest_ensure_response($form);
    }

    public function create_form($request) {
        global $wpdb;
        $form_data = $request->get_json_params();

        $result = $wpdb->insert(
            $wpdb->prefix . 'wd_appointment_forms',
            array(
                'title' => $form_data['title'],
                'settings' => json_encode($form_data['settings']),
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%s')
        );

        if (!$result) {
            return new WP_Error('db_error', 'Could not create form', array('status' => 500));
        }

        return rest_ensure_response(array(
            'id' => $wpdb->insert_id,
            'message' => 'Form created successfully'
        ));
    }

    public function update_form($request) {
        global $wpdb;
        $form_id = $request['id'];
        $form_data = $request->get_json_params();

        $result = $wpdb->update(
            $wpdb->prefix . 'wd_appointment_forms',
            array(
                'title' => $form_data['title'],
                'settings' => json_encode($form_data['settings']),
                'updated_at' => current_time('mysql'),
            ),
            array('id' => $form_id),
            array('%s', '%s', '%s'),
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('db_error', 'Could not update form', array('status' => 500));
        }

        return rest_ensure_response(array('message' => 'Form updated successfully'));
    }

    public function delete_form($request) {
        global $wpdb;
        $form_id = $request['id'];

        $result = $wpdb->delete(
            $wpdb->prefix . 'wd_appointment_forms',
            array('id' => $form_id),
            array('%d')
        );

        if (!$result) {
            return new WP_Error('db_error', 'Could not delete form', array('status' => 500));
        }

        return rest_ensure_response(array('message' => 'Form deleted successfully'));
    }

    // Appointments endpoints handlers
    public function get_appointments() {
        global $wpdb;
        $appointments = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wd_appointments ORDER BY appointment_date DESC");
        return rest_ensure_response($appointments);
    }

    public function get_appointment($request) {
        global $wpdb;
        $appointment_id = $request['id'];
        $appointment = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}wd_appointments WHERE id = %d",
            $appointment_id
        ));

        if (!$appointment) {
            return new WP_Error('not_found', 'Appointment not found', array('status' => 404));
        }

        return rest_ensure_response($appointment);
    }

    public function update_appointment($request) {
        global $wpdb;
        $appointment_id = $request['id'];
        $appointment_data = $request->get_json_params();

        $result = $wpdb->update(
            $wpdb->prefix . 'wd_appointments',
            array(
                'status' => $appointment_data['status'],
                'updated_at' => current_time('mysql'),
            ),
            array('id' => $appointment_id),
            array('%s', '%s'),
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('db_error', 'Could not update appointment', array('status' => 500));
        }

        return rest_ensure_response(array('message' => 'Appointment updated successfully'));
    }

    public function delete_appointment($request) {
        global $wpdb;
        $appointment_id = $request['id'];

        $result = $wpdb->delete(
            $wpdb->prefix . 'wd_appointments',
            array('id' => $appointment_id),
            array('%d')
        );

        if (!$result) {
            return new WP_Error('db_error', 'Could not delete appointment', array('status' => 500));
        }

        return rest_ensure_response(array('message' => 'Appointment deleted successfully'));
    }

    public function send_appointment_reminder($request) {
        $appointment_id = $request['id'];
        // TODO: Implement reminder email sending logic
        return rest_ensure_response(array('message' => 'Reminder sent successfully'));
    }

    // Calendar endpoints handlers
    public function get_calendar_events($request) {
        // TODO: Implement calendar events retrieval logic
        return rest_ensure_response(array());
    }

    public function calendar_authenticate($request) {
        $provider = $request['provider'];
        // TODO: Implement calendar authentication logic
        return rest_ensure_response(array('message' => 'Calendar authenticated successfully'));
    }

    public function calendar_disconnect($request) {
        $provider = $request['provider'];
        // TODO: Implement calendar disconnection logic
        return rest_ensure_response(array('message' => 'Calendar disconnected successfully'));
    }
}
