// Shopping cart state
let cart = [];
let cartCount = 0;

// Show loading spinner initially
document.addEventListener('DOMContentLoaded', function() {
  showLoadingSpinner();

  // Config is enqueued by WordPress, wait for window.config to be available
  const checkConfig = setInterval(() => {
    if (typeof window.config !== 'undefined') {
      clearInterval(checkConfig);
      initializeApp();
    }
  }, 50);

  // Fallback timeout
  setTimeout(() => {
    clearInterval(checkConfig);
    if (typeof window.config === 'undefined') {
      console.error('Config not loaded');
      hideLoadingSpinner();
    }
  }, 1000);
});

// Show loading spinner
function showLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.display = 'flex';
  }
}

// Hide loading spinner and show main content
function hideLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  const mainContent = document.getElementById('main-content');

  if (spinner) {
    spinner.style.display = 'none';
  }
  if (mainContent) {
    mainContent.style.display = 'block';
  }
}

// Phase 1 : Override prices with WooCommerce data
function overridePricesWithWooCommerce() {
  // Prevent double execution
  if (window.wooPricesUpdated) {
    console.log('⏭️ WooCommerce prices already updated, skipping...');
    return true;
  }

  // Check if WooCommerce products are available
  if (typeof window.products === 'undefined') {
    console.log('⏳ Waiting for WooCommerce products...');
    return false; // Return false to indicate not ready
  }

  if (!Array.isArray(window.products) || window.products.length === 0) {
    console.log('❌ WooCommerce products not available or empty, using config.js prices');
    return false;
  }

  console.log('✅ Phase 1: WooCommerce products loaded, overriding prices...');
  console.log(`📦 Found ${window.products.length} WooCommerce products`);

  // Group WooCommerce products by category
  const wooByCategory = {};
  window.products.forEach(product => {
    if (product.categories && Array.isArray(product.categories)) {
      product.categories.forEach(category => {
        if (!wooByCategory[category]) {
          wooByCategory[category] = [];
        }
        wooByCategory[category].push(product);
      });
    }
  });

  console.log('📂 Products grouped by category:', wooByCategory);

  // Map config.js keys to WooCommerce categories
  const categoryMapping = {
    'cd': 'CD',
    'livret': 'Livret',
    'aquarelles': 'Aquarelles',
    'bougies': 'Bougies'
  };

  let updatesCount = 0;

  // Override prices in config.products
  Object.keys(config.products).forEach(configKey => {
    const wooCategory = categoryMapping[configKey];
    if (wooByCategory[wooCategory] && wooByCategory[wooCategory].length > 0) {
      const wooProducts = wooByCategory[wooCategory];

      if (configKey === 'bougies') {
        // Special handling for bougies variants
        const variantPrices = getBougiesVariantPrices(wooProducts);
        if (variantPrices) {
          const oldPrice = config.products[configKey].price;

          // Update main price (petite by default)
          config.products[configKey].price = variantPrices.petite;
          console.log(`💰 Updated ${configKey}: ${oldPrice}€ → ${variantPrices.petite}€ (WooCommerce)`);
          updatesCount++;

          // Update variant prices
          if (config.products[configKey].variants) {
            if (config.products[configKey].variants.petite) {
              const oldPetitePrice = config.products[configKey].variants.petite.price;
              config.products[configKey].variants.petite.price = variantPrices.petite;
              console.log(`🔧 Updated ${configKey} variant petite: ${oldPetitePrice}€ → ${variantPrices.petite}€`);
            }

            if (config.products[configKey].variants.grande) {
              const oldGrandePrice = config.products[configKey].variants.grande.price;
              config.products[configKey].variants.grande.price = variantPrices.grande;
              console.log(`🔧 Updated ${configKey} variant grande: ${oldGrandePrice}€ → ${variantPrices.grande}€`);
            }
          }
        }
      } else {
        // Standard handling for other products
        const wooProduct = wooProducts[0]; // Take first product of category
        const wooPrice = parseFloat(wooProduct.price);

        if (!isNaN(wooPrice) && wooPrice > 0) {
          const oldPrice = config.products[configKey].price;

          // Override main price
          config.products[configKey].price = wooPrice;
          console.log(`💰 Updated ${configKey}: ${oldPrice}€ → ${wooPrice}€ (WooCommerce)`);
          updatesCount++;

          // Override variant prices if they exist
          if (config.products[configKey].variants) {
            Object.keys(config.products[configKey].variants).forEach(variantKey => {
              const variant = config.products[configKey].variants[variantKey];
              const oldVariantPrice = variant.price;
              variant.price = wooPrice; // Use same price for all variants
              console.log(`🔧 Updated ${configKey} variant ${variantKey}: ${oldVariantPrice}€ → ${wooPrice}€`);
            });
          }
        }
      }
    } else {
      console.log(`⚠️ No WooCommerce products found for category: ${wooCategory} (config key: ${configKey})`);
    }
  });

  // Mark as updated to prevent double execution
  window.wooPricesUpdated = true;

  console.log(`✅ Phase 1 completed: ${updatesCount} price(s) updated from WooCommerce`);
  return true; // Return true to indicate success
}

