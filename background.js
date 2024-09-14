chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.url.includes("amazon.com") || tab.url.includes("target.com") || tab.url.includes("walmart.com")) {    
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
      });
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "REOPEN_POPUP" });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_PRODUCT_DATA") {
    console.log(request.productName); // Log the requested product name
    fetchProductData(request.productName)
      .then(data => {
        console.log("Response data:", data); // Log the response data
        sendResponse({ success: true, data }); // Send the response
      })
      .catch(error => {
        console.log("Error:", error.message); // Log the error message
        sendResponse({ success: false, error: error.message }); // Send the response with error
      });
    return true; // Keep the message channel open for async response
  }
});


const fetchProductData = async (productName) => {
  try {
    const [amazonResponse, googleResponse] = await Promise.all([
      fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('_prox_RQ99U:Miloskralj2005_')
        },
        body: JSON.stringify({
          source: 'amazon_search',
          domain: 'com',
          query: productName,
          parse: true,
          context: [
            {
              key: 'autoselect_variant',
              value: true
            }
          ]
        })
      }),
      fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('_prox_RQ99U:Miloskralj2005_') // Replace with your own credentials
        },
        body: JSON.stringify({
          source: 'google_shopping_search',
          domain: 'com',
          query: productName,
          parse: true,
          context: [
            {
              key: 'autoselect_variant',
              value: true
            }
          ]
        })
      })
    ]);

    if (amazonResponse.ok && googleResponse.ok) {
      const amazonData = await amazonResponse.json();
      const googleData = await googleResponse.json();

      // Parse Amazon results
      const paidProducts = amazonData.results[0].content.results.paid.map(item => ({
        source: 'Amazon',
        title: item.title,
        price: item.price ? `${item.price} ${item.currency}` : 'N/A',
        url: `https://www.amazon.com${item.url}`, // Ensure URL is complete
        image: item.url_image,
        rating: item.rating || 'N/A',
        reviews: item.reviews_count || 0
      }));

      const organicProducts = amazonData.results[0].content.results.organic.map(item => ({
        source: 'Amazon',
        title: item.title,
        price: item.price ? `${item.price} ${item.currency}` : 'N/A',
        url: `https://www.amazon.com/${item.url}`, // Ensure URL is complete
        image: item.url_image,
        rating: item.rating || 'N/A',
        reviews: item.reviews_count || 0
      }));

      // Combine paid and organic products
      const amazonProducts = [...paidProducts, ...organicProducts];
      console.log("GUGL DATA");
      console.log(googleData);

      const defaultURL = googleData.results.content.url;
      // Parse Google Shopping results
      const googlePaidProducts = googleData.results[0].content.results.paid.map(item => ({
        source: 'Google Shopping',
        title: item.title,
        price: item.price_str || item.price || 'N/A', // Price is already formatted as a string
        url: item.url || defaultURL,
        image: item.thumbnail,
        rating: item.rating || 'N/A',
        reviews: item.reviews || 0
      }));

      const googleOrganicProducts = googleData.results[0].content.results.organic.map(item => ({
        source: 'Google Shopping',
        title: item.title,
        price: item.price_str || item.price || 'N/A', // Price is already formatted as a string
        url: item.url || defaultURL,
        image: item.thumbnail,
        rating: item.rating || 'N/A',
        reviews: item.reviews || 0
      }));

      // Combine paid and organic products for Google
      const googleProducts = [...googlePaidProducts, ...googleOrganicProducts];

      // Combine both results into a unified format
      const products = [...amazonProducts, ...googleProducts];
      return products;
    } else {
      // Handle error cases for responses
      const amazonErrorDetails = amazonResponse.ok ? null : await amazonResponse.text();
      const googleErrorDetails = googleResponse.ok ? null : await googleResponse.text();
      const errorMessage = `Amazon: ${amazonErrorDetails || 'No error message'}, Google Shopping: ${googleErrorDetails || 'No error message'}`;
      console.error('Failed to fetch product data:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error in fetchProductData:', error);
    throw error; // Ensure error is propagated
  }
};
