// Global variable to store fetched products
let fetchedProducts = [];

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

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NEW") {
        const productInfo = collectProductInfo(); // Collect product info when "NEW" message is received
        console.log(productInfo);

        // Send product name to the background script to fetch additional data
        chrome.runtime.sendMessage(
            { type: "FETCH_PRODUCT_DATA", productName: productInfo.title },
            (response) => {
                if (response.success) {
                    // Store the fetched data globally
                    fetchedProducts = response.data;

                    // Call the function to append the popup to the page with the fetched data
                    appendPopup(fetchedProducts);
                } else {
                    console.error("Error fetching product data:", response.error);
                }
            }
        );
    } else if (request.type === "REOPEN_POPUP") {
        // Toggle between showing the popup and the button
        togglePopupAndButton();
    }
});

// Collect product information based on the current website
const collectProductInfo = () => {
    let productInfo = {};
    const website = window.location.hostname;

    if (website.includes('amazon')) {
        productInfo = {
            title: document.querySelector('#productTitle')?.textContent.trim() || 'Title not found',
            priceSymbol: document.querySelector('.a-price-symbol')?.textContent.trim() || 'Symbol not found',
            priceWhole: document.querySelector('.a-price-whole')?.textContent.trim().slice(0, -1) || 'Price not found',
            priceFraction: document.querySelector('.a-price-fraction')?.textContent.trim() || 'Fraction not found',
            image: document.querySelector('#landingImage')?.src || 'Image not found'
        };
    } else if (website.includes('walmart')) {
        let priceText = document.querySelector('span[itemprop="price"]')?.textContent.trim() || 'Price not found';
        if (priceText.includes('Now')) {
            priceText = priceText.replace('Now', '').trim();
        }
        const priceSymbol = priceText.charAt(0);
        const priceParts = priceText.slice(1).split('.');

        productInfo = {
            title: document.querySelector('h1#main-title')?.textContent.trim() || 'Title not found',
            priceSymbol: priceSymbol || '$',
            priceWhole: priceParts[0] || 'Price not found',
            priceFraction: priceParts[1] || '00',
            image: document.querySelector('div[data-testid="stack-item-dynamic-zoom-image-lazy"] img')?.src || 'Image not found'
        };
    } else if (website.includes('target')) {
        productInfo = {
            title: document.querySelector('h1[data-test="product-title"]')?.textContent.trim() || 'Title not found',
            priceSymbol: '$',
            priceWhole: document.querySelector('span[data-test="product-price"]')?.textContent.trim().split('.')[0] || 'Price not found',
            priceFraction: document.querySelector('span[data-test="product-price"]')?.textContent.trim().split('.')[1] || '00',
            image: document.querySelector('div[data-test="image-gallery-item-0"] img')?.src || 'Image not found'
        };
    } else {
        console.error("Unsupported website");
    }

    return productInfo;
};