// Helper function to get bougies variant prices
function getBougiesVariantPrices(wooProducts) {
  const prices = { petite: null, grande: null };

  wooProducts.forEach(product => {
    const name = product.name.toLowerCase();
    const price = parseFloat(product.price);

    if (name.includes('petite') && !isNaN(price)) {
      prices.petite = price;
    } else if (name.includes('grande') && !isNaN(price)) {
      prices.grande = price;
    }
  });

  console.log('🎯 Bougies prices found:', prices);
  return (prices.petite !== null && prices.grande !== null) ? prices : null;
}

// Phase 2: Transform WooCommerce products to match config.js structure
function transformWooCommerceProducts() {
  if (!window.products || !Array.isArray(window.products)) {
    console.warn('⚠️ No WooCommerce products available for transformation');
    return null;
  }

  console.log('✅ Phase 2: Transforming WooCommerce products...');

  const transformed = {
    cd: null,
    livret: null,
    aquarelles: null,
    bougies: null
  };

  // Group products by category
  const byCategory = {
    'CD': [],
    'Livret': [],
    'Aquarelles': [],
    'Bougies': []
  };

  window.products.forEach(product => {
    if (product.categories && Array.isArray(product.categories)) {
      product.categories.forEach(cat => {
        if (byCategory[cat]) {
          byCategory[cat].push(product);
        }
      });
    }
  });

  // Transform CD
  if (byCategory['CD'].length > 0) {
    const cdProduct = byCategory['CD'][0];
    transformed.cd = {
      id: 'cd',
      title: cdProduct.name,
      description: cdProduct.description || config.products.cd.description,
      price: parseFloat(cdProduct.price),
      addToCartText: config.products.cd.addToCartText,
      images: [],
      inCarousel: true
    };

    // Add main image
    if (cdProduct.image) {
      transformed.cd.images.push({
        src: cdProduct.image,
        alt: cdProduct.name + ' recto'
      });
    }

    // Add gallery images
    if (cdProduct.gallery && Array.isArray(cdProduct.gallery)) {
      cdProduct.gallery.forEach((imgUrl, index) => {
        transformed.cd.images.push({
          src: imgUrl,
          alt: cdProduct.name + ' ' + (index + 2)
        });
      });
    }
  }

  // Transform Livret
  if (byCategory['Livret'].length > 0) {
    // Find main product (without variant suffix)
    const mainLivret = byCategory['Livret'].find(p => p.sku === 'livret') || byCategory['Livret'][0];
    
    transformed.livret = {
      id: 'livret',
      title: 'Livret de paroles et poèmes',
      description: mainLivret.description || config.products.livret.description,
      description2: config.products.livret.description2,
      price: parseFloat(mainLivret.price),
      selectionType: 'dropdown',
      selectionLabel: config.products.livret.selectionLabel,
      addToCartText: config.products.livret.addToCartText,
      colorOptions: config.products.livret.colorOptions,
      variants: {},
      inCarousel: true
    };

    // Map variants
    const variantMapping = {
      'livret-vert-bleu': 'vert-bleu',
      'livret-bordeaux': 'bordeaux',
      'livret-violet-fleuris': 'violet-fleuri'
    };

    byCategory['Livret'].forEach(product => {
      const variantKey = variantMapping[product.sku];
      if (variantKey) {
        // Extract variant name from product name (after " - ")
        const nameParts = product.name.split(' - ');
        const variantName = nameParts.length > 1 ? nameParts[1] : product.name;

        transformed.livret.variants[variantKey] = {
          name: variantName,
          price: parseFloat(product.price),
          image: product.image || THEME_URI + '/photos_merch_ep/livret_' + variantKey.replace('-', '_') + '.jpg'
        };
      }
    });

    // Fallback: if no variants found, use config.js variants
    if (Object.keys(transformed.livret.variants).length === 0) {
      transformed.livret.variants = config.products.livret.variants;
    }
  }

  // Transform Bougies
  if (byCategory['Bougies'].length > 0) {
    transformed.bougies = {
      id: 'bougies',
      title: 'Bougies',
      description: 'Bougies parfumées inspirées de l\'album.',
      price: 5, // Default to petite
      addToCartText: config.products.bougies.addToCartText,
      variants: {},
      inCarousel: true
    };

    byCategory['Bougies'].forEach(product => {
      const name = product.name.toLowerCase();
      if (name.includes('petite')) {
        transformed.bougies.variants.petite = {
          name: 'Petite bougie',
          price: parseFloat(product.price),
          image: product.image || THEME_URI + '/photos_merch_ep/bougie_petite.jpg'
        };
        transformed.bougies.price = parseFloat(product.price);
      } else if (name.includes('grande')) {
        transformed.bougies.variants.grande = {
          name: 'Grande bougie',
          price: parseFloat(product.price),
          image: product.image || THEME_URI + '/photos_merch_ep/bougie_grande.jpg'
        };
      }
    });

    // Fallback: if no variants found, use config.js variants
    if (Object.keys(transformed.bougies.variants).length === 0) {
      transformed.bougies.variants = config.products.bougies.variants;
    }
  }

  // Transform Aquarelles
  if (byCategory['Aquarelles'].length > 0) {
    transformed.aquarelles = {
      id: 'aquarelles',
      title: 'Aquarelles',
      description: 'Aquarelles inspirées des chansons de l\'album.',
      selectionLabel: config.products.aquarelles.selectionLabel,
      addToCartText: config.products.aquarelles.addToCartText,
      price: 3,
      colorOption: config.products.aquarelles.colorOption,
      colorOption2: config.products.aquarelles.colorOption2,
      songs: {},
      inCarousel: true
    };

    // Group aquarelles by song
    const songGroups = {};

    byCategory['Aquarelles'].forEach(product => {
      // Extract song name and color from product name
      // Format: "Aquarelle - [Song Name] (couleur/noire)"
      const match = product.name.match(/Aquarelle - (.+?) \((couleur|noire)\)/);
      if (match) {
        const songName = match[1];
        const color = match[2];

        if (!songGroups[songName]) {
          songGroups[songName] = { images: {} };
        }

        songGroups[songName].images[color] = product.image || '';
        
        // Update price from first product
        if (transformed.aquarelles.price === 3) {
          transformed.aquarelles.price = parseFloat(product.price);
        }
      }
    });

    transformed.aquarelles.songs = songGroups;

    // Fallback: if no songs found, use config.js songs
    if (Object.keys(transformed.aquarelles.songs).length === 0) {
      transformed.aquarelles.songs = config.products.aquarelles.songs;
    }
  }

  console.log('✅ Phase 2 completed: Products transformed', transformed);
  return transformed;
}

