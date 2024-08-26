chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.url.includes("amazon.com") || tab.url.includes("target.com") || tab.url.includes("walmart.com")) {
      let productId = null;
      
      if (tab.url.includes("amazon.com")) {
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);
        productId = urlParameters.get("pd_rd_r");  // Example parameter specific to Amazon
      } 
      
      // Add similar logic here if you want to extract specific product IDs from Target or Walmart URLs
      // else if (tab.url.includes("target.com")) {
      //   productId = ...;  // Logic to extract product ID for Target
      // } else if (tab.url.includes("walmart.com")) {
      //   productId = ...;  // Logic to extract product ID for Walmart
      // }

      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        productId: productId,
      });
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "REOPEN_POPUP" });
});
