<?php
/**
 * Fired during plugin deactivation
 */
class WD_Appointments_Deactivator {
    /**
     * Plugin deactivation tasks
     */
    public static function deactivate() {
        // Clear scheduled events
        wp_clear_scheduled_hook('wd_appointments_hourly_events');
        wp_clear_scheduled_hook('wd_appointments_daily_events');
        
        // We don't delete tables or settings here to preserve data
        // Tables and settings cleanup should be handled in uninstall.php if needed
    }
}
