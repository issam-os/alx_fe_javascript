const serverUrl = "https://jsonplaceholder.typicode.com/posts"; // Mock API URL
let quotes = [
  { text: "The journey of a thousand miles begins with a single step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = "${randomQuote.text}" - ${randomQuote.category};
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    populateCategories();
    filterQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
}

// Function to populate unique categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteDisplay = document.getElementById("quoteDisplay");

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = "${randomQuote.text}" - ${randomQuote.category};
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }

  // Save selected category to local storage
  localStorage.setItem("selectedCategory", selectedCategory);
}

// Restore the last selected category
function restoreLastSelectedCategory() {
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    document.getElementById("categoryFilter").value = savedCategory;
    filterQuotes();
  }
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    const serverData = await response.json();

    // Simulate server data structure
    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Merge server data with local data (server takes precedence)
    const uniqueServerQuotes = serverQuotes.filter(
      serverQuote => !quotes.some(localQuote => localQuote.text === serverQuote.text)
    );
    quotes = [...quotes, ...uniqueServerQuotes];

    populateCategories();
    filterQuotes();

    // Notify success
    showNotification("Quotes synced with server!", "green");
  } catch (error) {
    console.error("Error fetching data from server:", error);

    // Notify failure
    showNotification("Failed to sync data with the server.", "red");
  }
}

// Sync local data with the server
async function syncQuotes() {
  try {
    const newQuotes = quotes.map(quote => ({
      title: quote.text,
      body: quote.category,
      userId: 1
    }));

    await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuotes)
    });

    // Notify success
    showNotification("Quotes synced with server!", "green");
  } catch (error) {
    console.error("Error syncing data to server:", error);

    // Notify failure
    showNotification("Failed to sync data with the server.", "red");
  }
}

// Show notifications
// Show notifications
function showNotification(message, color) {
  // Alert for immediate feedback
  alert(message);

  // Optional: Use the existing syncStatus element for on-screen notifications
  const syncStatus = document.getElementById("syncStatus");
  syncStatus.textContent = message;
  syncStatus.style.color = color;

  // Clear the notification after 3 seconds
  setTimeout(() => {
    syncStatus.textContent = "";
  }, 3000);
}


// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  restoreLastSelectedCategory();
  showRandomQuote();

  // Periodic server sync (every 10 seconds)
  setInterval(fetchQuotesFromServer, 10000);
});
