// Sanity Configuration (Updated with your dashboard Project ID)
const PROJECT_ID = "agwjn9e2";
const DATASET = "production";
const QUERY = encodeURIComponent('*[_type == "product"]{ "id": _id, "nameAr": title, "nameEn": title, price, "category": "dresses", "sizes": ["S", "M", "L"], "image": image.asset->url }');
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;

// State Management
let cart = [];
let currentLang = 'ar';
let currentCategory = 'all';
let boutiqueProducts = []; 

// DOM Elements
const langToggle = document.getElementById('langToggle');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const productGrid = document.getElementById('productGrid');

const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');

// Initialize Page Load: Fetch from Sanity first
document.addEventListener('DOMContentLoaded', () => {
    loadSanityProducts();
});

// Fetch Products from Sanity CMS
async function loadSanityProducts() {
    try {
        const response = await fetch(SANITY_URL);
        const data = await response.json();
        
        if (data.result && data.result.length > 0) {
            boutiqueProducts = data.result;
        } else {
            boutiqueProducts = []; 
        }
    } catch (error) {
        console.error("Sanity fetch error:", error);
        boutiqueProducts = [];
    }
    
    renderProducts(boutiqueProducts);
}

// 1. Render Products Dynamically
function renderProducts(items) {
    if (!productGrid) return;

    if (items.length === 0) {
        const noResultsText = currentLang === 'ar' ? 'لا توجد منتجات مطابقة أو لم تقم بإضافة منتجات في لوحة التحكم بعد' : 'No products found or no items added in your CMS yet';
        productGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #777; padding: 3rem 1rem; font-weight: 600;">${noResultsText}</p>`;
        return;
    }

    productGrid.innerHTML = items.map((product, index) => {
        const name = currentLang === 'ar' ? product.nameAr : product.nameEn;
        const sizeOptions = product.sizes ? product.sizes.map(size => `<option value="${size}">${size}</option>`).join('') : '<option value="Standard">Standard</option>';
        const addToCartText = currentLang === 'ar' ? 'أضفي إلى السلة 🛒' : 'Add to Cart 🛒';
        const imageUrl = product.image || '';

        return `
            <div class="product-card" data-category="${product.category}">
                <div class="product-img-box">
                    <img src="${imageUrl}" alt="${name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="product-price">${product.price ? product.price.toLocaleString() : 0} EGP</p>
                    <div class="options-row">
                        <select class="size-select" id="size-${index}">
                            ${sizeOptions}
                        </select>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${index}')">${addToCartText}</button>
                </div>
            </div>
        `;
    }).join('');
}

// 2. Bilingual Toggle (Arabic / English)
langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    langToggle.textContent = currentLang === 'ar' ? 'English' : 'العربية';

    document.querySelectorAll('[data-ar]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });

    document.querySelectorAll('[data-placeholder-ar]').forEach(el => {
        el.placeholder = el.getAttribute(`data-placeholder-${currentLang}`);
    });

    filterAndSearch();
    updateCartUI();
});

// 3. Category Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        filterAndSearch();
    });
});

// 4. Real-Time Search Bar
searchInput.addEventListener('input', () => {
    filterAndSearch();
});

// Combined Filter and Search Function
function filterAndSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    const filtered = boutiqueProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const searchStr = `${product.nameAr || ''} ${product.nameEn || ''}`.toLowerCase();
        const matchesSearch = searchStr.includes(query);
        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

// 5. Talabat-Style Cart Drawer Toggle
function toggleCart() {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('open');
}

cartBtn.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

// 6. Add to Cart (Captures Selected Size from Dropdown)
window.addToCart = function(productId, index) {
    const product = boutiqueProducts.find(p => p.id === productId);
    const sizeSelect = document.getElementById(`size-${index}`);
    const selectedSize = sizeSelect ? sizeSelect.value : 'Standard';

    const existingItem = cart.find(item => item.id === productId && item.size === selectedSize);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: product.price,
            size: selectedSize,
            quantity: 1
        });
    }

    updateCartUI();
    toggleCart();
};

// 7. Update Cart UI & Totals
function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;

    if (cart.length === 0) {
        const emptyText = currentLang === 'ar' ? 'سلتك فارغة حالياً' : 'Your cart is currently empty';
        cartItems.innerHTML = `<p class="empty-cart-text" style="text-align: center; color: #888; padding: 2rem 0;">${emptyText}</p>`;
        cartTotalPrice.textContent = '0 EGP';
        return;
    }

    const sizeLabel = currentLang === 'ar' ? 'المقاس' : 'Size';
    const qtyLabel = currentLang === 'ar' ? 'الكمية' : 'Qty';

    cartItems.innerHTML = cart.map((item, index) => {
        const displayName = currentLang === 'ar' ? item.nameAr : item.nameEn;

        return `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem;">
                <div>
                    <h4 style="font-size: 0.95rem; margin-bottom: 0.2rem; color: #2d2d2d; font-weight: 700;">${displayName}</h4>
                    <p style="font-size: 0.85rem; color: #777;">${sizeLabel}: <strong>${item.size}</strong> | ${qtyLabel}: ${item.quantity}</p>
                    <p style="font-size: 0.9rem; color: #8E334C; font-weight: bold; margin-top: 2px;">${(item.price * item.quantity).toLocaleString()} EGP</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; opacity: 0.7; transition: 0.2s;" title="Remove">🗑️</button>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `${total.toLocaleString()} EGP`;
}

// 8. Remove Item from Cart
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// 9. WhatsApp Checkout Flow
window.checkoutWhatsApp = function() {
    if (cart.length === 0) return;

    const storePhoneNumber = "+201000000000"; 
    
    let messageText = currentLang === 'ar' 
        ? "مرحباً هاندمايد! أرغب في إتمام الطلب التالي:\n\n" 
        : "Hello Handmade! I'd like to place the following order:\n\n";
    
    cart.forEach(item => {
        const name = currentLang === 'ar' ? item.nameAr : item.nameEn;
        const sizeText = currentLang === 'ar' ? 'المقاس' : 'Size';
        messageText += `- ${name} (${sizeText}: ${item.size}) x${item.quantity} : ${(item.price * item.quantity).toLocaleString()} EGP\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    messageText += currentLang === 'ar' ? `\n*الإجمالي الكلي: ${total.toLocaleString()} EGP*` : `\n*Total Amount: ${total.toLocaleString()} EGP*`;

    const whatsappURL = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappURL, '_blank');
};