// Prevent multiple initializations
let appInitialized = false;

function initializeApp() {
  // Prevent multiple initializations
  if (appInitialized) {
    console.log('⏭️ App already initialized, skipping...');
    return;
  }

  console.log('🚀 Starting app initialization...');

  // Wait for both config and products to be available
  const checkDependencies = setInterval(() => {
    if (typeof window.config !== 'undefined' && typeof window.products !== 'undefined') {
      clearInterval(checkDependencies);

      // Phase 1: Override prices (legacy support)
      if (!window.wooPricesUpdated) {
        overridePricesWithWooCommerce();
      }

      // Phase 2: Transform WooCommerce products and merge with config
      const transformedProducts = transformWooCommerceProducts();
      if (transformedProducts) {
        // Clear existing products to prevent duplicates
        config.products = {};

        // Merge transformed products into config.products
        Object.keys(transformedProducts).forEach(key => {
          if (transformedProducts[key]) {
            config.products[key] = transformedProducts[key];
          }
        });
        console.log('✅ Products merged into config:', config.products);
      }

      // Mark as initialized before continuing
      appInitialized = true;

      // Continue with normal initialization
      continueInitialization();
    }
  }, 50);

  // Fallback timeout
  setTimeout(() => {
    clearInterval(checkDependencies);

    if (!appInitialized) {
      if (typeof window.products === 'undefined') {
        console.warn('⚠️ WooCommerce products not loaded after timeout, using config.js data');
      } else {
        // Try transformation even after timeout
        if (!window.wooPricesUpdated) {
          overridePricesWithWooCommerce();
        }

        const transformedProducts = transformWooCommerceProducts();
        if (transformedProducts) {
          // Clear existing products to prevent duplicates
          config.products = {};

          Object.keys(transformedProducts).forEach(key => {
            if (transformedProducts[key]) {
              config.products[key] = transformedProducts[key];
            }
          });
        }
      }

      // Mark as initialized before continuing
      appInitialized = true;

      continueInitialization();
    }
  }, 2000);
}

