// Shopping cart state
let cart = [];
let cartCount = 0;
let checkoutModal = null;

// Show loading spinner initially
document.addEventListener('DOMContentLoaded', function() {
  showLoadingSpinner();

  // Load config.js dynamically
  const script = document.createElement('script');
  script.src = 'config.js';
  script.onload = function() {
    // config is now available from config.js
    initializeApp();
  };
  script.onerror = function() {
    console.error('Error loading config.js');
    hideLoadingSpinner();
  };
  document.head.appendChild(script);
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

function initializeApp() {
   // Populate HTML texts from config
   document.title = config.site.title;
   document.querySelector('h1').textContent = config.site.headerTitle;

   // Update navigation
   const navLinks = document.querySelectorAll('.header-nav a');
   navLinks[0].textContent = config.navigation.cd;
   navLinks[1].textContent = config.navigation.carnet;
   navLinks[2].textContent = config.navigation.aquarelles;
   navLinks[3].textContent = config.navigation.bougies;

   // Update cart elements
   document.querySelector('.cart-dropdown h3').textContent = config.cart.title;
   document.querySelector('.total-amount').textContent = config.cart.empty + config.site.currency;
   document.querySelector('.checkout-btn').textContent = config.cart.checkout;

   // Generate product sections dynamically
   generateProductSections();

   // Load cart from localStorage
   loadCartFromStorage();
   // Initialize cart
   updateCartDisplay();

// Initialize EmailJS if available
    if (typeof emailjs !== 'undefined' && config.emailjs.publicKey) {
      window.emailjs.init(config.emailjs.publicKey);
    }

   // Setup event listeners
   setupEventListeners();

   // Hide loading spinner and show content
   hideLoadingSpinner();
}

// Generate all product sections from config
function generateProductSections() {
  const main = document.querySelector('main');

  Object.values(config.products).forEach(product => {
    const section = generateProductSection(product);
    main.appendChild(section);
  });

  // Update footer
  document.querySelector('footer p').innerHTML = config.site.footer;
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
  // Cart icon click
  const cartIcon = document.querySelector('.cart-icon');
  const cartDropdown = document.querySelector('.cart-dropdown');
  cartIcon.addEventListener('click', () => {
    cartDropdown.classList.toggle('show');
  });

  // Close button click (for mobile)
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      cartDropdown.classList.remove('show');
    });
  }

  // Close cart when clicking outside
  document.addEventListener('click', (e) => {
    if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
      cartDropdown.classList.remove('show');
    }
  });

  // Cart item controls
  document.addEventListener('click', handleCartControls);

  // Selection changes
  setupSelectionListeners();

  // Add to cart buttons
  setupAddToCartListeners();

  // Image clicks for lightbox
  setupImageListeners();

   // Other features
   setupHoverEffects();
   setupSmoothScrolling();
   setupCheckoutListener();
}

// Handle cart quantity and deletion
function handleCartControls(e) {
  // Quantity increase
  if (e.target.classList.contains('plus')) {
    const index = parseInt(e.target.dataset.index);
    if (index >= 0 && index < cart.length) {
       cart[index].quantity++;
       cartCount++;
       saveCartToStorage();
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
       saveCartToStorage();
       updateCartDisplay();
    }
  }

  // Item deletion
  if (e.target.classList.contains('delete-btn')) {
    const index = parseInt(e.target.dataset.index);
    if (index >= 0 && index < cart.length) {
       cartCount -= cart[index].quantity;
       cart.splice(index, 1);
       saveCartToStorage();
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

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('feedback-primary');
    }, 2000);
  } else {
    const product = button.closest('.product');
    const productId = product.id;
    const productConfig = config.products[productId];

    if (!productConfig) return;

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
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ name, quantity, price });
  }

  cartCount += quantity;
  saveCartToStorage();
  updateCartDisplay();
}

function updateCartDisplay() {
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

// Save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
  const stored = localStorage.getItem('cart');
  if (stored) {
    try {
      cart = JSON.parse(stored);
      // Update cartCount based on loaded cart
      cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
      cart = [];
      cartCount = 0;
    }
  } else {
    cart = [];
    cartCount = 0;
  }
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

// Setup checkout button listener
function setupCheckoutListener() {
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showCheckoutModal();
    });
  }
}

