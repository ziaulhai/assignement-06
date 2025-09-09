// API URLs
const API_BASE = "https://openapi.programming-hero.com/api";
const categoryList = document.querySelector(".category-list");
const plantContainer = document.getElementById("plant-container");
const cartContainer = document.getElementById("cart");
const cartTotal = document.getElementById("cart-total");

let cart = [];

// ✅ SPINNER UTILS যোগ করা হলো
function showSpinner() {
  plantContainer.innerHTML = `<div class="flex justify-center items-center h-40">
    <span class="loading loading-spinner text-accent"></span>
  </div>`;
}

function hideSpinner() {
  plantContainer.innerHTML = ""; 
}

// Load Categories
let currentActiveCategoryId = null; // globally track active category
let categoryListData = []; // store categories globally

// Load Categories
async function loadCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();
  categoryListData = data.categories;
  displayCategories(data.categories);
}

function displayCategories(categories) {
  categoryList.innerHTML = "";

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="w-full text-left m-1 p-2 hover:bg-[#15803D] hover:text-white rounded" 
      onclick="selectCategory(${cat.id})">${cat.category_name}</button>`;
    categoryList.appendChild(li);
  });
}

// Handle category click
function selectCategory(id) {
  currentActiveCategoryId = id;

  // Remove active class from all buttons
  const allButtons = categoryList.querySelectorAll("button");
  allButtons.forEach(btn => btn.classList.remove("bg-[#15803D]", "text-white"));

  // Add active class to clicked button
  const clickedButton = Array.from(allButtons).find(
    btn => btn.textContent.trim() === getCategoryNameById(id)
  );
  if (clickedButton) {
    clickedButton.classList.add("bg-[#15803D]", "text-white");
  }

  // Load plants of this category
  loadPlantsByCategory(id);
}

// Helper to get category name by id
function getCategoryNameById(id) {
  return categoryListData.find(c => c.id === id)?.category_name || "";
}

// Load Plants by Category
async function loadPlantsByCategory(id) {
  try {
    showSpinner(); // ✅ spinner দেখাচ্ছে

    const res = await fetch(`${API_BASE}/category/${id}`);
    const data = await res.json();

    hideSpinner(); // ✅ spinner hide হচ্ছে

    console.log("Plants by Category:", data);

    const plants = data.plants || [];
    if (!plants.length) {
      plantContainer.innerHTML =
        "<p class='text-center text-gray-500'>No plants found in this category</p>";
      return;
    }

    displayPlants(plants);
  } catch (err) {
    console.error("Error loading plants:", err);
    plantContainer.innerHTML =
      "<p class='text-center text-red-500'>Failed to load plants.</p>";
  }
}

// Display Plants in Cards
function displayPlants(plants) {
  plantContainer.innerHTML = "";

  plants.forEach((plant) => {
    const card = document.createElement("div");

    card.innerHTML = `
    <div class="w-[350px] h-auto rounded-md bg-white">
     <div class="p-5">
      <img src="${plant.image}" alt="${plant.name}" class="rounded-lg h-48 w-full object-cover"/>
      <h2 class="text-lg font-bold mt-2 cursor-pointer text-green-700 hover:underline"
        onclick="showPlantDetail(${plant.id})">${plant.name}</h2>
      <p class="text-sm text-gray-600">${plant.description ? plant.description.slice(0, 60) : ""}...</p>
      <div class="flex justify-between items-center mt-2">
      <p class="btn bg-[#DCFCE7] rounded-3xl border-none text-[#15803D] mt-1"><span class="font-semibold">${plant.category || "N/A"}</span></p>
      <p class="font-semibold text-gray-600 mt-1">Price: ৳${plant.price || 0}</p>
      </div>
      <button onclick="addToCart('${plant.id}','${plant.name}',${plant.price || 0})" 
        class="btn bg-[#15803D] text-white mt-3 rounded-3xl w-80">Add to Cart</button>
     </div>   
    </div>
    `;
    plantContainer.appendChild(card);
  });
}

// Show Plant Details in Modal
async function showPlantDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/plant/${id}`);
    const data = await res.json();

    const plant = data.plants; // API অনুযায়ী

    if (!plant) {
      alert("Plant details not found.");
      return;
    }

    // Remove old modal if exists
    const oldModal = document.getElementById("plant-detail-modal");
    if (oldModal) oldModal.remove();

    // Create modal (DaisyUI style)
    const modal = document.createElement("dialog");
    modal.id = "plant-detail-modal";
    modal.className = "modal"; // DaisyUI class
    modal.innerHTML = `
      <form method="dialog" class="modal-box">
        <h3 class="text-lg font-bold">${plant.name}</h3>
        <img src="${plant.image}" alt="${plant.name}" class="rounded-lg mt-3 w-full h-48 object-cover"/>
        <p class="py-2 text-gray-600">${plant.description}</p>
        <p class="font-semibold">Category: ${plant.category}</p>
        <p class="mt-1 text-green-700 font-bold">Price: ৳${plant.price}</p>
        <div class="modal-action">
          <button class="btn">Close</button>
        </div>
      </form>
    `;

    document.body.appendChild(modal);

    // Open modal
    modal.showModal();

  } catch (err) {
    console.error("Error loading plant detail:", err);
  }
}

// -------------------- Cart Logic with Quantity --------------------

// Add to Cart
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1; // quantity increase
  } else {
    cart.push({ id, name, price, quantity: 1 }); // new item
  }
  renderCart();
}

// Remove from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// Render Cart
function renderCart() {
  const itemsDiv = document.getElementById("cart-items-container");
  itemsDiv.innerHTML = ""; // Clear previous items

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "flex justify-between items-center w-[280px] h-[65px] bg-[#F0FDF4] rounded-sm p-2 mx-auto mb-2";

    // innerHTML দিয়ে content
    div.innerHTML = `
     <p class="font-semibold p-2">${item.name} <br>
      ৳${item.price} x ${item.quantity}</p>
      
      <button class="text-gray-500 p-2 remove-btn"><a>X</a></button>
    `;

    // Add event listener to the remove button
    div.querySelector(".remove-btn").addEventListener("click", () => {
      removeFromCart(index);
    });

    itemsDiv.appendChild(div);
  });

  const cartTotal = document.getElementById("cart-total");
cartTotal.innerText = cart.length > 0 ? `৳${total}` : "৳0";

//   const cartTotal = document.getElementById("cart-total");
//   cartTotal.innerText = `৳${total}`;
}

// Load default plants (mix categories)
async function loadDefaultPlants() {
  try {
    showSpinner(); // spinner

    const defaultCategoryIds = [1, 2, 3]; 
    let defaultPlants = [];

    for (const id of defaultCategoryIds) {
      const res = await fetch(`${API_BASE}/category/${id}`);
      const data = await res.json();
      if (data.plants) {
        defaultPlants = defaultPlants.concat(data.plants);
      }
    }

    // default home page
    defaultPlants = defaultPlants.slice(0, 6);

    hideSpinner(); // spinner hide 

    displayPlants(defaultPlants);
  } catch (err) {
    console.error("Error loading default plants:", err);
  }
}

// Initial Load
loadCategories();
loadDefaultPlants();
renderCart();