function continueInitialization() {
    console.log('🔄 Continuing initialization...');

    // Populate HTML texts from config
    document.title = config.site.title;
    document.querySelector('h1').textContent = config.site.headerTitle;

    // Update navigation
    const navLinks = document.querySelectorAll('.header-nav a');
    if (navLinks.length >= 4) {
      navLinks[0].textContent = config.navigation.cd;
      navLinks[1].textContent = config.navigation.carnet;
      navLinks[2].textContent = config.navigation.aquarelles;
      navLinks[3].textContent = config.navigation.bougies;
    }

    // Update cart elements
    const cartTitle = document.querySelector('.cart-dropdown h3');
    const totalAmount = document.querySelector('.total-amount');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (cartTitle) cartTitle.textContent = config.cart.title;
    if (totalAmount) totalAmount.textContent = config.cart.empty + config.site.currency;
    if (checkoutBtn) checkoutBtn.textContent = config.cart.checkout;

    // Clear main content before generating products
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = '';
    }

    // Generate product sections dynamically
    generateProductSections();

    // Initialize cart
    updateCartDisplay();

    // Setup event listeners
    setupEventListeners();

    // Hide loading spinner and show content
    hideLoadingSpinner();

    console.log('✅ Initialization completed');
}

// Generate all product sections from config
function generateProductSections() {
  const main = document.querySelector('main');
  if (!main) {
    console.error('❌ Main element not found');
    return;
  }

  console.log('🏗️ Generating product sections...');

  Object.values(config.products).forEach(product => {
    if (product) {
      const section = generateProductSection(product);
      main.appendChild(section);
    }
  });

  // Update footer
  const footer = document.querySelector('footer p');
  if (footer) {
    footer.innerHTML = config.site.footer;
  }

  console.log('✅ Product sections generated');
}

// Generate a product section based on component type
function generateProductSection(product) {
  const section = document.createElement('section');
  section.className = 'product';
  section.id = product.id;

  // Title
  const title = document.createElement('h2');
  title.textContent = product.title;
  section.appendChild(title);

  // Images
  if (product.images) {
    const imagesDiv = document.createElement('div');
    imagesDiv.className = 'product-images';
    product.images.forEach(imgData => {
      const img = document.createElement('img');
      img.src = imgData.src;
      img.alt = imgData.alt;
      img.className = 'product-image';
      img.dataset.productId = product.id;
      img.dataset.productType = 'single';
      if (product.id !== 'cd') {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';
        wrapper.appendChild(img);
        imagesDiv.appendChild(wrapper);
      } else {
        imagesDiv.appendChild(img);
      }
    });
    section.appendChild(imagesDiv);
  } else if (product.variants) {
    // Handle products with variants (livret, bougies)
    const imagesDiv = document.createElement('div');
    imagesDiv.className = 'product-images';
    Object.entries(product.variants).forEach(([variantKey, variant]) => {
      if (variant.image) {
        const img = document.createElement('img');
        img.src = variant.image;
        img.alt = variant.name;
        img.className = 'product-image';
        img.dataset.productId = product.id;
        img.dataset.productType = 'variant';
        img.dataset.variantKey = variantKey;
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';
        wrapper.appendChild(img);
        imagesDiv.appendChild(wrapper);
      }
    });
    section.appendChild(imagesDiv);
  }

  // Details
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'product-details';

  // Description
  if (product.description) {
    const descP = document.createElement('p');
    descP.textContent = product.description;
    detailsDiv.appendChild(descP);
  }

  // Additional description
  if (product.description2) {
    const desc2P = document.createElement('p');
    desc2P.textContent = product.description2;
    detailsDiv.appendChild(desc2P);
  }

  // Color options for livret
  if (product.colorOptions) {
    const colorP = document.createElement('p');
    colorP.textContent = product.colorOptions;
    detailsDiv.appendChild(colorP);
  }

  // Price
  const priceP = document.createElement('p');
  priceP.className = 'price';
  let displayPrice = product.price;
  if (product.id === 'bougies') {
    displayPrice = product.variants.petite.price;
  }
  priceP.textContent = `Prix : ${displayPrice}${config.site.currency}`;
  detailsDiv.appendChild(priceP);

  // Selection components
  if (product.selectionType) {
    const selectionDiv = generateSelectionComponent(product);
    detailsDiv.appendChild(selectionDiv);
  }

  // Special handling for aquarelles songs
  if (product.id === 'aquarelles') {
    const songsDiv = generateAquarellesSongs(product);
    detailsDiv.appendChild(songsDiv);
  }

  // Special handling for bougies sizes
  if (product.id === 'bougies') {
    const sizesDiv = generateBougiesSizes(product);
    detailsDiv.appendChild(sizesDiv);
  }

  // Add to cart button (skip for aquarelles as they have individual buttons per song)
  if (product.id !== 'aquarelles') {
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart';
    addToCartBtn.textContent = product.addToCartText;
    detailsDiv.appendChild(addToCartBtn);
  }

  section.appendChild(detailsDiv);
  return section;
}