// Create checkout modal
function createCheckoutModal() {
  const modal = document.createElement('div');
  modal.className = 'checkout-modal';
  modal.innerHTML = `
    <style>
      .checkout-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
      }
      .checkout-modal-content {
        background-color: #fefefe;
        margin: 10% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
        position: relative;
      }
      .checkout-modal-close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      .checkout-modal-close:hover,
      .checkout-modal-close:focus {
        color: black;
        text-decoration: none;
      }
      .form-group {
        margin-bottom: 15px;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
      }
      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
      }
      .checkout-submit-btn {
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
      }
      .checkout-submit-btn:hover {
        background-color: #45a049;
      }
      .checkout-message {
        margin-top: 15px;
        font-weight: bold;
      }
    </style>
    <div class="checkout-modal-content">
      <span class="checkout-modal-close">&times;</span>
      <h2>Passer commande</h2>
      <form id="checkout-form">
        <div class="form-group">
          <label for="first-name">Prénom *</label>
          <input type="text" id="first-name" required>
        </div>
        <div class="form-group">
          <label for="last-name">Nom *</label>
          <input type="text" id="last-name" required>
        </div>
        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" required>
        </div>
        <div class="form-group">
          <label for="address">Adresse *</label>
          <textarea id="address" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label for="country">Pays *</label>
          <input type="text" id="country" required>
        </div>
        <div class="form-group">
          <label for="phone">Téléphone (optionnel)</label>
          <input type="tel" id="phone">
        </div>
        <div class="form-group">
          <label for="message">Message (optionnel)</label>
          <textarea id="message" rows="2"></textarea>
        </div>
        <button type="submit" class="checkout-submit-btn">Envoyer la commande</button>
        <div class="checkout-message"></div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// Show checkout modal
function showCheckoutModal() {
  if (!checkoutModal) {
    checkoutModal = createCheckoutModal();
    // Add event listeners for close and form submit
    const closeBtn = checkoutModal.querySelector('.checkout-modal-close');
    const form = checkoutModal.querySelector('#checkout-form');
    const messageDiv = checkoutModal.querySelector('.checkout-message');

    closeBtn.addEventListener('click', hideCheckoutModal);
    // Close when clicking outside the modal content
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) {
        hideCheckoutModal();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Gather form data
      const customer = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        country: document.getElementById('country').value.trim(),
        phone: document.getElementById('phone').value.trim() || "NON REMPLI PAR L'ACHETEUR",
        message: document.getElementById('message').value.trim() || "NON REMPLI PAR L'ACHETEUR"
      };

      // Validate required fields
      if (!customer.firstName || !customer.lastName || !customer.email || !customer.address || !customer.country) {
        messageDiv.textContent = 'Veuillez remplir tous les champs obligatoires.';
        messageDiv.style.color = 'red';
        return;
      }

      // Get cart from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      if (cartItems.length === 0) {
        messageDiv.textContent = 'Votre panier est vide.';
        messageDiv.style.color = 'red';
        return;
      }

      // Generate email text
      let orderText = 'Nouvelle commande\n\nClient :\n';
      orderText += `${customer.firstName} ${customer.lastName}\n`;
      orderText += `${customer.email}\n\n`;
      orderText += 'Adresse :\n';
      orderText += `${customer.address}\n`;
      orderText += `${customer.country}\n`;
      if (customer.phone) {
        orderText += `${customer.phone}\n`;
      }
      orderText += '\nCommande :\n';
      let total = 0;
      cartItems.forEach(item => {
        orderText += `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€\n`;
        total += item.price * item.quantity;
      });
       orderText += `\nTotal : ${total.toFixed(2)}€`;

      // Send email via EmailJS
      if (typeof emailjs === 'undefined') {
        console.error('EmailJS library not loaded');
        messageDiv.textContent = 'Erreur : le service de messagerie n\'est pas disponible. Veuillez réessayer plus tard.';
        messageDiv.style.color = 'red';
        return;
      }
      if (!config.emailjs.publicKey || !config.emailjs.serviceId || !config.emailjs.templateId) {
        console.error('EmailJS not configured', config.emailjs);
        messageDiv.textContent = 'Erreur : configuration du service de messagerie incomplète.';
        messageDiv.style.color = 'red';
        return;
      }
       emailjs.send(
         config.emailjs.serviceId,
         config.emailjs.templateId,
         {
           customer_first_name: customer.firstName,
           customer_last_name: customer.lastName,
           customer_email: customer.email,
           customer_address: customer.address,
           customer_country: customer.country,
           customer_phone: customer.phone,
           customer_message: customer.message,
           order_text: orderText
         },
         config.emailjs.publicKey
       )
      .then(() => {
        // Success
        messageDiv.textContent = 'Commande envoyée avec succès. Nous vous contacterons rapidement.';
        messageDiv.style.color = 'green';
        // Clear cart
        cart = [];
        cartCount = 0;
        localStorage.removeItem('cart');
        updateCartDisplay();
        // Reset form
        form.reset();
        // Hide modal after a short delay
        setTimeout(() => {
          hideCheckoutModal();
        }, 2000);
      })
      .catch((error) => {
        console.error('EmailJS error:', error);
        messageDiv.textContent = 'Erreur lors de l’envoi. Veuillez réessayer.';
        messageDiv.style.color = 'red';
      });
    });
  }
  // Show the modal
  checkoutModal.style.display = 'block';
}

// Hide checkout modal
function hideCheckoutModal() {
  if (checkoutModal) {
    checkoutModal.style.display = 'none';
  }
}