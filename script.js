// Sanity Configuration (No sizes queried)
const PROJECT_ID = "agwjn9e2";
const DATASET = "production";
const QUERY = encodeURIComponent('*[_type == "product"]{ "id": _id, "nameAr": title, "nameEn": title, price, "image": image.asset->url }');
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;

// Target WhatsApp Number
const STORE_PHONE_NUMBER = "201220208096";

// State Management (No sizes tracked)
let cart = [];
let currentLang = 'ar';
let boutiqueProducts = []; 

// DOM Elements
const langToggle = document.getElementById('langToggle');
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');

// Checkout DOM Elements
const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const payRadios = document.querySelectorAll('input[name="payMethod"]');
const instapayBox = document.getElementById('instapayBox');

// Initialize Page Load: Fetch from Sanity
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

// 1. Render Products Dynamically (No Size Dropdowns)
function renderProducts(items) {
    if (!productGrid) return;

    if (items.length === 0) {
        const noResultsText = currentLang === 'ar' ? 'لم تقم بإضافة منتجات في لوحة التحكم بعد' : 'No items added in your CMS yet';
        productGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #777; padding: 3rem 1rem; font-weight: 600;">${noResultsText}</p>`;
        return;
    }

    productGrid.innerHTML = items.map((product) => {
        const name = currentLang === 'ar' ? product.nameAr : product.nameEn;
        const addToCartText = currentLang === 'ar' ? 'أضفي إلى السلة 🛒' : 'Add to Cart 🛒';
        const imageUrl = product.image || '';

        return `
            <div class="product-card">
                <div class="product-img-box">
                    <img src="${imageUrl}" alt="${name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="product-price">${product.price ? product.price.toLocaleString() : 0} EGP</p>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">${addToCartText}</button>
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

    renderProducts(boutiqueProducts);
    updateCartUI();
});

// 3. Talabat-Style Cart Drawer Toggle
function toggleCart() {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('open');
}

cartBtn.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

// 4. Add to Cart (No size parameter needed)
window.addToCart = function(productId) {
    const product = boutiqueProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    updateCartUI();
    toggleCart();
};

// 5. Update Cart UI & Totals (No size labels)
function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;

    if (cart.length === 0) {
        const emptyText = currentLang === 'ar' ? 'سلتك فارغة حالياً' : 'Your cart is currently empty';
        cartItems.innerHTML = `<p class="empty-cart-text" style="text-align: center; color: #888; padding: 2rem 0;">${emptyText}</p>`;
        cartTotalPrice.textContent = '0 EGP';
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => {
        const displayName = currentLang === 'ar' ? item.nameAr : item.nameEn;

        return `
            <div class="cart-item" style="display: flex; gap: 12px; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem;">
                <img src="${item.image || ''}" alt="${displayName}" style="width: 60px; height: 70px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 0.2rem; color: #2d2d2d; font-weight: 700;">${displayName}</h4>
                    <p style="font-size: 0.9rem; color: #8E334C; font-weight: bold; margin-top: 4px;">${(item.price * item.quantity).toLocaleString()} EGP</p>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="qty-controls" style="display: flex; align-items: center; gap: 6px;">
                        <button onclick="changeQuantity(${index}, -1)" style="padding: 2px 8px; background: #eee; border: none; border-radius: 4px; cursor: pointer;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)" style="padding: 2px 8px; background: #eee; border: none; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #d32f2f;" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `${total.toLocaleString()} EGP`;
}

// 6. Change Quantity & Remove from Cart
window.changeQuantity = function(index, delta) {
    if (cart[index].quantity + delta > 0) {
        cart[index].quantity += delta;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// 7. Checkout Form & InstaPay Logic
function toggleCheckoutModal() {
    checkoutModal.classList.toggle('open');
    checkoutOverlay.classList.toggle('open');
}

window.openCheckoutModal = function() {
    if (cart.length === 0) {
        alert(currentLang === 'ar' ? 'سلتك فارغة! يرجى إضافة منتجات أولاً.' : 'Your cart is empty! Please add items first.');
        return;
    }
    toggleCart(); 
    toggleCheckoutModal();
};

closeCheckout.addEventListener('click', toggleCheckoutModal);
checkoutOverlay.addEventListener('click', toggleCheckoutModal);

payRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'instapay') {
            instapayBox.style.display = 'block';
        } else {
            instapayBox.style.display = 'none';
        }
    });
});

// 8. Submit Final Order to WhatsApp
window.submitOrderWhatsApp = function() {
    const cName = document.getElementById('custName').value.trim();
    const cPhone = document.getElementById('custPhone').value.trim();
    const cCity = document.getElementById('custCity').value.trim();
    const cStreet = document.getElementById('custStreet').value.trim();
    const cBuilding = document.getElementById('custBuilding').value.trim();
    const cFloor = document.getElementById('custFloor').value.trim();
    const cApt = document.getElementById('custApt').value.trim();
    const cLandmark = document.getElementById('custLandmark').value.trim();
    
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

    if (!cName || !cPhone || !cCity || !cStreet || !cBuilding || !cFloor || !cApt) {
        alert(currentLang === 'ar' ? 'يرجى إكمال جميع الحقول المطلوبة لتوصيل الطلب.' : 'Please fill in all required delivery fields.');
        return;
    }

    const formattedAddress = currentLang === 'ar' 
        ? `${cCity}، شارع ${cStreet}، مبنى ${cBuilding}، طابق ${cFloor}، شقة ${cApt}${cLandmark ? ' | علامة مميزة: ' + cLandmark : ''}`
        : `Apt ${cApt}, Floor ${cFloor}, Bldg ${cBuilding}, ${cStreet} St., ${cCity}${cLandmark ? ' | Landmark: ' + cLandmark : ''}`;

    let msg = currentLang === 'ar' ? "*طلب جديد من المتجر!* 🛍️\n\n" : "*New Store Order!* 🛍️\n\n";
    
    msg += currentLang === 'ar' ? "📋 *بيانات العميل:*\n" : "📋 *Customer Details:*\n";
    msg += `- ${currentLang === 'ar' ? 'الاسم' : 'Name'}: ${cName}\n`;
    msg += `- ${currentLang === 'ar' ? 'الهاتف' : 'Phone'}: ${cPhone}\n`;
    msg += `- ${currentLang === 'ar' ? 'العنوان' : 'Address'}: ${formattedAddress}\n\n`;

    msg += currentLang === 'ar' ? "🛒 *المنتجات:*\n" : "🛒 *Order Items:*\n";
    cart.forEach(item => {
        const pName = currentLang === 'ar' ? item.nameAr : item.nameEn;
        msg += `- ${pName} x${item.quantity} : ${(item.price * item.quantity).toLocaleString()} EGP\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    msg += currentLang === 'ar' ? `\n💰 *الإجمالي الكلي: ${total.toLocaleString()} EGP*\n\n` : `\n💰 *Total Amount: ${total.toLocaleString()} EGP*\n\n`;

    msg += currentLang === 'ar' ? "💳 *طريقة الدفع:*\n" : "💳 *Payment Method:*\n";
    if (payMethod === 'cash') {
        msg += currentLang === 'ar' ? "الدفع عند الاستلام 💵" : "Cash on Delivery 💵";
    } else {
        msg += currentLang === 'ar' ? "تحويل إنستاباي (InstaPay - eyadaaa@instapay) 📱" : "InstaPay Transfer (eyadaaa@instapay) 📱";
    }

    const whatsappURL = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappURL, '_blank');
    toggleCheckoutModal();
};