// Generate selection component (dropdown or radio)
function generateSelectionComponent(product) {
  if (product.selectionType === 'dropdown') {
    const container = document.createElement('div');
    container.className = 'color-selection';

    const label = document.createElement('label');
    label.setAttribute('for', `${product.id}-select`);
    label.textContent = product.selectionLabel;

    const select = document.createElement('select');
    select.id = `${product.id}-select`;
    select.name = `${product.id}-select`;

    Object.entries(product.variants).forEach(([key, variant]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = variant.name;
      select.appendChild(option);
    });

    container.appendChild(label);
    container.appendChild(select);
    return container;
  }
  return document.createElement('div'); // Empty div for other types
}

// Generate aquarelles songs selection
function generateAquarellesSongs(product) {
  const container = document.createElement('div');
  container.className = 'song-selection';

  const title = document.createElement('h3');
  title.textContent = product.selectionLabel;
  container.appendChild(title);

  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'song-options';

  Object.entries(product.songs).forEach(([songName, songData]) => {
    const songOption = document.createElement('div');
    songOption.className = 'song-option';

    const songTitle = document.createElement('h4');
    songTitle.textContent = songName;
    songOption.appendChild(songTitle);

    const imagesDiv = document.createElement('div');
    imagesDiv.className = 'song-images';

    Object.entries(songData.images).forEach(([color, imgSrc]) => {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `${songName} - ${color}`;
      img.className = 'song-image';
      img.dataset.song = songName;
      img.dataset.color = color;
      img.dataset.productId = product.id;
      img.dataset.productType = 'aquarelle';
      img.dataset.variantKey = `${songName}-${color}`;
      const wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper';
      wrapper.appendChild(img);
      imagesDiv.appendChild(wrapper);
    });

    songOption.appendChild(imagesDiv);

    const colorDiv = document.createElement('div');
    colorDiv.className = 'text-color';

    ['couleur', 'noire'].forEach(color => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `text-color-${songName.toLowerCase().replace(/\s+/g, '-')}`;
      input.value = color;
      if (color === 'couleur') input.checked = true;

      const span = document.createElement('span');
      span.textContent = color === 'couleur' ? product.colorOption : product.colorOption2;

      label.appendChild(input);
      label.appendChild(span);
      colorDiv.appendChild(label);
    });

    songOption.appendChild(colorDiv);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-cart';
    addBtn.dataset.type = 'aquarelle';
    addBtn.dataset.song = songName;
    addBtn.textContent = product.addToCartText;
    songOption.appendChild(addBtn);

    optionsDiv.appendChild(songOption);
  });

  container.appendChild(optionsDiv);
  return container;
}

// Generate bougies sizes selection
function generateBougiesSizes(product) {
  const container = document.createElement('div');
  container.className = 'price-selection';

  Object.entries(product.variants).forEach(([size, variant]) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'bougie-size';
    input.value = size;
    if (size === 'petite') input.checked = true;

    const span = document.createElement('span');
    span.textContent = `${variant.name} : ${variant.price}${config.site.currency}`;

    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });

  return container;
}

