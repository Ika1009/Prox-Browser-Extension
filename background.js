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
      fetchProductData(request.productName)
          .then(data => sendResponse({ success: true, data }))
          .catch(error => sendResponse({ success: false, error }));
      return true; // Keep the message channel open for async response
  }
});

const fetchProductData = async (productName) => {
  console.log(productName);
  try {
      const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
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
      });

      if (response.ok) {
          const data = await response.json();
          return data.results;
      } else {
          const errorDetails = await response.text();
          console.error('Failed to fetch product data:', errorDetails);
      }
  } catch (error) {
      console.error('Error in fetchProductData:', error);
  }
};
