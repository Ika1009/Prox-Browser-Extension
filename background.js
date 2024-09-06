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
    console.log(request.productName);
      fetchProductData(request.productName)
          .then(data => sendResponse({ success: true, data }))
          .catch(error => sendResponse({ success: false, error }));
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
                  'Authorization': 'Basic ' + btoa('_prox_RQ99U:R8kTz3_bG4sQ')
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
                  'Authorization': 'Basic ' + btoa('_prox_RQ99U:R8kTz3_bG4sQ') // Replace with your own credentials
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
          const amazonProducts = amazonData.results.map(item => ({
              source: 'Amazon',
              title: item.title,
              price: item.price ? `${item.price.value} ${item.price.currency}` : 'N/A', // Format price from object
              link: item.product_url,
              image: item.main_image,
              rating: item.rating || 'N/A',
              reviews: item.reviews || 0
          }));

          // Parse Google Shopping results
          const googleProducts = googleData.results.map(item => ({
              source: 'Google Shopping',
              title: item.title,
              price: item.price || 'N/A', // Price is already formatted as a string
              link: item.link,
              image: item.image,
              rating: item.rating || 'N/A',
              reviews: item.reviews || 0
          }));

          // Combine both results into a unified format
          const products = [...amazonProducts, ...googleProducts];
          return products;
      } else {
          const amazonErrorDetails = await amazonResponse.text();
          const googleErrorDetails = await googleResponse.text();
          console.error('Failed to fetch product data:', amazonErrorDetails, googleErrorDetails);
      }
  } catch (error) {
      console.error('Error in fetchProductData:', error);
  }
};