// Setup all event listeners
function setupEventListeners() {
  // Prevent duplicate event listeners
  if (window.eventListenersSetup) {
    console.log('⏭️ Event listeners already set up, skipping...');
    return;
  }
  window.eventListenersSetup = true;

  console.log('🔧 Setting up event listeners...');

  // Cart icon click
  const cartIcon = document.querySelector('.cart-icon');
  const cartDropdown = document.querySelector('.cart-dropdown');

  if (cartIcon && cartDropdown) {
    // Remove existing listeners first
    const newCartIcon = cartIcon.cloneNode(true);
    const newCartDropdown = cartDropdown.cloneNode(true);
    cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);
    cartDropdown.parentNode.replaceChild(newCartDropdown, cartDropdown);

    newCartIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🛒 Cart icon clicked');
      newCartDropdown.classList.toggle('show');

      // Also close other dropdowns if open
      document.querySelectorAll('.cart-dropdown.show').forEach(dropdown => {
        if (dropdown !== newCartDropdown) {
          dropdown.classList.remove('show');
        }
      });
    });
  }

  // Close button click (for mobile)
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cartDropdown = document.querySelector('.cart-dropdown');
      if (cartDropdown) {
        cartDropdown.classList.remove('show');
      }
    });
  }

  // Close cart when clicking outside
  document.addEventListener('click', (e) => {
    const cartIcon = document.querySelector('.cart-icon');
    const cartDropdown = document.querySelector('.cart-dropdown');

    if (cartIcon && cartDropdown) {
      if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
        cartDropdown.classList.remove('show');
      }
    }
  });

  // Cart item controls
  document.addEventListener('click', handleCartControls);

  // Selection changes
  setupSelectionListeners();

  // Add to cart buttons
  setupAddToCartListeners();

  // Debug: Test cart functionality
  console.log('✅ Event listeners setup completed');

  // Image clicks for lightbox
  setupImageListeners();

  // Other features
  setupHoverEffects();
  setupSmoothScrolling();
}

// Handle cart quantity and deletion
function handleCartControls(e) {
  // Quantity increase
  if (e.target.classList.contains('plus')) {
    const index = parseInt(e.target.dataset.index);
    if (index >= 0 && index < cart.length) {
      cart[index].quantity++;
      cartCount++;
      updateCartDisplay();
    }
  }

  // Quantity decrease
  if (e.target.classList.contains('minus')) {
    const index = parseInt(e.target.dataset.index);
    if (index >= 0 && index < cart.length) {
      cart[index].quantity--;
      cartCount--;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      updateCartDisplay();
    }
  }

  // Item deletion
  if (e.target.classList.contains('delete-btn')) {
    const index = parseInt(e.target.dataset.index);
    if (index >= 0 && index < cart.length) {
      cartCount -= cart[index].quantity;
      cart.splice(index, 1);
      updateCartDisplay();
    }
  }
}

// Setup selection listeners
function setupSelectionListeners() {
  // Livret color selection
  const livretSelect = document.getElementById('livret-select');
  if (livretSelect) {
    livretSelect.addEventListener('change', () => {
      console.log('Livret color selected:', livretSelect.value);
    });
  }

  // Aquarelles text color selection
  const textColors = document.querySelectorAll('.text-color input[type="radio"]');
  textColors.forEach(radio => {
    radio.addEventListener('change', () => {
      console.log('Text color selected:', radio.value, 'for song:', radio.name);
    });
  });

  // Bougie size selection
  const bougieSizes = document.querySelectorAll('input[name="bougie-size"]');
  bougieSizes.forEach(radio => {
    radio.addEventListener('change', () => {
      const size = radio.value;
      const price = config.products.bougies.variants[size].price;
      const productDiv = radio.closest('.product');
      const priceP = productDiv.querySelector('.price');
      priceP.textContent = `Prix : ${price}${config.site.currency}`;
    });
  });
}

// Setup add to cart listeners
function setupAddToCartListeners() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      handleAddToCart(this);
    });
  });
}

// Handle add to cart
function handleAddToCart(button) {
  // Prevent double-clicks
  if (button.classList.contains('loading')) {
    return;
  }

  button.classList.add('loading');
  console.log('🛒 Adding to cart:', button.dataset.song || button.closest('.product')?.id);

  if (button.dataset.type === 'aquarelle') {
    const songName = button.dataset.song;
    const textColorRadio = button.closest('.song-option').querySelector('input[name^="text-color-"]:checked');
    const textColor = textColorRadio ? textColorRadio.value : 'couleur';
    const productName = `Aquarelle - ${songName} (${textColor})`;

    addToCart(productName, 1, config.products.aquarelles.price);

    // Visual feedback
    const originalText = button.textContent;
    button.textContent = config.texts.addedToCart;
    button.classList.add('feedback-primary');
    button.classList.remove('loading');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('feedback-primary');
    }, 2000);
  } else {
    const product = button.closest('.product');
    const productId = product.id;
    const productConfig = config.products[productId];

    if (!productConfig) {
      button.classList.remove('loading');
      return;
    }

    let productName = productConfig.title;
    let price = productConfig.price;

    // Special handling for variants
    if (productId === 'livret') {
      const select = document.getElementById('livret-select');
      const color = select ? select.value : 'vert-bleu';
      const variant = productConfig.variants[color];
      productName = `${productName} (${variant.name.toLowerCase()})`;
    } else if (productId === 'bougies') {
      const selectedSize = document.querySelector('input[name="bougie-size"]:checked');
      const size = selectedSize ? selectedSize.value : 'petite';
      const variant = productConfig.variants[size];
      productName = `${productName} (${variant.name.toLowerCase()})`;
      price = variant.price;
    }

    addToCart(productName, 1, price);

    // Visual feedback
    const originalText = button.textContent;
    button.textContent = config.texts.addedToCart;
    button.classList.add('feedback-success');
    button.classList.remove('loading');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('feedback-success');
    }, 2000);
  }
}

