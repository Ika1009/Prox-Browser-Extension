console.log("Content script loaded");

// Example: Find a specific element on the page and log its content
const titleElement = document.querySelector('h1');
if (titleElement) {
    console.log("Product title:", titleElement.innerText);
}
