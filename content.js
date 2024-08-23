console.log("Content script loaded");

// Example: Find a specific element on the page and log its content
const titleElement = document.querySelector('h1');
if (titleElement) {
    console.log("Product title:", titleElement.innerText);
}

let div = document.createElement(div);
div.id = 'toolbar';
document.body.appendChild(div);

fetch(chrome.runtime.getURL('popup.html'))
  .then((response) => response.text())
  .then((data) => {
    document.getElementById('toolbar').innerHTML = data;
  });
