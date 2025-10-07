<?php
function vanilla_theme_assets() {
    # Ton CSS
    wp_enqueue_style('vanilla-style', get_template_directory_uri() . '/style.css');

    # Tes scripts
    wp_enqueue_script('paypal', 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR', array(), null, true);
    wp_enqueue_script('emailjs', 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/emailjs.min.js', array(), null, true);
    wp_enqueue_script('config-js', get_template_directory_uri() . '/config.js', array(), null, true);
    wp_enqueue_script('script-js', get_template_directory_uri() . '/script.js', array('config-js'), null, true);
    wp_enqueue_script('payment-js', get_template_directory_uri() . '/payment.js', array(), null, true);
}
add_action('wp_enqueue_scripts', 'vanilla_theme_assets');