// Setup image listeners for lightbox
function setupImageListeners() {
  const allImages = getCarouselImages();
  allImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      openLightbox(index, img.src, img.alt);
    });
  });

  // Add quantity badges
  const allProductImages = document.querySelectorAll('.product-image, .song-image');
  allProductImages.forEach(img => {
    let badge = img.parentElement.querySelector('.quantity-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'quantity-badge';
      badge.textContent = '0';
      badge.style.display = 'none';
      img.parentElement.classList.add('badge-relative');
      img.parentElement.appendChild(badge);
    }
  });
}

// Get carousel images
function getCarouselImages() {
  const carouselImages = [];

  Object.values(config.products).forEach(product => {
    if (product.inCarousel) {
      if (product.images) {
        product.images.forEach(imgData => {
          const img = document.querySelector(`img[src="${imgData.src}"]`);
          if (img) carouselImages.push(img);
        });
      }

      if (product.variants) {
        Object.values(product.variants).forEach(variant => {
          if (variant.image) {
            const img = document.querySelector(`img[src="${variant.image}"]`);
            if (img) carouselImages.push(img);
          }
        });
      }

      if (product.songs) {
        Object.values(product.songs).forEach(song => {
          Object.values(song.images).forEach(imgSrc => {
            const img = document.querySelector(`img[src="${imgSrc}"]`);
            if (img) carouselImages.push(img);
          });
        });
      }
    }
  });

  return carouselImages;
}

// Setup hover effects
function setupHoverEffects() {
  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    product.addEventListener('mouseenter', function() {
      this.classList.add('product-hover');
    });

    product.addEventListener('mouseleave', function() {
      this.classList.remove('product-hover');
    });
  });
}

// Setup smooth scrolling
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Shopping cart functions
function addToCart(name, quantity, price) {
  console.log('🛒 Adding to cart:', name, quantity, price);

  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ name, quantity, price });
  }

  cartCount += quantity;
  console.log('🛒 Cart updated, count:', cartCount, 'items:', cart.length);
  updateCartDisplay();
}

function updateCartDisplay() {
  console.log('🛒 Updating cart display, count:', cartCount);

  // Update cart count
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }

  // Update cart dropdown
  const cartItemsElement = document.querySelector('.cart-items');
  const totalAmountElement = document.querySelector('.total-amount');

  if (cartItemsElement && totalAmountElement) {
    cartItemsElement.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
      const li = document.createElement('li');

      const itemContent = document.createElement('div');
      itemContent.className = 'cart-item-content';
      itemContent.innerHTML = `
        <span class="item-name">${item.name}</span>
        <div class="item-controls">
          <button class="qty-btn minus" data-index="${index}">${config.texts.minus}</button>
          <span class="item-quantity">${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">${config.texts.plus}</button>
          <span class="item-price">${(item.price * item.quantity).toFixed(2)}${config.site.currency}</span>
          <button class="delete-btn" data-index="${index}">${config.texts.delete}</button>
        </div>
      `;

      li.appendChild(itemContent);
      cartItemsElement.appendChild(li);
      total += item.price * item.quantity;
    });

    totalAmountElement.textContent = `${total.toFixed(2)}${config.site.currency}`;
    console.log('🛒 Cart total:', total.toFixed(2) + config.site.currency);
  }

  // Update checkout button state
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    if (cart.length === 0) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = config.cart.emptyCheckout || 'Panier vide';
    } else {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = config.cart.checkout;
    }
  }

  updateQuantityBadges();
}

