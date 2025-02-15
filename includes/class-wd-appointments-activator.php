<?php
/**
 * Fired during plugin activation
 */
class WD_Appointments_Activator {
    /**
     * Create necessary database tables and initialize plugin settings
     */
    public static function activate() {
        global $wpdb;
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Appointments table
        $table_appointments = $wpdb->prefix . 'wd_appointments';
        $sql_appointments = "CREATE TABLE IF NOT EXISTS $table_appointments (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            form_id bigint(20) NOT NULL,
            client_name varchar(100) NOT NULL,
            client_email varchar(100) NOT NULL,
            appointment_date datetime NOT NULL,
            duration int NOT NULL,
            status varchar(20) NOT NULL,
            calendar_event_id varchar(255),
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        // Booking Forms table
        $table_forms = $wpdb->prefix . 'wd_appointment_forms';
        $sql_forms = "CREATE TABLE IF NOT EXISTS $table_forms (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            settings longtext NOT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        // Form Fields table
        $table_form_fields = $wpdb->prefix . 'wd_appointment_form_fields';
        $sql_form_fields = "CREATE TABLE IF NOT EXISTS $table_form_fields (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            form_id bigint(20) NOT NULL,
            field_type varchar(50) NOT NULL,
            field_label varchar(255) NOT NULL,
            field_options longtext,
            is_required tinyint(1) DEFAULT 0,
            sort_order int DEFAULT 0,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        dbDelta($sql_appointments);
        dbDelta($sql_forms);
        dbDelta($sql_form_fields);
        
        // Set default options
        add_option('wd_appointments_version', WD_APPOINTMENTS_VERSION);
        add_option('wd_appointments_settings', array(
            'calendar_type' => 'google',
            'email_verification' => true,
            'timezone' => 'UTC',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
            'colors' => array(
                'primary' => '#007bff',
                'secondary' => '#6c757d'
            )
        ));
    }
}
