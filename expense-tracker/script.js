
const API = "http://localhost:5000/api/transactions";

let transactions = [];

// Get HTML elements
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionId = document.getElementById("transactionId");

const transactionList = document.getElementById("transactionList");
const categoryFilter = document.getElementById("categoryFilter");
const monthFilter = document.getElementById("monthFilter");

const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formHeading = document.getElementById("formHeading");

// Get today's date in YYYY-MM-DD format
function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Set default date and month
dateInput.value = getToday();
monthFilter.value = getToday().slice(0, 7);

// Fetch transactions from database
async function loadTransactions() {
    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Could not fetch transactions");
        }

        transactions = await response.json();

        displayTransactions();
    } catch (error) {
        transactionList.innerHTML =
            '<p class="empty-message">Unable to load transactions. Check the backend server.</p>';
    }
}

// Display transactions and update dashboard
function displayTransactions() {
    const selectedCategory = categoryFilter.value;
    const selectedMonth = monthFilter.value;

    // Filter transactions by month
    const monthlyTransactions = transactions.filter(item => {
        const itemMonth = new Date(item.date).toISOString().slice(0, 7);
        return itemMonth === selectedMonth;
    });

    // Calculate monthly income and expenses
    let income = 0;
    let expense = 0;

    monthlyTransactions.forEach(item => {
        if (item.type === "Income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }
    });

    // Update dashboard
    document.getElementById("totalIncome").textContent =
        "₹" + income.toFixed(2);

    document.getElementById("totalExpense").textContent =
        "₹" + expense.toFixed(2);

    document.getElementById("balance").textContent =
        "₹" + (income - expense).toFixed(2);

    // Filter transactions by category
    const filteredTransactions = monthlyTransactions.filter(item => {
        return selectedCategory === "All" ||
            item.category === selectedCategory;
    });

    // Show transaction list
    if (filteredTransactions.length === 0) {
        transactionList.innerHTML =
            '<p class="empty-message">No transactions found.</p>';
        return;
    }

    transactionList.innerHTML = "";

    filteredTransactions.forEach(item => {
        const transaction = document.createElement("div");
        transaction.className = "transaction";

        const sign = item.type === "Income" ? "+" : "-";
        const amountClass = item.type === "Income"
            ? "income-text"
            : "expense-text";

        const displayDate = new Date(item.date).toLocaleDateString("en-IN");

        transaction.innerHTML = `
            <div class="transaction-info">
                <h3>${escapeHTML(item.title)}</h3>
                <p>${escapeHTML(item.category)} | ${displayDate}</p>
                <p>${item.type}</p>
            </div>

            <div class="transaction-actions">
                <span class="transaction-amount ${amountClass}">
                    ${sign} ₹${Number(item.amount).toFixed(2)}
                </span>

                <button class="edit-btn"
                    onclick="editTransaction('${item._id}')">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteTransaction('${item._id}')">
                    Delete
                </button>
            </div>
        `;

        transactionList.appendChild(transaction);
    });
}

// Escape user-entered text before displaying it as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Add or update transaction
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = transactionId.value;

    const transactionData = {
        title: titleInput.value.trim(),
        amount: Number(amountInput.value),
        type: typeInput.value,
        category: categoryInput.value,
        date: dateInput.value
    };

    if (!transactionData.title || !transactionData.date ||
        !Number.isFinite(transactionData.amount) ||
        transactionData.amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    const url = id ? `${API}/${id}` : API;
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transactionData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Operation failed");
        }

        alert(result.message);

        resetForm();
        await loadTransactions();

    } catch (error) {
        alert(error.message);
    }
});

// Edit transaction
function editTransaction(id) {
    const item = transactions.find(transaction => transaction._id === id);

    if (!item) {
        return;
    }

    transactionId.value = item._id;
    titleInput.value = item.title;
    amountInput.value = item.amount;
    typeInput.value = item.type;
    categoryInput.value = item.category;
    dateInput.value = new Date(item.date).toISOString().slice(0, 10);

    formHeading.textContent = "Edit Transaction";
    saveButton.textContent = "Update Transaction";
    cancelButton.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete transaction
async function deleteTransaction(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert(result.message);
        await loadTransactions();

    } catch (error) {
        alert(error.message);
    }
}

// Reset form after adding or updating
function resetForm() {
    form.reset();

    transactionId.value = "";
    dateInput.value = getToday();

    formHeading.textContent = "Add Transaction";
    saveButton.textContent = "Add Transaction";
    cancelButton.hidden = true;
}

// Cancel editing
cancelButton.addEventListener("click", resetForm);

// Category filter
categoryFilter.addEventListener("change", displayTransactions);

// Month filter
monthFilter.addEventListener("change", displayTransactions);

// Load transactions when page opens
loadTransactions();