function updateQuantityBadges() {
  const productImages = document.querySelectorAll('.product-image, .song-image');

  productImages.forEach(img => {
    const badge = img.parentElement.querySelector('.quantity-badge');
    if (badge) {
      const src = img.src;
      let quantity = 0;

      if (src.includes('Aquarelles')) {
        // Aquarelles: per song and color
        const song = img.dataset.song;
        const color = img.dataset.color;
        if (song && color) {
          const cartItem = cart.find(item => item.name === `Aquarelle - ${song} (${color})`);
          quantity = cartItem ? cartItem.quantity : 0;
        }
      } else if (src.includes('bougie')) {
        // Bougies: differentiate petite and grande
        const isPetite = src.includes('petite');
        const size = isPetite ? 'petite' : 'grande';
        const variant = config.products.bougies.variants[size];
        const cartItem = cart.find(item => item.name === `${config.products.bougies.title} (${variant.name.toLowerCase()})`);
        quantity = cartItem ? cartItem.quantity : 0;
      } else if (src.toLowerCase().includes('livret')) {
        // Livret: use variantKey to find specific variant
        const variantKey = img.dataset.variantKey;
        if (variantKey && config.products.livret.variants[variantKey]) {
          const variant = config.products.livret.variants[variantKey];
          const cartItem = cart.find(item => item.name === `${config.products.livret.title} (${variant.name.toLowerCase()})`);
          quantity = cartItem ? cartItem.quantity : 0;
        }
      } else if (src.includes('CD')) {
        // CD: single product
        const cartItem = cart.find(item => item.name === config.products.cd.title);
        quantity = cartItem ? cartItem.quantity : 0;
      }

      badge.textContent = quantity;
      badge.style.display = quantity > 0 ? 'flex' : 'none';
    }
  });
}

// Lightbox functionality
let currentImageIndex = 0;

function openLightbox(index, src, alt) {
  currentImageIndex = index;
  const allImages = getCarouselImages();

  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox';

  const lightboxImg = document.createElement('img');
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxImg.className = 'lightbox-img';

  const lightboxControls = document.createElement('div');
  lightboxControls.className = 'lightbox-controls';

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'lightbox-close';

  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '&#10094;';
  prevBtn.className = 'lightbox-nav lightbox-prev';
  prevBtn.addEventListener('click', showPrevImage);

  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '&#10095;';
  nextBtn.className = 'lightbox-nav lightbox-next';
  nextBtn.addEventListener('click', showNextImage);

  const lightboxAddToCart = document.createElement('button');
  lightboxAddToCart.textContent = config.products.cd.addToCartText;
  lightboxAddToCart.className = 'add-to-cart lightbox-add-to-cart';

  lightboxAddToCart.addEventListener('click', () => {
    const currentImg = allImages[currentImageIndex];
    const productId = currentImg.dataset.productId;
    const productType = currentImg.dataset.productType;
    const variantKey = currentImg.dataset.variantKey;

    let productName = config.texts.defaultProduct;
    let productPrice = 0;

    if (productId && config.products[productId]) {
      const product = config.products[productId];

      if (productType === 'single') {
        // Single product (like CD)
        productName = product.title;
        productPrice = product.price;
      } else if (productType === 'variant' && variantKey && product.variants && product.variants[variantKey]) {
        // Product with variants (livret, bougies)
        const variant = product.variants[variantKey];
        productName = `${product.title} (${variant.name.toLowerCase()})`;
        productPrice = variant.price || product.price;
      } else if (productType === 'aquarelle') {
        // Handle aquarelles with songs and colors
        const song = currentImg.dataset.song;
        const color = currentImg.dataset.color;
        if (song && color) {
          productName = `Aquarelle - ${song} (${color})`;
          productPrice = product.price;
        } else {
          productName = product.title;
          productPrice = product.price;
        }
      }
    }

    addToCart(productName, 1, productPrice);
    lightboxAddToCart.textContent = config.texts.added;
    setTimeout(() => {
      lightboxAddToCart.textContent = config.products.cd.addToCartText;
    }, 2000);
  });

  lightboxControls.appendChild(prevBtn);
  lightboxControls.appendChild(lightboxAddToCart);
  lightboxControls.appendChild(nextBtn);
  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxControls);
  lightbox.appendChild(closeBtn);

  document.body.appendChild(lightbox);

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', escapeKeyListener);

  function closeLightbox() {
    document.removeEventListener('keydown', escapeKeyListener);
    document.body.removeChild(lightbox);
  }

  function escapeKeyListener(e) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPrevImage();
    else if (e.key === 'ArrowRight') showNextImage();
  }

  function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    updateLightboxImage();
  }

  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const currentImg = allImages[currentImageIndex];
    lightboxImg.src = currentImg.src;
    lightboxImg.alt = currentImg.alt;
  }
}