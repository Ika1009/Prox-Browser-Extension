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

    // Detect the website
    const website = window.location.hostname;

    if (website.includes('amazon')) {
        // Amazon product info collection
        productInfo = {
            title: document.querySelector('#productTitle')?.textContent.trim() || 'Title not found',
            priceSymbol: document.querySelector('.a-price-symbol')?.textContent.trim() || 'Symbol not found',
            priceWhole: document.querySelector('.a-price-whole')?.textContent.trim().slice(0, -1) || 'Price not found',
            priceFraction: document.querySelector('.a-price-fraction')?.textContent.trim() || 'Fraction not found',
            image: document.querySelector('#landingImage')?.src || 'Image not found'
        };
    } else if (website.includes('walmart')) {
        let priceText = document.querySelector('span[itemprop="price"]')?.textContent.trim() || 'Price not found';
    
        // Check if the price contains "Now" indicating a sale
        if (priceText.includes('Now')) {
            priceText = priceText.replace('Now', '').trim(); // Remove "Now" from the price string
        }
        
        // Extract the price symbol and parts
        const priceSymbol = priceText.charAt(0);  // Assume first character is the symbol
        const priceParts = priceText.slice(1).split('.');  // Split by decimal to get whole and fraction

        // Walmart product info collection
        productInfo = {
            title: document.querySelector('h1#main-title')?.textContent.trim() || 'Title not found',
            priceSymbol: priceSymbol || '$',  // Default to $ if no symbol is found
            priceWhole: priceParts[0] || 'Price not found',  // Get whole part
            priceFraction: priceParts[1] || '00',  // Get fraction part
            image: document.querySelector('div[data-testid="stack-item-dynamic-zoom-image-lazy"] img')?.src || 'Image not found'
        };
    } else if (website.includes('target')) {
        // Target product info collection
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
    // Create a div element to contain the popup
    const popup = document.createElement('div');
    popup.id = 'popup-element';  // Add an ID to the popup for easy reference

    // Apply styles to the popup for positioning and appearance
    popup.style.position = 'fixed';
    popup.style.bottom = '450px';
    popup.style.right = '90px';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.zIndex = '999999999';

    // Add the popup content with dynamic content
    popup.innerHTML = `
        <div class="w-96 bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="p-2 bg-gray-300 text-white flex justify-between items-center">
                <!-- Logo Image -->
                <img src="https://bonanza.mycpanel.rs/ajnakafu/images/text_logo.png" alt="Prox Logo" class="h-8">
                <button id="close-popup" class="text-blue-900 font-bold text-lg">✕</button>
            </div>

            <!-- Content Section -->
            <div id='products-container' class="p-4 max-h-96 overflow-auto flex flex-wrap gap-2">
                
            </div>
        </div>
    `;

    // Append the popup to the body of the page
    document.body.appendChild(popup);

    const container = document.getElementById('products-container'); // Get your existing container element
    
    fetchedData.forEach(product => {
        // Check if the price is "N/A" or another invalid price value
        if (product.price !== 'N/A' && product.price !== '' && !product.url.includes('undefined')) {
            // Product HTML Template
            const productHTML = `
                <div class="bg-white rounded-lg shadow-sm overflow-hidden w-40"> <!-- Adjust width as necessary -->
                    <a href="${product.url}" target="_blank" class="block hover:bg-gray-100">
                        <img src="${product.image}" alt="${product.title}" class="w-full h-32 object-cover">
                        <div class="p-2">
                            <h3 class="text-sm font-semibold truncate">${product.title}</h3>
                            <div class="flex items-center mt-2">
                                <span class="text-base font-bold text-green-600">
                                    ${product.price}
                                </span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
    
            // Append the HTML to the existing container
            container.innerHTML += productHTML;
        }
    });       

    // Add event listener to close the popup when the close button is clicked
    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
        addReopenButton();
    });
};

// Add a button to reopen the popup
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

    // Add an event listener to toggle the popup and button when the button is clicked
    reopenButton.addEventListener('click', () => {
        reopenButton.remove();
        appendPopup(fetchedProducts);  // Pass stored product data to reopen the popup
    });

    document.body.appendChild(reopenButton);
};

// Toggle between showing the popup and the button
const togglePopupAndButton = () => {
    const popup = document.getElementById('popup-element');
    const reopenButton = document.getElementById('reopen-button');

    if (popup) {
        popup.remove();
        addReopenButton();
    } else if (reopenButton) {
        reopenButton.remove();
        appendPopup(fetchedProducts);  // Pass stored product data to reopen the popup
    }
};