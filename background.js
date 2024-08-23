console.log("Background script running");

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

// Example: Listen for messages from content or popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received", request);
    sendResponse({ message: "Background script received the message" });
});
