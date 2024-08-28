// Listener for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NEW") {
        const productId = request.productId;
        console.log("Product ID received:", productId);

        fetchProductData(productId)
            .then(productData => displayProductData(productData))
            .catch(error => console.error('Error fetching product data:', error));

    } else if (request.type === "REOPEN_POPUP") {
        // Toggle between showing the popup and the button
        togglePopupAndButton();
    }
});

// Load Tailwind CSS
const linkTailwind = document.createElement('link');
linkTailwind.href = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.css'; 
linkTailwind.rel = 'stylesheet';
document.head.appendChild(linkTailwind);

// Load Font Awesome
const linkFontAwesome = document.createElement('link');
linkFontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"; 
linkFontAwesome.rel = 'stylesheet';
document.head.appendChild(linkFontAwesome);

const collectProductInfo = () => {
    let productTitle = document.querySelector('#productTitle')?.textContent.trim();
    let productPriceSymbol = document.querySelector('.a-price-symbol')?.textContent.trim();
    let productPriceWhole = document.querySelector('.a-price-whole')?.textContent.trim().slice(0, -1);
    let productPriceFraction = document.querySelector('.a-price-fraction')?.textContent.trim();
    let productImage = document.querySelector('#landingImage')?.src;

    if (!productTitle) {
        productTitle = document.querySelector('span.a-text-bold')?.textContent.trim();
    }

    return {
        title: productTitle || 'Title not found',
        priceSymbol: productPriceSymbol || 'Symbol not found',
        priceWhole: productPriceWhole || 'Price not found',
        priceFraction: productPriceFraction || 'Fraction not found',
        image: productImage || 'Image not found'
    };
};

// Example usage
const productInfo = collectProductInfo();
console.log("Product Info:", productInfo);

const appendPopup = (productId) => {
    // Create a div element to contain the popup
    const popup = document.createElement('div');
    popup.id = 'popup-element';  // Add an ID to the popup for easy reference

    // Apply styles to the popup for positioning and appearance
    popup.style.position = 'fixed';
    popup.style.bottom = '450px';
    popup.style.right = '90px';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.zIndex = '1000';

    // Add the popup content from your popup.html with dynamic content
    popup.innerHTML = `
        <div class="w-96 bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="p-2 bg-purple-900 text-white flex justify-between items-center">
                <!-- Logo Image -->
                <img src="https://bonanza.mycpanel.rs/ajnakafu/images/logo.jpg" alt="Prox Logo" class="h-8">
                <button id="close-popup" class="text-white font-bold text-lg">✕</button>
            </div>

            <!-- Filters and Buttons -->
            <div class="p-2 flex items-center bg-gray-50 border-b border-gray-200 space-x-1">
                <!-- Set Alert Button with Bell Icon -->
                <button class="font-bold text-green-900 px-3 py-2 rounded-md flex items-center space-x-1">
                    <i class="far fa-bell"></i>
                    <span>Set Alert</span>
                </button>

                <!-- Filters Button with Gear Icon -->
                <button class="font-bold text-green-900 px-3 py-2 rounded-md flex items-center space-x-1">
                    <i class="fas fa-sliders"></i>
                    <span>Filters</span>
                </button>

                <!-- Add your sizes Button with Plus Icon -->
                <button class="font-bold text-green-900 px-3 py-2 rounded-md flex items-center space-x-1">
                    <i class="fas fa-plus"></i>
                    <span>Add your sizes</span>
                </button>
            </div>

            <!-- Content Section -->
            <div class="p-4">
                <h2 class="text-xl font-semibold mb-4">Product ID: ${productId}</h2> <!-- Displaying Product ID -->

                <!-- Item List -->
                <div class="grid grid-cols-2 gap-4">
                    <!-- Item 1 -->
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                        <img src="${productInfo.image}" alt="${productInfo.title}" class="w-full h-32 object-cover">
                        <div class="p-2">
                            <h3 class="text-sm font-semibold">${productInfo.title}</h3>
                            <div class="flex items-center mt-2">
                                <span class="text-lg font-bold text-green-600 flex items-baseline">
                                    <span class="text-base">${productInfo.priceSymbol}</span>
                                    <span class="text-2xl">${productInfo.priceWhole}</span>
                                    <span class="text-sm text-gray-500 ml-1">.${productInfo.priceFraction}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Icon Row at the End of Popup -->
            <div class="flex justify-around p-4 border-t border-gray-200">
                <i class="fas fa-home text-lg text-teal-900"></i>       <!-- Outlined Home Icon -->
                <i class="far fa-bookmark text-lg text-gray-600"></i>   <!-- Outlined Bookmark Icon -->
                <i class="far fa-bell text-lg text-gray-600"></i>       <!-- Outlined Bell Icon -->
                <i class="fas fa-bars text-lg text-gray-600"></i>       <!-- Menu Icon -->
            </div>

        </div>
    `;

    // Append the popup to the body of the page
    document.body.appendChild(popup);

    // Add event listener to close the popup when the close button is clicked
    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
        addReopenButton();
    });
};

const addReopenButton = () => {
    const reopenButton = document.createElement('button');
    reopenButton.id = 'reopen-button';  // Add an ID for the reopen button
    reopenButton.style.position = 'fixed';
    reopenButton.style.bottom = '450px';
    reopenButton.style.right = '0px';
    reopenButton.style.backgroundColor = 'transparent';  // Remove background color
    reopenButton.style.border = 'none';  // Remove border
    reopenButton.style.padding = '0';  // Remove padding
    reopenButton.style.zIndex = '1000';
    reopenButton.style.cursor = 'pointer';  // Add a pointer cursor for better UX

    // Add the logo inside the button
    reopenButton.innerHTML = `<img src="https://bonanza.mycpanel.rs/ajnakafu/images/logo.jpg" alt="Prox Logo" style="width: 60px; height: 60px;">`;

    // Append the reopen button to the body
    document.body.appendChild(reopenButton);

    // Add event listener to reopen the popup
    reopenButton.addEventListener('click', () => {
        appendPopup();
        reopenButton.remove();
    });
};

const togglePopupAndButton = () => {
    const popup = document.getElementById('popup-element');
    const reopenButton = document.getElementById('reopen-button');

    if (popup) {
        // If the popup is visible, close it and show the reopen button
        popup.remove();
        addReopenButton();
    } else if (reopenButton) {
        // If the reopen button is visible, hide it and show the popup
        reopenButton.remove();
        appendPopup();
    }
};

const fetchProductData = async (productId) => {
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('USERNAME:PASSWORD')
        },
        body: JSON.stringify({
            source: 'amazon_product',
            domain: 'com',
            query: productId,
            parse: true,
            context: [
                {
                    key: 'autoselect_variant',
                    value: true
                }
            ]
        })
    });

    if (response.ok) {
        const data = await response.json();
        return data.results;
    } else {
        console.error('Failed to fetch product data');
    }
};

const displayProductData = (productData) => {
    const productInfo = {
        title: productData.title || 'Title not found',
        priceSymbol: productData.currency || '$',
        priceWhole: productData.price || 'Price not found',
        image: productData.image || 'Image not found'
    };

    console.log("Product Info:", productInfo);
    // Use productInfo to update your popup or UI
    appendPopup(productInfo);
};