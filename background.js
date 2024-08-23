chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("amazon.com")) {
    const queryParameters = tab.url.split("?")[1];
    console.log("query parameters: " + queryParameters);
    const urlParameters = new URLSearchParams(queryParameters);
    console.log("query parameters: " + urlParameters.get("pd_rd_r"));

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      productId: urlParameters.get("pd_rd_r"),
    });
  }
});
