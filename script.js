// API Key for Spoonacular API to access recipe data
const API_KEY = 'f0a1921c1b89417caa88e74a0417765b'; 

// Fetch recipes from the Spoonacular API
async function fetchRecipes() {
  try {
    // Fetch data from the Spoonacular API
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${API_KEY}`);
    const data = await response.json(); // Convert response to JSON

    // Check if recipes are available
    if (data.recipes && data.recipes.length > 0) {
      // Map recipes to a simpler format
      const recipes = data.recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        price: 7.00 // Static price for demonstration; adjust as needed
      }));
      displayRecipes(recipes); // Call function to display recipes
    } else {
      displayNoResults(); // Call function if no recipes are found
    }
  } catch (error) {
    console.error('Error:', error); // Log any errors
    displayError(); // Call function to display an error message
  }
}

// Display recipes on the page
function displayRecipes(recipes) {
  const dessertCrd = document.querySelector('.dessert-cards'); // Get the container for recipe cards
  dessertCrd.innerHTML = ""; // Clear any existing content

  // Create and append a card for each recipe
  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'dessert-card';
    card.dataset.price = recipe.price.toFixed(2); // Store price in dataset for easy access
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}"> <!-- Recipe image -->
            <div class="quantity">
        <!-- Buttons to change quantity and display current quantity -->
        <button aria-label="Decrease quantity" class="decreaseBtn" onclick="changeQuantity(this, -1)">-</button>
        <input type="text" class="quantity-input" value="0" aria-label="Product quantity" readonly>
        <button aria-label="Increase quantity" class="increaseBtn" onclick="changeQuantity(this, 1)">+</button>
      </div>
      <h2>${recipe.name}</h2> <!-- Recipe name -->
      <p>$${recipe.price.toFixed(2)}</p> <!-- Recipe price -->

      <!-- Button to add item to cart -->
      <button class="add-to-cart" onclick="addToCart(this)">Add to Cart</button>
    `;
    dessertCrd.appendChild(card); // Add the card to the container
  });

  // GSAP animation for card appearance
  gsap.from('.dessert-card', {
    opacity: 0,
    y: 50,
    stagger: 0.2,
    duration: 1
  });
}

// Change the quantity of an item
function changeQuantity(button, change) {
  const card = button.closest('.dessert-card'); // Get the closest dessert card element
  const quantityInput = card.querySelector('.quantity-input'); // Get the quantity input field
  let quantity = parseInt(quantityInput.value); // Parse current quantity

  quantity = Math.max(0, quantity + change); // Update quantity and ensure it does not go below 0
  quantityInput.value = quantity; // Update the input field with the new quantity
}

// Add an item to the cart
function addToCart(button) {
  const card = button.closest('.dessert-card'); // Get the closest dessert card
  const name = card.querySelector('h2').textContent; // Recipe name
  const image = card.querySelector('img').src; // Recipe image URL
  const price = parseFloat(card.dataset.price); // Recipe price from data attribute
  const quantity = parseInt(card.querySelector('.quantity-input').value); // Selected quantity
  const number=document.getElementById('number').textContent

  if (quantity > 0) {
    const cartItems = document.querySelector('.cart-items'); // Get cart items container
    let itemExists = false;

    cartItems.querySelectorAll('li').forEach(item => {
      if (item.dataset.name === name) {
        const currentQty = parseInt(item.dataset.quantity); // Get current quantity
        item.dataset.quantity = currentQty + quantity; // Update quantity in dataset
        item.querySelector('.item-quantity').textContent = `${item.dataset.quantity}x`; // Update display
        item.querySelector('.item-price').textContent = `$${(item.dataset.quantity * price).toFixed(2)}`; // Update price
        item.querySelector('#number').textContent=currentQty + quantity
        itemExists = true;
      }
    });

    if (!itemExists) {
      const newItem = document.createElement('li');
      newItem.dataset.name = name;
      newItem.dataset.quantity = quantity;
      newItem.innerHTML = `
        <img src="${image}" alt="${name}">
        <p>${name}</p>
        <span class="item-quantity">${quantity}x</span>
        <span class="item-price">$${(quantity * price).toFixed(2)}</span>
      `;
      cartItems.appendChild(newItem);
    }

    updateCartTotal(); // Update the cart total
    saveCart(); // Save cart to local storage
  }
}

