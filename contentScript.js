// Listener for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NEW") {
      const productId = request.productId;
      console.log("Product ID received:", productId);
  
      // Call the function to append the popup to the page
      appendPopup(productId);
    }
});

const linkTailwind = document.createElement('link');
linkTailwind.href = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css'; 
linkTailwind.rel = 'stylesheet';
document.head.appendChild(linkTailwind);

const linkFontAwesome = document.createElement('link');
linkFontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"; 
linkFontAwesome.rel = 'stylesheet';
document.head.appendChild(linkFontAwesome);

const appendPopup = (productId) => {
    // Create a div element to contain the popup
    const popup = document.createElement('div');

    // Apply styles to the popup for positioning and appearance
    popup.style.position = 'fixed';
    popup.style.bottom = '450px';
    popup.style.right = '100px';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.zIndex = '1000';

    // Add the popup content from your popup.html with dynamic content
    popup.innerHTML = `
        <div class="w-96 bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="p-2 bg-green-900 text-white flex justify-between items-center">
                <!-- Logo Image -->
                <img src="https://bonanza.mycpanel.rs/ajnakafu/images/logo.jpg" alt="Prox Logo" class="h-8">
                <button id="close-popup" class="text-white font-bold text-lg">✕</button>
            </div>

            <!-- Filters and Buttons -->
            <div class="p-2 flex items-center bg-gray-50 border-b border-gray-200 space-x-1">
                <!-- Set Alert Button with Bell Icon -->
                <button class="bg-yellow-400 font-bold text-green-900 px-3 py-2 rounded-md flex items-center space-x-1">
                    <i class="far fa-bell"></i>
                    <span>Set Alert</span>
                </button>

                <!-- Filters Button with Gear Icon -->
                <button class="bg-green-900 font-bold text-white px-3 py-2 rounded-md flex items-center space-x-1">
                    <i class="fas fa-sliders"></i>
                    <span>Filters</span>
                </button>

                <!-- Add your sizes Button with Plus Icon -->
                <button class="bg-blue-500 font-bold text-white px-3 py-2 rounded-md flex items-center space-x-1">
                    <i class="fas fa-plus"></i>
                    <span>Add your sizes</span>
                </button>
            </div>

            <!-- Content Section -->
            <div class="p-4">
                <h2 class="text-xl font-semibold mb-4">Product ID: ${productId}</h2> <!-- Displaying Product ID -->
                <h2 class="text-xl font-semibold mb-4">Top Finds from AliExpress RU</h2>

                <!-- Item List -->
                <div class="grid grid-cols-2 gap-4">
                    <!-- Item 1 -->
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                        <img src="https://di2ponv0v5otw.cloudfront.net/posts/2024/08/17/66c0ea33c9af8cd971d54111/66c0ec9fb4ee5bf79f2c9952.jpg" alt="Item Image" class="w-full h-32 object-cover">
                        <div class="p-2">
                            <h3 class="text-sm font-semibold">Burgundy And Navy...</h3>
                            <p class="text-xs text-gray-500">on Poshmark</p>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-lg font-bold text-green-600">$20</span>
                                <span class="text-sm">S</span>
                            </div>
                        </div>
                    </div>

                    <!-- Item 2 -->
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                        <img src="https://di2ponv0v5otw.cloudfront.net/posts/2024/08/16/66bf696850e2df59591cdb94/66bf6a5c2d829afe5fd151cb.jpeg" alt="Item Image" class="w-full h-32 object-cover">
                        <div class="p-2">
                            <h3 class="text-sm font-semibold">Aliexpress Angel Wing Backpack</h3>
                            <p class="text-xs text-gray-500">on Poshmark</p>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-lg font-bold text-green-600">$5</span>
                                <span class="text-sm">N/A</span>
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
    });
};