// Append the popup with product data
const appendPopup = (fetchedData) => {
    console.log(fetchedData);
    const popup = document.createElement('div');
    popup.id = 'popup-element';
    popup.style.position = 'fixed';
    popup.style.bottom = '520px';
    popup.style.right = '90px';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.zIndex = '999999999';
    
    // Get the full URL of the image within the extension
    const logoUrl = chrome.runtime.getURL('images/text_logo.png');

    popup.innerHTML = `
        <div class="w-96 bg-white shadow-lg rounded-lg overflow-hidden">
            <div class="p-2 bg-gray-300 text-white flex justify-between items-center">
                <img src="${logoUrl}" alt="Prox Logo" class="h-8">
                <button id="close-popup" class="text-blue-900 font-bold text-lg">✕</button>
            </div>
            
            <div class="p-2 flex items-center gap-2">
                <select id="sort-price" class="h-10 px-3 border border-gray-300 rounded-full">
                    <option value="none">Sort by Price</option>
                    <option value="low-high">Low to High</option>
                    <option value="high-low">High to Low</option>
                </select>
                <select id="retailer-select" class="h-10 px-3 border border-gray-300 rounded-full">
                    <option value="none">Retailer</option>
                    <option value="amazon">Amazon</option>
                    <option value="walmart">Walmart</option>
                    <option value="target">Target</option>
                </select>
                <select id="retailer-select" class="h-10 px-3 border border-gray-300 rounded-full">
                    <option value="none">Usage</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                </select>
            </div>
            <div class="p-2 flex flex-col space-y-2">
                <div class="flex items-center gap-2"> <!-- Added gap for spacing -->
                    <input id="search-input" type="text" placeholder="Search products..." 
                        class="w-full h-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-gray-500"
                    />
                    <button id="search-btn" class="h-8 w-12 rounded-full flex items-center justify-center">
                        <i class="fas fa-search text-gray-700 text-lg"></i>
                    </button>
                </div>
                <!-- Price Range Filter -->
                <div>
                    <label for="price-range" class="text-sm font-semibold">Filter by price:</label>
                    <input id="price-min" type="number" placeholder="Min" class="w-20 border rounded px-2">
                    <input id="price-max" type="number" placeholder="Max" class="w-20 border rounded px-2">
                </div>
            </div>
            <div id="products-container" class="p-4 max-h-96 overflow-auto flex flex-wrap gap-2"></div>
        </div>
    `;

    document.body.appendChild(popup);

    const container = document.getElementById('products-container');

    const displayProducts = (products) => {
        container.innerHTML = '';
        products.forEach(product => {
            if (product.price !== 'N/A' && product.price !== '' && !product.url.includes('undefined')) {
                const productHTML = `
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden w-40">
                        <a href="${product.url}" target="_blank" class="block hover:bg-gray-100">
                            <img src="${product.image}" alt="${product.title}" class="w-full h-32 object-cover">
                            <div class="p-2">
                                <h3 class="text-sm font-semibold truncate">${product.title}</h3>
                                <div class="flex items-center mt-2">
                                    <span class="text-base font-bold text-green-600">${product.price}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                container.innerHTML += productHTML;
            }
        });
    };

    displayProducts(fetchedData);

    document.getElementById('search-btn').addEventListener('click', () => {
        const searchQuery = document.getElementById('search-input').value.toLowerCase();
        const filteredProducts = fetchedData.filter(product =>
            product.title.toLowerCase().includes(searchQuery)
        );
        displayProducts(filteredProducts);
    });

    // Add event listener for price and retailer filter
    document.getElementById('price-max').addEventListener('change', () => applyFilters());
    document.getElementById('price-min').addEventListener('change', () => applyFilters());
    document.getElementById('retailer-select').addEventListener('change', () => applyFilters());
    
    // Function to apply all filters
    const applyFilters = () => {
        const minPrice = parseFloat(document.getElementById('price-min').value) || 0;
        const maxPrice = parseFloat(document.getElementById('price-max').value) || Infinity;
        const selectedRetailer = document.getElementById('retailer-select').value;
        const filteredProducts = fetchedData.filter(product => {
            const productPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, '')); // Remove symbols and convert to number
            const isInPriceRange = productPrice >= minPrice && productPrice <= maxPrice;
            const isRetailerMatch = selectedRetailer ? product.url.includes(selectedRetailer) : true;
            return isInPriceRange && isRetailerMatch;
        });
        displayProducts(filteredProducts);
    };

    document.getElementById('sort-price').addEventListener('change', () => {
        const sortType = document.getElementById('sort-price').value;
        let sortedProducts = [...fetchedData];
        if (sortType === 'low-high') {
            sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortType === 'high-low') {
            sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }
        displayProducts(sortedProducts);
    });

    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
        addReopenButton();
    });
};

// Add a button to reopen the popup
const addReopenButton = () => {
    if (!document.getElementById('reopen-button')) {
        const button = document.createElement('button');
        button.id = 'reopen-button';
        button.textContent = 'Reopen Prox Alternative Shopper';
        button.style.position = 'fixed';
        button.style.bottom = '50px';
        button.style.right = '50px';
        button.style.zIndex = '999999999';
        button.className = 'px-4 py-2 bg-green-500 text-white rounded-full';

        document.body.appendChild(button);

        button.addEventListener('click', () => {
            button.remove();
            appendPopup(fetchedProducts);
        });
    }
};

// Toggle between popup and reopen button
const togglePopupAndButton = () => {
    const popup = document.getElementById('popup-element');
    const button = document.getElementById('reopen-button');
    if (popup) {
        popup.remove();
        addReopenButton();
    } else if (button) {
        button.remove();
        appendPopup(fetchedProducts);
    }
};