<?php
/**
 * Plugin Name: Bespona Mannequin
 * Description: Mannequin interactif avec hotspots sélectionnables et suivi d'évènements.
 * Version: 1.0.0
 * Author: Bespona
 * Text Domain: bespona-mannequin
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register plugin assets.
 */
function bespona_mannequin_register_assets() {
    $plugin_url = plugin_dir_url(__FILE__);
    $version = '1.0.0';

    wp_register_style(
        'bp-mannequin',
        $plugin_url . 'assets/bp-mannequin.css',
        array(),
        $version
    );

    wp_register_script(
        'bp-mannequin',
        $plugin_url . 'assets/bp-mannequin.js',
        array(),
        $version,
        true
    );

    wp_localize_script(
        'bp-mannequin',
        'bpMannequinSettings',
        array(
            'assetsBaseUrl'  => trailingslashit($plugin_url . 'assets'),
            'presetsBaseUrl' => trailingslashit($plugin_url . 'assets/presets'),
        )
    );
}
add_action('init', 'bespona_mannequin_register_assets');

/**
 * Shortcode renderer for the mannequin component.
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function bespona_mannequin_shortcode($atts = array()) {
    $atts = shortcode_atts(
        array(
            'preset' => 'default',
            'mode'   => 'single',
        ),
        $atts,
        'bespona_mannequin'
    );

    $preset = sanitize_key($atts['preset']);
    $mode = ('multi' === strtolower($atts['mode'])) ? 'multi' : 'single';

    wp_enqueue_style('bp-mannequin');
    wp_enqueue_script('bp-mannequin');

    $image_src = plugin_dir_url(__FILE__) . 'assets/mannequin.svg';

    ob_start();
    ?>
    <div class="bp-mannequin" data-preset="<?php echo esc_attr($preset); ?>" data-mode="<?php echo esc_attr($mode); ?>">
        <img class="bp-mannequin__img" src="<?php echo esc_url($image_src); ?>" alt="Silhouette de mannequin" />
        <ul class="bp-mannequin__points" aria-label="Zones du corps"></ul>
    </div>
    <?php
    return trim(ob_get_clean());
}
add_shortcode('bespona_mannequin', 'bespona_mannequin_shortcode');
