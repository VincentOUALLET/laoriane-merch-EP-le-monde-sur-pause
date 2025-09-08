// Payment and email setup
// Note: Replace placeholders with actual keys from services

document.addEventListener('DOMContentLoaded', function() {
  // EmailJS setup (replace with your public key)
  if (typeof emailjs !== 'undefined') {
    emailjs.init("YOUR_PUBLIC_KEY");
  }
});

// Lydia setup (simplified, replace with actual integration)
function initLydiaPayment() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Redirect to Lydia payment page (replace with actual URL)
  window.location.href = `https://lydia-app.com/paiement?amount=${total}&currency=EUR&description=Merchandise Order`;
}

// Other payment options can be added here

// Send order email using EmailJS
function sendOrderEmail(paymentDetails) {
  const orderDetails = cart.map(item => `${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}€`).join('\n');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    to_email: "customer@example.com", // Replace with customer's email
    order_details: orderDetails,
    total: total.toFixed(2) + '€',
    payment_details: JSON.stringify(paymentDetails)
  });
}

// Modal setup
function showPaymentModal() {
  const modal = document.createElement('div');
  modal.id = 'payment-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Choisir un mode de paiement</h2>
      <div id="paypal-button-container"></div>
      <button id="lydia-button">Payer avec Lydia</button>
      <!-- Add other payment options here -->
    </div>
  `;
  document.body.appendChild(modal);

  // Render PayPal button
  if (typeof paypal !== 'undefined') {
    paypal.Buttons({
      createOrder: function(data, actions) {
        // Calculate total
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: total.toFixed(2),
              currency_code: 'EUR'
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          // Send confirmation email
          sendOrderEmail(details);
          alert('Payment completed! Order confirmation sent to your email.');
          // Clear cart
          cart.length = 0;
          updateCartDisplay();
          modal.remove();
        });
      }
    }).render('#paypal-button-container');
  }

  // Close modal
  modal.querySelector('.close').onclick = () => modal.remove();
  window.onclick = (event) => {
    if (event.target === modal) modal.remove();
  };

  // Lydia button
  document.getElementById('lydia-button').onclick = initLydiaPayment;
}

// Event listener for checkout button
document.addEventListener('DOMContentLoaded', function() {
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      showPaymentModal();
    });
  }
});