// Update the total amount in the cart
function updateCartTotal() {
  const cartItems = document.querySelectorAll('.cart-items li'); // Get all cart items
  let total = 0;

  cartItems.forEach(item => {
    const price = parseFloat(item.querySelector('span').textContent.replace('$', ''));
    total += price;
  });

  document.querySelector('.cart-total span').textContent = `$${total.toFixed(2)}`; // Display the total
}

// Save cart items to local storage
function saveCart() {
  const cartItems = document.querySelector('.cart-items').innerHTML;
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Load cart items from local storage
function loadCart() {
  const savedCart = JSON.parse(localStorage.getItem('cartItems'));
  if (savedCart) {
    document.querySelector('.cart-items').innerHTML = savedCart;
  }
  updateCartTotal(); // Update total after loading
}

// Confirm the order and show the confirmation overlay
// Confirm the order and show the confirmation overlay
function confirmOrder() {
  const overlay = document.getElementById('order-confirmation-overlay'); // Ensure this element exists
  const orderDetails = overlay ? overlay.querySelector('.order-details') : null;
  const orderTotalElement = overlay ? overlay.querySelector('.order-total p:last-of-type') : null;

  if (!overlay || !orderDetails || !orderTotalElement) {
    console.error('Order confirmation elements are missing or misconfigured.');
    return; // Exit the function if elements are not found
  }

  const cartItems = document.querySelectorAll('.cart-items li');

  if (cartItems.length === 0) {
    console.error('No items in the cart to confirm.');
    alert('Your cart is empty. Please add items before confirming the order.');
    return;
  }

  let orderDetailsHTML = '';

  cartItems.forEach(item => {
    // Extract data from item
    const name = item.querySelector('p') ? item.querySelector('p').textContent : 'Unknown Item'; // Use fallback name
    const image = item.querySelector('img') ? item.querySelector('img').src : ''; // Use fallback image URL
    const price = item.querySelector('span') ? item.querySelector('span').textContent : '$0.00'; // Use fallback price
    const quantity = item.dataset.quantity || 1; // Default quantity to 1 if not found

    // Construct HTML for each item
    orderDetailsHTML += `
      <div class="order-item">
        <img src="${image}" alt="${name}" onerror="this.src='fallback-image-url.jpg';"> <!-- Handle missing image -->
        <div class="item-info">
          <p>${name}</p> <!-- Display the item name -->
          <span>${quantity}x @ ${price}</span> <!-- Display quantity and price -->
        </div>
        <div class="item-price">${price}</div> <!-- Display price for each item -->
      </div>
    `;
  });

  // Populate the order details section with the generated HTML
  orderDetails.innerHTML = orderDetailsHTML;

  // Set the order total from the cart's total
  const cartTotal = document.querySelector('.cart-total span').textContent;
  orderTotalElement.textContent = cartTotal;

  // Show the confirmation overlay
  overlay.style.display = 'flex';

  // Clear the cart and local storage after confirmation
  document.querySelector('.cart-items').innerHTML = '';
  document.querySelector('.cart-total span').textContent = '$0.00';
  localStorage.removeItem('cartItems');
}

// Close the order confirmation overlay
function closeOrderConfirmation() {
  const overlay = document.getElementById('order-confirmation-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  } else {
    console.error('Order confirmation overlay not found.');
  }
}





// Load cart items when the page loads
window.onload = function() {
  loadCart();
  fetchRecipes(); // Initial call to fetch recipes
};
