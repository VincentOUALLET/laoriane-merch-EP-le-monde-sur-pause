<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php bloginfo('name'); ?> - <?php wp_title(); ?></title>
    <link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/style.css">
    <?php wp_head(); ?>
    <script>window.THEME_URI = '<?php echo get_template_directory_uri(); ?>';</script>
</head>
<body <?php body_class(); ?>>
<header>
    <div class="header-content">
        <h1>Le monde sur pause</h1>
        <nav class="header-nav">
            <ul>
                <li><a href="#cd">CD</a></li>
                <li><a href="#livret">Carnet</a></li>
                <li><a href="#aquarelles">Aquarelles</a></li>
                <li><a href="#bougies">Bougies</a></li>
            </ul>
        </nav>
        <div class="cart-container">
            <div class="cart-icon">
                <img src="http://192.168.1.175/wp-content/uploads/2025/09/cart_btn.png" alt="">
                <span class="cart-count">0</span>
            </div>
            <div class="cart-dropdown">
                <div class="header">
                    <h3>Panier</h3>
                    <button class="close">+</button>
                </div>
                <ul class="cart-items"></ul>
                <div class="cart-total">Total: <span class="total-amount">0€</span></div>
                <button class="checkout-btn">Passer commande</button>
            </div>
        </div>
    </div>
</header>

<!-- Loading Spinner -->
<div id="loading-spinner" class="loading-spinner">
    <p>Le monde sur pause - Merchandise</p>
    <div class="spinner"></div>
    <p>Chargement...</p>
</div>

<main id="main-content" style="display: none;">

<?php
// Récupérer tous les produits publiés
$products = wc_get_products(array(
    'status' => 'publish',
    'limit' => -1
));

$product_data = array();

foreach ($products as $product) {
    // featured image ID
    $image_id = $product->get_image_id();

    // gallery IDs -> URLs
    $gallery_urls = array();
    $gallery_ids = $product->get_gallery_image_ids();
    if (!empty($gallery_ids)) {
        foreach ($gallery_ids as $gid) {
            $url = wp_get_attachment_url($gid);
            if ($url) $gallery_urls[] = $url;
        }
    }

    // image_url : featured image if exists
    $image_url = $image_id ? wp_get_attachment_url($image_id) : '';

    // Si pas d'image et pas de gallery, essayer d'extraire depuis la description HTML
    if (empty($image_url) && empty($gallery_urls)) {
        $desc = $product->get_description();
        if (!empty($desc)) {
            // find all image src in the description
            preg_match_all('/<img[^>]+src=[\'"]([^\'"]+)[\'"][^>]*>/i', $desc, $matches);
            if (!empty($matches[1])) {
                // première image => image principale
                $image_url = $matches[1][0];
                // les autres => galerie
                for ($i = 1; $i < count($matches[1]); $i++) {
                    $gallery_urls[] = $matches[1][$i];
                }
            }
        }
    }

    // Optionnel : normaliser empty => '' et gallery => []
    $image_url = $image_url ? $image_url : '';
    if (!is_array($gallery_urls)) $gallery_urls = array();

    // Construire la data produit complète
    $product_data[] = array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'type' => $product->get_type(),
        'status' => $product->get_status(),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'description' => $product->get_description(),
        'short_description' => $product->get_short_description(),
        'categories' => wp_get_post_terms($product->get_id(), 'product_cat', array('fields' => 'names')),
        'tags' => wp_get_post_terms($product->get_id(), 'product_tag', array('fields' => 'names')),
        'image' => $image_url,
        'gallery' => $gallery_urls,
        'stock_quantity' => $product->get_stock_quantity(),
        'stock_status' => $product->get_stock_status(),
        'sku' => $product->get_sku(),
        'permalink' => get_permalink($product->get_id()),
    );
}
?>

<script>
window.products = <?php echo json_encode($product_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
console.log('WooCommerce products loaded:', window.products);
</script>
