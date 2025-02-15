<?php
/**
 * Plugin Name: WD Appointments
 * Plugin URI: https://wolfdevs.com/wd-appointments
 * Description: A modern appointment scheduling system with calendar integration
 * Version: 1.0.0
 * Author: WolfDevs
 * Author URI: https://wolfdevs.com
 * Text Domain: wd-appointments
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Plugin version
define('WD_APPOINTMENTS_VERSION', '1.0.0');
define('WD_APPOINTMENTS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WD_APPOINTMENTS_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Class WD_Appointments
 */
class WD_Appointments {
    /**
     * Instance of this class.
     *
     * @var object
     */
    protected static $instance = null;

    /**
     * The admin instance
     *
     * @var WD_Appointments_Admin
     */
    private $admin = null;

    /**
     * Initialize the plugin.
     */
    private function __construct() {
        // Load dependencies
        $this->load_dependencies();

        // Initialize hooks
        $this->init_hooks();

        // Initialize admin early
        $this->init_admin();
    }

    /**
     * Get plugin instance.
     *
     * @return WD_Appointments
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Load required dependencies.
     */
    private function load_dependencies() {
        // Include files
        require_once WD_APPOINTMENTS_PLUGIN_DIR . 'includes/class-wd-appointments-activator.php';
        require_once WD_APPOINTMENTS_PLUGIN_DIR . 'includes/class-wd-appointments-deactivator.php';
        require_once WD_APPOINTMENTS_PLUGIN_DIR . 'admin/class-wd-appointments-admin.php';
    }

    /**
     * Register all hooks.
     */
    private function init_hooks() {
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array('WD_Appointments_Activator', 'activate'));
        register_deactivation_hook(__FILE__, array('WD_Appointments_Deactivator', 'deactivate'));

        // Add actions
        add_action('init', array($this, 'load_plugin_textdomain'));
    }

    /**
     * Initialize admin functionality
     */
    public function init_admin() {
        if ($this->admin === null) {
            $this->admin = new WD_Appointments_Admin();
            error_log('WD Appointments Admin initialized');
        }
    }

    /**
     * Load plugin text domain.
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'wd-appointments',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages/'
        );
    }
}

// Initialize the plugin
function wd_appointments() {
    return WD_Appointments::get_instance();
}

// Start the plugin
wd_appointments();
